from flask import Flask, request, jsonify
from flask_cors import CORS
import random
import os
import joblib
import numpy as np
import pandas as pd

app = Flask(__name__)
CORS(app)

# Model paths
BASE_DIR = os.path.dirname(__file__)
CROP_REC_MODEL_PATH = os.path.join(BASE_DIR, "crop_rec_model.pkl")
YIELD_MODEL_PATH = os.path.join(BASE_DIR, "yield_pred_model.pkl")
YIELD_ENCODER_PATH = os.path.join(BASE_DIR, "yield_encoder.pkl")
YIELD_METADATA_PATH = os.path.join(BASE_DIR, "yield_metadata.pkl")

FERTILIZER_MODEL_PATH = os.path.join(BASE_DIR, "fertilizer_model.pkl")
FERTILIZER_SOIL_ENCODER_PATH = os.path.join(BASE_DIR, "fertilizer_soil_encoder.pkl")
FERTILIZER_CROP_ENCODER_PATH = os.path.join(BASE_DIR, "fertilizer_crop_encoder.pkl")

# Load models
crop_rec_model = None
yield_model = None
yield_encoder = None
yield_metadata = None

fertilizer_model = None
fertilizer_soil_encoder = None
fertilizer_crop_encoder = None

if os.path.exists(CROP_REC_MODEL_PATH):
    try:
        crop_rec_model = joblib.load(CROP_REC_MODEL_PATH)
        print("Loaded crop recommendation model.")
    except Exception as e:
        print("Error loading crop recommendation model:", e)

if os.path.exists(YIELD_MODEL_PATH):
    try:
        yield_model = joblib.load(YIELD_MODEL_PATH)
        print("Loaded yield prediction model.")
    except Exception as e:
        print("Error loading yield prediction model:", e)

if os.path.exists(YIELD_ENCODER_PATH):
    try:
        yield_encoder = joblib.load(YIELD_ENCODER_PATH)
        print("Loaded yield label encoder.")
    except Exception as e:
        print("Error loading yield label encoder:", e)

if os.path.exists(YIELD_METADATA_PATH):
    try:
        yield_metadata = joblib.load(YIELD_METADATA_PATH)
        print("Loaded yield metadata.")
    except Exception as e:
        print("Error loading yield metadata:", e)

if os.path.exists(FERTILIZER_MODEL_PATH):
    try:
        fertilizer_model = joblib.load(FERTILIZER_MODEL_PATH)
        print("Loaded fertilizer recommendation model.")
    except Exception as e:
        print("Error loading fertilizer model:", e)

if os.path.exists(FERTILIZER_SOIL_ENCODER_PATH):
    try:
        fertilizer_soil_encoder = joblib.load(FERTILIZER_SOIL_ENCODER_PATH)
        print("Loaded fertilizer soil encoder.")
    except Exception as e:
        print("Error loading fertilizer soil encoder:", e)

if os.path.exists(FERTILIZER_CROP_ENCODER_PATH):
    try:
        fertilizer_crop_encoder = joblib.load(FERTILIZER_CROP_ENCODER_PATH)
        print("Loaded fertilizer crop encoder.")
    except Exception as e:
        print("Error loading fertilizer crop encoder:", e)

