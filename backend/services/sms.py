import requests

from config import TEXTBELT_URL, TEXTBELT_KEY


def send_sms(phone, message):

    print("Sending SMS to:", phone)

    payload = {
        "phone": phone,
        "message": message,
        "key": TEXTBELT_KEY
    }

    try:
        response = requests.post(TEXTBELT_URL, data=payload, timeout=10)
        print(response.text)
    except Exception as e:
        print("SMS failed:", e)
