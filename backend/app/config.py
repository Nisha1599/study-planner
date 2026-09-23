import os
from dotenv import load_dotenv

load_dotenv()


class Config:
    """
    Central place for all settings. Reads from environment variables (.env)
    so secrets never get hardcoded or committed.
    """
    SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret-change-me")
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "dev-jwt-secret-change-me")

    SQLALCHEMY_DATABASE_URI = os.getenv(
        "DATABASE_URL", "postgresql://planner:plannerpass@localhost:5432/study_planner"
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")

    # JWT access tokens expire in 24h for a student project (keep it simple;
    # tighten this before any real deployment).
    JWT_ACCESS_TOKEN_EXPIRES = 60 * 60 * 24


class TestConfig(Config):
    """Used by pytest — fast in-memory SQLite, no Redis dependency needed."""
    TESTING = True
    SQLALCHEMY_DATABASE_URI = "sqlite:///:memory:"
