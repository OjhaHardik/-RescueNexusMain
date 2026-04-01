def calculate_severity(description: str, incident_type: str) -> str:
    description = description.lower()

    # 🔴 Critical phrases
    if any(phrase in description for phrase in [
        "not breathing", "unconscious", "dead", "death",
        "fatal", "people trapped", "severe bleeding"
    ]):
        return "critical"

    # 🟠 High severity
    if any(word in description for word in [
        "fire", "accident", "crash", "injured",
        "burn", "explosion"
    ]):
        return "high"

    # 🟡 Medium severity
    if any(word in description for word in [
        "smoke", "minor", "damage", "issue"
    ]):
        return "medium"

    # 🔵 Low severity (default)
    return "low"