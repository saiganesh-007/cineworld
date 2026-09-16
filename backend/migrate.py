"""
Safe, idempotent schema migration for the Supabase identity bridge.

Run from the project root with the backend virtualenv:

    python -m backend.migrate

Changes applied to the `user` table:
  - adds  supabase_user_id VARCHAR(64)  (unique, nullable, indexed)
  - makes password nullable (Supabase-authenticated users have no hash)

Existing rows and the integer primary key are preserved, so old Flask
favorites/watchlist rows keep working. create_all() does not alter
existing tables, which is why this script exists.
"""

import sqlalchemy as sa

from backend.app import app
from backend.models import db


def _create_table_sql():
    return """
        CREATE TABLE user_new (
            id INTEGER NOT NULL,
            username VARCHAR(80) NOT NULL,
            email VARCHAR(120) NOT NULL,
            password VARCHAR(255),
            profile_pic TEXT,
            supabase_user_id VARCHAR(64),
            PRIMARY KEY (id),
            UNIQUE (username),
            UNIQUE (email),
            UNIQUE (supabase_user_id)
        )
    """


def _migrate_sqlite(engine):
    inspector = sa.inspect(engine)
    columns = {
        column["name"]
        for column in inspector.get_columns("user")
    }

    password_column = next(
        column
        for column in inspector.get_columns("user")
        if column["name"] == "password"
    )

    has_new_column = "supabase_user_id" in columns
    password_is_nullable = bool(password_column.get("nullable"))

    if has_new_column and password_is_nullable:
        print("  user table already up to date — nothing to do")
        return False

    if has_new_column and not password_is_nullable:
        print(
            "  supabase_user_id exists but password is still NOT NULL "
            "in SQLite; rebuilding user table to fix nullability"
        )
    else:
        print("  adding supabase_user_id and making password nullable")

    with engine.begin() as connection:
        connection.execute(sa.text(_create_table_sql()))
        connection.execute(
            sa.text(
                """
                INSERT INTO user_new
                    (id, username, email, password, profile_pic)
                SELECT
                    id, username, email, password, profile_pic
                FROM user
                """
            )
        )
        connection.execute(sa.text("DROP TABLE user"))
        connection.execute(
            sa.text("ALTER TABLE user_new RENAME TO user")
        )
        connection.execute(
            sa.text(
                """
                CREATE UNIQUE INDEX IF NOT EXISTS
                    ix_user_supabase_user_id
                ON user (supabase_user_id)
                """
            )
        )

    print("  user table rebuilt successfully")
    return True


def _migrate_postgres(engine):
    with engine.begin() as connection:
        connection.execute(
            sa.text(
                """
                ALTER TABLE "user"
                ADD COLUMN IF NOT EXISTS supabase_user_id VARCHAR(64)
                """
            )
        )
        connection.execute(
            sa.text('ALTER TABLE "user" ALTER COLUMN password DROP NOT NULL')
        )
        connection.execute(
            sa.text(
                """
                CREATE UNIQUE INDEX IF NOT EXISTS
                    ix_user_supabase_user_id
                ON "user" (supabase_user_id)
                """
            )
        )

    print("  postgres user table migrated successfully")
    return True


def run():
    with app.app_context():
        return _run()


def _run():
    engine = db.engine
    dialect = engine.dialect.name

    print(f"schema migration starting (dialect: {dialect})")

    try:
        if dialect == "sqlite":
            changed = _migrate_sqlite(engine)
        elif dialect in ("postgresql", "postgres"):
            changed = _migrate_postgres(engine)
        else:
            print(f"  unsupported dialect: {dialect}")
            print(
                "  only sqlite and postgresql migrations are supported"
            )
            return 1
    except Exception as exc:
        if dialect == "sqlite":
            with engine.begin() as connection:
                connection.execute(
                    sa.text("DROP TABLE IF EXISTS user_new")
                )
        print(f"migration failed: {exc}")
        return 1

    if changed:
        print("  success: user table now includes supabase_user_id")
    print("schema migration complete")
    return 0


if __name__ == "__main__":
    raise SystemExit(run())