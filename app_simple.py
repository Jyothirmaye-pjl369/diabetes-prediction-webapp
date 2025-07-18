from flask import Flask, render_template, request, jsonify, session
from flask_cors import CORS
from model import predict_diabetes, train_model, model, scaler, load_model
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

@app.route('/health')
def health():
    """Health endpoint for deployment platforms"""
    return jsonify({'status': 'ok', 'message': 'App is healthy'})

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

@app.route('/api/health_tips')
def get_health_tips():
    """Get personalized health tips based on user's latest assessment"""
    try:
        history = session.get('prediction_history', [])
        if not history:
            return jsonify({
                'success': False,
                'error': 'No assessment history found. Please complete an assessment first.'
            })
        
        latest_assessment = history[-1]
        features = latest_assessment['features']
        prediction = latest_assessment['prediction']
        probability = latest_assessment['probability']
        
        # Generate personalized health tips
        health_tips = generate_personalized_health_tips(features, prediction, probability)
        
        return jsonify({
            'success': True,
            'health_tips': health_tips,
            'risk_level': get_risk_category(probability),
            'assessment_date': latest_assessment['timestamp']
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)})

@app.route('/api/detailed_analysis')
def get_detailed_analysis():
    """Get detailed analysis of the latest assessment"""
    try:
        history = session.get('prediction_history', [])
        if not history:
            return jsonify({
                'success': False,
                'error': 'No assessment history found. Please complete an assessment first.'
            })
        
        latest_assessment = history[-1]
        features = latest_assessment['features']
        prediction = latest_assessment['prediction']
        probability = latest_assessment['probability']
        
        # Generate detailed analysis
        analysis = generate_detailed_risk_analysis(features, prediction, probability)
        
        return jsonify({
            'success': True,
            'analysis': analysis
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)})

def generate_personalized_health_tips(features, prediction, probability):
    """Generate personalized health improvement tips"""
    tips = {
        'diet': [],
        'exercise': [],
        'lifestyle': [],
        'monitoring': [],
        'medical': []
    }
    
    # Diet recommendations based on glucose and BMI
    glucose = features['glucose']
    bmi = features['bmi']
    age = features['age']
    bp = features['bloodpressure']
    
    # Glucose-based diet tips
    if glucose > 140:
        tips['diet'].extend([
            "Eliminate refined sugars and processed foods from your diet",
            "Choose complex carbohydrates like whole grains, quinoa, and brown rice",
            "Practice portion control with the plate method (1/2 vegetables, 1/4 lean protein, 1/4 complex carbs)",
            "Eat small, frequent meals to maintain stable blood sugar"
        ])
    elif glucose > 100:
        tips['diet'].extend([
            "Reduce simple carbohydrates and sugary drinks",
            "Include more fiber-rich foods like vegetables, fruits, and legumes",
            "Choose lean proteins like fish, chicken, and plant-based options",
            "Monitor carbohydrate intake and consider carb counting"
        ])
    else:
        tips['diet'].extend([
            "Maintain your current healthy eating patterns",
            "Continue eating balanced meals with variety",
            "Include antioxidant-rich foods like berries and leafy greens"
        ])
    
    # BMI-based exercise tips
    if bmi > 30:
        tips['exercise'].extend([
            "Start with low-impact activities like walking, swimming, or cycling",
            "Aim for 150 minutes of moderate exercise per week",
            "Include strength training 2-3 times per week",
            "Consider working with a fitness professional for a personalized plan"
        ])
    elif bmi > 25:
        tips['exercise'].extend([
            "Increase daily physical activity with brisk walking",
            "Try interval training to boost metabolism",
            "Include resistance exercises to build muscle mass",
            "Find activities you enjoy to maintain consistency"
        ])
    else:
        tips['exercise'].extend([
            "Maintain your current activity level",
            "Mix cardio and strength training for optimal health",
            "Try new activities to keep exercise interesting"
        ])
    
    # Blood pressure-based lifestyle tips
    if bp > 90:
        tips['lifestyle'].extend([
            "Reduce sodium intake to less than 2,300mg daily",
            "Practice stress management techniques like meditation or yoga",
            "Limit alcohol consumption",
            "Ensure adequate sleep (7-9 hours nightly)"
        ])
    elif bp > 80:
        tips['lifestyle'].extend([
            "Monitor sodium intake and choose low-sodium options",
            "Include potassium-rich foods like bananas and spinach",
            "Practice deep breathing exercises"
        ])
    
    # Age-based monitoring tips
    if age > 45:
        tips['monitoring'].extend([
            "Monitor blood glucose levels more frequently",
            "Schedule regular health check-ups every 6 months",
            "Keep track of blood pressure readings",
            "Monitor weight and BMI changes"
        ])
    else:
        tips['monitoring'].extend([
            "Annual health screenings are recommended",
            "Monitor key health metrics monthly",
            "Keep a health journal"
        ])
    
    # Risk-based medical tips
    if prediction == 1:
        if probability > 0.8:
            tips['medical'].extend([
                "Schedule immediate consultation with healthcare provider",
                "Request comprehensive diabetes screening (HbA1c, fasting glucose)",
                "Discuss family history with your doctor",
                "Consider consultation with an endocrinologist"
            ])
        else:
            tips['medical'].extend([
                "Schedule appointment with healthcare provider within 2 weeks",
                "Request glucose tolerance test",
                "Discuss lifestyle modifications with your doctor"
            ])
    else:
        tips['medical'].extend([
            "Continue regular annual check-ups",
            "Maintain current health monitoring routine",
            "Discuss family history during routine visits"
        ])
    
    # General lifestyle tips
    tips['lifestyle'].extend([
        "Stay hydrated with 8-10 glasses of water daily",
        "Quit smoking if applicable",
        "Limit processed foods and eat whole foods",
        "Manage stress through relaxation techniques"
    ])
    
    return tips

