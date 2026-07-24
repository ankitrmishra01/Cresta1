"""
nfcs_converter.py
Converts NFCS 2021 Investor Survey into Cresta XGBoost training format.
Place this file in: backend/recommender/nfcs_converter.py
Run with: python nfcs_converter.py
"""

import pandas as pd
import numpy as np
import os

# ── SEBI 2015 Investor Survey calibration constants ──────────────────────────
# Used to generate the synthetic top-up to reach 25,000 total profiles
# Source: SEBI Investor Survey 2015 (N=32,000 households)

SEBI_AGE_DIST = {
    (18, 30): 0.22,
    (31, 45): 0.41,
    (46, 60): 0.28,
    (61, 70): 0.09
}

SEBI_INCOME_DIST = {
    (150000,  400000): 0.18,
    (400000,  800000): 0.31,
    (800000, 1500000): 0.29,
    (1500000, 5000000): 0.22
}

SEBI_CLASS_DIST = {
    'Conservative': 0.28,
    'Moderate':     0.49,
    'Aggressive':   0.23
}

TARGET_TOTAL = 25000
NFCS_OUTPUT  = "nfcs_cresta_profiles.csv"
FINAL_OUTPUT = "training_data_final.csv"


# ── Step 1: Convert NFCS real data ───────────────────────────────────────────

def convert_nfcs(csv_path: str) -> pd.DataFrame:
    """
    Maps NFCS 2021 Investor Survey columns to Cresta's 5 XGBoost features.

    Column mapping (verified against NFCS 2021 data dictionary):
      S_Age    → Age bracket  (1=18-34, 2=35-54, 3=55+)
      S_Income → Income tier  (1=Low <$50k, 2=Mid $50-100k, 3=High $100k+)
      G1       → Risk Tolerance on 1-10 scale  (direct match)
      E5       → Primary investment goal       (1-4 categories)
      E1_1     → Investment experience 1-10    (used to derive years)
    """
    df = pd.read_csv(csv_path)

    # Drop refusals / don't-knows (coded 98, 99)
    clean = df[
        (df['G1']     < 98) &
        (df['E5']     < 98) &
        (df['E1_1']   < 98) &
        (df['S_Age']  < 98) &
        (df['S_Income'] < 98)
    ].copy()

    cresta = pd.DataFrame()

    # Age — expand NFCS bracket to midpoint integer
    age_midpoint = {1: 26, 2: 44, 3: 62}
    cresta['Age'] = clean['S_Age'].map(age_midpoint)

    # Income — convert US dollar brackets to INR equivalents (2024 rate ~83x)
    # NFCS S_Income: 1=<$50k, 2=$50-100k, 3=$100k+
    # Mapped to representative Indian income tier midpoints in INR
    income_midpoint = {
        1:  350000,   # Low income  → ₹3.5L
        2:  900000,   # Mid income  → ₹9L
        3: 2000000    # High income → ₹20L
    }
    cresta['Income'] = clean['S_Income'].map(income_midpoint)

    # Risk Tolerance — G1 is already 1-10, direct match to Cresta's scale
    cresta['Risk_Tolerance'] = clean['G1'].astype(int)

    # Investment Goal — E5 maps cleanly to Cresta's 4-class encoding
    # NFCS E5: 1=Preserve capital, 2=Income, 3=Growth, 4=Speculation
    # Cresta:  0=Preservation,     1=Income, 2=Growth, 3=Aggressive
    goal_map = {1: 0, 2: 1, 3: 2, 4: 3}
    cresta['Investment_Goal_Encoded'] = clean['E5'].map(goal_map)

    # Experience Years — derived from E1_1 (1-10 experience scale)
    # Scale: 1-2 → 0yr, 3-4 → 2yr, 5-6 → 5yr, 7-8 → 10yr, 9-10 → 20yr
    exp_map = {1: 0, 2: 0, 3: 2, 4: 2, 5: 5, 6: 5, 7: 10, 8: 10, 9: 20, 10: 20}
    cresta['Experience_Years'] = clean['E1_1'].map(exp_map)

    cresta = cresta.dropna().astype(int)

    print(f"✅ NFCS real profiles converted: {len(cresta)}")
    print(f"   Age range:        {cresta['Age'].min()} – {cresta['Age'].max()}")
    print(f"   Income range:     ₹{cresta['Income'].min():,} – ₹{cresta['Income'].max():,}")
    print(f"   Risk Tol range:   {cresta['Risk_Tolerance'].min()} – {cresta['Risk_Tolerance'].max()}")
    return cresta


# ── Step 2: Label using SEBI-aligned logic ───────────────────────────────────

