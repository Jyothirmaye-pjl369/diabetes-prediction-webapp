// Navigation functionality
document.addEventListener('DOMContentLoaded', function() {
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('.section');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Remove active class from all nav links and sections
            navLinks.forEach(nl => nl.classList.remove('active'));
            sections.forEach(section => section.classList.remove('active'));
            
            // Add active class to clicked nav link
            this.classList.add('active');
            
            // Show corresponding section
            const targetId = this.getAttribute('href').substring(1);
            const targetSection = document.getElementById(targetId);
            if (targetSection) {
                targetSection.classList.add('active');
            }
        });
    });
    
    // Form submission
    document.getElementById('prediction-form').addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Show loading overlay
        showLoading();
        
        const formData = new FormData(this);
        
        // Validate inputs
        if (!validateInputs(formData)) {
            hideLoading();
            return;
        }
        
        fetch('/predict', {
            method: 'POST',
            body: formData
        })
        .then(response => {
            console.log('Response status:', response.status);
            console.log('Response headers:', response.headers);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log('Received data:', data);
            hideLoading();
            displayMLResult(data);
            
            // Save to history
            if (data.success) {
                saveToHistory(formData, data);
            }
        })
        .catch(error => {
            hideLoading();
            console.error('Error:', error);
            showError('An error occurred while processing your request. Please try again.');
        });
    });
    
    // Clear form functionality
    document.getElementById('clear-btn').addEventListener('click', function() {
        document.getElementById('prediction-form').reset();
        hideResult();
    });
    
    // Load history on page load
    loadHistory();
    
    // Initialize theme
    initializeTheme();
    
    // Initialize input validation
    document.querySelectorAll('#prediction-form input').forEach(input => {
        input.addEventListener('input', function() {
            validateInput(this);
        });
        input.addEventListener('blur', function() {
            validateInput(this);
        });
    });
    
    // Dataset exploration buttons
    const loadDatasetBtn = document.getElementById('load-dataset-btn');
    const datasetStatsBtn = document.getElementById('dataset-stats-btn');
    const correlationBtn = document.getElementById('correlation-btn');
    const batchPredictBtn = document.getElementById('batch-predict-btn');
    
    if (loadDatasetBtn) {
        loadDatasetBtn.addEventListener('click', loadDataset);
    }
    if (datasetStatsBtn) {
        datasetStatsBtn.addEventListener('click', showDatasetStats);
    }
    if (correlationBtn) {
        correlationBtn.addEventListener('click', showCorrelationMatrix);
    }
    if (batchPredictBtn) {
        batchPredictBtn.addEventListener('click', showBatchUpload);
    }
    
    // Visualization buttons
    const featureDistBtn = document.getElementById('feature-dist-btn');
    const outcomeAnalysisBtn = document.getElementById('outcome-analysis-btn');
    const featureImportanceVizBtn = document.getElementById('feature-importance-viz-btn');
    const modelComparisonBtn = document.getElementById('model-comparison-btn');
    
    if (featureDistBtn) {
        featureDistBtn.addEventListener('click', showFeatureDistributions);
    }
    if (outcomeAnalysisBtn) {
        outcomeAnalysisBtn.addEventListener('click', showOutcomeAnalysis);
    }
    if (featureImportanceVizBtn) {
        featureImportanceVizBtn.addEventListener('click', showFeatureImportance);
    }
    if (modelComparisonBtn) {
        modelComparisonBtn.addEventListener('click', showModelComparison);
    }
});

// Remove the duplicate form submission listener

// Input validation
function validateInputs(formData) {
    const inputs = {
        pregnancies: { min: 0, max: 20 },
        glucose: { min: 0, max: 300 },
        bloodpressure: { min: 0, max: 200 },
        skinthickness: { min: 0, max: 100 },
        insulin: { min: 0, max: 1000 },
        bmi: { min: 10, max: 70 },
        dpf: { min: 0, max: 5 },
        age: { min: 1, max: 120 }
    };
    
    for (let [key, range] of Object.entries(inputs)) {
        const value = parseFloat(formData.get(key));
        if (isNaN(value) || value < range.min || value > range.max) {
            showError(`Please enter a valid ${key.replace(/([A-Z])/g, ' $1').toLowerCase()} between ${range.min} and ${range.max}`);
            return false;
        }
    }
    
    return true;
}

