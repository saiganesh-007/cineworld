from flask_sqlalchemy import SQLAlchemy

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
        nullable=True
    )

    # Additive Supabase identity mapping.
    # The internal integer User.id is preserved for existing
    # favorites/watchlist rows. Supabase UUIDs are the external
    # authenticated identity and are only linked once verified.
    supabase_user_id = db.Column(
        db.String(64),
        unique=True,
        nullable=True,
        index=True
    )

    profile_pic = db.Column(
        db.Text,
        nullable=True
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