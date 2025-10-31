"""
SpeakEasy Language Learning - Python Web App V2
FastAPI backend with authentication and database
"""

from fastapi import FastAPI, HTTPException, Request, Depends, Header
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
import os
import openai
from datetime import datetime
from sqlalchemy.orm import Session

# Import database and services
try:
    from database import get_db, SessionLocal
    from database import crud
    from services import auth_service
    DATABASE_ENABLED = True
except ImportError:
    DATABASE_ENABLED = False
    print("⚠️  Database not configured, using in-memory storage")

app = FastAPI(title="SpeakEasy Language Learning")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# OpenAI configuration
openai.api_key = os.getenv("OPENAI_API_KEY")

# Pydantic models for API
class RegisterRequest(BaseModel):
    email: str
    password: str
    username: str
    target_language: str
    native_language: str = "English"

class LoginRequest(BaseModel):
    email: str
    password: str

class UsernameCheckRequest(BaseModel):
    username: str

class StoryRequest(BaseModel):
    target_language: str
    level: str
    interests: List[str]

class ChatMessage(BaseModel):
    message: str
    target_language: str
    conversation_history: List[dict] = []

class WordExplanation(BaseModel):
    word: str
    context: str
    target_language: str
    native_language: str = "English"

# In-memory fallback storage
users_memory = {}
stories_memory = {}
conversations_memory = {}

# Helper function to get current user from token
async def get_current_user(authorization: Optional[str] = Header(None), db: Session = Depends(get_db)):
    """Get current user from JWT token"""
    if not authorization or not authorization.startswith("Bearer "):
        return None

    token = authorization.split(" ")[1]
    try:
        payload = auth_service.verify_token(token)
        if DATABASE_ENABLED:
            user = db.query(crud.User).filter(crud.User.id == payload["user_id"]).first()
            return user
    except:
        return None
    return None

@app.get("/", response_class=HTMLResponse)
async def root():
    """Serve the main HTML page"""
    try:
        with open("static/index.html", "r") as f:
            return HTMLResponse(content=f.read())
    except FileNotFoundError:
        return HTMLResponse(content="<h1>SpeakEasy</h1><p>Welcome! Frontend not found.</p>")

@app.get("/health")
async def health():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "database": "enabled" if DATABASE_ENABLED else "disabled"
    }

# Authentication endpoints
@app.post("/api/auth/register")
async def register(request: RegisterRequest, db: Session = Depends(get_db)):
    """Register a new user"""
    if not DATABASE_ENABLED:
        # Fallback to in-memory
        if request.email in users_memory:
            raise HTTPException(status_code=400, detail="User already exists")
        users_memory[request.email] = request.dict()
        return {"success": True, "message": "User registered (in-memory)"}

    # Check if email exists
    existing_user = crud.get_user_by_email(db, request.email)
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    # Check if username exists
    existing_username = crud.get_user_by_username(db, request.username)
    if existing_username:
        raise HTTPException(status_code=400, detail="Username already taken")

    # Create user
    user = crud.create_user(
        db=db,
        email=request.email,
        username=request.username,
        target_language=request.target_language,
        password=request.password
    )

    # Create token
    token = auth_service.create_access_token(
        data={"user_id": user.id, "email": user.email, "username": user.username}
    )

    return {
        "success": True,
        "token": token,
        "user": {
            "id": user.id,
            "email": user.email,
            "username": user.username,
            "target_language": user.target_language
        }
    }

