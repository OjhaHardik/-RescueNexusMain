# =========================================
# CENTRAL BACKEND CONFIGURATION
# -----------------------------------------
# Every setting, password, link and ID used
# by the backend is read here — nowhere else.
#
# Values come from environment variables:
#   - Locally:  the .env file in the project root
#   - Vercel:   Project > Settings > Environment Variables
#
# See .env.example for the full list.
# =========================================

import os

PROJECT_ROOT = os.path.dirname(os.path.abspath(__file__))


def _load_env_file(path):
    """Minimal .env loader (KEY=VALUE lines). Real env vars take priority."""
    if not os.path.isfile(path):
        return
    with open(path, encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue
            key, value = line.split("=", 1)
            value = value.strip().strip('"').strip("'")
            os.environ.setdefault(key.strip(), value)


_load_env_file(os.path.join(PROJECT_ROOT, ".env"))


def _get(name, default=""):
    return os.getenv(name, default)


# -----------------------------------------
# DATABASE
# -----------------------------------------
DATABASE_URL = (
    _get("DATABASE_URL")
    or _get("POSTGRES_URL")   # set automatically by Vercel's Neon integration
    or "postgresql://postgres:root@localhost:5432/rescuenexus"
)

# SQLAlchemy 2.x no longer accepts the "postgres://" scheme
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

IS_VERCEL = bool(_get("VERCEL"))

# -----------------------------------------
# EMAIL (Gmail SMTP)
# -----------------------------------------
EMAIL_USER = _get("EMAIL_USER")
EMAIL_APP_PASSWORD = _get("EMAIL_APP_PASSWORD")
SMTP_HOST = _get("SMTP_HOST", "smtp.gmail.com")
SMTP_PORT = int(_get("SMTP_PORT", "587"))
EMAIL_SUBJECT = _get("EMAIL_SUBJECT", "🚨 RescueNexus Emergency Alert")

# -----------------------------------------
# SMS (Textbelt)
# -----------------------------------------
TEXTBELT_URL = _get("TEXTBELT_URL", "https://textbelt.com/text")
TEXTBELT_KEY = _get("TEXTBELT_KEY", "textbelt")   # "textbelt" = free, 1 SMS/day

# -----------------------------------------
# LINKS
# -----------------------------------------
# {lat} and {lng} are filled in automatically
MAPS_LINK_TEMPLATE = _get("MAPS_LINK_TEMPLATE", "https://maps.google.com/?q={lat},{lng}")
GEOCODER_URL = _get("GEOCODER_URL", "https://nominatim.openstreetmap.org/search")
GEOCODER_USER_AGENT = _get("GEOCODER_USER_AGENT", "RescueNexusApp")

# -----------------------------------------
# SECURITY
# -----------------------------------------
# Comma-separated list of allowed frontend origins, or * for any
CORS_ORIGINS = [o.strip() for o in _get("CORS_ORIGINS", "*").split(",") if o.strip()]

# -----------------------------------------
# MAP DEFAULTS (Streamlit admin)
# -----------------------------------------
DEFAULT_MAP_LAT = float(_get("DEFAULT_MAP_LAT", "28.4744"))
DEFAULT_MAP_LNG = float(_get("DEFAULT_MAP_LNG", "77.5040"))