# Crop metadata for the 22 recommendation crops
CROP_RECOMMENDATION_METADATA = {
    'rice': {'growingTime': '120-150 days', 'waterReq': 'High', 'price_per_quintal': 2100, 'typical_yield': 4.0},
    'maize': {'growingTime': '90-110 days', 'waterReq': 'Medium', 'price_per_quintal': 1900, 'typical_yield': 3.5},
    'chickpea': {'growingTime': '110-120 days', 'waterReq': 'Low', 'price_per_quintal': 5200, 'typical_yield': 1.5},
    'kidneybeans': {'growingTime': '90-100 days', 'waterReq': 'Medium', 'price_per_quintal': 6000, 'typical_yield': 1.2},
    'pigeonpeas': {'growingTime': '150-180 days', 'waterReq': 'Low', 'price_per_quintal': 6300, 'typical_yield': 1.0},
    'mothbeans': {'growingTime': '80-90 days', 'waterReq': 'Low', 'price_per_quintal': 5500, 'typical_yield': 0.8},
    'mungbean': {'growingTime': '60-75 days', 'waterReq': 'Low', 'price_per_quintal': 7000, 'typical_yield': 0.9},
    'blackgram': {'growingTime': '75-90 days', 'waterReq': 'Low', 'price_per_quintal': 6500, 'typical_yield': 1.0},
    'lentil': {'growingTime': '110-130 days', 'waterReq': 'Low', 'price_per_quintal': 6000, 'typical_yield': 1.1},
    'pomegranate': {'growingTime': '3-4 years', 'waterReq': 'Medium', 'price_per_quintal': 8000, 'typical_yield': 12.0},
    'banana': {'growingTime': '300-365 days', 'waterReq': 'High', 'price_per_quintal': 1500, 'typical_yield': 30.0},
    'mango': {'growingTime': '5-6 years', 'waterReq': 'Medium', 'price_per_quintal': 5000, 'typical_yield': 8.0},
    'grapes': {'growingTime': '2-3 years', 'waterReq': 'Medium', 'price_per_quintal': 6000, 'typical_yield': 15.0},
    'watermelon': {'growingTime': '80-100 days', 'waterReq': 'Medium', 'price_per_quintal': 1000, 'typical_yield': 25.0},
    'muskmelon': {'growingTime': '70-90 days', 'waterReq': 'Medium', 'price_per_quintal': 1200, 'typical_yield': 20.0},
    'apple': {'growingTime': '4-5 years', 'waterReq': 'Medium', 'price_per_quintal': 9000, 'typical_yield': 10.0},
    'orange': {'growingTime': '3-5 years', 'waterReq': 'Medium', 'price_per_quintal': 4000, 'typical_yield': 12.0},
    'papaya': {'growingTime': '270-360 days', 'waterReq': 'Medium', 'price_per_quintal': 2000, 'typical_yield': 40.0},
    'coconut': {'growingTime': '6-10 years', 'waterReq': 'High', 'price_per_quintal': 3000, 'typical_yield': 10.0},
    'cotton': {'growingTime': '150-180 days', 'waterReq': 'Medium', 'price_per_quintal': 6200, 'typical_yield': 2.0},
    'jute': {'growingTime': '120-150 days', 'waterReq': 'High', 'price_per_quintal': 4500, 'typical_yield': 2.5},
    'coffee': {'growingTime': '3-4 years', 'waterReq': 'High', 'price_per_quintal': 15000, 'typical_yield': 1.5}
}

# Crop prices per quintal for yield prediction
YIELD_CROP_PRICES = {
    'wheat': 2200,
    'rice': 2100,
    'rice, paddy': 2100,
    'maize': 1850,
    'potatoes': 1500,
    'soybeans': 4200,
    'cassava': 1200,
    'sweet potatoes': 1600,
    'plantains': 2000,
    'yams': 1800,
    'sorghum': 2100
}

# Irrigation suggestion endpoint
@app.route('/irrigation', methods=['POST'])
def irrigation():
    data = request.json or {}
    crop = data.get('crop', 'Wheat')
    area = float(data.get('area', 1.0))
    soil = data.get('soilType', 'Loamy')
    temp = float(data.get('temperature', 28))
    humidity = float(data.get('humidity', 60))

    water_needs = {'Rice': 1200, 'Wheat': 450, 'Maize': 500, 'Sugarcane': 1500, 'Tomato': 400}
    base = water_needs.get(crop, 500)
    # Adjust for temp and humidity
    adjusted = base * (1 + (temp - 25) * 0.01) * (1 - (humidity - 50) * 0.003)
    total = round(adjusted * area, 1)
    daily = round(total / 120, 1)

    soil_factor = {'Sandy': 'High drainage — water more frequently', 'Clay': 'Low drainage — risk of waterlogging', 'Loamy': 'Ideal drainage — standard schedule'}
    schedule = [
        {'day': 'Mon', 'amount': round(daily * 1.1, 1)},
        {'day': 'Wed', 'amount': round(daily * 0.9, 1)},
        {'day': 'Fri', 'amount': round(daily * 1.0, 1)},
        {'day': 'Sun', 'amount': round(daily * 0.8, 1)},
    ]
    alert = 'Over-watering risk' if humidity > 75 else ('Drought risk — increase irrigation' if humidity < 35 else 'Normal conditions')
    return jsonify({
        'totalWaterNeeded': total,
        'dailyRequirement': daily,
        'soilNote': soil_factor.get(soil, 'Standard schedule'),
        'schedule': schedule,
        'alert': alert
    })