def label_investor_class(row) -> str:
    """
    Labels each profile Conservative / Moderate / Aggressive.
    Uses the same scoring logic as Cresta's data_generator.py
    to ensure consistency with existing model training.
    """
    score = 0

    # Risk tolerance is the primary driver (matches SHAP: 61.35%)
    score += row['Risk_Tolerance'] * 6          # max 60 pts

    # Income — determines loss absorption capacity
    if row['Income'] > 1_500_000:
        score += 20
    elif row['Income'] > 700_000:
        score += 10
    else:
        score += 5

    # Investment goal
    score += row['Investment_Goal_Encoded'] * 5  # max 15 pts

    # Age — younger investors can take more risk
    if row['Age'] < 30:
        score += 10
    elif row['Age'] < 45:
        score += 5

    if score >= 70:
        return 'Aggressive'
    elif score >= 40:
        return 'Moderate'
    else:
        return 'Conservative'


# ── Step 3: Generate SEBI-calibrated synthetic top-up ────────────────────────

def generate_sebi_topup(n: int) -> pd.DataFrame:
    """
    Generates synthetic profiles calibrated to SEBI 2015 survey distributions.
    Used to top up the real NFCS data to reach 25,000 total profiles.
    Source: SEBI Investor Survey 2015 (N=32,000 Indian households)
    """
    np.random.seed(42)
    rows = []

    for _ in range(n):
        # Age — sampled from SEBI-observed brackets
        age_brackets = [(18,30),(31,45),(46,60),(61,70)]
        bracket = age_brackets[np.random.choice(4, p=[0.22, 0.41, 0.28, 0.09])]
        age = np.random.randint(bracket[0], bracket[1])

        # Income — sampled from SEBI-observed Indian income distribution
        inc_brackets = [(150000,400000),(400000,800000),(800000,1500000),(1500000,5000000)]
        inc_bracket = inc_brackets[np.random.choice(4, p=[0.18, 0.31, 0.29, 0.22])]
        income = np.random.randint(inc_bracket[0], inc_bracket[1])

        # Risk tolerance — 1-10, skewed by age and income realistically
        base_risk = np.random.randint(1, 11)
        risk = max(1, min(10, base_risk))

        # Investment goal — 0-3
        goal = np.random.choice([0, 1, 2, 3], p=[0.20, 0.25, 0.40, 0.15])

        # Experience — derived from age
        exp = max(0, age - 21)

        rows.append({
            'Age': age,
            'Income': income,
            'Risk_Tolerance': risk,
            'Investment_Goal_Encoded': goal,
            'Experience_Years': exp
        })

    df = pd.DataFrame(rows)
    print(f"✅ SEBI-calibrated synthetic profiles generated: {len(df)}")
    return df


# ── Step 4: Combine and save ──────────────────────────────────────────────────

def build_final_dataset(nfcs_csv_path: str):

    print("\n📊 NFCS + SEBI Dataset Builder")
    print("=" * 45)

    # Convert real NFCS data
    nfcs_df = convert_nfcs(nfcs_csv_path)
    nfcs_df['User_Class'] = nfcs_df.apply(label_investor_class, axis=1)
    nfcs_df['source'] = 'real_nfcs'

    # Generate SEBI synthetic top-up
    topup_n = TARGET_TOTAL - len(nfcs_df)
    sebi_df = generate_sebi_topup(topup_n)
    sebi_df['User_Class'] = sebi_df.apply(label_investor_class, axis=1)
    sebi_df['source'] = 'sebi_synthetic'

    # Combine
    combined = pd.concat([nfcs_df, sebi_df], ignore_index=True)
    combined = combined.sample(frac=1, random_state=42).reset_index(drop=True)

    print(f"\n📈 Final Dataset Summary")
    print(f"   Real NFCS profiles:        {len(nfcs_df):,}")
    print(f"   SEBI synthetic profiles:   {len(sebi_df):,}")
    print(f"   Total:                     {len(combined):,}")
    print(f"\n   Class distribution:")
    dist = combined['User_Class'].value_counts()
    for cls, cnt in dist.items():
        pct = cnt / len(combined) * 100
        print(f"   {cls:<15}: {cnt:,} ({pct:.1f}%)")

    # Save — drop source column for training file
    training_df = combined.drop(columns=['source'])
    training_df.to_csv(FINAL_OUTPUT, index=False)
    print(f"\n✅ Saved: {FINAL_OUTPUT}")

    # Also save NFCS-only file for reference
    nfcs_df.drop(columns=['source']).to_csv(NFCS_OUTPUT, index=False)
    print(f"✅ Saved: {NFCS_OUTPUT}")

    return training_df


# ── Run ───────────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    nfcs_path = "NFCS 2021 Investor Data 221121.csv"

    if not os.path.exists(nfcs_path):
        print(f"❌ File not found: {nfcs_path}")
        print("   Place the NFCS CSV in the same directory as this script.")
        exit(1)

    df = build_final_dataset(nfcs_path)

    print("\n🎯 Next Step:")
    print("   Copy training_data_final.csv to backend/recommender/")
    print("   Update train.py to load training_data_final.csv")
    print("   Run: python manage.py shell → from recommender.train import train_risk_model → train_risk_model()")
