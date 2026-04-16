"""
JWT Authentication — SQLite-backed user store.

Tables:
  users(id, username, hashed_password, created_at)

Endpoints:
  POST /api/auth/register  – create user (admin only in prod; open for first run)
  POST /api/auth/login     – returns access_token
  GET  /api/auth/me        – returns current user info
"""

import sqlite3
import os
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import JWTError, jwt
from passlib.context import CryptContext
from pydantic import BaseModel

# ── Config ────────────────────────────────────────────────────────────────────
SECRET_KEY = os.getenv("JWT_SECRET", "kes22-digital-twin-secret-change-in-prod")
ALGORITHM  = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 8   # 8 hours

DB_PATH = Path(__file__).parent.parent / "users.db"

pwd_ctx = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

router = APIRouter(prefix="/auth", tags=["Auth"])


# ── Database ──────────────────────────────────────────────────────────────────

def _get_conn():
    conn = sqlite3.connect(str(DB_PATH))
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    """Create the users table and seed a default admin if empty."""
    with _get_conn() as conn:
        conn.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id               INTEGER PRIMARY KEY AUTOINCREMENT,
                username         TEXT    UNIQUE NOT NULL,
                hashed_password  TEXT    NOT NULL,
                created_at       TEXT    NOT NULL DEFAULT (datetime('now'))
            )
        """)
        conn.commit()
        # Seed default admin: admin / admin123
        row = conn.execute("SELECT id FROM users WHERE username = 'admin'").fetchone()
        if not row:
            hashed = pwd_ctx.hash("admin123")
            conn.execute(
                "INSERT INTO users (username, hashed_password) VALUES (?, ?)",
                ("admin", hashed),
            )
            conn.commit()
            print("[auth] Default user created — username: admin  password: admin123")


def _get_user(username: str) -> Optional[sqlite3.Row]:
    with _get_conn() as conn:
        return conn.execute(
            "SELECT * FROM users WHERE username = ?", (username,)
        ).fetchone()


def _create_user_db(username: str, password: str):
    hashed = pwd_ctx.hash(password)
    with _get_conn() as conn:
        try:
            conn.execute(
                "INSERT INTO users (username, hashed_password) VALUES (?, ?)",
                (username, hashed),
            )
            conn.commit()
        except sqlite3.IntegrityError:
            raise HTTPException(status_code=400, detail="Username already exists")


# ── JWT helpers ───────────────────────────────────────────────────────────────

def _create_token(data: dict) -> str:
    payload = data.copy()
    payload["exp"] = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


def _decode_token(token: str) -> dict:
    try:
        return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )


# ── Dependency: current user ──────────────────────────────────────────────────

class UserOut(BaseModel):
    id: int
    username: str
    created_at: str


def get_current_user(token: str = Depends(oauth2_scheme)) -> UserOut:
    payload = _decode_token(token)
    username: str = payload.get("sub", "")
    if not username:
        raise HTTPException(status_code=401, detail="Invalid token payload")
    row = _get_user(username)
    if not row:
        raise HTTPException(status_code=401, detail="User not found")
    return UserOut(id=row["id"], username=row["username"], created_at=row["created_at"])


# ── Request / Response models ─────────────────────────────────────────────────

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    username: str
    expires_in: int = ACCESS_TOKEN_EXPIRE_MINUTES * 60


class RegisterRequest(BaseModel):
    username: str
    password: str


# ── Routes ────────────────────────────────────────────────────────────────────

@router.post("/login", response_model=TokenResponse, summary="Login and get JWT")
def login(form: OAuth2PasswordRequestForm = Depends()):
    """
    Accepts `application/x-www-form-urlencoded` with `username` + `password`.
    Returns a JWT access token valid for 8 hours.
    """
    row = _get_user(form.username)
    if not row or not pwd_ctx.verify(form.password, row["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    token = _create_token({"sub": row["username"]})
    return TokenResponse(access_token=token, username=row["username"])


@router.post("/register", response_model=UserOut, summary="Register a new user")
def register(body: RegisterRequest):
    """Create a new user. In production this should be admin-protected."""
    if len(body.password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters")
    _create_user_db(body.username, body.password)
    row = _get_user(body.username)
    return UserOut(id=row["id"], username=row["username"], created_at=row["created_at"])


@router.get("/me", response_model=UserOut, summary="Get current user info")
def me(current_user: UserOut = Depends(get_current_user)):
    return current_user