# Market price & profit analysis endpoint
@app.route('/market', methods=['POST'])
def market():
    data = request.json or {}
    crop = data.get('crop', 'Wheat')
    area = float(data.get('area', 1.0))

    prices = {
        'Wheat':     {'price': 2200, 'trend': '+3.2%', 'demand': 'High'},
        'Rice':      {'price': 2100, 'trend': '+1.8%', 'demand': 'High'},
        'Maize':     {'price': 1850, 'trend': '-0.5%', 'demand': 'Medium'},
        'Sugarcane': {'price': 350,  'trend': '+5.1%', 'demand': 'High'},
        'Tomato':    {'price': 1500, 'trend': '+12.4%','demand': 'Very High'},
        'Cotton':    {'price': 6500, 'trend': '+2.0%', 'demand': 'Medium'},
        'Soybean':   {'price': 4200, 'trend': '+4.3%', 'demand': 'High'},
    }
    all_crops = [{'crop': k, **v} for k, v in prices.items()]
    selected = prices.get(crop, {'price': 2000, 'trend': '0%', 'demand': 'Medium'})
    base_yield = {'Wheat': 4.0, 'Rice': 5.0, 'Maize': 6.0, 'Sugarcane': 60.0, 'Tomato': 25.0, 'Cotton': 2.0, 'Soybean': 3.0}.get(crop, 3.5)
    predicted_yield = base_yield * area
    revenue = round(predicted_yield * selected['price'], 2)
    cost = round(revenue * 0.35, 2)
    profit = round(revenue - cost, 2)
    best = max(prices.items(), key=lambda x: x[1]['price'])

    return jsonify({
        'selectedCrop': crop,
        'pricePerQuintal': selected['price'],
        'trend': selected['trend'],
        'demand': selected['demand'],
        'estimatedRevenue': revenue,
        'estimatedCost': cost,
        'estimatedProfit': profit,
        'bestCrop': best[0],
        'bestPrice': best[1]['price'],
        'allPrices': all_crops
    })

# Real Logic for Crop Recommendation
@app.route('/recommend-crop', methods=['POST'])
def recommend_crop():
    data = request.json or {}
    
    if crop_rec_model is None:
        # Fallback dummy recommendations if model not loaded
        recommendations = [
            {"name": "Rice", "confidence": 92.5, "growingTime": "120 days", "waterReq": "High", "expectedProfit": "₹ 50,000 / ha"},
            {"name": "Maize", "confidence": 85.0, "growingTime": "90 days", "waterReq": "Medium", "expectedProfit": "₹ 40,000 / ha"},
            {"name": "Tomato", "confidence": 78.4, "growingTime": "60 days", "waterReq": "Medium", "expectedProfit": "₹ 60,000 / ha"}
        ]
        return jsonify({"recommended": recommendations})

    try:
        n = float(data.get('N', 80))
        p = float(data.get('P', 40))
        k = float(data.get('K', 40))
        temp = float(data.get('temperature', 28))
        humidity = float(data.get('humidity', 70))
        ph = float(data.get('ph', 6.5))
        rainfall = float(data.get('rainfall', 100))
    except (ValueError, TypeError) as e:
        return jsonify({"error": f"Invalid numerical inputs: {str(e)}"}), 400

    # Features: N, P, K, temperature, humidity, ph, rainfall
    features = pd.DataFrame([[n, p, k, temp, humidity, ph, rainfall]], 
                            columns=['N', 'P', 'K', 'temperature', 'humidity', 'ph', 'rainfall'])
    
    # Get class probabilities
    probs = crop_rec_model.predict_proba(features)[0]
    classes = crop_rec_model.classes_
    
    # Get top 3 indices
    top_indices = np.argsort(probs)[::-1][:3]
    
    recommendations = []
    for idx in top_indices:
        crop_name = classes[idx]
        confidence = round(probs[idx] * 100, 1)
        
        # Skip crops with negligible probability
        if confidence < 0.1:
            continue
            
        # Get metadata
        meta = CROP_RECOMMENDATION_METADATA.get(crop_name.lower(), {
            'growingTime': '90-120 days', 
            'waterReq': 'Medium', 
            'price_per_quintal': 2000, 
            'typical_yield': 3.0
        })
        
        # Calculate expected profit per hectare
        # 1 ton = 10 quintals. Expected profit = typical_yield * price_per_quintal * 10 * 0.65
        expected_profit_val = round(meta['typical_yield'] * meta['price_per_quintal'] * 10 * 0.65)
        expected_profit_str = f"₹ {expected_profit_val:,} / ha"
        
        recommendations.append({
            "name": crop_name.capitalize(),
            "confidence": confidence,
            "growingTime": meta['growingTime'],
            "waterReq": meta['waterReq'],
            "expectedProfit": expected_profit_str
        })
        
    return jsonify({"recommended": recommendations})

