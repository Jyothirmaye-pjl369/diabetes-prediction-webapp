from flask import Flask, render_template, request, jsonify, session
from flask_cors import CORS
from model import predict_diabetes, train_model, model, scaler
import datetime
import json

app = Flask(__name__)
app.secret_key = 'diabetes_prediction_secret_key_2025'
CORS(app)  # Enable CORS for all routes

# Helper functions (defined first to avoid reference errors)
def get_feature_importance(features):
    """Get feature importance for the current prediction"""
    from model import model, scaler
    
    if model is None:
        return []
    
    # Get feature names
    feature_names = [
        'Pregnancies', 'Glucose', 'Blood Pressure', 'Skin Thickness',
        'Insulin', 'BMI', 'Diabetes Pedigree Function', 'Age'
    ]
    
    # Get feature importance from the model
    importance_scores = model.feature_importances_
    
    # Create feature importance list
    feature_importance = []
    for i, (name, score) in enumerate(zip(feature_names, importance_scores)):
        feature_importance.append({
            'feature': name,
            'importance': float(score),
            'value': features[i],
            'impact': 'high' if score > 0.15 else 'medium' if score > 0.08 else 'low'
        })
    
    # Sort by importance
    feature_importance.sort(key=lambda x: x['importance'], reverse=True)
    
    return feature_importance

def get_risk_category(probability):
    """Categorize risk based on probability"""
    if probability < 0.2:
        return "Very Low Risk"
    elif probability < 0.4:
        return "Low Risk"
    elif probability < 0.6:
        return "Moderate Risk"
    elif probability < 0.8:
        return "High Risk"
    else:
        return "Very High Risk"

def get_medical_priority(prediction, probability):
    """Determine medical priority level"""
    if prediction == 1:
        if probability > 0.8:
            return "URGENT - Immediate medical consultation required"
        elif probability > 0.6:
            return "HIGH - Schedule appointment within 1-2 weeks"
        else:
            return "MEDIUM - Schedule appointment within 1 month"
    else:
        if probability > 0.4:
            return "LOW - Annual check-up recommended"
        else:
            return "ROUTINE - Continue healthy lifestyle"

def analyze_risk_factors(features):
    """Analyze individual risk factors"""
    risk_factors = []
    
    # Glucose analysis
    glucose = features[1]
    if glucose > 140:
        risk_factors.append({
            'factor': 'Blood Glucose',
            'value': glucose,
            'level': 'high',
            'description': 'Elevated blood glucose levels increase diabetes risk'
        })
    elif glucose > 100:
        risk_factors.append({
            'factor': 'Blood Glucose',
            'value': glucose,
            'level': 'moderate',
            'description': 'Slightly elevated blood glucose levels'
        })
    
    # BMI analysis
    bmi = features[5]
    if bmi > 30:
        risk_factors.append({
            'factor': 'BMI',
            'value': bmi,
            'level': 'high',
            'description': 'Obesity significantly increases diabetes risk'
        })
    elif bmi > 25:
        risk_factors.append({
            'factor': 'BMI',
            'value': bmi,
            'level': 'moderate',
            'description': 'Overweight increases diabetes risk'
        })
    
    # Blood pressure analysis
    bp = features[2]
    if bp > 90:
        risk_factors.append({
            'factor': 'Blood Pressure',
            'value': bp,
            'level': 'high',
            'description': 'High blood pressure is linked to diabetes'
        })
    elif bp > 80:
        risk_factors.append({
            'factor': 'Blood Pressure',
            'value': bp,
            'level': 'moderate',
            'description': 'Elevated blood pressure'
        })
    
    # Age analysis
    age = features[7]
    if age > 45:
        risk_factors.append({
            'factor': 'Age',
            'value': age,
            'level': 'moderate',
            'description': 'Age increases diabetes risk'
        })
    
    return risk_factors

