import os
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split, cross_val_score, StratifiedKFold
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix
from sklearn.utils.class_weight import compute_sample_weight
import joblib
import xgboost as xgb

try:
    import mlflow
    import mlflow.sklearn
    HAS_MLFLOW = True
except ImportError:
    HAS_MLFLOW = False



import os
from recommender.risk_profiler import RiskProfiler

def train_model():
    current_dir = os.path.dirname(os.path.abspath(__file__))
    data_path = os.path.join(current_dir, "investor_profiles.csv")
    
    if not os.path.exists(data_path):
        from recommender.data_generator import generate_data
        print("[TRAIN] investor_profiles.csv not found. Generating fresh synthetic data...")
        generate_data(num_samples=25000, output_path=data_path)
        
    print("[TRAIN] Starting Risk Profiler training via RiskProfiler class...")
    profiler = RiskProfiler()
    acc = profiler.train(data_path)
    
    print(f"[TRAIN] Risk Profiler training finished. Final Accuracy: {acc:.4f}")

if __name__ == "__main__":
    train_model()