# Real Logic for Yield Prediction
@app.route('/predict-yield', methods=['POST'])
def predict_yield():
    data = request.json or {}
    crop = data.get('crop', 'Wheat')
    area = float(data.get('area', 1.0))
    
    if yield_model is None or yield_encoder is None or yield_metadata is None:
        # Fallback dummy logic
        base_yield = {"Wheat": 4.0, "Rice": 5.0, "Maize": 6.0}.get(crop, 3.5)
        predicted_yield = base_yield * (0.9 + random.random() * 0.2)
        profit_per_ton = {"Wheat": 15000, "Rice": 18000, "Maize": 12000}.get(crop, 10000)
        profit = predicted_yield * area * profit_per_ton
        return jsonify({
            "predictedYield": round(predicted_yield * area, 2),
            "yieldPerHa": round(predicted_yield, 2),
            "estimatedProfit": round(profit, 2)
        })

    # Substring matching to handle e.g. "Rice" -> "Rice, paddy" or case differences
    matched_crop = None
    crop_lower = crop.lower()
    for enc_class in yield_encoder.classes_:
        enc_class_lower = enc_class.lower()
        if crop_lower == enc_class_lower or crop_lower in enc_class_lower or enc_class_lower in crop_lower:
            matched_crop = enc_class
            break
            
    if matched_crop is None:
        # Fallback if crop is completely unknown to the model
        matched_crop = yield_encoder.classes_[0]

    # Get typical values
    meta = yield_metadata.get(matched_crop, {
        'median_pesticides': 100.0,
        'median_temp': 25.0,
        'median_rainfall': 1000.0
    })
    
    # Read weather/rainfall overrides if passed from the frontend
    try:
        temp = float(data.get('temperature', meta['median_temp']))
        rainfall = float(data.get('rainfall', meta['median_rainfall']))
    except (ValueError, TypeError):
        temp = meta['median_temp']
        rainfall = meta['median_rainfall']
        
    pesticides = meta['median_pesticides']
    
    # Predict yield (tons/ha)
    try:
        crop_encoded = yield_encoder.transform([matched_crop])[0]
        # Features: Item_encoded, avg_temp, average_rain_fall_mm_per_year, pesticides_tonnes
        features = pd.DataFrame([[crop_encoded, temp, rainfall, pesticides]], 
                                columns=['Item_encoded', 'avg_temp', 'average_rain_fall_mm_per_year', 'pesticides_tonnes'])
        predicted_yield_ha = yield_model.predict(features)[0]
    except Exception as e:
        # Fallback in case prediction fails
        predicted_yield_ha = 3.5

    # Compute expected profit
    # Look up price per quintal
    price_per_quintal = YIELD_CROP_PRICES.get(matched_crop.lower(), 2000)
    # expected profit = yield * area * price_per_ton * 0.65
    profit = predicted_yield_ha * area * (price_per_quintal * 10) * 0.65
    
    return jsonify({
        "predictedYield": round(predicted_yield_ha * area, 2),
        "yieldPerHa": round(predicted_yield_ha, 2),
        "estimatedProfit": round(profit, 2)
    })