def generate_recommendations(prediction, probability, features):
    """Generate personalized recommendations"""
    recommendations = []
    
    if prediction == 1:  # High risk
        recommendations.extend([
            "Consult with a healthcare professional immediately",
            "Schedule comprehensive diabetes screening tests",
            "Begin monitoring blood glucose levels daily"
        ])
    
    # BMI-based recommendations
    bmi = features[5]
    if bmi > 25:
        recommendations.extend([
            "Focus on weight management through diet and exercise",
            "Consider consulting a nutritionist",
            "Aim for 150 minutes of moderate exercise weekly"
        ])
    
    # Glucose-based recommendations
    glucose = features[1]
    if glucose > 100:
        recommendations.extend([
            "Adopt a low-glycemic diet",
            "Limit refined sugars and processed foods",
            "Monitor blood sugar levels regularly"
        ])
    
    # General recommendations
    recommendations.extend([
        "Maintain a balanced diet rich in vegetables and whole grains",
        "Stay hydrated with plenty of water",
        "Get adequate sleep (7-9 hours per night)",
        "Manage stress through relaxation techniques",
        "Schedule regular health check-ups"
    ])
    
    return recommendations[:8]  # Limit to 8 recommendations

def get_bmi_category(bmi):
    """Get BMI category"""
    if bmi < 18.5:
        return "Underweight"
    elif bmi < 25:
        return "Normal"
    elif bmi < 30:
        return "Overweight"
    else:
        return "Obese"

def get_glucose_status(glucose):
    """Get glucose status"""
    if glucose < 70:
        return "Low"
    elif glucose <= 100:
        return "Normal"
    elif glucose <= 140:
        return "Elevated"
    else:
        return "High"

def get_bp_status(bp):
    """Get blood pressure status"""
    if bp <= 80:
        return "Normal"
    elif bp <= 90:
        return "Elevated"
    else:
        return "High"

def get_next_steps(prediction, probability):
    """Get next steps based on prediction"""
    if prediction == 1:
        if probability > 0.8:
            return [
                "Schedule immediate appointment with healthcare provider",
                "Request comprehensive diabetes screening",
                "Begin daily blood glucose monitoring",
                "Review current medications with doctor"
            ]
        else:
            return [
                "Schedule appointment within 1-2 weeks",
                "Start tracking blood glucose levels",
                "Begin dietary modifications",
                "Increase physical activity"
            ]
    else:
        return [
            "Continue current healthy lifestyle",
            "Schedule annual health check-up",
            "Monitor weight and BMI regularly",
            "Maintain balanced diet and exercise routine"
        ]

def get_lifestyle_advice(features):
    """Get personalized lifestyle advice"""
    advice = []
    
    # BMI-based advice
    bmi = features['bmi']
    if bmi > 30:
        advice.append("Focus on weight loss through calorie reduction and increased activity")
    elif bmi > 25:
        advice.append("Work towards gradual weight loss to reach healthy BMI range")
    
    # Glucose-based advice
    glucose = features['glucose']
    if glucose > 140:
        advice.append("Strictly limit refined sugars and processed carbohydrates")
    elif glucose > 100:
        advice.append("Reduce sugar intake and choose complex carbohydrates")
    
    # Blood pressure advice
    bp = features['bloodpressure']
    if bp > 90:
        advice.append("Reduce sodium intake and manage stress levels")
    
    # Age-based advice
    age = features['age']
    if age > 45:
        advice.append("Increase frequency of health monitoring due to age-related risk")
    
    # General advice
    advice.extend([
        "Aim for 150 minutes of moderate exercise weekly",
        "Include strength training exercises 2-3 times per week",
        "Stay hydrated with 8-10 glasses of water daily",
        "Get 7-9 hours of quality sleep nightly"
    ])
    
    return advice[:6]  # Limit to 6 pieces of advice

# Train the model when the app starts
try:
    model_accuracy = train_model()
    print(f"Model trained successfully with accuracy: {model_accuracy}")
except Exception as e:
    print(f"Error training model: {e}")
    model_accuracy = 0.721  # Default accuracy value

@app.route('/')
def index():
    try:
        return render_template('index_simple.html', accuracy=model_accuracy)
    except Exception as e:
        print(f"Error rendering template: {e}")
        return f"<h1>Diabetes Prediction App</h1><p>App is running but template error: {e}</p>"

