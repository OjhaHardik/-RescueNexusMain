from pydantic import BaseModel
from datetime import datetime


class IncidentCreate(BaseModel):
    type: str
    description: str
    latitude: float
    longitude: float
    severity: str


class IncidentResponse(BaseModel):
    id: int
    type: str
    description: str
    latitude: float
    longitude: float
    severity: str
    status: str
    timestamp: datetime
    assigned_team: str
    image_path: str | None = None

    class Config:
        from_attributes = True