# Real Logic for Soil Analysis & Fertilizer Recommendation
@app.route('/analyze-soil', methods=['POST'])
def analyze_soil():
    data = request.json or {}
    n = int(data.get('N', 50))
    p = int(data.get('P', 50))
    k = int(data.get('K', 50))
    
    # Optional parameters for model
    temp = float(data.get('temperature', 25.0))
    humidity = float(data.get('humidity', 60.0))
    moisture = float(data.get('moisture', 40.0))
    soil_type = data.get('soilType', 'Loamy')
    crop_type = data.get('crop', 'Wheat')
    
    report = {
        "Nitrogen": "Low" if n < 40 else "High" if n > 80 else "Medium",
        "Phosphorus": "Low" if p < 30 else "High" if p > 60 else "Medium",
        "Potassium": "Low" if k < 30 else "High" if k > 60 else "Medium",
    }
    
    suggestions = []
    
    if fertilizer_model is not None and fertilizer_soil_encoder is not None and fertilizer_crop_encoder is not None:
        try:
            # Substring matching for Soil Type
            matched_soil = None
            soil_lower = soil_type.lower()
            for c in fertilizer_soil_encoder.classes_:
                c_lower = c.lower()
                if soil_lower == c_lower or soil_lower in c_lower or c_lower in soil_lower:
                    matched_soil = c
                    break
            if matched_soil is None:
                matched_soil = fertilizer_soil_encoder.classes_[0]

            # Substring matching for Crop Type
            matched_crop = None
            crop_lower = crop_type.lower()
            for c in fertilizer_crop_encoder.classes_:
                c_lower = c.lower()
                if crop_lower == c_lower or crop_lower in c_lower or c_lower in crop_lower:
                    matched_crop = c
                    break
            if matched_crop is None:
                matched_crop = fertilizer_crop_encoder.classes_[0]
                
            soil_encoded = fertilizer_soil_encoder.transform([matched_soil])[0]
            crop_encoded = fertilizer_crop_encoder.transform([matched_crop])[0]
            
            # Features in order: Temparature, Humidity, Moisture, Soil Type Encoded, Crop Type Encoded, Nitrogen, Potassium, Phosphorous
            features = pd.DataFrame([[temp, humidity, moisture, soil_encoded, crop_encoded, n, k, p]], 
                                    columns=['Temparature', 'Humidity', 'Moisture', 'Soil Type Encoded', 'Crop Type Encoded', 'Nitrogen', 'Potassium', 'Phosphorous'])
            
            predicted_fertilizer = fertilizer_model.predict(features)[0]
            suggestions.append(f"AI recommended fertilizer: {predicted_fertilizer}")
            
            # Map fertilizer details
            details = {
                'Urea': 'Apply in splits to minimize nitrogen leaching.',
                'DAP': 'Apply at sowing time to boost root growth.',
                'MOP': 'Potash helps with disease resistance and quality.',
                '10-26-26': 'Balanced NPK blend suitable for root crops.',
                '14-35-14': 'High phosphorus mix ideal for flowering crops.',
                '17-17-17': 'General purpose balanced NPK fertilizer.',
                '20-20': 'N-P blend to support vegetative growth.'
            }
            extra = details.get(predicted_fertilizer, 'Apply according to local agricultural extension guidelines.')
            suggestions.append(extra)
            
        except Exception as e:
            suggestions.append(f"Error executing AI fertilizer model: {str(e)}")
    
    # Fallback to rules if model failed or not loaded
    if not suggestions:
        if report["Nitrogen"] == "Low":
            suggestions.append("Apply Urea (100 kg/ha) or ammonium sulfate")
        if report["Phosphorus"] == "Low":
            suggestions.append("Apply Single Superphosphate (SSP) or DAP (50 kg/ha)")
        if report["Potassium"] == "Low":
            suggestions.append("Apply Muriate of Potash (MOP) (30 kg/ha)")
        if not suggestions:
            suggestions.append("Soil is healthy. Maintain organic compost and crop rotation.")
            
    return jsonify({
        "soilTest": report,
        "fertilizerSuggestions": suggestions,
        "diseaseRisk": "Leaf Blight (Moderate Risk)" if humidity > 70 else "Low Risk"
    })

if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)
