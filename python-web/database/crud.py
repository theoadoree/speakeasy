"""
CRUD operations for database
"""

from sqlalchemy.orm import Session
from database.models import User, UserSettings, UserProgress
from passlib.context import CryptContext
from datetime import datetime

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def get_password_hash(password: str) -> str:
    """Hash a password"""
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against its hash"""
    return pwd_context.verify(plain_password, hashed_password)


# User CRUD operations
def get_user_by_email(db: Session, email: str):
    """Get user by email"""
    return db.query(User).filter(User.email == email).first()


def get_user_by_username(db: Session, username: str):
    """Get user by username"""
    return db.query(User).filter(User.username == username).first()


def get_user_by_oauth(db: Session, oauth_provider: str, oauth_id: str):
    """Get user by OAuth provider and ID"""
    return db.query(User).filter(
        User.oauth_provider == oauth_provider,
        User.oauth_id == oauth_id
    ).first()


def create_user(
    db: Session,
    email: str,
    username: str,
    target_language: str,
    password: str = None,
    oauth_provider: str = None,
    oauth_id: str = None,
    profile_image_url: str = None
):
    """Create a new user"""
    password_hash = get_password_hash(password) if password else None

    db_user = User(
        email=email,
        username=username,
        password_hash=password_hash,
        oauth_provider=oauth_provider,
        oauth_id=oauth_id,
        target_language=target_language,
        profile_image_url=profile_image_url,
        last_login=datetime.utcnow()
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)

    # Create user settings
    db_settings = UserSettings(user_id=db_user.id)
    db.add(db_settings)

    # Create user progress
    db_progress = UserProgress(user_id=db_user.id)
    db.add(db_progress)

    db.commit()
    return db_user


def update_user_login(db: Session, user_id: int):
    """Update user's last login timestamp"""
    db.query(User).filter(User.id == user_id).update(
        {"last_login": datetime.utcnow()}
    )
    db.commit()


def username_exists(db: Session, username: str) -> bool:
    """Check if username is already taken"""
    return db.query(User).filter(User.username == username).first() is not None


def suggest_username(db: Session, base_username: str) -> str:
    """Suggest an available username"""
    if not username_exists(db, base_username):
        return base_username

    # Try with numbers
    for i in range(1, 1000):
        suggestion = f"{base_username}{i}"
        if not username_exists(db, suggestion):
            return suggestion

    # Fallback: add random suffix
    import random
    suggestion = f"{base_username}{random.randint(1000, 9999)}"
    return suggestion


# User Settings CRUD
def get_user_settings(db: Session, user_id: int):
    """Get user settings"""
    return db.query(UserSettings).filter(UserSettings.user_id == user_id).first()


def update_user_settings(db: Session, user_id: int, **kwargs):
    """Update user settings"""
    db.query(UserSettings).filter(UserSettings.user_id == user_id).update(kwargs)
    db.commit()
    return get_user_settings(db, user_id)


# User Progress CRUD
def get_user_progress(db: Session, user_id: int):
    """Get user progress"""
    return db.query(UserProgress).filter(UserProgress.user_id == user_id).first()


def update_user_progress(db: Session, user_id: int, **kwargs):
    """Update user progress"""
    db.query(UserProgress).filter(UserProgress.user_id == user_id).update(kwargs)
    db.commit()
    return get_user_progress(db, user_id)


def add_xp(db: Session, user_id: int, amount: int, source: str, source_id: int = None, description: str = None):
    """Add XP to user's total and weekly XP"""
    from database.models import XPTransaction

    # Update user progress
    progress = get_user_progress(db, user_id)
    progress.total_xp += amount
    db.commit()

    # Log transaction
    transaction = XPTransaction(
        user_id=user_id,
        amount=amount,
        source=source,
        source_id=source_id,
        description=description
    )
    db.add(transaction)
    db.commit()

    return progress.total_xp
