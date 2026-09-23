"""
FR/NFR-05: registration + login, bcrypt password hashing, JWT issuing.

The design doc's API table (Section 6.4) only lists POST /api/auth/login —
register is added here since there's no way to create an account otherwise.
Document this addition in your report as a sensible extension of the spec.
"""
from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token
from app.extensions import db, bcrypt
from app.models import User

auth_bp = Blueprint("auth", __name__, url_prefix="/api/auth")


@auth_bp.post("/register")
def register():
    data = request.get_json(silent=True) or {}
    name = (data.get("name") or "").strip()
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""

    if not name or not email or not password:
        return jsonify({"error": "name, email and password are required"}), 400
    if len(password) < 8:
        return jsonify({"error": "password must be at least 8 characters"}), 400
    if User.query.filter_by(email=email).first():
        return jsonify({"error": "an account with this email already exists"}), 409

    # 12 rounds per NFR-05
    pw_hash = bcrypt.generate_password_hash(password, rounds=12).decode("utf-8")
    user = User(name=name, email=email, password_hash=pw_hash, role=data.get("role", "student"))
    db.session.add(user)
    db.session.commit()

    token = create_access_token(identity=user.user_id)
    return jsonify({"access_token": token, "user": user.to_dict()}), 201


@auth_bp.post("/login")
def login():
    data = request.get_json(silent=True) or {}
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""

    user = User.query.filter_by(email=email).first()
    if not user or not bcrypt.check_password_hash(user.password_hash, password):
        # Deliberately generic message — don't reveal whether the email exists.
        return jsonify({"error": "invalid email or password"}), 401

    token = create_access_token(identity=user.user_id)
    return jsonify({"access_token": token, "user": user.to_dict()}), 200
