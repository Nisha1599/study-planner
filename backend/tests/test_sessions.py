def test_mark_session_complete(client, auth_headers, course_id):
    client.post("/api/assignments", json={
        "course_id": course_id, "title": "Essay", "deadline": "2026-09-12", "estimated_hours": 2,
    }, headers=auth_headers)
    client.post("/api/availability", json={"blocks": [
        {"day_of_week": 0, "start_time": "08:00", "end_time": "12:00"},
    ]}, headers=auth_headers)
    gen = client.post("/api/plans/generate", json={"week_start": "2026-09-07"}, headers=auth_headers)
    session_id = gen.get_json()["sessions"][0]["session_id"]

    resp = client.patch(f"/api/sessions/{session_id}/complete", json={
        "actual_hours_spent": 2, "completion_percentage": 100,
    }, headers=auth_headers)
    assert resp.status_code == 200
    assert resp.get_json()["status"] == "completed"


def test_mark_session_incomplete_attempts_reschedule(client, auth_headers, course_id):
    client.post("/api/assignments", json={
        "course_id": course_id, "title": "Essay", "deadline": "2026-09-20", "estimated_hours": 2,
    }, headers=auth_headers)
    client.post("/api/availability", json={"blocks": [
        {"day_of_week": 0, "start_time": "08:00", "end_time": "12:00"},
        {"day_of_week": 1, "start_time": "08:00", "end_time": "12:00"},
    ]}, headers=auth_headers)
    gen = client.post("/api/plans/generate", json={"week_start": "2026-09-07"}, headers=auth_headers)
    session_id = gen.get_json()["sessions"][0]["session_id"]

    resp = client.patch(f"/api/sessions/{session_id}/incomplete", headers=auth_headers)
    assert resp.status_code == 200
    body = resp.get_json()
    assert body["original_session"]["status"] == "incomplete"


def test_session_not_found_returns_404(client, auth_headers):
    resp = client.patch("/api/sessions/does-not-exist/complete", json={}, headers=auth_headers)
    assert resp.status_code == 404
