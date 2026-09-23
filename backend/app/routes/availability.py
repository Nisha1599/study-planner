"""FR-02: weekly available-hours time blocks."""
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.extensions import db
from app.models import AvailableHours

availability_bp = Blueprint("availability", __name__, url_prefix="/api/availability")


@availability_bp.get("")
@jwt_required()
def list_availability():
    user_id = get_jwt_identity()
    blocks = AvailableHours.query.filter_by(user_id=user_id).all()
    return jsonify([b.to_dict() for b in blocks]), 200


@availability_bp.post("")
@jwt_required()
def replace_availability():
    """
    The frontend's drag-select grid saves the whole week's availability at
    once, so this endpoint replaces the full set rather than adding one row
    at a time. Body: {"blocks": [{day_of_week, start_time, end_time}, ...]}
    """
    user_id = get_jwt_identity()
    data = request.get_json(silent=True) or {}
    blocks = data.get("blocks", [])

    for b in blocks:
        if not (0 <= b.get("day_of_week", -1) <= 6):
            return jsonify({"error": "day_of_week must be 0-6"}), 400

    AvailableHours.query.filter_by(user_id=user_id).delete()
    for b in blocks:
        db.session.add(AvailableHours(
            user_id=user_id,
            day_of_week=b["day_of_week"],
            start_time=b["start_time"],
            end_time=b["end_time"],
        ))
    db.session.commit()

    saved = AvailableHours.query.filter_by(user_id=user_id).all()
    return jsonify([b.to_dict() for b in saved]), 200