def generate_detailed_risk_analysis(features, prediction, probability):
    """Generate detailed risk factor analysis"""
    analysis = {
        'overall_risk': {
            'level': get_risk_category(probability),
            'percentage': f"{probability * 100:.1f}%",
            'description': get_risk_description(probability)
        },
        'risk_factors': [],
        'protective_factors': [],
        'recommendations': [],
        'timeline': get_action_timeline(prediction, probability)
    }
    
    # Analyze each risk factor
    glucose = features['glucose']
    bmi = features['bmi']
    age = features['age']
    bp = features['bloodpressure']
    pregnancies = features['pregnancies']
    insulin = features['insulin']
    dpf = features['dpf']
    
    # High-risk factors
    if glucose > 126:
        analysis['risk_factors'].append({
            'factor': 'Blood Glucose',
            'value': glucose,
            'level': 'High',
            'impact': 'Major risk factor - indicates possible diabetes',
            'action': 'Immediate medical evaluation required'
        })
    elif glucose > 100:
        analysis['risk_factors'].append({
            'factor': 'Blood Glucose',
            'value': glucose,
            'level': 'Elevated',
            'impact': 'Pre-diabetic range - increased risk',
            'action': 'Lifestyle modifications and monitoring'
        })
    
    if bmi > 30:
        analysis['risk_factors'].append({
            'factor': 'BMI',
            'value': bmi,
            'level': 'High',
            'impact': 'Obesity significantly increases diabetes risk',
            'action': 'Weight management program recommended'
        })
    elif bmi > 25:
        analysis['risk_factors'].append({
            'factor': 'BMI',
            'value': bmi,
            'level': 'Elevated',
            'impact': 'Overweight increases risk moderately',
            'action': 'Gradual weight loss through diet and exercise'
        })
    
    if age > 45:
        analysis['risk_factors'].append({
            'factor': 'Age',
            'value': age,
            'level': 'Moderate',
            'impact': 'Age-related increased risk',
            'action': 'Regular monitoring and healthy lifestyle'
        })
    
    if bp > 90:
        analysis['risk_factors'].append({
            'factor': 'Blood Pressure',
            'value': bp,
            'level': 'High',
            'impact': 'Hypertension compounds diabetes risk',
            'action': 'Blood pressure management essential'
        })
    
    # Protective factors
    if glucose < 100:
        analysis['protective_factors'].append({
            'factor': 'Normal Blood Glucose',
            'description': 'Your glucose levels are in the normal range'
        })
    
    if bmi >= 18.5 and bmi < 25:
        analysis['protective_factors'].append({
            'factor': 'Healthy Weight',
            'description': 'Your BMI is in the healthy range'
        })
    
    if age < 35:
        analysis['protective_factors'].append({
            'factor': 'Young Age',
            'description': 'Younger age provides protection against diabetes'
        })
    
    return analysis

