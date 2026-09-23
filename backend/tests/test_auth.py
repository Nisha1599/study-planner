def test_register_creates_user_and_returns_token(client):
    resp = client.post("/api/auth/register", json={
        "name": "Alex", "email": "alex@test.com", "password": "password123",
    })
    assert resp.status_code == 201
    body = resp.get_json()
    assert "access_token" in body
    assert body["user"]["email"] == "alex@test.com"


def test_register_rejects_duplicate_email(client):
    client.post("/api/auth/register", json={"name": "A", "email": "dup@test.com", "password": "password123"})
    resp = client.post("/api/auth/register", json={"name": "B", "email": "dup@test.com", "password": "password123"})
    assert resp.status_code == 409


def test_register_rejects_short_password(client):
    resp = client.post("/api/auth/register", json={"name": "A", "email": "a@test.com", "password": "short"})
    assert resp.status_code == 400


def test_login_with_correct_credentials_succeeds(client):
    client.post("/api/auth/register", json={"name": "Alex", "email": "alex@test.com", "password": "password123"})
    resp = client.post("/api/auth/login", json={"email": "alex@test.com", "password": "password123"})
    assert resp.status_code == 200
    assert "access_token" in resp.get_json()


def test_login_with_wrong_password_fails(client):
    client.post("/api/auth/register", json={"name": "Alex", "email": "alex@test.com", "password": "password123"})
    resp = client.post("/api/auth/login", json={"email": "alex@test.com", "password": "wrongpassword"})
    assert resp.status_code == 401


def test_protected_endpoint_rejects_missing_token(client):
    resp = client.get("/api/courses")
    assert resp.status_code == 401
