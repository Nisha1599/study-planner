"""FR-01: create, edit, delete assignments."""
from datetime import datetime
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.extensions import db
from app.models import Assignment, Course
from app.services.cache import cache_delete

assignments_bp = Blueprint("assignments", __name__, url_prefix="/api/assignments")

VALID_PRIORITIES = {"low", "medium", "high"}
VALID_STATUSES = {"not_started", "in_progress", "completed"}


def _parse_date(value):
    return datetime.strptime(value, "%Y-%m-%d").date()


@assignments_bp.get("")
@jwt_required()
def list_assignments():
    user_id = get_jwt_identity()
    items = Assignment.query.filter_by(user_id=user_id).order_by(Assignment.deadline.asc()).all()
    return jsonify([a.to_dict() for a in items]), 200


@assignments_bp.post("")
@jwt_required()
def create_assignment():
    user_id = get_jwt_identity()
    data = request.get_json(silent=True) or {}

    required = ("course_id", "title", "deadline", "estimated_hours")
    missing = [f for f in required if not data.get(f)]
    if missing:
        return jsonify({"error": f"missing required fields: {', '.join(missing)}"}), 400

    course = Course.query.filter_by(course_id=data["course_id"], user_id=user_id).first()
    if not course:
        return jsonify({"error": "course_id does not belong to this user"}), 400

    if float(data["estimated_hours"]) <= 0:
        return jsonify({"error": "estimated_hours must be greater than 0"}), 400
    priority = data.get("priority", "medium")
    if priority not in VALID_PRIORITIES:
        return jsonify({"error": "priority must be one of low, medium, high"}), 400

    try:
        deadline = _parse_date(data["deadline"])
    except ValueError:
        return jsonify({"error": "deadline must be in YYYY-MM-DD format"}), 400

    assignment = Assignment(
        user_id=user_id,
        course_id=data["course_id"],
        title=data["title"],
        deadline=deadline,
        estimated_hours=float(data["estimated_hours"]),
        priority=priority,
        status=data.get("status", "not_started"),
        completion_percentage=data.get("completion_percentage", 0),
        notes=data.get("notes"),
    )
    db.session.add(assignment)
    db.session.commit()
    cache_delete(f"dashboard:{user_id}")
    return jsonify(assignment.to_dict()), 201


@assignments_bp.put("/<assignment_id>")
@jwt_required()
def update_assignment(assignment_id):
    user_id = get_jwt_identity()
    assignment = Assignment.query.filter_by(assignment_id=assignment_id, user_id=user_id).first()
    if not assignment:
        return jsonify({"error": "assignment not found"}), 404

    data = request.get_json(silent=True) or {}
    if "deadline" in data:
        try:
            assignment.deadline = _parse_date(data["deadline"])
        except ValueError:
            return jsonify({"error": "deadline must be in YYYY-MM-DD format"}), 400
    if "priority" in data and data["priority"] not in VALID_PRIORITIES:
        return jsonify({"error": "invalid priority"}), 400
    if "status" in data and data["status"] not in VALID_STATUSES:
        return jsonify({"error": "invalid status"}), 400

    for field in ("course_id", "title", "estimated_hours", "priority", "status", "completion_percentage", "notes"):
        if field in data:
            setattr(assignment, field, data[field])

    db.session.commit()
    cache_delete(f"dashboard:{user_id}")
    return jsonify(assignment.to_dict()), 200


@assignments_bp.delete("/<assignment_id>")
@jwt_required()
def delete_assignment(assignment_id):
    user_id = get_jwt_identity()
    assignment = Assignment.query.filter_by(assignment_id=assignment_id, user_id=user_id).first()
    if not assignment:
        return jsonify({"error": "assignment not found"}), 404
    db.session.delete(assignment)
    db.session.commit()
    cache_delete(f"dashboard:{user_id}")
    return jsonify({"deleted": True}), 200
