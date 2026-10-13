# 🚑 RescueNexus – Smart Emergency Response System

## 📌 Overview
RescueNexus is an intelligent emergency response platform designed to streamline incident reporting, monitoring, and response management. It enables users to report emergencies in real-time and allows authorities to track, analyze, and respond efficiently.

---

## 🎯 Objectives
- Provide a fast and reliable emergency reporting system
- Enable real-time tracking of incidents
- Improve coordination between users and authorities
- Analyze incident trends for better decision-making

---

## 🧠 Key Features

### 🚨 Incident Reporting
- Users can report emergencies with:
  - Type (fire, accident, medical, etc.)
  - Description
  - Location (latitude & longitude)
  - Optional image upload
- Automatic severity classification (High / Medium / Low)

### 📊 Dashboard
- Total incidents count
- High severity alerts
- Resolved cases
- Map-based visualization

### 👤 User Management
- User registration and login
- Role-based access (citizen/admin)

### 📡 Notifications
- Email alerts
- SMS notifications for critical updates

### 📈 Analytics
- Incident trends
- Historical data tracking
- Report generation

---

## 🏗️ Tech Stack

| Layer       | Technology Used |
|------------|----------------|
| Backend    | FastAPI (Python) |
| Frontend   | HTML, CSS, JavaScript |
| UI (Admin) | Streamlit |
| Database   | SQLite (SQLAlchemy ORM) |
| APIs       | OpenStreetMap (Geolocation) |

---

## 🚀 Running Locally

```bash
pip install -r requirements-local.txt
cp .env.example .env            # then fill in values
uvicorn backend.main:app --reload --port 8000
```
Open `frontend/index.html` (admin) or `frontend/login.html` (citizen) with Live Server.
The frontend automatically talks to `http://localhost:8000` when opened locally.

## ☁️ Deploying to Vercel (free)

- `frontend/` is served as the static site.
- `api/index.py` runs the FastAPI backend as a serverless function under `/api/*`.
- Images are stored in the database (Vercel has no persistent disk).

Required environment variable: `DATABASE_URL` (PostgreSQL, e.g. a free Neon database).
Optional: `EMAIL_USER`, `EMAIL_APP_PASSWORD`, `TEXTBELT_KEY`.

Pages after deploy: `/` (admin control center), `/login.html`, `/register.html`, `/citizen.html`.

> The Streamlit UI (`app.py`) cannot run on Vercel; run it locally with `streamlit run app.py`.
