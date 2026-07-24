import os
import django
import json

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'robo_advisor.settings')
django.setup()

from django.contrib.auth.models import User
from rest_framework.test import APIRequestFactory, force_authenticate
from advisor.views.ml import recommend_api
from advisor.models import UserProfile

def test_recommend_persistence():
    print("\n--- Testing recommend_api persistence ---")
    factory = APIRequestFactory()
    
    # Payload similar to what frontend sends
    payload = {
        "Age": 28,
        "Income": 850000,
        "Risk_Tolerance": 4, # Should map to 'Aggressive'
        "Investment_Goal": "Wealth"
    }
    
    request = factory.post('/api/recommend/', payload, format='json')
    
    # Use the test user
    user = User.objects.filter(username='testuser').first()
    if not user:
        user = User.objects.create_user(username='testuser', password='password')
    
    force_authenticate(request, user=user)
    
    try:
        response = recommend_api(request)
        print(f"Status: {response.status_code}")
        
        # Check UserProfile
        profile = UserProfile.objects.get(user=user)
        print(f"Profile saved - Risk: {profile.risk_profile}, Score: {profile.risk_score}, Goal: {profile.investment_goal}, Age: {profile.age}")
        
        if profile.risk_profile == 'Aggressive' and profile.risk_score == 4:
            print("SUCCESS: Profile data persisted correctly.")
        else:
            print("FAILURE: Profile data mismatch.")
            
    except Exception as e:
        print(f"Error executing test: {e}")

if __name__ == "__main__":
    test_recommend_persistence()
