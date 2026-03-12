import requests
import time
import subprocess
import sys
import threading

def run_server():
    subprocess.run([sys.executable, 'manage.py', 'runserver'], cwd='backend', stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

def verify_network():
    print("Starting server for verification...")
    server_thread = threading.Thread(target=run_server, daemon=True)
    server_thread.start()
    time.sleep(5) # Wait for server to start

    print("\nChecking API connectivity...")
    try:
        response = requests.get('http://127.0.0.1:8000/api/nifty/')
        print(f"Direct GET Status: {response.status_code}")
        print(f"Direct GET Content: {response.json()}")
    except Exception as e:
        print(f"Direct GET Failed: {e}")

    print("\nChecking CORS headers...")
    try:
        headers = {'Origin': 'http://localhost:5173'}
        response = requests.options('http://127.0.0.1:8000/api/nifty/', headers=headers)
        print(f"OPTIONS Status: {response.status_code}")
        print(f"Access-Control-Allow-Origin: {response.headers.get('Access-Control-Allow-Origin')}")
    except Exception as e:
        print(f"OPTIONS Failed: {e}")

if __name__ == "__main__":
    verify_network()
