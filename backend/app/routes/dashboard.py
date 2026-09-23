"""FR-08: progress dashboard — completion %, hours studied, deadlines."""
from datetime import datetime, timedelta
from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models import Assignment, StudySession
from app.services.cache import cache_get, cache_set

dashboard_bp = Blueprint("dashboard", __name__, url_prefix="/api/dashboard")


@dashboard_bp.get("")
@jwt_required()
def get_dashboard():
    user_id = get_jwt_identity()
    cache_key = f"dashboard:{user_id}"

    cached = cache_get(cache_key)
    if cached:
        return jsonify(cached), 200

    assignments = Assignment.query.filter_by(user_id=user_id).all()
    sessions = StudySession.query.filter_by(user_id=user_id).all()

    total = len(assignments)
    completed = len([a for a in assignments if a.status == "completed"])
    avg_completion = round(sum(a.completion_percentage for a in assignments) / total, 1) if total else 0

    hours_studied = sum(
        (s.actual_hours_spent if s.actual_hours_spent is not None
         else (s.scheduled_end - s.scheduled_start).total_seconds() / 3600)
        for s in sessions if s.status == "completed"
    )

    upcoming_cutoff = datetime.utcnow().date() + timedelta(days=7)
    upcoming_deadlines = [
        a.to_dict() for a in assignments
        if a.status != "completed" and a.deadline <= upcoming_cutoff
    ]

    result = {
        "total_assignments": total,
        "completed_assignments": completed,
        "average_completion_percentage": avg_completion,
        "hours_studied": round(hours_studied, 1),
        "upcoming_deadlines": sorted(upcoming_deadlines, key=lambda a: a["deadline"]),
    }

    cache_set(cache_key, result, ttl_seconds=300)
    return jsonify(result), 200
