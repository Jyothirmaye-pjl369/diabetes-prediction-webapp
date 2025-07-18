#!/usr/bin/env python3
"""
Test script to verify form functionality
"""
import requests
import json

def test_form_functionality():
    """Test the main form functionality"""
    base_url = "http://127.0.0.1:5000"
    
    # Test that the main page loads
    try:
        response = requests.get(base_url)
        if response.status_code == 200:
            print("✓ Main page loads successfully")
        else:
            print(f"✗ Main page failed to load: {response.status_code}")
            return False
    except Exception as e:
        print(f"✗ Error loading main page: {e}")
        return False
    
    # Test the prediction endpoint with sample data
    test_data = {
        'pregnancies': '1',
        'glucose': '85',
        'bloodpressure': '66',
        'skinthickness': '29',
        'insulin': '0',
        'bmi': '26.6',
        'dpf': '0.351',
        'age': '31'
    }
    
    try:
        response = requests.post(f"{base_url}/predict", data=test_data)
        if response.status_code == 200:
            result = response.json()
            if 'prediction' in result:
                print("✓ Prediction endpoint works correctly")
                print(f"  - Prediction: {result['prediction']}")
                print(f"  - Confidence: {result.get('confidence', 'N/A')}%")
            else:
                print("✗ Prediction response missing required fields")
                return False
        else:
            print(f"✗ Prediction endpoint failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"✗ Error testing prediction endpoint: {e}")
        return False
    
    print("\n✓ All form functionality tests passed!")
    return True

if __name__ == "__main__":
    print("Testing form functionality...")
    test_form_functionality()
