from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash

db = SQLAlchemy()


# ==========================================
# USER
# ==========================================

class User(db.Model):

    id = db.Column(
        db.Integer,
        primary_key=True
    )

    username = db.Column(
        db.String(80),
        unique=True,
        nullable=False
    )

    email = db.Column(
        db.String(120),
        unique=True,
        nullable=False
    )

    password = db.Column(
        db.String(255),
        nullable=False
    )

    profile_pic = db.Column(
        db.Text,
        nullable=True
    )

    def set_password(self, password):
        self.password = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(
            self.password,
            password
        )


# ==========================================
# FAVORITE
# ==========================================

class Favorite(db.Model):

    id = db.Column(
        db.Integer,
        primary_key=True
    )

    user_id = db.Column(
        db.Integer,
        db.ForeignKey("user.id"),
        nullable=False
    )

    movie_id = db.Column(
        db.Integer,
        nullable=False
    )

    media_type = db.Column(
        db.String(20),
        nullable=False
    )

    title = db.Column(
        db.String(255),
        nullable=False
    )

    poster_path = db.Column(
        db.String(500),
        nullable=True
    )

    created_at = db.Column(
        db.DateTime,
        server_default=db.func.now()
    )


# ==========================================
# WATCHLIST
# ==========================================

class Watchlist(db.Model):

    id = db.Column(
        db.Integer,
        primary_key=True
    )

    user_id = db.Column(
        db.Integer,
        db.ForeignKey("user.id"),
        nullable=False
    )

    movie_id = db.Column(
        db.Integer,
        nullable=False
    )

    media_type = db.Column(
        db.String(20),
        nullable=False
    )

    title = db.Column(
        db.String(255),
        nullable=False
    )

    poster_path = db.Column(
        db.String(500),
        nullable=True
    )

    created_at = db.Column(
        db.DateTime,
        server_default=db.func.now()
    )