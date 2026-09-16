import os
from pathlib import Path

from dotenv import load_dotenv
from flask import Flask, jsonify, request
from flask_cors import CORS


load_dotenv(Path(__file__).resolve().parent / ".env")

from backend.auth import require_authenticated_user, resolve_authenticated_user
from backend.models import db, Favorite, Watchlist


app = Flask(__name__)


# ==========================================
# DATABASE CONFIGURATION
# ==========================================

DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    DEFAULT_DB_PATH = (
        Path(__file__).resolve().parent
        / "instance"
        / "cineworld.db"
    )
    DATABASE_URL = f"sqlite:///{DEFAULT_DB_PATH.as_posix()}"

# PostgreSQL URLs sometimes start with postgres://
# SQLAlchemy expects postgresql://
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace(
        "postgres://",
        "postgresql://",
        1
    )

app.config["SQLALCHEMY_DATABASE_URI"] = DATABASE_URL
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False


# ==========================================
# FLASK CONFIGURATION
# ==========================================

CORS(app)

db.init_app(app)


# ==========================================
# CREATE DATABASE TABLES
# ==========================================

with app.app_context():
    db.create_all()


# ==========================================
# TEST
# ==========================================

@app.route("/api/test", methods=["GET"])
def test():
    return jsonify({
        "success": True,
        "message": "CINEWorld backend is working"
    })


# ==========================================
# SUPABASE AUTH IDENTITY BRIDGE (read-only)
# ==========================================

@app.route("/api/auth/me", methods=["GET"])
def auth_me():
    payload, status = resolve_authenticated_user()
    return jsonify(payload), status


# ==========================================
# AUTHENTICATED FAVORITES / WATCHLIST (Supabase)
#
# Identity always comes from the verified Supabase Bearer token.
# A client-supplied user_id is never accepted or trusted here.
# ==========================================

def _require_user():
    user, payload, status = require_authenticated_user()

    if not user:
        return None, payload, status

    return user, None, status


def _favorite_payload(item):
    return {
        "id": item.id,
        "movie_id": item.movie_id,
        "media_type": item.media_type,
        "title": item.title,
        "poster_path": item.poster_path
    }


def _watchlist_payload(item):
    return {
        "id": item.id,
        "movie_id": item.movie_id,
        "media_type": item.media_type,
        "title": item.title,
        "poster_path": item.poster_path
    }


def _parse_item_payload():
    data = request.get_json() or {}

    tmdb_id = data.get("tmdb_id")
    if tmdb_id is None:
        tmdb_id = data.get("movie_id")

    media_type = (data.get("media_type") or "").strip() or None
    title = (data.get("title") or "").strip() or None
    poster_path = data.get("poster_path")

    if poster_path is not None:
        poster_path = str(poster_path).strip() or None

    return tmdb_id, media_type, title, poster_path


def _valid_tmdb_id(tmdb_id):
    try:
        value = int(tmdb_id)
    except (TypeError, ValueError):
        return None

    if value <= 0:
        return None

    return value


@app.route("/api/me/favorites", methods=["GET"])
def get_my_favorites():
    user, payload, status = _require_user()

    if not user:
        return jsonify(payload), status

    favorites = Favorite.query.filter_by(
        user_id=user.id
    ).order_by(
        Favorite.created_at.desc()
    ).all()

    return jsonify({
        "success": True,
        "favorites": [
            _favorite_payload(item)
            for item in favorites
        ]
    })


