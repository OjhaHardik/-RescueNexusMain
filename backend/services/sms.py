import requests

from config import TEXTBELT_URL, TEXTBELT_KEY


def send_sms(phone, message):
    """Send an SMS. Returns (True, None) on success or (False, error message)."""

    print("Sending SMS to:", phone)

    payload = {
        "phone": phone,
        "message": message,
        "key": TEXTBELT_KEY
    }

    try:
        response = requests.post(TEXTBELT_URL, data=payload, timeout=10)
        print(response.text)
        result = response.json()
        if result.get("success"):
            return True, None
        return False, result.get("error") or "SMS provider rejected the message"
    except Exception as e:
        print("SMS failed:", e)
        return False, str(e)
