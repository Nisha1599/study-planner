from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.extensions import db
from app.models import Course

courses_bp = Blueprint("courses", __name__, url_prefix="/api/courses")


@courses_bp.get("")
@jwt_required()
def list_courses():
    user_id = get_jwt_identity()
    courses = Course.query.filter_by(user_id=user_id).all()
    return jsonify([c.to_dict() for c in courses]), 200


@courses_bp.post("")
@jwt_required()
def create_course():
    user_id = get_jwt_identity()
    data = request.get_json(silent=True) or {}
    if not data.get("course_name"):
        return jsonify({"error": "course_name is required"}), 400

    course = Course(
        user_id=user_id,
        course_name=data["course_name"],
        course_code=data.get("course_code"),
        color=data.get("color", "#3B82F6"),
    )
    db.session.add(course)
    db.session.commit()
    return jsonify(course.to_dict()), 201


@courses_bp.put("/<course_id>")
@jwt_required()
def update_course(course_id):
    user_id = get_jwt_identity()
    course = Course.query.filter_by(course_id=course_id, user_id=user_id).first()
    if not course:
        return jsonify({"error": "course not found"}), 404

    data = request.get_json(silent=True) or {}
    for field in ("course_name", "course_code", "color"):
        if field in data:
            setattr(course, field, data[field])
    db.session.commit()
    return jsonify(course.to_dict()), 200


@courses_bp.delete("/<course_id>")
@jwt_required()
def delete_course(course_id):
    user_id = get_jwt_identity()
    course = Course.query.filter_by(course_id=course_id, user_id=user_id).first()
    if not course:
        return jsonify({"error": "course not found"}), 404
    db.session.delete(course)  # cascades to its assignments (ON DELETE CASCADE)
    db.session.commit()
    return jsonify({"deleted": True}), 200
