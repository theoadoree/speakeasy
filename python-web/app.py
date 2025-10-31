"""
SpeakEasy Language Learning - Python Web App
FastAPI backend with HTML/CSS/JavaScript frontend
"""

from fastapi import FastAPI, HTTPException, Request
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List, Dict
import os
import openai
from datetime import datetime
import jwt
import time

# Google OAuth imports (optional - gracefully degrade if not available)
try:
    from google.oauth2 import id_token
    from google.auth.transport import requests as google_requests
    GOOGLE_AUTH_AVAILABLE = True
except ImportError:
    GOOGLE_AUTH_AVAILABLE = False
    print("Warning: google-auth not available. Google OAuth will use fallback mode.")

# Import lessons data
from lessons_data import LESSONS, get_lesson_by_id, get_lessons_by_level, get_all_lessons

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
    password: Optional[str] = None
    username: Optional[str] = None
    target_language: str
    native_language: str = "English"
    level: str = "beginner"
    interests: List[str] = []

class LoginRequest(BaseModel):
    email: str
    password: str

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

class UsernameCheck(BaseModel):
    username: str

class GoogleAuthRequest(BaseModel):
    credential: Optional[str] = None
    email: Optional[str] = None
    name: Optional[str] = None
    picture: Optional[str] = None
    oauth_provider: Optional[str] = None
    oauth_id: Optional[str] = None

class LessonProgress(BaseModel):
    lesson_id: int
    completed: bool = False
    score: Optional[int] = None
    attempts: int = 0
    last_attempt: Optional[str] = None

class QuizAnswer(BaseModel):
    question_id: int
    answer: str

class QuizSubmission(BaseModel):
    lesson_id: int
    answers: List[QuizAnswer]

# In-memory storage (replace with database in production)
users = {}
usernames = set()  # Track usernames for uniqueness
stories = {}
conversations = {}
user_lesson_progress = {}  # email -> {lesson_id: LessonProgress}

# XP and Leagues system
LEAGUES = {
    'bronze': {'name': 'Bronze', 'min_xp': 0, 'max_xp': 499, 'color': '#CD7F32'},
    'silver': {'name': 'Silver', 'min_xp': 500, 'max_xp': 1499, 'color': '#C0C0C0'},
    'gold': {'name': 'Gold', 'min_xp': 1500, 'max_xp': 2999, 'color': '#FFD700'},
    'diamond': {'name': 'Diamond', 'min_xp': 3000, 'max_xp': 5999, 'color': '#B9F2FF'},
    'master': {'name': 'Master', 'min_xp': 6000, 'max_xp': float('inf'), 'color': '#9F00FF'}
}

user_xp = {}  # email -> {'total_xp': int, 'weekly_xp': int, 'streak_days': int, 'last_active': str}
weekly_leaderboard = []  # List of {email, username, weekly_xp, league}

import datetime

def get_week_number():
    """Get current week number of the year"""
    return datetime.datetime.now().isocalendar()[1]

current_week = get_week_number()

def get_league_from_xp(total_xp):
    """Determine league based on total XP"""
    for league_id, league_data in LEAGUES.items():
        if league_data['min_xp'] <= total_xp <= league_data['max_xp']:
            return league_id
    return 'bronze'

def add_xp(email, xp_amount):
    """Add XP to user and update league"""
    global current_week

    if email not in user_xp:
        user_xp[email] = {
            'total_xp': 0,
            'weekly_xp': 0,
            'streak_days': 1,
            'last_active': datetime.datetime.utcnow().isoformat(),
            'week': current_week
        }

    # Check if new week - reset weekly XP
    if get_week_number() != current_week:
        current_week = get_week_number()
        for user_email in user_xp:
            user_xp[user_email]['weekly_xp'] = 0
            user_xp[user_email]['week'] = current_week

    # Add XP
    user_xp[email]['total_xp'] += xp_amount
    user_xp[email]['weekly_xp'] += xp_amount

    # Update streak
    last_active = datetime.datetime.fromisoformat(user_xp[email]['last_active'])
    now = datetime.datetime.utcnow()
    days_diff = (now - last_active).days

    if days_diff == 1:
        user_xp[email]['streak_days'] += 1
    elif days_diff > 1:
        user_xp[email]['streak_days'] = 1

    user_xp[email]['last_active'] = now.isoformat()

    # Update leaderboard
    update_leaderboard()

