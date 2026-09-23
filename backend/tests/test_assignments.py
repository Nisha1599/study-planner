def test_create_assignment(client, auth_headers, course_id):
    resp = client.post("/api/assignments", json={
        "course_id": course_id, "title": "ER Diagram", "deadline": "2026-10-01",
        "estimated_hours": 4, "priority": "high",
    }, headers=auth_headers)
    assert resp.status_code == 201
    body = resp.get_json()
    assert body["title"] == "ER Diagram"
    assert body["status"] == "not_started"
    assert body["completion_percentage"] == 0


def test_create_assignment_rejects_zero_hours(client, auth_headers, course_id):
    resp = client.post("/api/assignments", json={
        "course_id": course_id, "title": "X", "deadline": "2026-10-01", "estimated_hours": 0,
    }, headers=auth_headers)
    assert resp.status_code == 400


def test_create_assignment_rejects_bad_priority(client, auth_headers, course_id):
    resp = client.post("/api/assignments", json={
        "course_id": course_id, "title": "X", "deadline": "2026-10-01",
        "estimated_hours": 2, "priority": "urgent",
    }, headers=auth_headers)
    assert resp.status_code == 400


def test_create_assignment_rejects_foreign_course(client, auth_headers):
    resp = client.post("/api/assignments", json={
        "course_id": "not-a-real-course-id", "title": "X", "deadline": "2026-10-01", "estimated_hours": 2,
    }, headers=auth_headers)
    assert resp.status_code == 400


def test_update_and_delete_assignment(client, auth_headers, course_id):
    create = client.post("/api/assignments", json={
        "course_id": course_id, "title": "X", "deadline": "2026-10-01", "estimated_hours": 2,
    }, headers=auth_headers)
    aid = create.get_json()["assignment_id"]

    resp = client.put(f"/api/assignments/{aid}", json={"completion_percentage": 50}, headers=auth_headers)
    assert resp.get_json()["completion_percentage"] == 50

    resp = client.delete(f"/api/assignments/{aid}", headers=auth_headers)
    assert resp.status_code == 200
