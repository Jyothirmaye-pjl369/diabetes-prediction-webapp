"""
Test script to verify the fixed JavaScript functionality
"""
import requests
import json

# Test the backend API
def test_backend_api():
    url = "http://127.0.0.1:5000/predict"
    
    # Test data
    test_data = {
        'pregnancies': 1,
        'glucose': 85,
        'bloodpressure': 66,
        'skinthickness': 29,
        'insulin': 0,
        'bmi': 26.6,
        'dpf': 0.351,
        'age': 31
    }
    
    try:
        response = requests.post(url, data=test_data)
        
        if response.status_code == 200:
            result = response.json()
            print("✅ Backend API Test PASSED")
            print(f"   Prediction: {result['prediction']}")
            print(f"   Probability: {result['probability']:.3f}")
            print(f"   Confidence: {result['confidence']:.3f}")
            print(f"   Risk Category: {result['prediction_details']['risk_category']}")
            print(f"   Medical Priority: {result['prediction_details']['medical_priority']}")
            return True
        else:
            print(f"❌ Backend API Test FAILED: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Backend API Test FAILED: {e}")
        return False

def test_frontend_accessibility():
    """Test if frontend is accessible"""
    try:
        response = requests.get("http://127.0.0.1:5000/")
        if response.status_code == 200:
            print("✅ Frontend Accessibility Test PASSED")
            return True
        else:
            print(f"❌ Frontend Accessibility Test FAILED: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Frontend Accessibility Test FAILED: {e}")
        return False

def test_history_endpoint():
    """Test history endpoint"""
    try:
        response = requests.get("http://127.0.0.1:5000/history")
        if response.status_code == 200:
            print("✅ History Endpoint Test PASSED")
            return True
        else:
            print(f"❌ History Endpoint Test FAILED: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ History Endpoint Test FAILED: {e}")
        return False

if __name__ == "__main__":
    print("🧪 Testing Diabetes Prediction Web App")
    print("=" * 50)
    
    # Run tests
    tests = [
        test_frontend_accessibility,
        test_backend_api,
        test_history_endpoint
    ]
    
    results = []
    for test in tests:
        results.append(test())
        print()
    
    # Summary
    passed = sum(results)
    total = len(results)
    
    print("=" * 50)
    print(f"📊 Test Results: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 All tests passed! The application is working correctly.")
        print("🌐 Access the app at: http://127.0.0.1:5000")
    else:
        print("⚠️  Some tests failed. Please check the application.")
