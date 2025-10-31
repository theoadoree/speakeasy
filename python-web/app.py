"""
SpeakEasy Language Learning - Python Web App
FastAPI backend with HTML/CSS/JavaScript frontend
"""

from fastapi import FastAPI, HTTPException, Request
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
import os
import openai
from datetime import datetime

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

# Data models
class User(BaseModel):
    email: str
    target_language: str
    native_language: str = "English"
    level: str = "beginner"
    interests: List[str] = []

class StoryRequest(BaseModel):
    target_language: str
    level: str
    interests: List[str]
    user_id: Optional[str] = None

class ChatMessage(BaseModel):
    message: str
    target_language: str
    conversation_history: List[dict] = []

class WordExplanation(BaseModel):
    word: str
    context: str
    target_language: str
    native_language: str = "English"

# In-memory storage (replace with database in production)
users = {}
stories = {}
conversations = {}

@app.get("/", response_class=HTMLResponse)
async def root():
    """Serve the main HTML page"""
    with open("static/index.html", "r") as f:
        return HTMLResponse(content=f.read())

@app.get("/health")
async def health():
    """Health check endpoint"""
    return {"status": "healthy", "timestamp": datetime.utcnow().isoformat()}

@app.post("/api/auth/register")
async def register(user: User):
    """Register a new user"""
    if user.email in users:
        raise HTTPException(status_code=400, detail="User already exists")

    users[user.email] = user.dict()
    return {
        "success": True,
        "message": "User registered successfully",
        "user": user.dict()
    }

@app.post("/api/auth/login")
async def login(email: str, password: str):
    """Login user (simplified - add proper auth in production)"""
    if email not in users:
        raise HTTPException(status_code=404, detail="User not found")

    return {
        "success": True,
        "token": f"mock_token_{email}",
        "user": users[email]
    }

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
