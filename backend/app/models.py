"""
SQLAlchemy models for all six tables described in the design doc (Section 6.3).

ID strategy: UUID primary keys (stored as 36-char strings), matching the
doc's "UUID primary keys" requirement. This is deliberately DB-portable —
it works identically on PostgreSQL, MySQL, or SQLite (used in tests) with
no native-UUID-type dependency.

NOTE for frontend integration: the current mock data in the React app uses
plain integers for course_id / assignment_id / session_id. Once you wire
real API calls, those TypeScript types need to change from `number` to
`string` for id fields — everything else about the shape matches.
"""
import uuid
from datetime import datetime, date
from app.extensions import db


def gen_uuid():
    return str(uuid.uuid4())


class User(db.Model):
    __tablename__ = "users"

    user_id = db.Column(db.String(36), primary_key=True, default=gen_uuid)
    name = db.Column(db.String(120), nullable=False)
    email = db.Column(db.String(255), nullable=False, unique=True, index=True)
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(20), nullable=False, default="student")  # student|parent|admin
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {"user_id": self.user_id, "name": self.name, "email": self.email, "role": self.role}


class Course(db.Model):
    __tablename__ = "courses"

    course_id = db.Column(db.String(36), primary_key=True, default=gen_uuid)
    user_id = db.Column(db.String(36), db.ForeignKey("users.user_id", ondelete="CASCADE"), nullable=False)
    course_name = db.Column(db.String(200), nullable=False)
    course_code = db.Column(db.String(50), nullable=True)
    color = db.Column(db.String(20), nullable=True)

    def to_dict(self):
        return {
            "course_id": self.course_id,
            "course_name": self.course_name,
            "course_code": self.course_code,
            "color": self.color,
        }


class Assignment(db.Model):
    __tablename__ = "assignments"
    __table_args__ = (
        db.CheckConstraint("estimated_hours > 0", name="ck_assignment_hours_positive"),
        db.CheckConstraint("completion_percentage >= 0 AND completion_percentage <= 100", name="ck_completion_range"),
        db.CheckConstraint("priority IN ('low','medium','high')", name="ck_priority_values"),
        db.CheckConstraint("status IN ('not_started','in_progress','completed')", name="ck_status_values"),
    )

    assignment_id = db.Column(db.String(36), primary_key=True, default=gen_uuid)
    user_id = db.Column(db.String(36), db.ForeignKey("users.user_id", ondelete="CASCADE"), nullable=False, index=True)
    course_id = db.Column(db.String(36), db.ForeignKey("courses.course_id", ondelete="CASCADE"), nullable=False)
    title = db.Column(db.String(255), nullable=False)
    deadline = db.Column(db.Date, nullable=False, index=True)
    estimated_hours = db.Column(db.Float, nullable=False)
    priority = db.Column(db.String(10), nullable=False, default="medium")
    status = db.Column(db.String(20), nullable=False, default="not_started")
    completion_percentage = db.Column(db.Float, nullable=False, default=0)
    notes = db.Column(db.Text, nullable=True)

    def to_dict(self):
        return {
            "assignment_id": self.assignment_id,
            "course_id": self.course_id,
            "title": self.title,
            "deadline": self.deadline.isoformat(),
            "estimated_hours": self.estimated_hours,
            "priority": self.priority,
            "status": self.status,
            "completion_percentage": self.completion_percentage,
            "notes": self.notes,
        }


class AvailableHours(db.Model):
    __tablename__ = "available_hours"

    id = db.Column(db.String(36), primary_key=True, default=gen_uuid)
    user_id = db.Column(db.String(36), db.ForeignKey("users.user_id", ondelete="CASCADE"), nullable=False, index=True)
    day_of_week = db.Column(db.Integer, nullable=False)  # 0=Monday ... 6=Sunday, matches frontend dayLabels
    start_time = db.Column(db.String(5), nullable=False)  # "HH:MM"
    end_time = db.Column(db.String(5), nullable=False)    # "HH:MM"

    def to_dict(self):
        return {"day_of_week": self.day_of_week, "start_time": self.start_time, "end_time": self.end_time}


class StudyPlan(db.Model):
    __tablename__ = "study_plans"
    __table_args__ = (db.UniqueConstraint("user_id", "week_start", name="uq_user_week"),)

    plan_id = db.Column(db.String(36), primary_key=True, default=gen_uuid)
    user_id = db.Column(db.String(36), db.ForeignKey("users.user_id", ondelete="CASCADE"), nullable=False)
    week_start = db.Column(db.Date, nullable=False)
    week_end = db.Column(db.Date, nullable=False)
    generated_at = db.Column(db.DateTime, default=datetime.utcnow)

    sessions = db.relationship("StudySession", backref="plan", cascade="all, delete-orphan")


class StudySession(db.Model):
    __tablename__ = "study_sessions"
    __table_args__ = (
        db.CheckConstraint("status IN ('scheduled','completed','incomplete')", name="ck_session_status"),
    )

    session_id = db.Column(db.String(36), primary_key=True, default=gen_uuid)
    plan_id = db.Column(db.String(36), db.ForeignKey("study_plans.plan_id", ondelete="CASCADE"), nullable=True)
    user_id = db.Column(db.String(36), db.ForeignKey("users.user_id", ondelete="CASCADE"), nullable=False, index=True)
    assignment_id = db.Column(db.String(36), db.ForeignKey("assignments.assignment_id", ondelete="CASCADE"), nullable=False)
    scheduled_start = db.Column(db.DateTime, nullable=False, index=True)
    scheduled_end = db.Column(db.DateTime, nullable=False)
    status = db.Column(db.String(20), nullable=False, default="scheduled")
    actual_hours_spent = db.Column(db.Float, nullable=True)

    def to_dict(self):
        return {
            "session_id": self.session_id,
            "assignment_id": self.assignment_id,
            "scheduled_start": self.scheduled_start.strftime("%Y-%m-%dT%H:%M"),
            "scheduled_end": self.scheduled_end.strftime("%Y-%m-%dT%H:%M"),
            "status": self.status,
        }
