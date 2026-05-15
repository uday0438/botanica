import requests
import json

api_key = "AIzaSyCECVF3ahJ54UmJPlcJKjw9AB0LSWKX8Q8"
url = f"https://generativelanguage.googleapis.com/v1beta/models?key={api_key}"

try:
    response = requests.get(url)
    data = response.json()
    if response.ok:
        print("Models available for your key:")
        for model in data.get('models', []):
            print(f"- {model['name']} (Supports: {model['supportedGenerationMethods']})")
    else:
        print(f"API Error: {data.get('error', {}).get('message', 'Unknown error')}")
except Exception as e:
    print(f"Connection Error: {e}")
