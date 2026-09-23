from flask import Flask
from app.config import Config
from app.extensions import db, jwt, bcrypt, cors, limiter


def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    db.init_app(app)
    jwt.init_app(app)
    bcrypt.init_app(app)
    cors.init_app(app, resources={r"/api/*": {"origins": "*"}})  # tighten origins before real deployment

    limiter.storage_uri = app.config.get("REDIS_URL", "memory://")
    limiter.init_app(app)

    from app.routes.auth import auth_bp
    from app.routes.courses import courses_bp
    from app.routes.assignments import assignments_bp
    from app.routes.availability import availability_bp
    from app.routes.plans import plans_bp
    from app.routes.sessions import sessions_bp
    from app.routes.dashboard import dashboard_bp

    app.register_blueprint(auth_bp)
    app.register_blueprint(courses_bp)
    app.register_blueprint(assignments_bp)
    app.register_blueprint(availability_bp)
    app.register_blueprint(plans_bp)
    app.register_blueprint(sessions_bp)
    app.register_blueprint(dashboard_bp)

    @app.get("/api/health")
    def health():
        return {"status": "ok"}, 200

    # Simple dev-only helper — creates all tables without needing a full
    # Alembic migration setup. Run with: flask --app run.py create-db
    @app.cli.command("create-db")
    def create_db():
        with app.app_context():
            db.create_all()
        print("Tables created.")

    return app
