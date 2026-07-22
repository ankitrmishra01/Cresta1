import os
import django
import joblib
import pandas as pd

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'robo_advisor.settings')
django.setup()

from recommender.engine import load_model

try:
    export_data = load_model()
    model = export_data['model']
    encoder = export_data['goal_encoder']
    
    # User-requested data
    # age: 25, income: 500000, risk_tolerance: 7, investment_goal: 'growth', experience: 2
    
    # Map 'growth' to something the encoder knows (likely 'Wealth' or 'Tax')
    # If 'growth' is not in encoder, it will fail. Let's check encoder classes.
    print(f"Goal Encoder Classes: {encoder.classes_}")
    
    test_goal = 'Wealth' # fallback to Wealth as 'growth' might not be in the SEBI-like synthetic data
    encoded_goal = encoder.transform([test_goal])[0]
    
    feature_dict = {
        'Age': 25,
        'Income': 500000,
        'Risk_Tolerance': 7,
        'Investment_Goal_Encoded': encoded_goal
    }
    
    # Check if 'Experience_Years' is required
    feature_columns = export_data.get('feature_columns', list(feature_dict.keys()))
    if 'Experience_Years' in feature_columns:
        feature_dict['Experience_Years'] = 2
        
    df_features = pd.DataFrame([feature_dict])[feature_columns]
    user_class_num = model.predict(df_features)[0]
    
    if 'label_encoder' in export_data:
        user_class = export_data['label_encoder'].inverse_transform([user_class_num])[0]
    else:
        user_class = user_class_num
        
    print(f"Diagnostic Result (Risk Classifier): {user_class}")

except Exception as e:
    print(f"Diagnostic Test 3 Failed: {e}")
