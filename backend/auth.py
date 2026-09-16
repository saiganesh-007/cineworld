import json
import os
import urllib.error
import urllib.request

from backend.models import User, db


# ==========================================
# SUPABASE BACKEND CONFIGURATION
# ==========================================

def _supabase_url():
    return os.getenv("SUPABASE_URL", "").strip().rstrip("/")


def _supabase_publishable_key():
    return os.getenv("SUPABASE_PUBLISHABLE_KEY", "").strip()


def is_supabase_configured():
    return bool(_supabase_url() and _supabase_publishable_key())


# ==========================================
# TOKEN VERIFICATION
# ==========================================

def verify_supabase_token(access_token):
    """
    Verify an access token against Supabase Auth.

    Calls GET {SUPABASE_URL}/auth/v1/user so the token is verified by
    Supabase itself. The JWT is never decoded locally without checks.
    Returns the verified Supabase user dict, or None if invalid.
    """
    if not access_token or not is_supabase_configured():
        return None

    url = f"{_supabase_url()}/auth/v1/user"

    req = urllib.request.Request(url)
    req.add_header("Authorization", f"Bearer {access_token}")
    req.add_header("apikey", _supabase_publishable_key())

    try:
        with urllib.request.urlopen(req, timeout=10) as response:
            if response.status != 200:
                return None

            payload = json.loads(
                response.read().decode("utf-8")
            )

            if not payload or not payload.get("id"):
                return None

            return payload
    except (urllib.error.URLError, OSError, ValueError):
        return None


# ==========================================
# IDENTITY MAPPING
# ==========================================

def _unique_username(preferred, email, supabase_user_id):
    candidate = (preferred or "").strip()

    if not candidate and email:
        candidate = email.split("@")[0].strip()

    if not candidate:
        candidate = f"user_{supabase_user_id[:16]}"

    candidate = candidate[:80]

    if not User.query.filter_by(username=candidate).first():
        return candidate

    suffix = supabase_user_id[:8]
    base = candidate[: 80 - 1 - len(suffix)].rstrip("_")
    candidate = f"{base}_{suffix}"

    if not User.query.filter_by(username=candidate).first():
        return candidate

    return f"user_{supabase_user_id}"[:80]


def get_or_create_app_user(supabase_user):
    """
    Map a verified Supabase user to the internal app User.

    Identity is the Supabase UUID. The internal integer User.id is
    preserved so existing favorites/watchlist rows keep working.
    Supabase-authenticated users never get a password hash stored here.

    If the Supabase email already belongs to an old Flask account, the
    accounts are NOT silently merged. A deterministic conflict response
    is returned so a linking strategy can be decided explicitly.
    """
    supabase_user_id = supabase_user.get("id")

    if not supabase_user_id:
        return None, "Missing identity from Supabase"

    app_user = User.query.filter_by(
        supabase_user_id=supabase_user_id
    ).first()

    if app_user:
        return app_user, None

    email = (supabase_user.get("email") or "").strip() or None
    metadata = supabase_user.get("user_metadata") or {}
    username = (metadata.get("username") or "").strip() or None

    if email:
        existing_by_email = User.query.filter_by(
            email=email
        ).first()

        if existing_by_email:
            if existing_by_email.supabase_user_id:
                return None, (
                    "This email is already linked to another "
                    "Supabase account."
                )

            return None, (
                "Email is already registered to an existing "
                "account. Account linking is not enabled."
            )

    username = _unique_username(username, email, supabase_user_id)

    app_user = User(
        username=username,
        email=email or f"{supabase_user_id}@supabase.local",
        supabase_user_id=supabase_user_id,
        password=None,
    )

    db.session.add(app_user)
    db.session.commit()

    return app_user, None


def require_authenticated_user():
    """
    Resolve the authenticated local app User from the Bearer token.

    Used by authenticated endpoints. Returns:
        (app_user, error_payload, status)
    On success app_user is set and error_payload is None.
    On failure app_user is None and error_payload/status describe
    the 401/409 response to return.
    """
    from flask import request

    auth_header = request.headers.get("Authorization", "")

    if not auth_header or not auth_header.startswith("Bearer "):
        return None, {
            "success": False,
            "message": "Missing or malformed Authorization header"
        }, 401

    access_token = auth_header[len("Bearer "):].strip()

    if not access_token:
        return None, {
            "success": False,
            "message": "Missing or malformed Authorization header"
        }, 401

    if not is_supabase_configured():
        return None, {
            "success": False,
            "message": "Supabase Auth is not configured on the backend"
        }, 503

    supabase_user = verify_supabase_token(access_token)

    if not supabase_user:
        return None, {
            "success": False,
            "message": "Invalid or expired token"
        }, 401

    app_user, error = get_or_create_app_user(supabase_user)

    if error:
        return None, {
            "success": False,
            "message": error
        }, 409

    return app_user, None, 200


def resolve_authenticated_user():
    """
    Read the Authorization header, verify the token with Supabase,
    and resolve/create the mapped local app User.

    Returns (payload_dict, http_status).
    """
    app_user, error_payload, status = require_authenticated_user()

    if not app_user:
        return error_payload, status

    return {
        "success": True,
        "user": {
            "id": app_user.id,
            "supabase_user_id": app_user.supabase_user_id,
            "email": app_user.email,
            "username": app_user.username,
        }
    }, 200