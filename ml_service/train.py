import os
import requests
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor
from sklearn.preprocessing import LabelEncoder
import joblib

# Paths
DATA_DIR = os.path.join(os.path.dirname(__file__), "data")
os.makedirs(DATA_DIR, exist_ok=True)

CROP_REC_CSV = os.path.join(DATA_DIR, "crop_recommendation.csv")
YIELD_CSV = os.path.join(DATA_DIR, "yield_df.csv")
FERTILIZER_CSV = os.path.join(DATA_DIR, "fertilizer_prediction.csv")

CROP_REC_MODEL_PATH = os.path.join(os.path.dirname(__file__), "crop_rec_model.pkl")
YIELD_MODEL_PATH = os.path.join(os.path.dirname(__file__), "yield_pred_model.pkl")
YIELD_ENCODER_PATH = os.path.join(os.path.dirname(__file__), "yield_encoder.pkl")
YIELD_METADATA_PATH = os.path.join(os.path.dirname(__file__), "yield_metadata.pkl")

FERTILIZER_MODEL_PATH = os.path.join(os.path.dirname(__file__), "fertilizer_model.pkl")
FERTILIZER_SOIL_ENCODER_PATH = os.path.join(os.path.dirname(__file__), "fertilizer_soil_encoder.pkl")
FERTILIZER_CROP_ENCODER_PATH = os.path.join(os.path.dirname(__file__), "fertilizer_crop_encoder.pkl")

# URLs
CROP_REC_URL = "https://raw.githubusercontent.com/Gladiator07/Harvestify/master/Data-processed/crop_recommendation.csv"
YIELD_URL = "https://raw.githubusercontent.com/611noorsaeed/Crop-Yield-Prediction-Using-Machin-Learning-Python/main/yield_df.csv"
FERTILIZER_URL = "https://raw.githubusercontent.com/Lanchavi/AgroTechh/main/Fertilizer%20Prediction.csv"

def download_file(url, dest):
    if not os.path.exists(dest):
        print(f"Downloading {url} to {dest}...")
        response = requests.get(url)
        response.raise_for_status()
        with open(dest, "wb") as f:
            f.write(response.content)
        print("Download complete.")
    else:
        print(f"File {dest} already exists.")

def train_crop_recommendation():
    print("\n--- Training Crop Recommendation Model ---")
    if os.path.exists(CROP_REC_CSV):
        try:
            temp_df = pd.read_csv(CROP_REC_CSV)
            if 'N' not in temp_df.columns:
                print("Existing crop_recommendation.csv has incorrect columns. Deleting it to re-download...")
                os.remove(CROP_REC_CSV)
        except Exception:
            try:
                os.remove(CROP_REC_CSV)
            except Exception:
                pass
    download_file(CROP_REC_URL, CROP_REC_CSV)
    
    df = pd.read_csv(CROP_REC_CSV)
    print("Crop Rec dataset shape:", df.shape)
    print("Columns:", df.columns.tolist())
    
    # Check for missing values
    missing = df.isnull().sum().sum()
    print("Missing values in Crop Rec dataset:", missing)
    if missing > 0:
        df = df.dropna()
        
    X = df[['N', 'P', 'K', 'temperature', 'humidity', 'ph', 'rainfall']]
    y = df['label']
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)
    
    model = RandomForestClassifier(n_estimators=100, random_state=42)
    model.fit(X_train, y_train)
    
    train_acc = model.score(X_train, y_train)
    test_acc = model.score(X_test, y_test)
    
    print(f"Crop Recommendation Model Training Accuracy: {train_acc:.4f}")
    print(f"Crop Recommendation Model Testing Accuracy: {test_acc:.4f}")
    
    # Save model
    joblib.dump(model, CROP_REC_MODEL_PATH)
    print(f"Saved crop recommendation model to {CROP_REC_MODEL_PATH}")

