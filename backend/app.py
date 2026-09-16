import os

from flask import Flask, jsonify, request
from flask_cors import CORS

from backend.models import db, User, Favorite, Watchlist


app = Flask(__name__)


# ==========================================
# DATABASE CONFIGURATION
# ==========================================

DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    DATABASE_URL = "sqlite:///cineworld.db"

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
# REGISTER
# ==========================================

@app.route("/api/register", methods=["POST"])
def register():

    data = request.get_json() or {}

    username = data.get("username")
    email = data.get("email")
    password = data.get("password")

    if not username or not email or not password:
        return jsonify({
            "success": False,
            "message": "All fields are required"
        }), 400

    existing_user = User.query.filter(
        (User.email == email) |
        (User.username == username)
    ).first()

    if existing_user:
        return jsonify({
            "success": False,
            "message": "Username or email already exists"
        }), 409

    user = User(
        username=username,
        email=email
    )

    user.set_password(password)

    db.session.add(user)
    db.session.commit()

    return jsonify({
        "success": True,
        "message": "Account created successfully",
        "user": {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "profile_pic": user.profile_pic
        }
    }), 201


# ==========================================
# LOGIN
# ==========================================

@app.route("/api/login", methods=["POST"])
def login():

    data = request.get_json() or {}

    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return jsonify({
            "success": False,
            "message": "Email and password are required"
        }), 400

    user = User.query.filter_by(
        email=email
    ).first()

    if not user:
        return jsonify({
            "success": False,
            "message": "Invalid email or password"
        }), 401

    if not user.check_password(password):
        return jsonify({
            "success": False,
            "message": "Invalid email or password"
        }), 401

    return jsonify({
        "success": True,
        "message": "Login successful",
        "user": {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "profile_pic": user.profile_pic
        }
    }), 200


# ==========================================
# GET USER
# ==========================================

@app.route("/api/user/<int:user_id>", methods=["GET"])
def get_user(user_id):

    user = User.query.get(user_id)

    if not user:
        return jsonify({
            "success": False,
            "message": "User not found"
        }), 404

    return jsonify({
        "success": True,
        "user": {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "profile_pic": user.profile_pic
        }
    })


# ==========================================
# DELETE ACCOUNT
# ==========================================

@app.route("/api/user/<int:user_id>", methods=["DELETE"])
def delete_account(user_id):

    user = User.query.get(user_id)

    if not user:
        return jsonify({
            "success": False,
            "message": "User not found"
        }), 404

    Favorite.query.filter_by(
        user_id=user_id
    ).delete()

    Watchlist.query.filter_by(
        user_id=user_id
    ).delete()

    db.session.delete(user)
    db.session.commit()

    return jsonify({
        "success": True,
        "message": "Account deleted successfully"
    })


# ==========================================
# ADD FAVORITE
# ==========================================

@app.route("/api/favorites", methods=["POST"])
def add_favorite():

    data = request.get_json() or {}

    user_id = data.get("user_id")
    movie_id = data.get("movie_id")
    media_type = data.get("media_type")
    title = data.get("title")
    poster_path = data.get("poster_path")

    if not user_id or not movie_id or not media_type or not title:
        return jsonify({
            "success": False,
            "message": "Missing required fields"
        }), 400

    user = User.query.get(user_id)

    if not user:
        return jsonify({
            "success": False,
            "message": "User not found"
        }), 404

    existing = Favorite.query.filter_by(
        user_id=user_id,
        movie_id=movie_id,
        media_type=media_type
    ).first()

    if existing:
        return jsonify({
            "success": False,
            "message": "Already in favorites"
        }), 409

    favorite = Favorite(
        user_id=user_id,
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
        "favorite": {
            "id": favorite.id,
            "movie_id": favorite.movie_id,
            "media_type": favorite.media_type,
            "title": favorite.title,
            "poster_path": favorite.poster_path
        }
    }), 201


# ==========================================
# GET FAVORITES
# ==========================================

@app.route("/api/favorites/<int:user_id>", methods=["GET"])
def get_favorites(user_id):

    favorites = Favorite.query.filter_by(
        user_id=user_id
    ).order_by(
        Favorite.created_at.desc()
    ).all()

    return jsonify({
        "success": True,
        "favorites": [
            {
                "id": item.id,
                "movie_id": item.movie_id,
                "media_type": item.media_type,
                "title": item.title,
                "poster_path": item.poster_path
            }
            for item in favorites
        ]
    })


# ==========================================
# REMOVE FAVORITE
# ==========================================

@app.route("/api/favorites/<int:favorite_id>", methods=["DELETE"])
def remove_favorite(favorite_id):

    favorite = Favorite.query.get(favorite_id)

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


# ==========================================
# ADD WATCHLIST
# ==========================================

@app.route("/api/watchlist", methods=["POST"])
def add_watchlist():

    data = request.get_json() or {}

    user_id = data.get("user_id")
    movie_id = data.get("movie_id")
    media_type = data.get("media_type")
    title = data.get("title")
    poster_path = data.get("poster_path")

    if not user_id or not movie_id or not media_type or not title:
        return jsonify({
            "success": False,
            "message": "Missing required fields"
        }), 400

    user = User.query.get(user_id)

    if not user:
        return jsonify({
            "success": False,
            "message": "User not found"
        }), 404

    existing = Watchlist.query.filter_by(
        user_id=user_id,
        movie_id=movie_id,
        media_type=media_type
    ).first()

    if existing:
        return jsonify({
            "success": False,
            "message": "Already in watchlist"
        }), 409

    item = Watchlist(
        user_id=user_id,
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
        "watchlist": {
            "id": item.id,
            "movie_id": item.movie_id,
            "media_type": item.media_type,
            "title": item.title,
            "poster_path": item.poster_path
        }
    }), 201


# ==========================================
# GET WATCHLIST
# ==========================================

@app.route("/api/watchlist/<int:user_id>", methods=["GET"])
def get_watchlist(user_id):

    items = Watchlist.query.filter_by(
        user_id=user_id
    ).order_by(
        Watchlist.created_at.desc()
    ).all()

    return jsonify({
        "success": True,
        "watchlist": [
            {
                "id": item.id,
                "movie_id": item.movie_id,
                "media_type": item.media_type,
                "title": item.title,
                "poster_path": item.poster_path
            }
            for item in items
        ]
    })


# ==========================================
# REMOVE WATCHLIST
# ==========================================

@app.route("/api/watchlist/<int:item_id>", methods=["DELETE"])
def remove_watchlist(item_id):

    item = Watchlist.query.get(item_id)

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