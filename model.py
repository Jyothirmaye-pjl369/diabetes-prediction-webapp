import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report, confusion_matrix, precision_score, recall_score, f1_score
import pickle

# Global variables to store model and scaler
model = None
scaler = None

def load_model():
    """Load the trained model and scaler"""
    global model, scaler
    try:
        with open('diabetes_model.pkl', 'rb') as f:
            model = pickle.load(f)
        print("Model loaded successfully")
    except Exception as e:
        print(f"Error loading model: {e}")
        model = None
    
    try:
        with open('scaler.pkl', 'rb') as f:
            scaler = pickle.load(f)
        print("Scaler loaded successfully")
    except Exception as e:
        print(f"Error loading scaler: {e}")
        scaler = None
    except FileNotFoundError:
        print("Model files not found. Training new model...")
        train_model()
        load_model()

def train_model():
    global model, scaler
    # Load the dataset
    data = pd.read_csv('diabetes.csv')

    # Separate features and target
    X = data.drop('Outcome', axis=1)
    y = data['Outcome']

    # Split the data
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    # Scale the features
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)

    # Train the model
    model = RandomForestClassifier(n_estimators=100, random_state=42)
    model.fit(X_train_scaled, y_train)

    # Calculate accuracy
    accuracy = model.score(X_test_scaled, y_test)
    
    # Get detailed metrics
    y_pred = model.predict(X_test_scaled)
    precision = precision_score(y_test, y_pred)
    recall = recall_score(y_test, y_pred)
    f1 = f1_score(y_test, y_pred)
    
    print(f"Model Performance:")
    print(f"Accuracy: {accuracy:.3f}")
    print(f"Precision: {precision:.3f}")
    print(f"Recall: {recall:.3f}")
    print(f"F1-Score: {f1:.3f}")

    # Save the model and scaler
    with open('diabetes_model.pkl', 'wb') as f:
        pickle.dump(model, f)
    with open('scaler.pkl', 'wb') as f:
        pickle.dump(scaler, f)

    return accuracy

def predict_diabetes(features):
    global model, scaler
    
    # Ensure model is loaded
    if model is None or scaler is None:
        load_model()

    # Convert features to numpy array and reshape
    features_array = np.array(features).reshape(1, -1)

    # Scale the features
    features_scaled = scaler.transform(features_array)

    # Make prediction
    prediction = model.predict(features_scaled)[0]
    probability = model.predict_proba(features_scaled)[0][1]

    return prediction, probability


def get_model_metrics():
    """Get comprehensive model performance metrics"""
    # Load the dataset
    data = pd.read_csv('diabetes.csv')
    
    # Separate features and target
    X = data.drop('Outcome', axis=1)
    y = data['Outcome']
    
    # Split the data
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    # Scale the features
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)
    
    # Load the saved model
    with open('diabetes_model.pkl', 'rb') as f:
        model = pickle.load(f)
    
    # Make predictions
    y_pred = model.predict(X_test_scaled)
    
    # Calculate metrics
    accuracy = model.score(X_test_scaled, y_test)
    precision = precision_score(y_test, y_pred)
    recall = recall_score(y_test, y_pred)
    f1 = f1_score(y_test, y_pred)
    
    # Get classification report
    report = classification_report(y_test, y_pred, output_dict=True)
    
    # Get confusion matrix
    cm = confusion_matrix(y_test, y_pred)
    
    return {
        'accuracy': accuracy,
        'precision': precision,
        'recall': recall,
        'f1_score': f1,
        'classification_report': report,
        'confusion_matrix': cm.tolist(),
        'feature_importance': model.feature_importances_.tolist(),
        'feature_names': ['Pregnancies', 'Glucose', 'BloodPressure', 'SkinThickness', 
                         'Insulin', 'BMI', 'DiabetesPedigreeFunction', 'Age']
    }

def get_prediction_explanation(features):
    """Get detailed explanation of prediction"""
    # Load the saved model and scaler
    with open('diabetes_model.pkl', 'rb') as f:
        model = pickle.load(f)
    with open('scaler.pkl', 'rb') as f:
        scaler = pickle.load(f)
    
    # Convert features to numpy array and reshape
    features_array = np.array(features).reshape(1, -1)
    
    # Scale the features
    features_scaled = scaler.transform(features_array)
    
    # Make prediction
    prediction = model.predict(features_scaled)[0]
    probabilities = model.predict_proba(features_scaled)[0]
    
    # Get feature importance
    feature_importance = model.feature_importances_
    feature_names = ['Pregnancies', 'Glucose', 'BloodPressure', 'SkinThickness', 
                    'Insulin', 'BMI', 'DiabetesPedigreeFunction', 'Age']
    
    # Create feature impact analysis
    feature_impact = {}
    for i, (name, value, importance) in enumerate(zip(feature_names, features, feature_importance)):
        feature_impact[name] = {
            'value': value,
            'importance': importance,
            'scaled_value': features_scaled[0][i]
        }
    
    return {
        'prediction': int(prediction),
        'probability_no_diabetes': probabilities[0],
        'probability_diabetes': probabilities[1],
        'feature_impact': feature_impact,
        'model_confidence': max(probabilities)
    }


if __name__ == "__main__":
    accuracy = train_model()
    print(f"Model accuracy: {accuracy:.2f}")