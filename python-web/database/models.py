"""
Database models for SpeakEasy
Using SQLAlchemy ORM
"""

from sqlalchemy import Column, Integer, String, Boolean, DateTime, Date, ARRAY, JSON, ForeignKey, Text, Index
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.sql import func
from datetime import datetime, date

Base = declarative_base()


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    username = Column(String(50), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=True)  # NULL for OAuth users
    oauth_provider = Column(String(50), nullable=True)  # 'google', 'apple', or NULL
    oauth_id = Column(String(255), nullable=True)
    target_language = Column(String(50), nullable=False)
    native_language = Column(String(50), default="English")
    assessed_level = Column(String(20), nullable=True)  # Result from assessment
    profile_image_url = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    last_login = Column(DateTime(timezone=True), nullable=True)

    __table_args__ = (
        Index('idx_oauth_unique', 'oauth_provider', 'oauth_id', unique=True),
    )


class UserSettings(Base):
    __tablename__ = "user_settings"

    user_id = Column(Integer, ForeignKey('users.id', ondelete='CASCADE'), primary_key=True)
    theme = Column(String(20), default='light')  # 'light' or 'dark'
    music_enabled = Column(Boolean, default=False)
    spotify_token = Column(Text, nullable=True)
    spotify_refresh_token = Column(Text, nullable=True)
    notifications_enabled = Column(Boolean, default=True)
    daily_goal_xp = Column(Integer, default=50)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())


class UserProgress(Base):
    __tablename__ = "user_progress"

    user_id = Column(Integer, ForeignKey('users.id', ondelete='CASCADE'), primary_key=True)
    current_lesson = Column(Integer, default=0)  # 0 means assessment not done
    lessons_completed = Column(ARRAY(Integer), default=[])
    total_xp = Column(Integer, default=0)
    daily_streak = Column(Integer, default=0)
    last_activity_date = Column(Date, nullable=True)
    assessment_completed = Column(Boolean, default=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())


class Lesson(Base):
    __tablename__ = "lessons"

    id = Column(Integer, primary_key=True, index=True)
    lesson_number = Column(Integer, unique=True, nullable=False, index=True)
    title = Column(String(255), nullable=False)
    level = Column(String(20), nullable=False)  # 'beginner', 'intermediate', 'advanced'
    language = Column(String(50), nullable=False)
    content = Column(JSON, nullable=False)  # {story, vocabulary, grammar, exercises}
    quiz = Column(JSON, nullable=False)  # {questions: [...], passing_score: 70}
    xp_reward = Column(Integer, default=50)
    estimated_minutes = Column(Integer, default=15)


class QuizAttempt(Base):
    __tablename__ = "quiz_attempts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    lesson_id = Column(Integer, ForeignKey('lessons.id'), nullable=False)
    score = Column(Integer, nullable=False)
    perfect_score = Column(Boolean, default=False)
    answers = Column(JSON, nullable=True)  # User's answers
    xp_earned = Column(Integer, nullable=True)
    completed_at = Column(DateTime(timezone=True), server_default=func.now())

    __table_args__ = (
        Index('idx_user_lesson', 'user_id', 'lesson_id'),
    )


class League(Base):
    __tablename__ = "leagues"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), unique=True, nullable=False)  # 'Bronze', 'Silver', etc.
    rank_order = Column(Integer, unique=True, nullable=False)  # 1=Bronze, 2=Silver
    promotion_threshold = Column(Integer, nullable=True)  # Top N promote
    demotion_threshold = Column(Integer, nullable=True)  # Bottom N demote
    min_xp = Column(Integer, default=0)
    icon = Column(String(100), nullable=True)


class LeagueParticipant(Base):
    __tablename__ = "league_participants"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    league_id = Column(Integer, ForeignKey('leagues.id'), nullable=False)
    week_start = Column(Date, nullable=False)
    week_end = Column(Date, nullable=False)
    weekly_xp = Column(Integer, default=0)
    rank = Column(Integer, nullable=True)
    promoted = Column(Boolean, default=False)
    demoted = Column(Boolean, default=False)

    __table_args__ = (
        Index('idx_user_week', 'user_id', 'week_start', unique=True),
    )


class Conversation(Base):
    __tablename__ = "conversations"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    language = Column(String(50), nullable=False)
    messages = Column(JSON, nullable=False)  # Array of {role, content, timestamp}
    xp_earned = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())


class XPTransaction(Base):
    __tablename__ = "xp_transactions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    amount = Column(Integer, nullable=False)
    source = Column(String(50), nullable=False)  # 'lesson', 'quiz', 'streak', 'chat'
    source_id = Column(Integer, nullable=True)  # Reference to lesson_id, etc.
    description = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)

    __table_args__ = (
        Index('idx_user_created', 'user_id', 'created_at'),
    )
