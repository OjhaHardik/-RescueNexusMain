import requests

def send_sms(phone, message):

    print("Sending SMS to:", phone)

    url = "https://textbelt.com/text"

    payload = {
        "phone": phone,
        "message": message,
        "key": "textbelt"
    }

    response = requests.post(url, data=payload)

    print(response.text)