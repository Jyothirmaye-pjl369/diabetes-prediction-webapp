from flask import Flask, render_template, request, jsonify
from model import predict_diabetes, train_model
import pickle
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.svm import SVC
from sklearn.neighbors import KNeighborsClassifier
from sklearn.tree import DecisionTreeClassifier
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, classification_report
import json
import os

app = Flask(__name__)

# Train the model when the app starts
model_accuracy = train_model()


@app.route('/')
def index():
    return render_template('index.html', accuracy=model_accuracy)


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

        return jsonify({
            'prediction': int(prediction),
            'probability': float(probability),
            'success': True
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        })


@app.route('/feature-importance', methods=['GET'])
def get_feature_importance():
    try:
        # Load the trained model
        with open('diabetes_model.pkl', 'rb') as f:
            model = pickle.load(f)

        # Get feature importance from the Random Forest model
        feature_names = ['Pregnancies', 'Glucose', 'BloodPressure', 'SkinThickness',
                         'Insulin', 'BMI', 'DiabetesPedigreeFunction', 'Age']

        importances = model.feature_importances_
        feature_importance = dict(zip(feature_names, importances))

        return jsonify({
            'feature_importance': feature_importance,
            'model_info': {
                'algorithm': 'Random Forest',
                'n_estimators': model.n_estimators,
                'max_depth': model.max_depth,
                'random_state': model.random_state
            },
            'success': True
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        })


@app.route('/model-info', methods=['GET'])
def get_model_info():
    try:
        # Load model and get information
        with open('diabetes_model.pkl', 'rb') as f:
            model = pickle.load(f)

        return jsonify({
            'algorithm': 'Random Forest',
            'n_estimators': model.n_estimators,
            'accuracy': model_accuracy,
            'features': 8,
            'training_samples': 768,
            'test_samples': 192,
            'success': True
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        })