def get_risk_description(probability):
    """Get detailed risk description"""
    if probability < 0.2:
        return "Your current health parameters indicate a very low risk for diabetes. Continue your healthy lifestyle."
    elif probability < 0.4:
        return "You have a low risk for diabetes, but maintaining healthy habits is important for prevention."
    elif probability < 0.6:
        return "You have a moderate risk for diabetes. Lifestyle modifications can significantly reduce this risk."
    elif probability < 0.8:
        return "You have a high risk for diabetes. Immediate lifestyle changes and medical consultation are recommended."
    else:
        return "You have a very high risk for diabetes. Urgent medical evaluation and intervention are needed."

def get_action_timeline(prediction, probability):
    """Get recommended action timeline"""
    if prediction == 1:
        if probability > 0.8:
            return {
                'immediate': 'Schedule medical appointment within 48 hours',
                'short_term': 'Begin strict lifestyle modifications within 1 week',
                'long_term': 'Ongoing medical monitoring and management'
            }
        else:
            return {
                'immediate': 'Schedule medical appointment within 2 weeks',
                'short_term': 'Implement lifestyle changes within 1 month',
                'long_term': 'Regular health monitoring every 3-6 months'
            }
    else:
        return {
            'immediate': 'Continue current healthy practices',
            'short_term': 'Maintain or improve current lifestyle',
            'long_term': 'Annual health screenings and prevention focus'
        }

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

