#!/usr/bin/env python3
"""Simple test script to verify the prediction functionality"""

import requests
import json

# Test data
test_data = {
    'pregnancies': 2,
    'glucose': 120,
    'bloodpressure': 80,
    'skinthickness': 25,
    'insulin': 100,
    'bmi': 25.5,
    'dpf': 0.5,
    'age': 35
}

try:
    # Test the prediction endpoint
    response = requests.post('http://127.0.0.1:5000/predict', data=test_data)
    
    if response.status_code == 200:
        result = response.json()
        print("✅ Prediction API is working!")
        print(f"Response: {json.dumps(result, indent=2)}")
        
        if result.get('success'):
            print(f"🎯 Prediction: {'Diabetes Risk' if result['prediction'] == 1 else 'Low Risk'}")
            print(f"📊 Probability: {result['probability']:.2%}")
        else:
            print("❌ Prediction failed:", result.get('error', 'Unknown error'))
    else:
        print(f"❌ HTTP Error: {response.status_code}")
        print(f"Response: {response.text}")
        
except requests.exceptions.ConnectionError:
    print("❌ Connection failed. Make sure the Flask app is running on http://127.0.0.1:5000")
except Exception as e:
    print(f"❌ Error: {e}")