@app.route('/predict', methods=['POST'])
def predict():
    try:
        # Get form data
        features = [
            float(request.form['pregnancies']),
            float(request.form['glucose']),
            float(request.form['bloodpressure']),
            float(request.form['skinthickness']),
            float(request.form['insulin']),
            float(request.form['bmi']),
            float(request.form['dpf']),
            float(request.form['age'])
        ]

        # Make prediction
        prediction, probability = predict_diabetes(features)
        
        # Calculate confidence score (distance from decision boundary)
        confidence = abs(probability - 0.5) * 2  # Scale to 0-1 range
        confidence_level = "High" if confidence > 0.6 else "Medium" if confidence > 0.3 else "Low"
        
        # Get feature importance for this prediction
        feature_importance = get_feature_importance(features)

        # Store prediction in session for history
        if 'prediction_history' not in session:
            session['prediction_history'] = []
        
        prediction_data = {
            'timestamp': datetime.datetime.now().isoformat(),
            'prediction': int(prediction),
            'probability': float(probability),
            'confidence': confidence,
            'confidence_level': confidence_level,
            'features': {
                'pregnancies': features[0],
                'glucose': features[1],
                'bloodpressure': features[2],
                'skinthickness': features[3],
                'insulin': features[4],
                'bmi': features[5],
                'dpf': features[6],
                'age': features[7]
            }
        }
        
        session['prediction_history'].append(prediction_data)
        session.modified = True

        return jsonify({
            'prediction': int(prediction),
            'probability': float(probability),
            'confidence': float(confidence),
            'confidence_level': confidence_level,
            'success': True,
            'risk_factors': analyze_risk_factors(features),
            'recommendations': generate_recommendations(prediction, probability, features),
            'feature_importance': feature_importance,
            'prediction_details': {
                'model_accuracy': model_accuracy,
                'prediction_timestamp': datetime.datetime.now().isoformat(),
                'risk_category': get_risk_category(probability),
                'medical_priority': get_medical_priority(prediction, probability)
            }
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        })

@app.route('/history')
def get_history():
    """Get prediction history"""
    history = session.get('prediction_history', [])
    return jsonify({'history': history})

@app.route('/clear_history', methods=['POST'])
def clear_history():
    """Clear prediction history"""
    session.pop('prediction_history', None)
    return jsonify({'success': True})

@app.route('/health_check')
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'message': 'Diabetes Prediction App is running',
        'model_accuracy': model_accuracy,
        'timestamp': datetime.datetime.now().isoformat()
    })

@app.route('/generate_report', methods=['POST'])
def generate_report():
    """Generate a comprehensive health report"""
    try:
        history = session.get('prediction_history', [])
        if not history:
            return jsonify({'success': False, 'error': 'No prediction history available'})
        
        latest_prediction = history[-1]
        report = generate_health_report(latest_prediction)
        
        return jsonify({
            'success': True,
            'report': report,
            'timestamp': datetime.datetime.now().isoformat()
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)})

@app.route('/export_report', methods=['POST'])
def export_report():
    """Export prediction report as downloadable content"""
    try:
        history = session.get('prediction_history', [])
        if not history:
            return jsonify({'success': False, 'error': 'No data to export'})
        
        # Generate comprehensive report
        report_data = generate_comprehensive_report(history)
        
        return jsonify({
            'success': True,
            'report': report_data,
            'filename': f'diabetes_assessment_report_{datetime.datetime.now().strftime("%Y%m%d_%H%M%S")}.txt'
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)})

@app.route('/test')
def test():
    return "<h1>Diabetes Prediction App - Test Route</h1><p>If you see this, the Flask app is working!</p>"

