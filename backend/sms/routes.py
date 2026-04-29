from fastapi import APIRouter, Request
from database.db import SessionLocal
from database.models import Incident
from modules.severity import calculate_severity
import json

router = APIRouter()

@router.post("/incoming")
async def receive_sms(request: Request):
    db = SessionLocal()

    try:
        print("\n--- SMS REQUEST RECEIVED ---")

        body_bytes = await request.body()
        raw_text = body_bytes.decode("utf-8")

        print("RAW BODY:", raw_text)

        import json
        data = json.loads(raw_text)

        sender = data.get("sender")
        message = data.get("message")

        print("FINAL SENDER:", sender)
        print("FINAL MESSAGE:", message)

        if not message:
            return {"status": "error", "detail": "No message received"}

        msg = message.lower()

        # Detect incident type
        if "fire" in msg:
            incident_type = "fire"
        elif "accident" in msg:
            incident_type = "accident"
        elif "medical" in msg:
            incident_type = "medical"
        else:
            incident_type = "general"

        severity = calculate_severity(message, incident_type)

        print("TYPE:", incident_type)
        print("SEVERITY:", severity)

        # Save to DB
        new_incident = Incident(
            type=incident_type,
            description=message,
            severity=severity,
            latitude=0.0,
            longitude=0.0,
            status="Pending",
            assigned_team="Not Assigned"
        )

        db.add(new_incident)
        db.commit()
        db.refresh(new_incident)

        print("✅ SAVED:", new_incident.id)

        return {"status": "success", "incident_id": new_incident.id}

    except Exception as e:
        print("❌ ERROR:", e)
        return {"status": "error", "detail": str(e)}

    finally:
        db.close()