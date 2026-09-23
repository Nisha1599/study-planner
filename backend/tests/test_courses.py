def test_create_and_list_courses(client, auth_headers):
    resp = client.post("/api/courses", json={"course_name": "Databases", "course_code": "CS350"}, headers=auth_headers)
    assert resp.status_code == 201
    assert resp.get_json()["course_name"] == "Databases"

    resp = client.get("/api/courses", headers=auth_headers)
    assert resp.status_code == 200
    assert len(resp.get_json()) == 1


def test_create_course_without_name_fails(client, auth_headers):
    resp = client.post("/api/courses", json={"course_code": "CS350"}, headers=auth_headers)
    assert resp.status_code == 400


def test_update_course(client, auth_headers, course_id):
    resp = client.put(f"/api/courses/{course_id}", json={"course_name": "Updated Name"}, headers=auth_headers)
    assert resp.status_code == 200
    assert resp.get_json()["course_name"] == "Updated Name"


def test_delete_course(client, auth_headers, course_id):
    resp = client.delete(f"/api/courses/{course_id}", headers=auth_headers)
    assert resp.status_code == 200
    resp = client.get("/api/courses", headers=auth_headers)
    assert resp.get_json() == []


def test_courses_are_scoped_per_user(client, auth_headers, course_id):
    # A second user should not see the first user's courses.
    client.post("/api/auth/register", json={"name": "Other", "email": "other@test.com", "password": "password123"})
    login = client.post("/api/auth/login", json={"email": "other@test.com", "password": "password123"})
    other_headers = {"Authorization": f"Bearer {login.get_json()['access_token']}"}

    resp = client.get("/api/courses", headers=other_headers)
    assert resp.get_json() == []
