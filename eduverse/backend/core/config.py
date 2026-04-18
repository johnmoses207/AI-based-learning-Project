import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./eduverse.db")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
from urllib.parse import urlparse

_frontend_raw = os.getenv("FRONTEND_URL", "http://localhost:5173")
_raw_origins = [url.strip() for url in _frontend_raw.split(",") if url.strip()]

# Sanitize: Ensure origins are only protocol + domain (no paths, no trailing slashes)
ALLOWED_ORIGINS = []
for url in _raw_origins:
    parsed = urlparse(url)
    if parsed.scheme and parsed.netloc:
        ALLOWED_ORIGINS.append(f"{parsed.scheme}://{parsed.netloc}")
    else:
        # Fallback for simple strings
        ALLOWED_ORIGINS.append(url.rstrip("/"))

FRONTEND_URL = ALLOWED_ORIGINS[0] if ALLOWED_ORIGINS else "http://localhost:5173"

# URL Sanitization for SQLAlchemy 1.4+
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

# Ensure SSL mode for Neon/Postgres if not present
if "postgresql" in DATABASE_URL and "sslmode" not in DATABASE_URL:
    separator = "&" if "?" in DATABASE_URL else "?"
    DATABASE_URL += f"{separator}sslmode=require"

# SMTP Configuration
SMTP_HOST = os.getenv("SMTP_HOST", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USER = os.getenv("SMTP_USER")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD")
ADMIN_EMAIL = os.getenv("ADMIN_EMAIL")