# Dataset API endpoints
@app.route('/api/dataset')
def get_dataset():
    try:
        df = pd.read_csv('diabetes.csv')
        
        # Basic statistics
        total_samples = len(df)
        features = len(df.columns) - 1  # Excluding outcome column
        diabetic_cases = df['Outcome'].sum()
        non_diabetic_cases = total_samples - diabetic_cases
        diabetes_rate = round((diabetic_cases / total_samples) * 100, 1)
        
        # Sample data (first 20 rows)
        sample_data = df.head(20).values.tolist()
        
        return jsonify({
            'total_samples': total_samples,
            'features': features,
            'diabetic_cases': int(diabetic_cases),
            'non_diabetic_cases': int(non_diabetic_cases),
            'diabetes_rate': diabetes_rate,
            'columns': df.columns.tolist(),
            'sample_data': sample_data
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/dataset-stats')
def get_dataset_stats():
    try:
        df = pd.read_csv('diabetes.csv')
        X = df.drop('Outcome', axis=1)
        
        feature_stats = {}
        for column in X.columns:
            feature_stats[column] = {
                'mean': float(X[column].mean()),
                'std': float(X[column].std()),
                'min': float(X[column].min()),
                'max': float(X[column].max()),
                'median': float(X[column].median())
            }
        
        return jsonify({
            'feature_stats': feature_stats,
            'total_samples': len(df),
            'missing_values': X.isnull().sum().to_dict()
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/correlation-matrix')
def get_correlation_matrix():
    try:
        df = pd.read_csv('diabetes.csv')
        correlation_matrix = df.corr().values.tolist()
        
        return jsonify({
            'correlation_matrix': correlation_matrix,
            'features': df.columns.tolist()
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/feature-distributions')
def get_feature_distributions():
    try:
        df = pd.read_csv('diabetes.csv')
        X = df.drop('Outcome', axis=1)
        
        distributions = {}
        stats = {}
        histograms = {}
        
        for column in X.columns:
            stats[column] = {
                'mean': float(X[column].mean()),
                'std': float(X[column].std())
            }
            
            # Create histogram data
            hist, bins = np.histogram(X[column], bins=10)
            histograms[column] = hist.tolist()
        
        return jsonify({
            'features': X.columns.tolist(),
            'stats': stats,
            'histograms': histograms
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/outcome-analysis')
def get_outcome_analysis():
    try:
        df = pd.read_csv('diabetes.csv')
        
        diabetic_count = int(df['Outcome'].sum())
        non_diabetic_count = len(df) - diabetic_count
        total_samples = len(df)
        
        diabetic_percentage = round((diabetic_count / total_samples) * 100, 1)
        non_diabetic_percentage = round((non_diabetic_count / total_samples) * 100, 1)
        
        # Age analysis
        diabetic_df = df[df['Outcome'] == 1]
        non_diabetic_df = df[df['Outcome'] == 0]
        
        avg_age_diabetic = round(diabetic_df['Age'].mean(), 1)
        avg_age_non_diabetic = round(non_diabetic_df['Age'].mean(), 1)
        
        balance_status = "balanced" if abs(diabetic_percentage - 50) < 15 else "imbalanced"
        
        return jsonify({
            'diabetic_count': diabetic_count,
            'non_diabetic_count': non_diabetic_count,
            'total_samples': total_samples,
            'diabetic_percentage': diabetic_percentage,
            'non_diabetic_percentage': non_diabetic_percentage,
            'avg_age_diabetic': avg_age_diabetic,
            'avg_age_non_diabetic': avg_age_non_diabetic,
            'balance_status': balance_status
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/model-comparison')
def get_model_comparison():
    try:
        df = pd.read_csv('diabetes.csv')
        X = df.drop('Outcome', axis=1)
        y = df['Outcome']
        
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
        
        scaler = StandardScaler()
        X_train_scaled = scaler.fit_transform(X_train)
        X_test_scaled = scaler.transform(X_test)
        
        models = {
            'Random Forest': RandomForestClassifier(n_estimators=100, random_state=42),
            'Logistic Regression': LogisticRegression(random_state=42),
            'SVM': SVC(random_state=42),
            'K-Nearest Neighbors': KNeighborsClassifier(n_neighbors=5),
            'Decision Tree': DecisionTreeClassifier(random_state=42)
        }
        
        model_results = []
        best_accuracy = 0
        best_model = ""
        
        for name, model in models.items():
            model.fit(X_train_scaled, y_train)
            y_pred = model.predict(X_test_scaled)
            
            accuracy = accuracy_score(y_test, y_pred)
            precision = precision_score(y_test, y_pred, zero_division=0)
            recall = recall_score(y_test, y_pred, zero_division=0)
            f1 = f1_score(y_test, y_pred, zero_division=0)
            
            if accuracy > best_accuracy:
                best_accuracy = accuracy
                best_model = name
            
            status = "best" if accuracy >= 0.8 else "good" if accuracy >= 0.75 else "fair"
            
            model_results.append({
                'name': name,
                'accuracy': accuracy,
                'precision': precision,
                'recall': recall,
                'f1_score': f1,
                'status': status
            })
        
        # Sort by accuracy
        model_results.sort(key=lambda x: x['accuracy'], reverse=True)
        
        # Find current model rank
        current_model_rank = next((i+1 for i, model in enumerate(model_results) if model['name'] == 'Random Forest'), 0)
        
        recommendation = f"Random Forest performs well with {(model_results[current_model_rank-1]['accuracy']*100):.1f}% accuracy. "
        if current_model_rank == 1:
            recommendation += "It's the best performing model!"
        else:
            recommendation += f"Consider trying {model_results[0]['name']} for potentially better results."
        
        return jsonify({
            'models': model_results,
            'best_model': best_model,
            'best_accuracy': best_accuracy,
            'current_model_rank': current_model_rank,
            'recommendation': recommendation
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/batch-predict', methods=['POST'])
def batch_predict():
    try:
        if 'file' not in request.files:
            return jsonify({'success': False, 'error': 'No file uploaded'}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({'success': False, 'error': 'No file selected'}), 400
        
        # Read uploaded CSV
        df = pd.read_csv(file)
        
        # Validate columns
        expected_columns = ['Pregnancies', 'Glucose', 'BloodPressure', 'SkinThickness', 
                          'Insulin', 'BMI', 'DiabetesPedigreeFunction', 'Age']
        
        if not all(col in df.columns for col in expected_columns):
            return jsonify({
                'success': False, 
                'error': f'CSV must contain columns: {", ".join(expected_columns)}'
            }), 400
        
        # Make predictions
        predictions = []
        diabetic_count = 0
        
        for _, row in df.iterrows():
            features = [
                row['Pregnancies'], row['Glucose'], row['BloodPressure'],
                row['SkinThickness'], row['Insulin'], row['BMI'],
                row['DiabetesPedigreeFunction'], row['Age']
            ]
            
            prediction, probability = predict_diabetes(features)
            
            if prediction == 1:
                diabetic_count += 1
            
            risk_level = "High" if probability > 0.7 else "Medium" if probability > 0.4 else "Low"
            
            predictions.append({
                'prediction': int(prediction),
                'probability': float(probability),
                'risk_level': risk_level
            })
        
        total_predictions = len(predictions)
        non_diabetic_count = total_predictions - diabetic_count
        risk_rate = round((diabetic_count / total_predictions) * 100, 1)
        
        return jsonify({
            'success': True,
            'total_predictions': total_predictions,
            'diabetic_predictions': diabetic_count,
            'non_diabetic_predictions': non_diabetic_count,
            'risk_rate': risk_rate,
            'predictions': predictions
        })
    
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


if __name__ == '__main__':
    import os
    port = int(os.environ.get('PORT', 5000))
    debug = os.environ.get('DEBUG', 'False').lower() == 'true'
    app.run(host='0.0.0.0', port=port, debug=debug)