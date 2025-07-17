# 🩺 Diabetes Prediction Web App

An advanced AI-powered web application for diabetes risk assessment using machine learning. Built with Flask, scikit-learn, and modern web technologies.

![Python](https://img.shields.io/badge/python-v3.8+-blue.svg)
![Flask](https://img.shields.io/badge/flask-v2.0+-green.svg)
![scikit-learn](https://img.shields.io/badge/scikit--learn-v1.0+-orange.svg)
![License](https://img.shields.io/badge/license-MIT-blue.svg)

## 🌟 Features

### 🎯 Core Functionality
- **AI-Powered Prediction**: Random Forest model with 72% accuracy
- **8 Health Parameters**: Comprehensive health assessment
- **Real-time Validation**: Instant feedback on health indicators
- **Multi-step Form**: User-friendly progressive form interface

### 📊 Advanced Analytics
- **Feature Importance**: Understand which factors matter most
- **Risk Factor Analysis**: Detailed breakdown of health risks
- **Confidence Scoring**: Multiple confidence calculation methods
- **Medical Priority**: Actionable priority recommendations

### 🎨 Modern UI/UX
- **Responsive Design**: Works on all devices
- **Dark Mode**: Toggle between light and dark themes
- **Progress Indicators**: Visual feedback during assessment
- **Health Indicators**: Real-time parameter validation

### 📈 Professional Features
- **Prediction History**: Track assessments over time
- **Professional Reports**: Generate medical-grade reports
- **Export Functionality**: Print and save results
- **Result Sharing**: Share results with healthcare providers

## 🚀 Quick Start

### Prerequisites
- Python 3.8 or higher
- pip package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/diabetes-prediction-webapp.git
   cd diabetes-prediction-webapp
   ```

2. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

3. **Run the application**
   ```bash
   python app_simple.py
   ```

4. **Access the app**
   Open your browser and go to `http://127.0.0.1:5000`

## 🏗️ Project Structure

```
diabetes_prediction/
├── app_simple.py              # Main Flask application
├── model.py                   # ML model training and prediction
├── diabetes_model.pkl         # Trained Random Forest model
├── scaler.pkl                # Feature scaler
├── diabetes.csv              # Training dataset
├── requirements.txt          # Python dependencies
├── templates/
│   └── index_simple.html     # Main UI template
├── static/
│   ├── css/
│   │   └── style_simple.css  # Styling
│   └── js/
│       └── script_simple.js  # Frontend logic
├── tests/
│   ├── test_api.py           # API testing
│   ├── test_enhanced_app.py  # Comprehensive tests
│   └── test_form.py          # Form functionality tests
└── docs/
    ├── README.md             # This file
    ├── README_ENHANCED.md    # Detailed documentation
    └── IMPLEMENTATION_COMPARISON.md  # Feature comparison
```

## 🔧 API Endpoints

### Main Endpoints

#### `POST /predict`
Predict diabetes risk based on health parameters.

**Request Body:**
```json
{
  "pregnancies": 1,
  "glucose": 85,
  "bloodpressure": 66,
  "skinthickness": 29,
  "insulin": 0,
  "bmi": 26.6,
  "dpf": 0.351,
  "age": 31
}
```

**Response:**
```json
{
  "prediction": 0,
  "probability": 0.020,
  "confidence": 0.960,
  "risk_factors": [...],
  "recommendations": [...],
  "feature_importance": [...],
  "prediction_details": {
    "risk_category": "Very Low Risk",
    "medical_priority": "ROUTINE - Continue healthy lifestyle"
  }
}
```

#### `GET /history`
Retrieve prediction history for the current session.

#### `GET /report/<int:prediction_id>`
Generate a professional report for a specific prediction.

## 🧪 Testing

Run the comprehensive test suite:

```bash
# Test API functionality
python test_api.py

# Test enhanced features
python test_enhanced_app.py

# Test form functionality
python test_form.py
```

## 📊 Model Information

- **Algorithm**: Random Forest Classifier
- **Training Dataset**: Pima Indians Diabetes Database (768 samples)
- **Features**: 8 health parameters
- **Performance**: 
  - Accuracy: 72.1%
  - Precision: 60.7%
  - Recall: 61.8%
  - F1-Score: 61.3%

### Health Parameters
1. **Pregnancies**: Number of times pregnant
2. **Glucose**: Plasma glucose concentration
3. **Blood Pressure**: Diastolic blood pressure (mm Hg)
4. **Skin Thickness**: Triceps skin fold thickness (mm)
5. **Insulin**: 2-Hour serum insulin (mu U/ml)
6. **BMI**: Body mass index (weight in kg/(height in m)^2)
7. **Diabetes Pedigree Function**: Family history score
8. **Age**: Age in years

## 🌐 Deployment

### Local Development
```bash
python app_simple.py
```

### Production Deployment
The application is ready for deployment on platforms like:
- **Heroku**: Use the included `Procfile`
- **Render**: Flask application deployment
- **AWS/Google Cloud**: Container deployment
- **Railway**: Simple deployment

### Environment Variables
```bash
FLASK_ENV=production
SECRET_KEY=your-secret-key-here
```

## 🔒 Security Features

- **Input Validation**: Comprehensive server-side validation
- **CSRF Protection**: Flask-WTF integration
- **CORS Support**: Cross-origin resource sharing
- **Session Management**: Secure session handling
- **Error Handling**: Graceful error management

## 🎯 Use Cases

### For Healthcare Professionals
- **Pre-screening Tool**: Quick diabetes risk assessment
- **Patient Education**: Visual risk factor explanation
- **Documentation**: Professional report generation

### For Individuals
- **Self-Assessment**: Personal health monitoring
- **Health Awareness**: Understanding risk factors
- **Lifestyle Guidance**: Personalized recommendations

### For Researchers
- **Model Validation**: Testing prediction algorithms
- **Data Analysis**: Feature importance insights
- **UI/UX Research**: Healthcare interface design

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📋 TODO

- [ ] Add user authentication
- [ ] Implement database storage
- [ ] Add more ML models for comparison
- [ ] Mobile app version
- [ ] API documentation with Swagger
- [ ] Internationalization (i18n)
- [ ] Advanced analytics dashboard

## 🐛 Known Issues

- Session-based history (not persistent)
- Limited to single-user sessions
- Model requires periodic retraining

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Dataset**: Pima Indians Diabetes Database
- **ML Library**: scikit-learn
- **Web Framework**: Flask
- **UI Icons**: Font Awesome
- **Fonts**: Google Fonts (Inter)

## 📞 Support

For support, please open an issue in the GitHub repository or contact the development team.

---

**⚠️ Medical Disclaimer**: This application is for educational and screening purposes only. It should not be used as a substitute for professional medical advice, diagnosis, or treatment. Always consult with a qualified healthcare provider for medical concerns.