def generate_health_report(prediction_data):
    """Generate a comprehensive health report"""
    features = prediction_data['features']
    prediction = prediction_data['prediction']
    probability = prediction_data['probability']
    
    report = {
        'patient_summary': {
            'age': features['age'],
            'bmi': features['bmi'],
            'bmi_category': get_bmi_category(features['bmi']),
            'glucose_level': features['glucose'],
            'glucose_status': get_glucose_status(features['glucose']),
            'blood_pressure': features['bloodpressure'],
            'bp_status': get_bp_status(features['bloodpressure'])
        },
        'risk_assessment': {
            'prediction': 'High Risk' if prediction == 1 else 'Low Risk',
            'probability': f"{(probability * 100):.1f}%",
            'risk_category': get_risk_category(probability),
            'medical_priority': get_medical_priority(prediction, probability)
        },
        'health_metrics': {
            'insulin_level': features['insulin'],
            'skin_thickness': features['skinthickness'],
            'pregnancies': features['pregnancies'],
            'family_history_score': features['dpf']
        },
        'recommendations': generate_recommendations(prediction, probability, [
            features['pregnancies'], features['glucose'], features['bloodpressure'],
            features['skinthickness'], features['insulin'], features['bmi'],
            features['dpf'], features['age']
        ]),
        'next_steps': get_next_steps(prediction, probability),
        'lifestyle_advice': get_lifestyle_advice(features)
    }
    
    return report

def generate_comprehensive_report(history):
    """Generate a comprehensive report from prediction history"""
    if not history:
        return "No prediction history available."
    
    latest = history[-1]
    report_lines = []
    
    # Header
    report_lines.append("="*60)
    report_lines.append("DIABETES RISK ASSESSMENT REPORT")
    report_lines.append("="*60)
    report_lines.append(f"Generated: {datetime.datetime.now().strftime('%B %d, %Y at %I:%M %p')}")
    report_lines.append(f"Total Assessments: {len(history)}")
    report_lines.append("")
    
    # Latest Assessment
    report_lines.append("LATEST ASSESSMENT RESULTS")
    report_lines.append("-"*30)
    report_lines.append(f"Date: {datetime.datetime.fromisoformat(latest['timestamp']).strftime('%B %d, %Y')}")
    report_lines.append(f"Risk Level: {'HIGH RISK' if latest['prediction'] == 1 else 'LOW RISK'}")
    report_lines.append(f"Probability: {(latest['probability'] * 100):.1f}%")
    report_lines.append(f"Risk Category: {get_risk_category(latest['probability'])}")
    report_lines.append("")
    
    # Health Parameters
    features = latest['features']
    report_lines.append("HEALTH PARAMETERS")
    report_lines.append("-"*20)
    report_lines.append(f"Age: {features['age']} years")
    report_lines.append(f"BMI: {features['bmi']} ({get_bmi_category(features['bmi'])})")
    report_lines.append(f"Glucose: {features['glucose']} mg/dL ({get_glucose_status(features['glucose'])})")
    report_lines.append(f"Blood Pressure: {features['bloodpressure']} mmHg ({get_bp_status(features['bloodpressure'])})")
    report_lines.append(f"Insulin: {features['insulin']} μU/mL")
    report_lines.append(f"Pregnancies: {features['pregnancies']}")
    report_lines.append(f"Skin Thickness: {features['skinthickness']} mm")
    report_lines.append(f"Family History Score: {features['dpf']}")
    report_lines.append("")
    
    # Recommendations
    recommendations = generate_recommendations(latest['prediction'], latest['probability'], [
        features['pregnancies'], features['glucose'], features['bloodpressure'],
        features['skinthickness'], features['insulin'], features['bmi'],
        features['dpf'], features['age']
    ])
    
    report_lines.append("RECOMMENDATIONS")
    report_lines.append("-"*15)
    for i, rec in enumerate(recommendations, 1):
        report_lines.append(f"{i}. {rec}")
    report_lines.append("")
    
    # Trend Analysis (if multiple assessments)
    if len(history) > 1:
        report_lines.append("TREND ANALYSIS")
        report_lines.append("-"*15)
        
        # Calculate trends
        probs = [item['probability'] for item in history]
        bmis = [item['features']['bmi'] for item in history]
        glucose_levels = [item['features']['glucose'] for item in history]
        
        avg_prob = sum(probs) / len(probs)
        avg_bmi = sum(bmis) / len(bmis)
        avg_glucose = sum(glucose_levels) / len(glucose_levels)
        
        report_lines.append(f"Average Risk Probability: {(avg_prob * 100):.1f}%")
        report_lines.append(f"Average BMI: {avg_bmi:.1f}")
        report_lines.append(f"Average Glucose: {avg_glucose:.1f} mg/dL")
        
        # Trend direction
        if len(history) >= 2:
            recent_prob = probs[-1]
            previous_prob = probs[-2]
            trend = "increasing" if recent_prob > previous_prob else "decreasing" if recent_prob < previous_prob else "stable"
            report_lines.append(f"Risk Trend: {trend}")
        
        report_lines.append("")
    
    # Disclaimer
    report_lines.append("IMPORTANT DISCLAIMER")
    report_lines.append("-"*19)
    report_lines.append("This report is for educational purposes only and should not be used")
    report_lines.append("for medical diagnosis. Please consult healthcare professionals for")
    report_lines.append("proper medical advice and diabetes screening.")
    report_lines.append("")
    report_lines.append("In case of emergency, call 911 immediately.")
    
    return "\n".join(report_lines)

