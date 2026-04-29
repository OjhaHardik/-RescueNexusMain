import site
import sys
import os

# Add the project root to sys.path so we can import 'database'
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from database.db import SessionLocal, engine, Base
from database.models import Incident, ReportRecord

def run_migration():
    # Make sure the table exists
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    
    # 1. Fetch all existing incidents
    incidents = db.query(Incident).all()
    count = 0
    
    for inc in incidents:
        # Check if it already exists as a report (idempotency)
        exists = db.query(ReportRecord).filter(ReportRecord.original_incident_id == inc.id).first()
        if not exists:
            report = ReportRecord(
                original_incident_id=inc.id,
                type=inc.type,
                description=inc.description,
                latitude=inc.latitude,
                longitude=inc.longitude,
                severity=inc.severity,
                status=inc.status,
                assigned_team=inc.assigned_team,
                timestamp=inc.timestamp,
                image_path=inc.image_path,
                user_id=inc.user_id
            )
            db.add(report)
            count += 1
            
    db.commit()
    db.close()
    
    print(f"Migration complete: Transferred {count} legacy incidents to the permanent Reports Ledger.")

if __name__ == "__main__":
    run_migration()
