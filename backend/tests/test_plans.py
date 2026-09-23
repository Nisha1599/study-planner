def test_generate_plan_end_to_end(client, auth_headers, course_id):
    client.post("/api/assignments", json={
        "course_id": course_id, "title": "Essay", "deadline": "2026-09-12",
        "estimated_hours": 3, "priority": "high",
    }, headers=auth_headers)
    client.post("/api/availability", json={"blocks": [
        {"day_of_week": 0, "start_time": "08:00", "end_time": "12:00"},
    ]}, headers=auth_headers)

    resp = client.post("/api/plans/generate", json={"week_start": "2026-09-07"}, headers=auth_headers)
    assert resp.status_code == 201
    body = resp.get_json()
    assert len(body["sessions"]) >= 1
    assert body["sessions"][0]["status"] == "scheduled"


def test_generate_plan_without_availability_fails_clearly(client, auth_headers, course_id):
    client.post("/api/assignments", json={
        "course_id": course_id, "title": "Essay", "deadline": "2026-09-12", "estimated_hours": 3,
    }, headers=auth_headers)
    resp = client.post("/api/plans/generate", json={"week_start": "2026-09-07"}, headers=auth_headers)
    assert resp.status_code == 400


def test_regenerating_plan_replaces_old_sessions(client, auth_headers, course_id):
    client.post("/api/assignments", json={
        "course_id": course_id, "title": "Essay", "deadline": "2026-09-12", "estimated_hours": 2,
    }, headers=auth_headers)
    client.post("/api/availability", json={"blocks": [
        {"day_of_week": 0, "start_time": "08:00", "end_time": "12:00"},
    ]}, headers=auth_headers)

    first = client.post("/api/plans/generate", json={"week_start": "2026-09-07"}, headers=auth_headers)
    second = client.post("/api/plans/generate", json={"week_start": "2026-09-07"}, headers=auth_headers)

    resp = client.get("/api/plans", query_string={"week_start": "2026-09-07"}, headers=auth_headers)
    # should not have doubled up sessions from regenerating twice
    assert len(resp.get_json()) == len(second.get_json()["sessions"])