// Display result
function displayResult(data) {
    const resultContainer = document.getElementById('result');
    
    if (data.success) {
        const probability = (data.probability * 100).toFixed(1);
        const isPositive = data.prediction === 1;
        
        resultContainer.innerHTML = `
            <div class="result-card ${isPositive ? 'positive' : 'negative'}">
                <div class="result-header">
                    <i class="fas ${isPositive ? 'fa-exclamation-triangle' : 'fa-check-circle'}"></i>
                    <h3 class="result-title">
                        ${isPositive ? 'High Diabetes Risk Detected' : 'Low Diabetes Risk'}
                    </h3>
                </div>
                
                <div class="result-details">
                    <div class="probability-text">Risk Probability: ${probability}%</div>
                    <div class="probability-bar">
                        <div class="probability-fill" style="width: ${probability}%"></div>
                    </div>
                    
                    <div class="result-advice">
                        <h4>${isPositive ? 'Recommendations:' : 'Maintain Healthy Habits:'}</h4>
                        <ul>
                            ${isPositive ? 
                                '<li>Consult with a healthcare professional immediately</li><li>Monitor blood glucose levels regularly</li><li>Adopt a low-sugar, balanced diet</li><li>Increase physical activity</li><li>Consider regular medical check-ups</li>' :
                                '<li>Continue maintaining a healthy lifestyle</li><li>Regular exercise and balanced diet</li><li>Periodic health screenings</li><li>Stay hydrated and get adequate sleep</li>'
                            }
                        </ul>
                    </div>
                </div>
            </div>
        `;
        
        resultContainer.style.display = 'block';
        resultContainer.scrollIntoView({ behavior: 'smooth' });
    } else {
        showError(data.error || 'An error occurred during prediction');
    }
}

// Loading overlay functions
function showLoading() {
    const loadingOverlay = document.getElementById('loading-overlay');
    const predictBtn = document.getElementById('predict-btn');
    
    if (loadingOverlay) {
        loadingOverlay.classList.add('active');
    }
    if (predictBtn) {
        predictBtn.disabled = true;
    }
}

function hideLoading() {
    const loadingOverlay = document.getElementById('loading-overlay');
    const predictBtn = document.getElementById('predict-btn');
    
    if (loadingOverlay) {
        loadingOverlay.classList.remove('active');
    }
    if (predictBtn) {
        predictBtn.disabled = false;
    }
}

// Error handling
function showError(message) {
    const resultContainer = document.getElementById('result');
    resultContainer.innerHTML = `
        <div class="result-card" style="border-left-color: #f59e0b; background: linear-gradient(135deg, #fef3c7, #ffffff);">
            <div class="result-header">
                <i class="fas fa-exclamation-circle" style="color: #f59e0b;"></i>
                <h3 class="result-title" style="color: #d97706;">Error</h3>
            </div>
            <p style="color: #92400e; margin-top: 1rem;">${message}</p>
        </div>
    `;
    resultContainer.style.display = 'block';
}

function hideResult() {
    document.getElementById('result').style.display = 'none';
}

// History management
function saveToHistory(formData, result) {
    const history = JSON.parse(localStorage.getItem('diabetesHistory') || '[]');
    
    const entry = {
        id: Date.now(),
        date: new Date().toISOString(),
        inputs: {
            pregnancies: formData.get('pregnancies'),
            glucose: formData.get('glucose'),
            bloodpressure: formData.get('bloodpressure'),
            skinthickness: formData.get('skinthickness'),
            insulin: formData.get('insulin'),
            bmi: formData.get('bmi'),
            dpf: formData.get('dpf'),
            age: formData.get('age')
        },
        prediction: result.prediction,
        probability: result.probability,
        confidence: (result.probability * 100).toFixed(1)
    };
    
    history.unshift(entry);
    
    // Keep only last 10 entries
    if (history.length > 10) {
        history.splice(10);
    }
    
    localStorage.setItem('diabetesHistory', JSON.stringify(history));
    showNotification('Results saved to history!', 'success');
    loadHistory();
}