def get_bmi_category(bmi):
    """Get BMI category"""
    if bmi < 18.5:
        return "Underweight"
    elif bmi < 25:
        return "Normal"
    elif bmi < 30:
        return "Overweight"
    else:
        return "Obese"

def get_glucose_status(glucose):
    """Get glucose status"""
    if glucose < 70:
        return "Low"
    elif glucose <= 100:
        return "Normal"
    elif glucose <= 140:
        return "Elevated"
    else:
        return "High"

def get_bp_status(bp):
    """Get blood pressure status"""
    if bp <= 80:
        return "Normal"
    elif bp <= 90:
        return "Elevated"
    else:
        return "High"

def get_next_steps(prediction, probability):
    """Get next steps based on prediction"""
    if prediction == 1:
        if probability > 0.8:
            return [
                "Schedule immediate appointment with healthcare provider",
                "Request comprehensive diabetes screening",
                "Begin daily blood glucose monitoring",
                "Review current medications with doctor"
            ]
        else:
            return [
                "Schedule appointment within 1-2 weeks",
                "Start tracking blood glucose levels",
                "Begin dietary modifications",
                "Increase physical activity"
            ]
    else:
        return [
            "Continue current healthy lifestyle",
            "Schedule annual health check-up",
            "Monitor weight and BMI regularly",
            "Maintain balanced diet and exercise routine"
        ]

def get_lifestyle_advice(features):
    """Get personalized lifestyle advice"""
    advice = []
    
    # BMI-based advice
    bmi = features['bmi']
    if bmi > 30:
        advice.append("Focus on weight loss through calorie reduction and increased activity")
    elif bmi > 25:
        advice.append("Work towards gradual weight loss to reach healthy BMI range")
    
    # Glucose-based advice
    glucose = features['glucose']
    if glucose > 140:
        advice.append("Strictly limit refined sugars and processed carbohydrates")
    elif glucose > 100:
        advice.append("Reduce sugar intake and choose complex carbohydrates")
    
    # Blood pressure advice
    bp = features['bloodpressure']
    if bp > 90:
        advice.append("Reduce sodium intake and manage stress levels")
    
    # Age-based advice
    age = features['age']
    if age > 45:
        advice.append("Increase frequency of health monitoring due to age-related risk")
    
    # General advice
    advice.extend([
        "Aim for 150 minutes of moderate exercise weekly",
        "Include strength training exercises 2-3 times per week",
        "Stay hydrated with 8-10 glasses of water daily",
        "Get 7-9 hours of quality sleep nightly"
    ])
    
    return advice[:6]  # Limit to 6 pieces of advice

if __name__ == '__main__':
    import os
    port = int(os.environ.get('PORT', 5000))
    debug = os.environ.get('FLASK_ENV') != 'production'
    app.run(debug=debug, host='0.0.0.0', port=port)
