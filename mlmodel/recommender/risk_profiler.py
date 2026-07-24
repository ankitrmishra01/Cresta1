import os
import pandas as pd
import numpy as np
import joblib
import xgboost as xgb
from sklearn.model_selection import train_test_split, StratifiedKFold, cross_val_score
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix
from sklearn.utils.class_weight import compute_sample_weight

class RiskProfiler:
    """
    Overhauled Risk Profiler using XGBoost with balanced class weights
    and focus on minority class (Aggressive) recall.
    """
    
    def __init__(self, model_path=None):
        self.model_path = model_path or os.path.join(os.path.dirname(__file__), "user_classifier.pkl")
        self.model = None
        self.label_encoder = LabelEncoder()
        self.goal_encoder = LabelEncoder()
        self.feature_cols = ['Age', 'Income', 'Risk_Tolerance', 'Investment_Goal_Encoded', 'Experience_Years']

    def train(self, data_path):
        """
        Trains the XGBoost classifier with class-weight balancing.
        """
        if not os.path.exists(data_path):
            raise FileNotFoundError(f"Data not found at {data_path}")
            
        df = pd.read_csv(data_path)
        print(f"[RISK_PROFILER] Loaded {len(df)} samples for training.")
        
        # Preprocessing
        self.goal_encoder.fit(['Education', 'Income', 'Retirement', 'Tax', 'Wealth'])
        df['Investment_Goal_Encoded'] = self.goal_encoder.transform(df['Investment_Goal'])
        
        X = df[self.feature_cols]
        y = self.label_encoder.fit_transform(df['User_Class'])
        
        # Split
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42, stratify=y
        )
        
        # Overhaul 1: Dynamic Sample Weighting for Class Imbalance
        # This fixes the near-zero recall for "Aggressive" users
        sample_weights = compute_sample_weight(class_weight='balanced', y=y_train)
        
        # Overhaul 2: Refined XGBoost Hyperparameters
        self.model = xgb.XGBClassifier(
            n_estimators=300,
            max_depth=6,
            learning_rate=0.05,
            objective='multi:softprob',
            random_state=42,
            subsample=0.8,
            colsample_bytree=0.8,
            eval_metric='mlogloss'
        )
        
        print("[RISK_PROFILER] Training model with balanced sample weights...")
        self.model.fit(X_train, y_train, sample_weight=sample_weights)
        
        # Evaluation
        y_pred = self.model.predict(X_test)
        acc = accuracy_score(y_test, y_pred)
        
        print(f"[RISK_PROFILER] Training Complete. Accuracy: {acc:.4f}")
        print("\n[RISK_PROFILER] Detailed Classification Report:")
        print(classification_report(
            y_test, y_pred, 
            target_names=self.label_encoder.classes_
        ))
        
        # Save model
        self.save()
        return acc

    def save(self):
        """Saves model and encoders."""
        export_data = {
            'model': self.model,
            'goal_encoder': self.goal_encoder,
            'label_encoder': self.label_encoder,
            'feature_columns': self.feature_cols,
            'metadata': {
                'model_type': 'XGBClassifier',
                'classes': list(self.label_encoder.classes_)
            }
        }
        joblib.dump(export_data, self.model_path)
        print(f"[RISK_PROFILER] Model saved to {self.model_path}")

    def predict(self, user_data: dict):
        """
        Predicts risk class for a single user.
        Input format: {'Age': 25, 'Income': 800000, 'Risk_Tolerance': 4, 'Investment_Goal': 'Wealth', 'Experience_Years': 3}
        """
        if self.model is None:
            if os.path.exists(self.model_path):
                data = joblib.load(self.model_path)
                self.model = data['model']
                self.goal_encoder = data['goal_encoder']
                self.label_encoder = data['label_encoder']
            else:
                raise ValueError("Model not trained or found.")
                
        # Prep single sample
        goal_encoded = self.goal_encoder.transform([user_data['Investment_Goal']])[0]
        sample = pd.DataFrame([[
            user_data['Age'],
            user_data['Income'],
            user_data['Risk_Tolerance'],
            goal_encoded,
            user_data.get('Experience_Years', user_data['Age'] - 21)
        ]], columns=self.feature_cols)
        
        pred_idx = self.model.predict(sample)[0]
        return self.label_encoder.classes_[pred_idx]

if __name__ == "__main__":
    # Internal test/train
    profiler = RiskProfiler()
    data_path = os.path.join(os.path.dirname(__file__), "investor_profiles.csv")
    if os.path.exists(data_path):
        profiler.train(data_path)
    else:
        print("Run data_generator.py first to create investor_profiles.csv")
