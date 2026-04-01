from database.db import SessionLocal
from database.models import Incident

def create_incident(data):
    session = SessionLocal()
    incident = Incident(**data)
    session.add(incident)
    session.commit()
    session.close()

def get_all_incidents():
    session = SessionLocal()
    incidents = session.query(Incident).all()
    session.close()
    return incidents

def update_incident(incident_id, status, team):
    session = SessionLocal()
    incident = session.query(Incident).filter(Incident.id == incident_id).first()

    if incident:
        incident.status = status
        incident.assigned_team = team
        session.commit()



    session.close()