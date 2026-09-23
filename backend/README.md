# Study Planner — Backend

Flask API implementing the design in `ICT503_A1_Personalized_Study_Planning_Application.docx`.
Matches the mock data field names already used in the React frontend, so
wiring them together later is a small change, not a rewrite.

## Project structure

```
backend/
  app/
    __init__.py          # app factory — wires everything together
    config.py             # settings, read from .env
    extensions.py         # db, jwt, bcrypt, cors, limiter objects
    models.py              # all 6 SQLAlchemy models (Section 6.3 of the doc)
    routes/                # one blueprint per resource
      auth.py               # register, login
      courses.py
      assignments.py         # FR-01
      availability.py         # FR-02
      plans.py                  # FR-03 — plan generation (the core feature)
      sessions.py                # FR-04, FR-05 — complete/incomplete + reschedule
      dashboard.py                 # FR-08
    services/
      scheduler.py           # the real algorithm (Appendix C), pure functions
      cache.py                 # Redis helper, fails safe if Redis is down
  tests/                  # pytest — one file per route group + the algorithm
  requirements.txt
  docker-compose.yml     # Postgres + Redis, for local dev
  .env.example
  run.py                  # entrypoint
```

## Step-by-step setup (from nothing)

**1. Get the files in place.**
You already have this `backend/` folder — put it inside your `study-planner`
repo, as a sibling to the existing frontend code (not nested inside `src/`):

```
study-planner/
  src/            <- existing React frontend
  backend/        <- this folder
  package.json
```

**2. Create and activate a Python virtual environment.**
```bash
cd study-planner/backend
python3 -m venv venv

# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate
```
You'll know it worked because your terminal prompt gets a `(venv)` prefix.

**3. Install dependencies.**
```bash
pip install -r requirements.txt
```

**4. Start Postgres and Redis.**
You need Docker Desktop installed and running first. Then:
```bash
docker compose up -d
```
This starts two containers in the background — check with `docker ps`. If
you don't want Docker, you can install Postgres and Redis natively instead,
but Docker is far less setup pain.

**5. Set up your environment file.**
```bash
cp .env.example .env
```
The defaults in `.env.example` already match `docker-compose.yml`'s
credentials, so for local dev you likely don't need to change anything.
Just change `SECRET_KEY` and `JWT_SECRET_KEY` to any random strings.

**6. Create the database tables.**
```bash
flask --app run.py create-db
```
This runs a small custom command (defined in `app/__init__.py`) that calls
`db.create_all()` — the simplest way to get tables into a fresh database.
(For a real production app you'd use proper migrations via Flask-Migrate,
but for a 12-week student project this is a reasonable simplification —
mention this as a known limitation in your report if you want to be thorough.)

**7. Run the server.**
```bash
python run.py
```
You should see Flask start on `http://localhost:5000`. Test it's alive:
```bash
curl http://localhost:5000/api/health
# {"status": "ok"}
```

**8. Run the tests.**
In a separate terminal (venv still active):
```bash
pytest -v
```
All 31 tests should pass. These don't need Docker/Postgres/Redis running —
they use an in-memory SQLite database instead, so they're fast and fully
isolated from your dev environment.

## Trying it manually before touching React

Worth doing once, so you *see* the whole pipeline work before wiring the
frontend to it:

```bash
# 1. Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Alex","email":"alex@test.com","password":"password123"}'
# copy the "access_token" from the response

# 2. Create a course (replace TOKEN below)
curl -X POST http://localhost:5000/api/courses \
  -H "Authorization: Bearer TOKEN" -H "Content-Type: application/json" \
  -d '{"course_name":"Databases","course_code":"CS350"}'
# copy the returned "course_id"

# 3. Create an assignment (replace COURSE_ID)
curl -X POST http://localhost:5000/api/assignments \
  -H "Authorization: Bearer TOKEN" -H "Content-Type: application/json" \
  -d '{"course_id":"COURSE_ID","title":"ER Diagram","deadline":"2026-10-05","estimated_hours":4,"priority":"high"}'

# 4. Set availability
curl -X POST http://localhost:5000/api/availability \
  -H "Authorization: Bearer TOKEN" -H "Content-Type: application/json" \
  -d '{"blocks":[{"day_of_week":0,"start_time":"08:00","end_time":"12:00"}]}'

# 5. Generate a plan
curl -X POST http://localhost:5000/api/plans/generate \
  -H "Authorization: Bearer TOKEN" -H "Content-Type: application/json" \
  -d '{"week_start":"2026-09-07"}'
```
Step 5's response is your real, algorithm-generated study schedule.

## Known simplifications (be upfront about these in your report)

- `db.create_all()` instead of Flask-Migrate — fine for dev, not for
  production schema evolution.
- CORS is wide open (`origins: "*"`) — fine for local dev, must be
  restricted before any real deployment.
- JWTs don't currently support logout/revocation (no blacklist) — noted as
  a possible Redis-backed extension in the design doc discussion.
- Calendar sync (FR-09) and notifications (FR-07) are not implemented —
  both need external OAuth credentials and were flagged as lower-priority
  given the project's stated constraints (no premium third-party APIs,
  12-week timeline, 2-person team).

## Next step

Everything above gets you a working backend you can test with `curl`.
Wiring the React frontend to call this instead of `mockData.ts` is the
next phase — one page at a time (Login first, since everything else is
gated behind it).
