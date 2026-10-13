# =========================================
# VERCEL ENTRY POINT
# -----------------------------------------
# Vercel routes every /api/* request here
# (see vercel.json). The FastAPI app is
# mounted under /api so the backend routes
# stay unchanged (/api/incidents/ -> /incidents/).
# =========================================

import os
import sys

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from fastapi import FastAPI

from backend.main import app as backend_app

app = FastAPI()
app.mount("/api", backend_app)
