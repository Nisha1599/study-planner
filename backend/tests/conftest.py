"""
Shared pytest fixtures. Tests run against an in-memory SQLite DB (TestConfig)
so they're fast and need no Docker/Postgres/Redis running — Redis calls in
cache.py fail silently and fall back to "no cache", which is fine for tests.
"""
import pytest
from app import create_app
from app.config import TestConfig
from app.extensions import db as _db


@pytest.fixture
def app():
    app = create_app(TestConfig)
    with app.app_context():
        _db.create_all()
        yield app
        _db.drop_all()


@pytest.fixture
def client(app):
    return app.test_client()


@pytest.fixture
def auth_headers(client):
    """Registers a fresh test user and returns ready-to-use auth headers."""
    resp = client.post("/api/auth/register", json={
        "name": "Test Student",
        "email": "student@test.com",
        "password": "password123",
    })
    token = resp.get_json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
def course_id(client, auth_headers):
    resp = client.post("/api/courses", json={"course_name": "CS301", "course_code": "CS301"}, headers=auth_headers)
    return resp.get_json()["course_id"]
