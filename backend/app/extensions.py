"""
All Flask extension objects live here, uninitialized. This avoids circular
imports: models.py can import `db`, routes can import `jwt`/`bcrypt`, etc.,
without any of them needing to import the app factory itself.
"""
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager
from flask_bcrypt import Bcrypt
from flask_cors import CORS
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

db = SQLAlchemy()
jwt = JWTManager()
bcrypt = Bcrypt()
cors = CORS()

# NFR-01 in the design doc requires 100 requests/minute/user with 429s.
# storage_uri is set to Redis in create_app(); falls back to in-memory
# automatically if Redis isn't reachable during early local dev.
limiter = Limiter(key_func=get_remote_address, default_limits=["100 per minute"])
