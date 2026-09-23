"""FR-04 / FR-05: mark sessions complete/incomplete, trigger rescheduling."""
from datetime import datetime
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.extensions import db
from app.models import StudySession, Assignment, AvailableHours
from app.services.scheduler import reschedule_incomplete
from app.services.cache import cache_delete

sessions_bp = Blueprint("sessions", __name__, url_prefix="/api/sessions")


@sessions_bp.patch("/<session_id>/complete")
@jwt_required()
def mark_complete(session_id):
    user_id = get_jwt_identity()
    session = StudySession.query.filter_by(session_id=session_id, user_id=user_id).first()
    if not session:
        return jsonify({"error": "session not found"}), 404

    data = request.get_json(silent=True) or {}
    session.status = "completed"
    session.actual_hours_spent = data.get("actual_hours_spent")

    assignment = Assignment.query.get(session.assignment_id)
    if assignment and "completion_percentage" in data:
        assignment.completion_percentage = data["completion_percentage"]
        if assignment.completion_percentage >= 100:
            assignment.status = "completed"

    db.session.commit()
    cache_delete(f"dashboard:{user_id}")
    return jsonify(session.to_dict()), 200


@sessions_bp.patch("/<session_id>/incomplete")
@jwt_required()
def mark_incomplete(session_id):
    """
    FR-05 in action: mark this session incomplete, then immediately try to
    find it a new slot later in the same week, skipping any time already
    used by other still-scheduled sessions. NFR target: this responds
    within 1 second — the search space here is small (one week), so a
    simple greedy scan comfortably meets that.
    """
    user_id = get_jwt_identity()
    session = StudySession.query.filter_by(session_id=session_id, user_id=user_id).first()
    if not session:
        return jsonify({"error": "session not found"}), 404

    session.status = "incomplete"

    assignment = Assignment.query.get(session.assignment_id)
    original_duration = (session.scheduled_end - session.scheduled_start).total_seconds() / 3600

    availability = AvailableHours.query.filter_by(user_id=user_id).all()
    other_sessions = StudySession.query.filter(
        StudySession.user_id == user_id,
        StudySession.status == "scheduled",
        StudySession.session_id != session_id,
    ).all()
    occupied = [{"start": s.scheduled_start, "end": s.scheduled_end} for s in other_sessions]

    week_end = session.scheduled_start.date()
    week_end = week_end.replace(day=min(week_end.day + (6 - week_end.weekday()), 28))  # end of that week, safe clamp

    new_sessions = []
    if assignment:
        new_sessions = reschedule_incomplete(
            assignment={"assignment_id": assignment.assignment_id},
            remaining_hours=original_duration,
            available_hours=[b.to_dict() for b in availability],
            occupied=occupied,
            search_from=datetime.utcnow(),
            week_end=week_end,
        )

    created = []
    for s in new_sessions:
        new_session = StudySession(
            plan_id=session.plan_id,
            user_id=user_id,
            assignment_id=s["assignment_id"],
            scheduled_start=s["scheduled_start"],
            scheduled_end=s["scheduled_end"],
            status="scheduled",
        )
        db.session.add(new_session)
        created.append(new_session)

    db.session.commit()
    cache_delete(f"dashboard:{user_id}")

    return jsonify({
        "original_session": session.to_dict(),
        "rescheduled_sessions": [s.to_dict() for s in created],
        "rescheduled": len(created) > 0,
    }), 200