def update_leaderboard():
    """Update the weekly leaderboard"""
    global weekly_leaderboard

    leaderboard_data = []
    for email, xp_data in user_xp.items():
        user_data = users.get(email, {})
        username = user_data.get('username', email.split('@')[0])
        league = get_league_from_xp(xp_data['total_xp'])

        leaderboard_data.append({
            'email': email,
            'username': username,
            'weekly_xp': xp_data['weekly_xp'],
            'total_xp': xp_data['total_xp'],
            'league': league,
            'streak_days': xp_data['streak_days']
        })

    # Sort by weekly XP descending
    weekly_leaderboard = sorted(leaderboard_data, key=lambda x: x['weekly_xp'], reverse=True)

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

    # Check username uniqueness if provided
    if user.username:
        if user.username in usernames:
            raise HTTPException(status_code=400, detail="Username already taken")
        usernames.add(user.username)

    user_data = user.dict()
    users[user.email] = user_data

    # Don't return password in response
    response_data = user_data.copy()
    if 'password' in response_data:
        del response_data['password']

    return {
        "success": True,
        "message": "User registered successfully",
        "token": f"mock_token_{user.email}",
        "user": response_data
    }

@app.post("/api/auth/check-username")
async def check_username(request: UsernameCheck):
    """Check if username is available"""
    available = request.username not in usernames

    # Generate suggestion if taken
    suggestion = None
    if not available:
        base = request.username
        counter = 1
        while f"{base}{counter}" in usernames:
            counter += 1
        suggestion = f"{base}{counter}"

    return {
        "available": available,
        "suggestion": suggestion
    }

