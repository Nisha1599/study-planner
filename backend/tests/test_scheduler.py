"""
Unit tests for the pure scheduling algorithm (no Flask/DB involved) —
directly verifies Appendix C's logic: priority+deadline ordering, the
3-hour max session cap, splitting across multiple blocks, and marking
assignments "at risk" when they don't fit.
"""
from datetime import date
from app.services.scheduler import generate_study_plan, MAX_SESSION_HOURS


def make_assignment(aid, hours, priority="medium", deadline=date(2026, 9, 12), completion=0, status="not_started"):
    return {
        "assignment_id": aid, "deadline": deadline, "estimated_hours": hours,
        "priority": priority, "completion_percentage": completion, "status": status,
    }


def test_high_priority_scheduled_before_low_priority():
    assignments = [
        make_assignment("low", 2, priority="low"),
        make_assignment("high", 2, priority="high"),
    ]
    availability = [{"day_of_week": 0, "start_time": "08:00", "end_time": "12:00"}]
    sessions, at_risk = generate_study_plan(assignments, availability, date(2026, 9, 7), date(2026, 9, 13))

    assert sessions[0]["assignment_id"] == "high"
    assert at_risk == []


def test_session_never_exceeds_max_hours():
    assignments = [make_assignment("a1", 6)]
    availability = [{"day_of_week": 0, "start_time": "08:00", "end_time": "18:00"}]  # 10h block
    sessions, _ = generate_study_plan(assignments, availability, date(2026, 9, 7), date(2026, 9, 13))

    for s in sessions:
        duration = (s["scheduled_end"] - s["scheduled_start"]).total_seconds() / 3600
        assert duration <= MAX_SESSION_HOURS + 1e-6


def test_assignment_marked_at_risk_when_not_enough_time():
    assignments = [make_assignment("a1", 20)]  # way more than available
    availability = [{"day_of_week": 0, "start_time": "08:00", "end_time": "09:00"}]  # only 1h
    sessions, at_risk = generate_study_plan(assignments, availability, date(2026, 9, 7), date(2026, 9, 13))

    assert "a1" in at_risk


def test_completed_assignments_are_skipped():
    assignments = [make_assignment("done", 5, status="completed")]
    availability = [{"day_of_week": 0, "start_time": "08:00", "end_time": "18:00"}]
    sessions, at_risk = generate_study_plan(assignments, availability, date(2026, 9, 7), date(2026, 9, 13))

    assert sessions == []
    assert at_risk == []


def test_partial_completion_reduces_remaining_hours():
    # 50% done on a 4h assignment -> only 2h should actually be scheduled
    assignments = [make_assignment("a1", 4, completion=50)]
    availability = [{"day_of_week": 0, "start_time": "08:00", "end_time": "18:00"}]
    sessions, _ = generate_study_plan(assignments, availability, date(2026, 9, 7), date(2026, 9, 13))

    total_scheduled = sum((s["scheduled_end"] - s["scheduled_start"]).total_seconds() / 3600 for s in sessions)
    assert abs(total_scheduled - 2) < 0.01


def test_performance_within_nfr01_budget():
    """NFR-01: plan generation must complete in <=3s for 50 assignments / 40h availability."""
    import time
    assignments = [make_assignment(f"a{i}", 2, priority=["low", "medium", "high"][i % 3]) for i in range(50)]
    availability = [
        {"day_of_week": d, "start_time": "08:00", "end_time": "16:00"} for d in range(5)  # 5 days x 8h = 40h
    ]
    start = time.time()
    generate_study_plan(assignments, availability, date(2026, 9, 7), date(2026, 9, 13))
    elapsed = time.time() - start
    assert elapsed <= 3.0
