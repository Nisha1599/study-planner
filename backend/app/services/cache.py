"""
Thin Redis wrapper. Matches the design doc's stated pattern (Section 5):
results are written to PostgreSQL, then the Redis cache for that user's
data is invalidated so the next read recomputes fresh.

Every call is wrapped in try/except: if Redis is unreachable, the app
should degrade to "just query the DB every time" rather than crash. That
fallback is a deliberate reliability choice, not laziness — Redis here is
purely a performance optimization, and the app must remain correct without it.
"""
import json
import redis
from flask import current_app

_client = None


def get_client():
    global _client
    if _client is None:
        _client = redis.from_url(current_app.config["REDIS_URL"], decode_responses=True, socket_connect_timeout=1)
    return _client


def cache_get(key: str):
    try:
        raw = get_client().get(key)
        return json.loads(raw) if raw else None
    except Exception:
        return None  # Redis down or key missing — caller falls back to DB


def cache_set(key: str, value, ttl_seconds: int = 300):
    try:
        get_client().set(key, json.dumps(value), ex=ttl_seconds)
    except Exception:
        pass  # caching is best-effort, never fatal


def cache_delete(key: str):
    try:
        get_client().delete(key)
    except Exception:
        pass
