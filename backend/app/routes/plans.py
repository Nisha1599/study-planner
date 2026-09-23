"""
FR-03 / NFR-01: POST /api/plans/generate — the core feature of the whole app.
Must complete in <=3s for 50 assignments / 40h availability (NFR-01);
this implementation is O(n log n) sort + linear block allocation, so that
budget is comfortable even at much larger scale.
"""
from datetime import datetime, timedelta
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.extensions import db
from app.models import Assignment, AvailableHours, StudyPlan, StudySession
from app.services.scheduler import generate_study_plan
from app.services.cache import cache_delete

plans_bp = Blueprint("plans", __name__, url_prefix="/api/plans")


@plans_bp.post("/generate")
@jwt_required()
def generate_plan():
    user_id = get_jwt_identity()
    data = request.get_json(silent=True) or {}

    try:
        week_start = datetime.strptime(data["week_start"], "%Y-%m-%d").date()
    except (KeyError, ValueError):
        return jsonify({"error": "week_start is required, format YYYY-MM-DD"}), 400
    week_end = week_start + timedelta(days=6)

    assignments = Assignment.query.filter_by(user_id=user_id).all()
    availability = AvailableHours.query.filter_by(user_id=user_id).all()

    if not availability:
        return jsonify({"error": "no availability set — add available hours before generating a plan"}), 400

    assignment_dicts = [{
        "assignment_id": a.assignment_id,
        "deadline": a.deadline,
        "estimated_hours": a.estimated_hours,
        "priority": a.priority,
        "completion_percentage": a.completion_percentage,
        "status": a.status,
    } for a in assignments]
    availability_dicts = [b.to_dict() for b in availability]

    sessions, at_risk = generate_study_plan(assignment_dicts, availability_dicts, week_start, week_end)

    # Replace any existing plan for this week (regenerating overwrites, it
    # doesn't stack duplicate sessions).
    existing_plan = StudyPlan.query.filter_by(user_id=user_id, week_start=week_start).first()
    if existing_plan:
        db.session.delete(existing_plan)
        db.session.flush()

    plan = StudyPlan(user_id=user_id, week_start=week_start, week_end=week_end)
    db.session.add(plan)
    db.session.flush()  # get plan.plan_id before creating sessions

    created = []
    for s in sessions:
        session = StudySession(
            plan_id=plan.plan_id,
            user_id=user_id,
            assignment_id=s["assignment_id"],
            scheduled_start=s["scheduled_start"],
            scheduled_end=s["scheduled_end"],
            status="scheduled",
        )
        db.session.add(session)
        created.append(session)

    db.session.commit()
    cache_delete(f"dashboard:{user_id}")

    return jsonify({
        "plan_id": plan.plan_id,
        "week_start": week_start.isoformat(),
        "week_end": week_end.isoformat(),
        "sessions": [s.to_dict() for s in created],
        "at_risk_assignment_ids": at_risk,  # couldn't fit — surface this in the UI
    }), 201


@plans_bp.get("")
@jwt_required()
def get_plan_sessions():
    """Convenience endpoint for the Calendar page: sessions for a given week."""
    user_id = get_jwt_identity()
    week_start_str = request.args.get("week_start")
    if not week_start_str:
        return jsonify({"error": "week_start query param required, format YYYY-MM-DD"}), 400
    week_start = datetime.strptime(week_start_str, "%Y-%m-%d").date()
    week_end = week_start + timedelta(days=7)

    sessions = StudySession.query.filter(
        StudySession.user_id == user_id,
        StudySession.scheduled_start >= datetime.combine(week_start, datetime.min.time()),
        StudySession.scheduled_start < datetime.combine(week_end, datetime.min.time()),
    ).all()
    return jsonify([s.to_dict() for s in sessions]), 200
