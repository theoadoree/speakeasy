"""
Initialize database tables and seed initial data
Run this once to set up the database
"""

from database import init_db, SessionLocal
from database.models import League

def seed_leagues():
    """Create initial league tiers"""
    db = SessionLocal()

    leagues_data = [
        {"name": "Bronze", "rank_order": 1, "promotion_threshold": 5, "demotion_threshold": 5, "min_xp": 0, "icon": "🥉"},
        {"name": "Silver", "rank_order": 2, "promotion_threshold": 5, "demotion_threshold": 5, "min_xp": 500, "icon": "🥈"},
        {"name": "Gold", "rank_order": 3, "promotion_threshold": 5, "demotion_threshold": 5, "min_xp": 1000, "icon": "🥇"},
        {"name": "Diamond", "rank_order": 4, "promotion_threshold": 5, "demotion_threshold": 5, "min_xp": 2000, "icon": "💎"},
        {"name": "Master", "rank_order": 5, "promotion_threshold": None, "demotion_threshold": 5, "min_xp": 4000, "icon": "👑"},
    ]

    for league_data in leagues_data:
        existing = db.query(League).filter(League.name == league_data["name"]).first()
        if not existing:
            league = League(**league_data)
            db.add(league)
            print(f"✅ Created league: {league_data['name']}")

    db.commit()
    db.close()
    print("✅ Leagues seeded successfully!")


if __name__ == "__main__":
    print("🔨 Initializing database...")
    init_db()
    print("\n🌱 Seeding initial data...")
    seed_leagues()
    print("\n✅ Database setup complete!")
    print("\n📝 Next steps:")
    print("1. Update .env with your configuration")
    print("2. Run: python app.py")
