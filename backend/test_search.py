import os
import django

# Setup Django environment BEFORE ANY OTHER IMPORTS
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'robo_advisor.settings')
django.setup()

from django.contrib.auth.models import User
from rest_framework.test import APIRequestFactory, force_authenticate
from advisor.views.markets import search_stock

def test_search_view(query):
    print(f"\n--- Testing search view logic for query: '{query}' ---")
    factory = APIRequestFactory()
    request = factory.get('/api/search/', {'ticker': query})
    
    # Create a dummy user
    try:
        user = User.objects.filter(username='testuser').first()
        if not user:
            user = User.objects.create_user(username='testuser', password='password')
    except Exception as e:
        print(f"Error getting/creating user: {e}")
        return
        
    force_authenticate(request, user=user)
    
    try:
        response = search_stock(request)
        # DRF responses might need rendering
        if hasattr(response, 'render') and callable(response.render):
            response.render()
        print(f"Status: {response.status_code}")
        print(f"Data: {response.content.decode()}")
    except Exception as e:
        print(f"Error executing view: {e}")

if __name__ == "__main__":
    test_search_view("reliance")
    test_search_view("RELIANCE")
    test_search_view("TCS.NS")
    test_search_view("TCS")
