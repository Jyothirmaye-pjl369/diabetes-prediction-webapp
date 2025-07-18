# 🩺 Diabetes Prediction Web App

An advanced AI-powered web application for diabetes risk assessment using medical rule-based predictions. Built with Flask and modern web technologies - **no dataset dependency required!**

![Python](https://img.shields.io/badge/python-v3.8+-blue.svg)
![Flask](https://img.shields.io/badge/flask-v2.0+-green.svg)
![Chart.js](https://img.shields.io/badge/Chart.js-v3.0+-ff6384.svg)
![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Deployment](https://img.shields.io/badge/deployment-ready-brightgreen.svg)

> **🚀 Repository**: [GitHub](https://github.com/Jyothirmaye-pjl369/diabetes-prediction-webapp) | **📖 Deployment Guide**: [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)

## 🌟 Features

### 🎯 Core Functionality
- **Medical Rule-Based Predictions**: Based on established medical guidelines (no dataset required)
- **User Input Only**: All predictions based purely on user-provided health data
- **8 Health Parameters**: Comprehensive health assessment
- **Real-time Health Tips**: Personalized recommendations based on input
- **Multi-step Form**: User-friendly progressive form interface

### 📊 Interactive Visualizations
- **Feature Importance Charts**: Visual representation of health factor importance
- **Outcome Analysis**: Interactive charts showing risk distributions
- **Model Comparison**: Compare different prediction approaches
- **Responsive Charts**: Built with Chart.js for smooth interactivity

### 🎨 Modern UI/UX
- **Responsive Design**: Works perfectly on all devices
- **Dark Mode**: Toggle between light and dark themes
- **Progress Indicators**: Visual feedback during assessment
- **Health Indicators**: Real-time parameter validation
- **Intuitive Navigation**: Easy switching between prediction and visualization

### 📈 Professional Features
- **Prediction History**: Track assessments over time
- **Professional Reports**: Generate comprehensive health reports
- **Export Functionality**: Download detailed assessment reports
- **Medical Priority Levels**: Clear guidance on urgency of medical consultation
- **Confidence Scoring**: Multiple confidence calculation methods

## 🚀 Quick Start

### Prerequisites
- Python 3.8 or higher
- pip package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Jyothirmaye-pjl369/diabetes-prediction-webapp.git
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
    └── README_ENHANCED.md    # Detailed documentation
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

## 🧪 Testing

Run the comprehensive test suite:

```bash
# Test API functionality
python tests/test_api.py

# Test enhanced features
python tests/test_enhanced_app.py

# Test form functionality
python tests/test_form.py
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
- **Render**: One-click deployment with `render.yaml` ([Guide](RENDER_DEPLOYMENT.md))
- **Heroku**: Use the included `Procfile`
- **AWS/Google Cloud**: Container deployment

#### Deploy to Render
1. Fork this repository
2. Sign up at [render.com](https://render.com)
3. Connect your GitHub repository
4. Follow the [deployment guide](RENDER_DEPLOYMENT.md)

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Dataset**: Pima Indians Diabetes Database
- **ML Library**: scikit-learn
- **Web Framework**: Flask
- **UI Icons**: Font Awesome

---

**⚠️ Medical Disclaimer**: This application is for educational and screening purposes only. It should not be used as a substitute for professional medical advice, diagnosis, or treatment. Always consult with a qualified healthcare provider for medical concerns.