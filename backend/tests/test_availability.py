def test_replace_availability_saves_blocks(client, auth_headers):
    resp = client.post("/api/availability", json={"blocks": [
        {"day_of_week": 0, "start_time": "08:00", "end_time": "12:00"},
        {"day_of_week": 2, "start_time": "14:00", "end_time": "18:00"},
    ]}, headers=auth_headers)
    assert resp.status_code == 200
    assert len(resp.get_json()) == 2


def test_replace_availability_overwrites_previous_set(client, auth_headers):
    client.post("/api/availability", json={"blocks": [{"day_of_week": 0, "start_time": "08:00", "end_time": "12:00"}]}, headers=auth_headers)
    resp = client.post("/api/availability", json={"blocks": [{"day_of_week": 1, "start_time": "09:00", "end_time": "10:00"}]}, headers=auth_headers)
    assert len(resp.get_json()) == 1
    assert resp.get_json()[0]["day_of_week"] == 1


def test_invalid_day_of_week_rejected(client, auth_headers):
    resp = client.post("/api/availability", json={"blocks": [{"day_of_week": 9, "start_time": "08:00", "end_time": "12:00"}]}, headers=auth_headers)
    assert resp.status_code == 400
