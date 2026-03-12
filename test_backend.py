import os
import django
import sys

# Setup Django environment
sys.path.append(os.path.join(os.getcwd(), 'backend'))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'robo_advisor.settings')
django.setup()

from advisor.views import get_nifty, get_sensex, get_banknifty
from django.test import RequestFactory
import json

def test_views():
    factory = RequestFactory()
    request = factory.get('/')

    print("Testing NIFTY API...")
    try:
        response = get_nifty(request)
        print(f"Status: {response.status_code}")
        print(f"Content: {response.content.decode()}")
    except Exception as e:
        print(f"NIFTY Failed: {e}")

    print("\nTesting SENSEX API...")
    try:
        response = get_sensex(request)
        print(f"Status: {response.status_code}")
        print(f"Content: {response.content.decode()}")
    except Exception as e:
        print(f"SENSEX Failed: {e}")

if __name__ == "__main__":
    test_views()