@app.route("/api/me/favorites", methods=["POST"])
def add_my_favorite():
    user, payload, status = _require_user()

    if not user:
        return jsonify(payload), status

    tmdb_id, media_type, title, poster_path = _parse_item_payload()

    movie_id = _valid_tmdb_id(tmdb_id)

    if movie_id is None or not media_type or not title:
        return jsonify({
            "success": False,
            "message": (
                "tmdb_id, media_type and title are required"
            )
        }), 400

    if len(media_type) > 20:
        return jsonify({
            "success": False,
            "message": "media_type must be 20 characters or fewer"
        }), 400

    existing = Favorite.query.filter_by(
        user_id=user.id,
        movie_id=movie_id,
        media_type=media_type
    ).first()

    if existing:
        return jsonify({
            "success": False,
            "message": "Already in favorites"
        }), 409

    favorite = Favorite(
        user_id=user.id,
        movie_id=movie_id,
        media_type=media_type,
        title=title,
        poster_path=poster_path
    )

    db.session.add(favorite)
    db.session.commit()

    return jsonify({
        "success": True,
        "message": "Added to favorites",
        "favorite": _favorite_payload(favorite)
    }), 201


@app.route("/api/me/favorites/<int:tmdb_id>", methods=["DELETE"])
def remove_my_favorite(tmdb_id):
    user, payload, status = _require_user()

    if not user:
        return jsonify(payload), status

    media_type = (request.args.get("media_type") or "").strip()

    if not media_type:
        return jsonify({
            "success": False,
            "message": "media_type query parameter is required"
        }), 400

    favorite = Favorite.query.filter_by(
        user_id=user.id,
        movie_id=tmdb_id,
        media_type=media_type
    ).first()

    if not favorite:
        return jsonify({
            "success": False,
            "message": "Favorite not found"
        }), 404

    db.session.delete(favorite)
    db.session.commit()

    return jsonify({
        "success": True,
        "message": "Removed from favorites"
    })


@app.route("/api/me/watchlist", methods=["GET"])
def get_my_watchlist():
    user, payload, status = _require_user()

    if not user:
        return jsonify(payload), status

    items = Watchlist.query.filter_by(
        user_id=user.id
    ).order_by(
        Watchlist.created_at.desc()
    ).all()

    return jsonify({
        "success": True,
        "watchlist": [
            _watchlist_payload(item)
            for item in items
        ]
    })


@app.route("/api/me/watchlist", methods=["POST"])
def add_my_watchlist():
    user, payload, status = _require_user()

    if not user:
        return jsonify(payload), status

    tmdb_id, media_type, title, poster_path = _parse_item_payload()

    movie_id = _valid_tmdb_id(tmdb_id)

    if movie_id is None or not media_type or not title:
        return jsonify({
            "success": False,
            "message": (
                "tmdb_id, media_type and title are required"
            )
        }), 400

    if len(media_type) > 20:
        return jsonify({
            "success": False,
            "message": "media_type must be 20 characters or fewer"
        }), 400

    existing = Watchlist.query.filter_by(
        user_id=user.id,
        movie_id=movie_id,
        media_type=media_type
    ).first()

    if existing:
        return jsonify({
            "success": False,
            "message": "Already in watchlist"
        }), 409

    item = Watchlist(
        user_id=user.id,
        movie_id=movie_id,
        media_type=media_type,
        title=title,
        poster_path=poster_path
    )

    db.session.add(item)
    db.session.commit()

    return jsonify({
        "success": True,
        "message": "Added to watchlist",
        "watchlist": _watchlist_payload(item)
    }), 201


@app.route("/api/me/watchlist/<int:tmdb_id>", methods=["DELETE"])
def remove_my_watchlist(tmdb_id):
    user, payload, status = _require_user()

    if not user:
        return jsonify(payload), status

    media_type = (request.args.get("media_type") or "").strip()

    if not media_type:
        return jsonify({
            "success": False,
            "message": "media_type query parameter is required"
        }), 400

    item = Watchlist.query.filter_by(
        user_id=user.id,
        movie_id=tmdb_id,
        media_type=media_type
    ).first()

    if not item:
        return jsonify({
            "success": False,
            "message": "Watchlist item not found"
        }), 404

    db.session.delete(item)
    db.session.commit()

    return jsonify({
        "success": True,
        "message": "Removed from watchlist"
    })


# ==========================================
# START SERVER
# ==========================================

if __name__ == "__main__":
    app.run(
        host="0.0.0.0",
        port=5001,
        debug=True
    )