@app.post("/api/auth/login")
async def login(request: LoginRequest, db: Session = Depends(get_db)):
    """Login user"""
    if not DATABASE_ENABLED:
        # Fallback
        if request.email not in users_memory:
            raise HTTPException(status_code=401, detail="Invalid credentials")
        return {"success": True, "token": f"mock_{request.email}"}

    # Get user
    user = crud.get_user_by_email(db, request.email)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    # Verify password
    if not crud.verify_password(request.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    # Update last login
    crud.update_user_login(db, user.id)

    # Create token
    token = auth_service.create_access_token(
        data={"user_id": user.id, "email": user.email, "username": user.username}
    )

    return {
        "success": True,
        "token": token,
        "user": {
            "id": user.id,
            "email": user.email,
            "username": user.username,
            "target_language": user.target_language
        }
    }

@app.post("/api/auth/check-username")
async def check_username(request: UsernameCheckRequest, db: Session = Depends(get_db)):
    """Check if username is available"""
    if not DATABASE_ENABLED:
        available = request.username not in [u.get("username") for u in users_memory.values()]
        return {"available": available}

    available = not crud.username_exists(db, request.username)
    suggestion = None if available else crud.suggest_username(db, request.username)

    return {
        "available": available,
        "suggestion": suggestion
    }

@app.get("/api/auth/me")
async def get_me(current_user = Depends(get_current_user)):
    """Get current user info"""
    if not current_user:
        raise HTTPException(status_code=401, detail="Not authenticated")

    return {
        "id": current_user.id,
        "email": current_user.email,
        "username": current_user.username,
        "target_language": current_user.target_language
    }

# Original OpenAI endpoints (keep existing functionality)
@app.post("/api/stories/generate")
async def generate_story(request: StoryRequest):
    """Generate a personalized language learning story"""
    try:
        interests_text = ", ".join(request.interests) if request.interests else "general topics"

        prompt = f"""Create a short story in {request.target_language} for a {request.level} level learner.

The story should:
- Be appropriate for {request.level} level
- Include topics about: {interests_text}
- Be 150-250 words long
- Use simple, clear language
- Include some dialogue
- Be engaging and educational

Return the story in JSON format with:
{{
    "title": "story title in {request.target_language}",
    "content": "the full story text",
    "difficulty": "{request.level}",
    "vocabulary_count": number of unique words
}}
"""

        client = openai.OpenAI(api_key=openai.api_key)
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You are a language learning assistant creating personalized stories."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            max_tokens=1000
        )

        story_data = response.choices[0].message.content

        return JSONResponse(content={
            "success": True,
            "story": story_data
        })

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating story: {str(e)}")

@app.post("/api/words/explain")
async def explain_word(request: WordExplanation):
    """Explain a word in context"""
    try:
        prompt = f"""Explain this word from {request.target_language}:

Word: {request.word}
Context: "{request.context}"
Explain to: {request.native_language} speaker

Provide:
1. Translation to {request.native_language}
2. Part of speech
3. Simple definition
4. Example sentence in {request.target_language}
5. Example sentence translated to {request.native_language}

Return as JSON:
{{
    "word": "{request.word}",
    "translation": "...",
    "part_of_speech": "...",
    "definition": "...",
    "example": "...",
    "example_translation": "..."
}}
"""

        client = openai.OpenAI(api_key=openai.api_key)
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You are a language learning tutor."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.3,
            max_tokens=500
        )

        explanation = response.choices[0].message.content

        return JSONResponse(content={
            "success": True,
            "explanation": explanation
        })

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error explaining word: {str(e)}")

@app.post("/api/practice/chat")
async def practice_conversation(request: ChatMessage):
    """Practice conversation in target language"""
    try:
        system_message = f"""You are a friendly language learning tutor helping a student practice {request.target_language}.

Guidelines:
- Respond naturally in {request.target_language}
- Keep responses concise (2-3 sentences)
- Use appropriate level vocabulary
- Gently correct major errors
- Be encouraging and supportive
"""

        messages = [{"role": "system", "content": system_message}]
        messages.extend(request.conversation_history)
        messages.append({"role": "user", "content": request.message})

        client = openai.OpenAI(api_key=openai.api_key)
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=messages,
            temperature=0.8,
            max_tokens=200
        )

        assistant_message = response.choices[0].message.content

        return JSONResponse(content={
            "success": True,
            "message": assistant_message,
            "timestamp": datetime.utcnow().isoformat()
        })

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error in conversation: {str(e)}")

@app.get("/api/languages")
async def get_languages():
    """Get list of supported languages"""
    languages = [
        {"code": "es", "name": "Spanish", "native": "Español"},
        {"code": "fr", "name": "French", "native": "Français"},
        {"code": "de", "name": "German", "native": "Deutsch"},
        {"code": "it", "name": "Italian", "native": "Italiano"},
        {"code": "pt", "name": "Portuguese", "native": "Português"},
        {"code": "ja", "name": "Japanese", "native": "日本語"},
        {"code": "ko", "name": "Korean", "native": "한국어"},
        {"code": "zh", "name": "Chinese", "native": "中文"},
        {"code": "ar", "name": "Arabic", "native": "العربية"},
        {"code": "ru", "name": "Russian", "native": "Русский"},
    ]
    return {"success": True, "languages": languages}

# Mount static files
if os.path.exists("static"):
    app.mount("/static", StaticFiles(directory="static"), name="static")

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8080))
    uvicorn.run(app, host="0.0.0.0", port=port)