def train_yield_prediction():
    print("\n--- Training Crop Yield Prediction Model ---")
    download_file(YIELD_URL, YIELD_CSV)
    
    df = pd.read_csv(YIELD_CSV)
    print("Yield dataset shape:", df.shape)
    
    # Clean column names
    df.columns = [c.strip() for c in df.columns]
    print("Columns:", df.columns.tolist())
    
    # Drop unnamed column if exists
    if 'Unnamed: 0' in df.columns:
        df = df.drop(columns=['Unnamed: 0'])
    
    # Check for missing values
    missing = df.isnull().sum().sum()
    print("Missing values in Yield dataset:", missing)
    if missing > 0:
        df = df.dropna()
        
    # We want to train on: Item (Crop), avg_temp, average_rain_fall_mm_per_year, pesticides_tonnes
    # Target: hg/ha_yield (convert to tons/ha by dividing by 10000)
    df['yield_tons_per_ha'] = df['hg/ha_yield'] / 10000.0
    
    # Get typical values (median pesticide usage per crop, median rainfall, median temp)
    # to use as defaults in Flask API when not fully supplied
    yield_metadata = {}
    for crop in df['Item'].unique():
        crop_data = df[df['Item'] == crop]
        yield_metadata[crop] = {
            'median_pesticides': float(crop_data['pesticides_tonnes'].median()),
            'median_temp': float(crop_data['avg_temp'].median()),
            'median_rainfall': float(crop_data['average_rain_fall_mm_per_year'].median())
        }
    
    # Encode 'Item' (Crop)
    le = LabelEncoder()
    df['Item_encoded'] = le.fit_transform(df['Item'])
    
    features = ['Item_encoded', 'avg_temp', 'average_rain_fall_mm_per_year', 'pesticides_tonnes']
    X = df[features]
    y = df['yield_tons_per_ha']
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    model = RandomForestRegressor(n_estimators=100, random_state=42)
    model.fit(X_train, y_train)
    
    train_r2 = model.score(X_train, y_train)
    test_r2 = model.score(X_test, y_test)
    
    train_predictions = model.predict(X_train)
    test_predictions = model.predict(X_test)
    
    train_mae = np.mean(np.abs(train_predictions - y_train))
    test_mae = np.mean(np.abs(test_predictions - y_test))
    
    print(f"Yield Prediction Model Training R2: {train_r2:.4f}, MAE: {train_mae:.4f} tons/ha")
    print(f"Yield Prediction Model Testing R2: {test_r2:.4f}, MAE: {test_mae:.4f} tons/ha")
    
    # Save artifacts
    joblib.dump(model, YIELD_MODEL_PATH)
    joblib.dump(le, YIELD_ENCODER_PATH)
    joblib.dump(yield_metadata, YIELD_METADATA_PATH)
    
    print(f"Saved yield model, encoder, and metadata.")

def train_fertilizer_recommendation():
    print("\n--- Training Fertilizer Recommendation Model ---")
    download_file(FERTILIZER_URL, FERTILIZER_CSV)
    
    df = pd.read_csv(FERTILIZER_CSV)
    print("Fertilizer dataset shape:", df.shape)
    
    # Clean column names
    df.columns = [c.strip() for c in df.columns]
    print("Columns:", df.columns.tolist())
    
    # Check for missing values
    missing = df.isnull().sum().sum()
    print("Missing values in Fertilizer dataset:", missing)
    if missing > 0:
        df = df.dropna()
        
    # Encoders
    soil_le = LabelEncoder()
    df['Soil Type Encoded'] = soil_le.fit_transform(df['Soil Type'])
    
    crop_le = LabelEncoder()
    df['Crop Type Encoded'] = crop_le.fit_transform(df['Crop Type'])
    
    # Features in order: Temparature, Humidity, Moisture, Soil Type Encoded, Crop Type Encoded, Nitrogen, Potassium, Phosphorous
    features = ['Temparature', 'Humidity', 'Moisture', 'Soil Type Encoded', 'Crop Type Encoded', 'Nitrogen', 'Potassium', 'Phosphorous']
    X = df[features]
    y = df['Fertilizer Name']
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    model = RandomForestClassifier(n_estimators=100, random_state=42)
    model.fit(X_train, y_train)
    
    train_acc = model.score(X_train, y_train)
    test_acc = model.score(X_test, y_test)
    
    print(f"Fertilizer Model Training Accuracy: {train_acc:.4f}")
    print(f"Fertilizer Model Testing Accuracy: {test_acc:.4f}")
    
    # Save artifacts
    joblib.dump(model, FERTILIZER_MODEL_PATH)
    joblib.dump(soil_le, FERTILIZER_SOIL_ENCODER_PATH)
    joblib.dump(crop_le, FERTILIZER_CROP_ENCODER_PATH)
    
    print("Saved fertilizer model and encoders.")

if __name__ == "__main__":
    train_crop_recommendation()
    train_yield_prediction()
    train_fertilizer_recommendation()