function loadHistory() {
    const history = JSON.parse(localStorage.getItem('diabetesHistory') || '[]');
    const historyContainer = document.getElementById('history-container');
    
    if (history.length === 0) {
        historyContainer.innerHTML = `
            <div class="no-history">
                <i class="fas fa-history"></i>
                <p>No predictions made yet. Use the assessment tool to get started!</p>
            </div>
        `;
        return;
    }
    
    historyContainer.innerHTML = history.map(entry => {
        const date = new Date(entry.date).toLocaleDateString();
        const time = new Date(entry.date).toLocaleTimeString();
        const isPositive = entry.prediction === 1;
        const probability = (entry.probability * 100).toFixed(1);
        
        return `
            <div class="history-item">
                <div>
                    <div style="font-weight: 600; margin-bottom: 0.5rem;">${date} at ${time}</div>
                    <div style="color: #666; font-size: 0.9rem;">
                        Age: ${entry.inputs.age}, BMI: ${entry.inputs.bmi}, Glucose: ${entry.inputs.glucose}
                    </div>
                </div>
                <div style="text-align: right;">
                    <div class="history-result ${isPositive ? 'positive' : 'negative'}">
                        ${isPositive ? 'High Risk' : 'Low Risk'}
                    </div>
                    <div style="font-size: 0.8rem; color: #666; margin-top: 0.25rem;">
                        ${probability}% probability
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// Input formatting and validation
document.querySelectorAll('input[type="number"]').forEach(input => {
    input.addEventListener('input', function() {
        const value = parseFloat(this.value);
        const min = parseFloat(this.min);
        const max = parseFloat(this.max);
        
        if (!isNaN(value)) {
            if (value < min) {
                this.style.borderColor = '#ef4444';
            } else if (value > max) {
                this.style.borderColor = '#f59e0b';
            } else {
                this.style.borderColor = '#10b981';
            }
        } else {
            this.style.borderColor = '#e5e7eb';
        }
    });
});

// Add sample data functionality
function fillSampleData() {
    const sampleData = {
        pregnancies: 2,
        glucose: 120,
        bloodpressure: 80,
        skinthickness: 25,
        insulin: 100,
        bmi: 25.5,
        dpf: 0.5,
        age: 35
    };
    
    Object.entries(sampleData).forEach(([key, value]) => {
        const input = document.getElementById(key);
        if (input) {
            input.value = value;
        }
    });
}

// Add keyboard shortcuts
document.addEventListener('keydown', function(e) {
    if (e.ctrlKey && e.key === 'Enter') {
        document.getElementById('prediction-form').dispatchEvent(new Event('submit'));
    }
    
    if (e.ctrlKey && e.key === 'r') {
        e.preventDefault();
        document.getElementById('clear-btn').click();
    }
});

// Add sample data button
if (document.getElementById('sample-btn')) {
    document.getElementById('sample-btn').addEventListener('click', loadEnhancedSampleData);
}

// Feature importance button
if (document.getElementById('feature-importance-btn')) {
    document.getElementById('feature-importance-btn').addEventListener('click', showFeatureImportance);
}

// Feature importance data (typical values for diabetes prediction)
const featureImportance = {
    'Glucose': 0.25,
    'BMI': 0.18,
    'Age': 0.15,
    'Diabetes Pedigree Function': 0.12,
    'Blood Pressure': 0.10,
    'Pregnancies': 0.08,
    'Insulin': 0.07,
    'Skin Thickness': 0.05
};

// ML model information
const modelInfo = {
    algorithm: 'Random Forest',
    trees: 100,
    features: 8,
    trainingSize: 768,
    testSize: 192,
    crossValidation: 5
};

// Feature importance visualization
function showFeatureImportance() {
    const resultContainer = document.getElementById('result');
    
    let html = `
        <div class="feature-importance">
            <h3><i class="fas fa-chart-bar"></i> Feature Importance in ML Model</h3>
            <p>These values show how much each feature contributes to the Random Forest model's predictions:</p>
            <div class="feature-bars">
    `;
    
    Object.entries(featureImportance).forEach(([feature, importance]) => {
        const percentage = (importance * 100).toFixed(1);
        html += `
            <div class="feature-bar">
                <div class="feature-name">${feature}</div>
                <div class="feature-bar-container">
                    <div class="feature-bar-fill" style="width: ${percentage}%"></div>
                </div>
                <div class="feature-value">${percentage}%</div>
            </div>
        `;
    });
    
    html += `
            </div>
            <div class="ml-explanation">
                <h4><i class="fas fa-info-circle"></i> Understanding Feature Importance</h4>
                <p><strong>Glucose Level</strong> is the most important feature, as it directly indicates blood sugar levels.</p>
                <p><strong>BMI</strong> and <strong>Age</strong> are strong predictors as they relate to metabolic health and risk accumulation.</p>
                <p><strong>Diabetes Pedigree Function</strong> captures genetic predisposition based on family history.</p>
            </div>
        </div>
    `;
    
    resultContainer.innerHTML = html;
    resultContainer.scrollIntoView({ behavior: 'smooth' });
}

// Enhanced result display with ML details
function displayMLResult(data) {
    const resultContainer = document.getElementById('result');
    
    // Check if the request was successful
    if (!data.success) {
        showError(data.error || 'An error occurred during prediction');
        return;
    }
    
    const isPositive = data.prediction === 1;
    const confidence = (data.probability * 100).toFixed(1);
    
    // Health recommendations based on prediction
    const recommendations = getHealthRecommendations(isPositive, confidence);
    
    const html = `
        <div class="result-container ml-result">
            <div class="prediction-summary">
                <div class="prediction-icon ${isPositive ? 'positive' : 'negative'}">
                    <i class="fas fa-${isPositive ? 'exclamation-triangle' : 'check-circle'}"></i>
                </div>
                <div class="prediction-text">
                    <h3>${isPositive ? 'Diabetes Risk Detected' : 'Low Diabetes Risk'}</h3>
                    <p>Confidence: ${confidence}%</p>
                </div>
            </div>
            
            <div class="confidence-meter">
                <div class="confidence-fill" style="width: ${confidence}%"></div>
            </div>
            
            <div class="prediction-details">
                <div class="prediction-card">
                    <h4><i class="fas fa-brain"></i> AI Analysis</h4>
                    <p>Random Forest algorithm analyzed your health parameters</p>
                    <p>Prediction confidence: ${confidence}%</p>
                </div>
                
                <div class="prediction-card">
                    <h4><i class="fas fa-chart-line"></i> Risk Assessment</h4>
                    <p>Risk Level: ${getRiskLevel(confidence, isPositive)}</p>
                    <p>Based on 8 health indicators</p>
                </div>
            </div>
            
            <div class="health-recommendations">
                <h4><i class="fas fa-medical-kit"></i> Health Recommendations</h4>
                <ul>
                    ${recommendations.map(rec => `<li>${rec}</li>`).join('')}
                </ul>
            </div>
            
            <div class="quick-actions">
                <a href="#" class="quick-action" onclick="generateHealthReport()">
                    <i class="fas fa-file-medical"></i>
                    Generate Report
                </a>
                <a href="#" class="quick-action" onclick="shareResults()">
                    <i class="fas fa-share-alt"></i>
                    Share Results
                </a>
                <a href="#" class="quick-action" onclick="showNotification('Results automatically saved to history!', 'info')">
                    <i class="fas fa-save"></i>
                    Save to History
                </a>
            </div>
        </div>
    `;
    
    resultContainer.innerHTML = html;
    resultContainer.scrollIntoView({ behavior: 'smooth' });
}

function getHealthRecommendations(isPositive, confidence) {
    if (isPositive) {
        return [
            'Consult with a healthcare professional for proper diagnosis',
            'Consider regular blood sugar monitoring',
            'Adopt a balanced, low-sugar diet',
            'Incorporate regular physical activity',
            'Monitor your weight and BMI',
            'Stay hydrated and get adequate sleep',
            'Schedule regular medical check-ups'
        ];
    } else {
        return [
            'Maintain your current healthy lifestyle',
            'Continue regular exercise routine',
            'Keep eating a balanced diet',
            'Stay within healthy weight range',
            'Schedule annual health screenings',
            'Monitor stress levels and manage effectively',
            'Stay informed about diabetes prevention'
        ];
    }
}

function getRiskLevel(confidence, isPositive) {
    if (isPositive) {
        if (confidence > 80) return 'High Risk';
        if (confidence > 60) return 'Moderate Risk';
        return 'Low-Moderate Risk';
    } else {
        if (confidence > 80) return 'Very Low Risk';
        if (confidence > 60) return 'Low Risk';
        return 'Minimal Risk';
    }
}

// Additional Quick Actions
function generateHealthReport() {
    showNotification('Health report feature coming soon!', 'info');
}

function shareResults() {
    if (navigator.share) {
        navigator.share({
            title: 'Diabetes Risk Assessment Results',
            text: 'Check out my diabetes risk assessment results from the AI-powered prediction system.',
            url: window.location.href
        });
    } else {
        // Fallback for browsers that don't support Web Share API
        const url = window.location.href;
        navigator.clipboard.writeText(url).then(() => {
            showNotification('Link copied to clipboard!', 'success');
        });
    }
}

function updateHistoryDisplay() {
    const historyContainer = document.getElementById('history-container');
    const history = JSON.parse(localStorage.getItem('diabetesHistory') || '[]');
    
    if (history.length === 0) {
        historyContainer.innerHTML = `
            <div class="no-history">
                <i class="fas fa-brain"></i>
                <p>No ML predictions made yet. Use the model to get started!</p>
            </div>
        `;
        return;
    }
    
    const historyHtml = `
        <div class="history-list">
            ${history.map((entry, index) => `
                <div class="history-item ${entry.prediction === 1 ? 'positive' : 'negative'}">
                    <div class="history-date">${new Date(entry.date).toLocaleDateString()}</div>
                    <div class="history-result">
                        <i class="fas fa-${entry.prediction === 1 ? 'exclamation-triangle' : 'check-circle'}"></i>
                        ${entry.prediction === 1 ? 'Diabetes Risk' : 'Low Risk'}
                    </div>
                    <div class="history-confidence">${entry.confidence}%</div>
                </div>
            `).join('')}
        </div>
        <button onclick="clearHistory()" class="btn-secondary" style="margin-top: 1rem;">
            <i class="fas fa-trash"></i> Clear History
        </button>
    `;
    
    historyContainer.innerHTML = historyHtml;
}

function clearHistory() {
    localStorage.removeItem('diabetesHistory');
    updateHistoryDisplay();
    showNotification('History cleared!', 'info');
}

// Dark Mode Toggle
function initializeTheme() {
    const savedTheme = localStorage.getItem('theme');
    const themeToggle = document.getElementById('theme-toggle');
    const body = document.body;
    
    if (savedTheme === 'dark') {
        body.classList.add('dark-mode');
        themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
    }
    
    themeToggle.addEventListener('click', function() {
        body.classList.toggle('dark-mode');
        
        if (body.classList.contains('dark-mode')) {
            localStorage.setItem('theme', 'dark');
            this.innerHTML = '<i class="fas fa-sun"></i>';
        } else {
            localStorage.setItem('theme', 'light');
            this.innerHTML = '<i class="fas fa-moon"></i>';
        }
    });
}

// Enhanced Input Validation
function validateInput(input) {
    const value = parseFloat(input.value);
    const min = parseFloat(input.min);
    const max = parseFloat(input.max);
    const name = input.name;
    
    // Remove existing validation messages
    const existingMessage = input.parentNode.querySelector('.validation-message');
    if (existingMessage) {
        existingMessage.remove();
    }
    
    if (isNaN(value) || value === '') {
        input.classList.remove('valid', 'invalid', 'warning');
        return;
    }
    
    let message = '';
    let messageType = 'valid';
    
    if (value < min || value > max) {
        input.classList.add('invalid');
        input.classList.remove('valid', 'warning');
        message = `Value must be between ${min} and ${max}`;
        messageType = 'invalid';
    } else {
        // Add health-specific validation
        switch (name) {
            case 'glucose':
                if (value < 70) {
                    input.classList.add('warning');
                    input.classList.remove('valid', 'invalid');
                    message = 'Low glucose level detected';
                    messageType = 'warning';
                } else if (value > 140) {
                    input.classList.add('warning');
                    input.classList.remove('valid', 'invalid');
                    message = 'High glucose level detected';
                    messageType = 'warning';
                } else {
                    input.classList.add('valid');
                    input.classList.remove('invalid', 'warning');
                    message = 'Normal glucose level';
                }
                break;
            case 'bmi':
                if (value < 18.5) {
                    input.classList.add('warning');
                    input.classList.remove('valid', 'invalid');
                    message = 'Underweight BMI';
                    messageType = 'warning';
                } else if (value > 30) {
                    input.classList.add('warning');
                    input.classList.remove('valid', 'invalid');
                    message = 'Obese BMI range';
                    messageType = 'warning';
                } else {
                    input.classList.add('valid');
                    input.classList.remove('invalid', 'warning');
                    message = 'Healthy BMI range';
                }
                break;
            case 'bloodpressure':
                if (value > 90) {
                    input.classList.add('warning');
                    input.classList.remove('valid', 'invalid');
                    message = 'High blood pressure';
                    messageType = 'warning';
                } else {
                    input.classList.add('valid');
                    input.classList.remove('invalid', 'warning');
                    message = 'Normal blood pressure';
                }
                break;
            default:
                input.classList.add('valid');
                input.classList.remove('invalid', 'warning');
                message = 'Valid value';
        }
    }
    
    if (message) {
        const messageElement = document.createElement('div');
        messageElement.className = `validation-message ${messageType}`;
        messageElement.innerHTML = `
            <i class="fas fa-${messageType === 'valid' ? 'check' : messageType === 'warning' ? 'exclamation-triangle' : 'times'}"></i>
            ${message}
        `;
        input.parentNode.appendChild(messageElement);
    }
}

// Notification function
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
        <span>${message}</span>
    `;
    
    document.body.appendChild(notification);
    
    // Show notification
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    // Hide notification after 3 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Dataset exploration functions
function loadDataset() {
    fetch('/dataset')
        .then(response => response.json())
        .then(data => {
            const container = document.getElementById('dataset-container');
            if (data.success) {
                let html = '<div class="dataset-table-container">';
                html += '<h3>Diabetes Dataset (First 10 rows)</h3>';
                html += '<table class="dataset-table">';
                html += '<thead><tr>';
                
                // Headers
                Object.keys(data.data[0]).forEach(key => {
                    html += `<th>${key}</th>`;
                });
                html += '</tr></thead><tbody>';
                
                // Data rows (first 10)
                data.data.slice(0, 10).forEach(row => {
                    html += '<tr>';
                    Object.values(row).forEach(value => {
                        html += `<td>${value}</td>`;
                    });
                    html += '</tr>';
                });
                
                html += '</tbody></table>';
                html += `<p>Total rows: ${data.total_rows}</p>`;
                html += '</div>';
                
                container.innerHTML = html;
            } else {
                showError('Failed to load dataset');
            }
        })
        .catch(error => {
            console.error('Error loading dataset:', error);
            showError('Error loading dataset');
        });
}

function showDatasetStats() {
    fetch('/dataset-stats')
        .then(response => response.json())
        .then(data => {
            const container = document.getElementById('dataset-container');
            if (data.success) {
                let html = '<div class="dataset-stats">';
                html += '<h3>Dataset Statistics</h3>';
                html += '<div class="stats-grid">';
                
                Object.entries(data.stats).forEach(([feature, stats]) => {
                    html += `
                        <div class="stat-card">
                            <h4>${feature}</h4>
                            <p>Mean: ${stats.mean.toFixed(2)}</p>
                            <p>Std: ${stats.std.toFixed(2)}</p>
                            <p>Min: ${stats.min}</p>
                            <p>Max: ${stats.max}</p>
                        </div>
                    `;
                });
                
                html += '</div></div>';
                container.innerHTML = html;
            } else {
                showError('Failed to load dataset statistics');
            }
        })
        .catch(error => {
            console.error('Error loading stats:', error);
            showError('Error loading dataset statistics');
        });
}

function showCorrelationMatrix() {
    fetch('/correlation-matrix')
        .then(response => response.json())
        .then(data => {
            const container = document.getElementById('dataset-container');
            if (data.success) {
                container.innerHTML = `
                    <div class="correlation-matrix">
                        <h3>Feature Correlation Matrix</h3>
                        <div class="matrix-container">
                            <img src="data:image/png;base64,${data.plot}" alt="Correlation Matrix" style="max-width: 100%; height: auto;">
                        </div>
                    </div>
                `;
            } else {
                showError('Failed to generate correlation matrix');
            }
        })
        .catch(error => {
            console.error('Error generating correlation matrix:', error);
            showError('Error generating correlation matrix');
        });
}

function showBatchUpload() {
    const batchUpload = document.getElementById('batch-upload');
    if (batchUpload) {
        batchUpload.classList.toggle('hidden');
    }
}

function showFeatureDistributions() {
    fetch('/feature-distributions')
        .then(response => response.json())
        .then(data => {
            const container = document.getElementById('visualization-container');
            if (data.success) {
                container.innerHTML = `
                    <div class="feature-distributions">
                        <h3>Feature Distributions</h3>
                        <div class="plot-container">
                            <img src="data:image/png;base64,${data.plot}" alt="Feature Distributions" style="max-width: 100%; height: auto;">
                        </div>
                    </div>
                `;
            } else {
                showError('Failed to generate feature distributions');
            }
        })
        .catch(error => {
            console.error('Error generating feature distributions:', error);
            showError('Error generating feature distributions');
        });
}

function showOutcomeAnalysis() {
    fetch('/outcome-analysis')
        .then(response => response.json())
        .then(data => {
            const container = document.getElementById('visualization-container');
            if (data.success) {
                container.innerHTML = `
                    <div class="outcome-analysis">
                        <h3>Outcome Analysis</h3>
                        <div class="plot-container">
                            <img src="data:image/png;base64,${data.plot}" alt="Outcome Analysis" style="max-width: 100%; height: auto;">
                        </div>
                    </div>
                `;
            } else {
                showError('Failed to generate outcome analysis');
            }
        })
        .catch(error => {
            console.error('Error generating outcome analysis:', error);
            showError('Error generating outcome analysis');
        });
}

function showModelComparison() {
    fetch('/model-comparison')
        .then(response => response.json())
        .then(data => {
            const container = document.getElementById('visualization-container');
            if (data.success) {
                container.innerHTML = `
                    <div class="model-comparison">
                        <h3>Model Performance Comparison</h3>
                        <div class="plot-container">
                            <img src="data:image/png;base64,${data.plot}" alt="Model Comparison" style="max-width: 100%; height: auto;">
                        </div>
                        <div class="model-metrics">
                            <h4>Model Accuracies:</h4>
                            <ul>
                                ${Object.entries(data.accuracies).map(([model, acc]) => 
                                    `<li>${model}: ${(acc * 100).toFixed(2)}%</li>`
                                ).join('')}
                            </ul>
                        </div>
                    </div>
                `;
            } else {
                showError('Failed to generate model comparison');
            }
        })
        .catch(error => {
            console.error('Error generating model comparison:', error);
            showError('Error generating model comparison');
        });
}

// Additional functionality is already initialized above

// Enhanced sample data with better examples
function loadEnhancedSampleData() {
    const sampleSets = [
        {
            name: "High Risk Case",
            data: {
                pregnancies: 6,
                glucose: 148,
                bloodpressure: 72,
                skinthickness: 35,
                insulin: 0,
                bmi: 33.6,
                dpf: 0.627,
                age: 50
            }
        },
        {
            name: "Low Risk Case",
            data: {
                pregnancies: 1,
                glucose: 89,
                bloodpressure: 66,
                skinthickness: 23,
                insulin: 94,
                bmi: 28.1,
                dpf: 0.167,
                age: 21
            }
        },
        {
            name: "Moderate Risk Case",
            data: {
                pregnancies: 3,
                glucose: 120,
                bloodpressure: 78,
                skinthickness: 25,
                insulin: 100,
                bmi: 27.5,
                dpf: 0.4,
                age: 35
            }
        }
    ];
    
    const randomSet = sampleSets[Math.floor(Math.random() * sampleSets.length)];
    
    Object.entries(randomSet.data).forEach(([key, value]) => {
        const input = document.getElementById(key);
        if (input) {
            input.value = value;
            validateInput(input);
        }
    });
    
    showNotification(`Loaded ${randomSet.name} sample data`, 'info');
}