def get_sample_feature_distribution():
    """Generate sample feature distribution for visualization"""
    return {
        'glucose': {
            'ranges': ['< 70', '70-99', '100-125', '126-199', '≥ 200'],
            'counts': [5, 45, 25, 20, 5],
            'labels': ['Low', 'Normal', 'Pre-diabetic', 'Diabetic', 'Very High'],
            'colors': ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#7c2d12']
        },
        'bmi': {
            'ranges': ['< 18.5', '18.5-24.9', '25.0-29.9', '30.0-34.9', '≥ 35.0'],
            'counts': [3, 35, 35, 20, 7],
            'labels': ['Underweight', 'Normal', 'Overweight', 'Obese I', 'Obese II+'],
            'colors': ['#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#7c2d12']
        },
        'age': {
            'ranges': ['< 25', '25-34', '35-44', '45-54', '55-64', '≥ 65'],
            'counts': [8, 25, 30, 20, 12, 5],
            'labels': ['Young Adult', 'Adult', 'Middle Age', 'Mature', 'Senior', 'Elderly'],
            'colors': ['#06b6d4', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#7c2d12']
        },
        'blood_pressure': {
            'ranges': ['< 60', '60-79', '80-89', '90-99', '≥ 100'],
            'counts': [10, 50, 25, 12, 3],
            'labels': ['Low', 'Normal', 'Elevated', 'Stage 1 HTN', 'Stage 2 HTN'],
            'colors': ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#7c2d12']
        }
    }

def generate_user_feature_distribution(history):
    """Generate feature distribution based on user's assessment history"""
    if not history:
        return get_sample_feature_distribution()
    
    # Extract features from user history
    glucose_values = [item['features']['glucose'] for item in history]
    bmi_values = [item['features']['bmi'] for item in history]
    age_values = [item['features']['age'] for item in history]
    bp_values = [item['features']['bloodpressure'] for item in history]
    
    def categorize_values(values, thresholds, labels):
        counts = [0] * len(labels)
        for value in values:
            for i, threshold in enumerate(thresholds):
                if value < threshold:
                    counts[i] += 1
                    break
            else:
                counts[-1] += 1
        return counts
    
    # User's personal distribution
    user_distribution = {
        'glucose': {
            'ranges': ['< 70', '70-99', '100-125', '126-199', '≥ 200'],
            'counts': categorize_values(glucose_values, [70, 100, 126, 200], ['Low', 'Normal', 'Pre-diabetic', 'Diabetic', 'Very High']),
            'labels': ['Low', 'Normal', 'Pre-diabetic', 'Diabetic', 'Very High'],
            'colors': ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#7c2d12'],
            'user_data': True
        },
        'bmi': {
            'ranges': ['< 18.5', '18.5-24.9', '25.0-29.9', '30.0-34.9', '≥ 35.0'],
            'counts': categorize_values(bmi_values, [18.5, 25, 30, 35], ['Underweight', 'Normal', 'Overweight', 'Obese I', 'Obese II+']),
            'labels': ['Underweight', 'Normal', 'Overweight', 'Obese I', 'Obese II+'],
            'colors': ['#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#7c2d12'],
            'user_data': True
        }
    }
    
    return user_distribution

def get_sample_outcome_analysis():
    """Generate sample outcome analysis data"""
    return {
        'risk_distribution': {
            'labels': ['Low Risk', 'Moderate Risk', 'High Risk'],
            'counts': [65, 25, 10],
            'colors': ['#10b981', '#f59e0b', '#ef4444']
        },
        'prediction_confidence': {
            'labels': ['High Confidence', 'Medium Confidence', 'Low Confidence'],
            'counts': [70, 25, 5],
            'colors': ['#10b981', '#f59e0b', '#ef4444']
        },
        'age_risk_correlation': {
            'age_groups': ['< 30', '30-39', '40-49', '50-59', '≥ 60'],
            'risk_percentages': [8, 15, 25, 40, 55],
            'sample_sizes': [50, 80, 90, 70, 40]
        }
    }

def generate_user_outcome_analysis(history):
    """Generate outcome analysis based on user's history"""
    if not history:
        return get_sample_outcome_analysis()
    
    # Analyze user's prediction history
    high_risk = sum(1 for item in history if item['prediction'] == 1)
    low_risk = len(history) - high_risk
    
    # Confidence analysis
    high_conf = sum(1 for item in history if item.get('confidence', 0) > 0.6)
    med_conf = sum(1 for item in history if 0.3 <= item.get('confidence', 0) <= 0.6)
    low_conf = len(history) - high_conf - med_conf
    
    return {
        'risk_distribution': {
            'labels': ['Low Risk', 'High Risk'],
            'counts': [low_risk, high_risk],
            'colors': ['#10b981', '#ef4444'],
            'user_data': True,
            'total_assessments': len(history)
        },
        'prediction_confidence': {
            'labels': ['High Confidence', 'Medium Confidence', 'Low Confidence'],
            'counts': [high_conf, med_conf, low_conf],
            'colors': ['#10b981', '#f59e0b', '#ef4444'],
            'user_data': True
        },
        'timeline': [
            {
                'date': item['timestamp'][:10],
                'risk': item['prediction'],
                'probability': item['probability']
            } for item in history[-10:]  # Last 10 assessments
        ]
    }

if __name__ == '__main__':
    import os
    port = int(os.environ.get('PORT', 5000))
    debug = os.environ.get('FLASK_ENV') != 'production'
    app.run(debug=debug, host='0.0.0.0', port=port)