@app.post("/api/auth/google")
async def google_auth(request: GoogleAuthRequest):
    """Handle Google OAuth authentication"""
    try:
        email = None
        name = None
        picture = None
        oauth_id = None

        # If credential JWT is provided, verify and decode it
        if request.credential and GOOGLE_AUTH_AVAILABLE:
            try:
                # Get Google Client ID from environment or use the OAuth 2 Web App client
                GOOGLE_CLIENT_ID = os.getenv('GOOGLE_CLIENT_ID', '823510409781-7am96n366leset271qt9c8djo265u24n.apps.googleusercontent.com')

                # Verify the token
                idinfo = id_token.verify_oauth2_token(
                    request.credential,
                    google_requests.Request(),
                    GOOGLE_CLIENT_ID
                )

                # Extract user info from verified token
                email = idinfo.get('email')
                name = idinfo.get('name')
                picture = idinfo.get('picture')
                oauth_id = idinfo.get('sub')

            except ValueError as e:
                # Token verification failed - fallback to direct email
                print(f"Google token verification failed: {e}")
                if request.email:
                    email = request.email
                    name = request.name
                    picture = request.picture
                    oauth_id = request.oauth_id
                else:
                    raise HTTPException(status_code=400, detail="Invalid Google token")
        else:
            # Direct email provided (fallback mode)
            email = request.email
            name = request.name
            picture = request.picture
            oauth_id = request.oauth_id

        if not email:
            raise HTTPException(status_code=400, detail="Email required from Google")

        # Generate username from name or email
        if name:
            base_username = name.lower().replace(' ', '_')
        else:
            base_username = email.split('@')[0]

        # Ensure username is unique
        username = base_username
        counter = 1
        while username in usernames:
            username = f"{base_username}{counter}"
            counter += 1

        # Check if user already exists
        if email in users:
            # Existing user - login
            user_data = users[email].copy()
        else:
            # New user - register
            usernames.add(username)
            user_data = {
                'email': email,
                'username': username,
                'target_language': 'Spanish',  # Default, user can change later
                'native_language': 'English',
                'level': 'beginner',
                'interests': [],
                'oauth_provider': 'google',
                'oauth_id': oauth_id,
                'picture': picture
            }
            users[email] = user_data

        # Don't return sensitive data
        response_data = user_data.copy()
        if 'password' in response_data:
            del response_data['password']
        if 'oauth_id' in response_data:
            del response_data['oauth_id']

        return {
            "success": True,
            "token": f"mock_token_{email}",
            "user": response_data
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Google auth error: {str(e)}")

@app.post("/api/auth/login")
async def login(request: LoginRequest):
    """Login user (simplified - add proper auth in production)"""
    if request.email not in users:
        raise HTTPException(status_code=404, detail="User not found")

    # In production, verify password hash here
    user_data = users[request.email].copy()
    if 'password' in user_data:
        del user_data['password']  # Don't return password

    return {
        "success": True,
        "token": f"mock_token_{request.email}",
        "user": user_data
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

# ==================== LESSON ENDPOINTS ====================

@app.get("/api/lessons")
async def get_lessons(level: Optional[str] = None):
    """Get all lessons or filter by level"""
    try:
        if level:
            lessons = get_lessons_by_level(level)
        else:
            lessons = get_all_lessons()

        return {
            "success": True,
            "lessons": lessons,
            "total": len(lessons)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching lessons: {str(e)}")

@app.get("/api/lessons/{lesson_id}")
async def get_lesson(lesson_id: int):
    """Get a specific lesson by ID"""
    try:
        lesson = get_lesson_by_id(lesson_id)
        if not lesson:
            raise HTTPException(status_code=404, detail="Lesson not found")

        return {
            "success": True,
            "lesson": lesson
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching lesson: {str(e)}")

@app.post("/api/lessons/progress")
async def update_lesson_progress(progress: LessonProgress, request: Request):
    """Update user's progress on a lesson"""
    try:
        # Get user from token (for now, using email from request)
        # In production, extract from JWT token
        user_email = request.headers.get("X-User-Email", "guest@example.com")

        if user_email not in user_lesson_progress:
            user_lesson_progress[user_email] = {}

        user_lesson_progress[user_email][progress.lesson_id] = {
            "lesson_id": progress.lesson_id,
            "completed": progress.completed,
            "score": progress.score,
            "attempts": progress.attempts,
            "last_attempt": datetime.utcnow().isoformat()
        }

        return {
            "success": True,
            "progress": user_lesson_progress[user_email][progress.lesson_id]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error updating progress: {str(e)}")

@app.get("/api/lessons/progress/all")
async def get_all_progress(request: Request):
    """Get all lesson progress for current user"""
    try:
        user_email = request.headers.get("X-User-Email", "guest@example.com")

        progress = user_lesson_progress.get(user_email, {})

        return {
            "success": True,
            "progress": progress,
            "total_lessons": len(LESSONS),
            "completed_lessons": len([p for p in progress.values() if p.get("completed", False)])
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching progress: {str(e)}")

@app.post("/api/lessons/{lesson_id}/quiz")
async def submit_quiz(lesson_id: int, submission: QuizSubmission, request: Request):
    """Submit quiz answers and get score"""
    try:
        lesson = get_lesson_by_id(lesson_id)
        if not lesson:
            raise HTTPException(status_code=404, detail="Lesson not found")

        quiz = lesson.get("quiz", [])
        if not quiz:
            raise HTTPException(status_code=400, detail="No quiz for this lesson")

        # Grade the quiz
        total_questions = len(quiz)
        correct_answers = 0
        detailed_results = []

        for answer in submission.answers:
            question = next((q for q in quiz if q["id"] == answer.question_id), None)
            if question:
                is_correct = answer.answer.strip().lower() == question["correct"].strip().lower()
                if is_correct:
                    correct_answers += 1

                detailed_results.append({
                    "question_id": answer.question_id,
                    "question": question["question"],
                    "user_answer": answer.answer,
                    "correct_answer": question["correct"],
                    "is_correct": is_correct
                })

        score = int((correct_answers / total_questions) * 100) if total_questions > 0 else 0
        passed = score >= 70  # 70% to pass

        # Update progress
        user_email = request.headers.get("X-User-Email", "guest@example.com")
        if user_email not in user_lesson_progress:
            user_lesson_progress[user_email] = {}

        current_progress = user_lesson_progress[user_email].get(lesson_id, {})
        attempts = current_progress.get("attempts", 0) + 1

        user_lesson_progress[user_email][lesson_id] = {
            "lesson_id": lesson_id,
            "completed": passed,
            "score": score,
            "attempts": attempts,
            "last_attempt": datetime.utcnow().isoformat()
        }

        # Calculate XP earned
        xp_earned = 0
        if passed:
            xp_earned = 50  # Base XP for passing
            if score == 100:
                xp_earned += 25  # Bonus for perfect score
            if attempts == 1:
                xp_earned += 25  # Bonus for first attempt

            # Award XP to user
            add_xp(user_email, xp_earned)

        # Get updated user stats
        user_stats = user_xp.get(user_email, {})
        current_league = get_league_from_xp(user_stats.get('total_xp', 0))

        return {
            "success": True,
            "score": score,
            "passed": passed,
            "correct_answers": correct_answers,
            "total_questions": total_questions,
            "xp_earned": xp_earned,
            "total_xp": user_stats.get('total_xp', 0),
            "league": current_league,
            "streak_days": user_stats.get('streak_days', 0),
            "detailed_results": detailed_results,
            "message": "Congratulations! You passed!" if passed else "Keep trying! You need 70% to pass."
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error submitting quiz: {str(e)}")

@app.post("/api/auth/apple")
async def apple_auth(request: Request):
    """Handle Apple Sign In authentication"""
    try:
        body = await request.json()
        id_token = body.get("identityToken")
        user_id = body.get("user")
        email = body.get("email")
        name = body.get("fullName", {})

        print(f"Apple auth request: user_id={user_id}, email={email}, name={name}")

        if not id_token:
            raise HTTPException(status_code=400, detail="Missing Apple identity token")

        if not user_id:
            raise HTTPException(status_code=400, detail="Missing Apple user ID")

        # In production, verify the JWT token from Apple
        # For now, we'll create/login the user

        # Try to find existing user by Apple user_id
        existing_user = None
        for user_email, user_data in users.items():
            if user_data.get('oauth_provider') == 'apple' and user_data.get('oauth_id') == user_id:
                existing_user = user_email
                break

        if existing_user:
            # Returning user - load their data
            print(f"Found existing Apple user: {existing_user}")
            user_data = users[existing_user].copy()
        else:
            # New user - create account
            print(f"Creating new Apple user: user_id={user_id}")

            # Generate username from name or email
            if name and isinstance(name, dict):
                given_name = name.get("givenName", "")
                family_name = name.get("familyName", "")
                base_username = f"{given_name}_{family_name}".lower().replace(" ", "_").strip("_")
            elif email:
                base_username = email.split('@')[0]
            else:
                base_username = f"apple_user_{user_id[:8]}"

            # Ensure username is unique
            username = base_username
            counter = 1
            while username in usernames:
                username = f"{base_username}{counter}"
                counter += 1

            # Create new user
            usernames.add(username)
            user_email = email or f"{user_id}@privaterelay.appleid.com"

            user_data = {
                'email': user_email,
                'username': username,
                'target_language': 'Spanish',
                'native_language': 'English',
                'level': 'beginner',
                'interests': [],
                'oauth_provider': 'apple',
                'oauth_id': user_id
            }

            # Store by email AND by Apple user_id for future lookups
            users[user_email] = user_data
            print(f"Created new user: {user_email} (username: {username})")

        # Remove sensitive data
        response_data = user_data.copy()
        if 'password' in response_data:
            del response_data['password']
        if 'oauth_id' in response_data:
            del response_data['oauth_id']

        # Generate JWT token
        token_payload = {
            'email': user_data['email'],
            'exp': int(time.time()) + (7 * 24 * 60 * 60)  # 7 days
        }
        token = jwt.encode(token_payload, 'your-secret-key', algorithm='HS256')

        print(f"Apple auth successful for: {user_data['email']}")

        return {
            "success": True,
            "token": token,
            "user": response_data
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"Apple auth error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Apple auth error: {str(e)}")

# ==================== LEAGUE ENDPOINTS ====================

@app.get("/api/leagues/info")
async def get_leagues_info():
    """Get information about all leagues"""
    return {
        "success": True,
        "leagues": LEAGUES
    }

@app.get("/api/leagues/leaderboard")
async def get_leaderboard(limit: int = 50):
    """Get weekly leaderboard"""
    try:
        # Update leaderboard first
        update_leaderboard()

        # Return top N users
        top_users = weekly_leaderboard[:limit]

        return {
            "success": True,
            "leaderboard": top_users,
            "total_users": len(weekly_leaderboard),
            "week_number": current_week
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching leaderboard: {str(e)}")

@app.get("/api/leagues/my-stats")
async def get_my_league_stats(request: Request):
    """Get current user's league stats and ranking"""
    try:
        user_email = request.headers.get("X-User-Email", "guest@example.com")

        # Update leaderboard
        update_leaderboard()

        # Get user stats
        stats = user_xp.get(user_email, {
            'total_xp': 0,
            'weekly_xp': 0,
            'streak_days': 0,
            'last_active': datetime.datetime.utcnow().isoformat()
        })

        # Determine league
        league_id = get_league_from_xp(stats['total_xp'])
        league_info = LEAGUES[league_id]

        # Find user's rank
        rank = None
        for i, user in enumerate(weekly_leaderboard):
            if user['email'] == user_email:
                rank = i + 1
                break

        # Get XP needed for next league
        next_league_xp = None
        next_league_name = None
        league_keys = list(LEAGUES.keys())
        current_league_index = league_keys.index(league_id)

        if current_league_index < len(league_keys) - 1:
            next_league_id = league_keys[current_league_index + 1]
            next_league_info = LEAGUES[next_league_id]
            next_league_xp = next_league_info['min_xp'] - stats['total_xp']
            next_league_name = next_league_info['name']

        return {
            "success": True,
            "total_xp": stats['total_xp'],
            "weekly_xp": stats['weekly_xp'],
            "streak_days": stats['streak_days'],
            "league": league_info,
            "league_id": league_id,
            "rank": rank,
            "total_competitors": len(weekly_leaderboard),
            "next_league": {
                "name": next_league_name,
                "xp_needed": next_league_xp
            } if next_league_name else None
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching stats: {str(e)}")

@app.get("/api/leagues/by-league/{league_id}")
async def get_league_leaderboard(league_id: str, limit: int = 20):
    """Get leaderboard filtered by specific league"""
    try:
        if league_id not in LEAGUES:
            raise HTTPException(status_code=404, detail="League not found")

        # Update leaderboard
        update_leaderboard()

        # Filter by league
        league_users = [user for user in weekly_leaderboard if user['league'] == league_id]
        league_users = league_users[:limit]

        return {
            "success": True,
            "league": LEAGUES[league_id],
            "leaderboard": league_users,
            "total_users": len(league_users)
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching league leaderboard: {str(e)}")

@app.post("/api/xp/add")
async def add_xp_manual(request: Request):
    """Manually add XP (for activities like stories, practice, etc.)"""
    try:
        body = await request.json()
        xp_amount = body.get("xp", 0)
        activity = body.get("activity", "general")

        if xp_amount <= 0 or xp_amount > 100:
            raise HTTPException(status_code=400, detail="XP amount must be between 1 and 100")

        user_email = request.headers.get("X-User-Email", "guest@example.com")

        # Award XP
        add_xp(user_email, xp_amount)

        # Get updated stats
        stats = user_xp.get(user_email, {})
        league_id = get_league_from_xp(stats['total_xp'])

        return {
            "success": True,
            "xp_added": xp_amount,
            "total_xp": stats['total_xp'],
            "weekly_xp": stats['weekly_xp'],
            "league": league_id,
            "activity": activity
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error adding XP: {str(e)}")

# Mount static files
if os.path.exists("static"):
    app.mount("/static", StaticFiles(directory="static"), name="static")

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8080))
    uvicorn.run(app, host="0.0.0.0", port=port)
