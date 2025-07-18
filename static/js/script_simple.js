// Enhanced Diabetes Prediction App
document.addEventListener('DOMContentLoaded', function() {
    let currentStep = 1;
    const totalSteps = 2;
    
    // Navigation functionality
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('.section');
    
    // Global navigation function
    window.navigateToSection = function(sectionId) {
        // Remove active class from all nav links and sections
        navLinks.forEach(nl => nl.classList.remove('active'));
        sections.forEach(section => section.classList.remove('active'));
        
        // Add active class to corresponding nav link
        const navLink = document.querySelector(`[href="#${sectionId}"]`);
        if (navLink) {
            navLink.classList.add('active');
        }
        
        // Show corresponding section
        const targetSection = document.getElementById(sectionId);
        if (targetSection) {
            targetSection.classList.add('active');
            
            // Load content for specific sections
            if (sectionId === 'results') {
                loadResultsContent();
            } else if (sectionId === 'tips') {
                loadHealthTipsContent();
            }
        }
    };
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            navigateToSection(targetId);
        });
    });

    // Multi-step form functionality
    const nextBtn = document.getElementById('next-btn');
    const prevBtn = document.getElementById('prev-btn');
    const predictBtn = document.getElementById('predict-btn');

    if (nextBtn) {
        nextBtn.addEventListener('click', function() {
            if (validateCurrentStep()) {
                nextStep();
            }
        });
    }

    if (prevBtn) {
        prevBtn.addEventListener('click', function() {
            prevStep();
        });
    }

    // Form submission
    const form = document.getElementById('prediction-form');
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Show loading
            showLoading();
            
            const formData = new FormData(this);
            
            // Make prediction request
            fetch('/predict', {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                hideLoading();
                displayResult(data);
                // Automatically navigate to results after prediction
                setTimeout(() => {
                    navigateToSection('results');
                }, 2000);
            })
            .catch(error => {
                hideLoading();
                console.error('Error:', error);
                showError('An error occurred while processing your request. Please try again.');
            });
        });
    }

    // Sample data button
    const sampleBtn = document.getElementById('sample-btn');
    if (sampleBtn) {
        sampleBtn.addEventListener('click', function() {
            loadSampleData();
        });
    }

    // Clear form button
    const clearBtn = document.getElementById('clear-btn');
    if (clearBtn) {
        clearBtn.addEventListener('click', function() {
            form.reset();
            hideResult();
            resetHealthIndicators();
            currentStep = 1;
            updateStepDisplay();
        });
    }

    // Load Results Content
    async function loadResultsContent() {
        const loadingDiv = document.getElementById('results-loading');
        const noResultsDiv = document.getElementById('no-results');
        const contentDiv = document.getElementById('results-content');
        
        // Show loading
        loadingDiv.style.display = 'block';
        noResultsDiv.style.display = 'none';
        contentDiv.style.display = 'none';
        
        try {
            const response = await fetch('/api/detailed_analysis');
            const data = await response.json();
            
            if (data.success) {
                displayResultsContent(data.analysis);
            } else {
                showNoResults();
            }
        } catch (error) {
            console.error('Error loading results:', error);
            showNoResults();
        }
    }
    
    function displayResultsContent(analysis) {
        const loadingDiv = document.getElementById('results-loading');
        const contentDiv = document.getElementById('results-content');
        
        loadingDiv.style.display = 'none';
        contentDiv.style.display = 'block';
        
        const riskLevel = analysis.overall_risk.level;
        const riskPercentage = analysis.overall_risk.percentage;
        const riskDescription = analysis.overall_risk.description;
        
        contentDiv.innerHTML = `
            <div class="risk-summary-card">
                <div class="risk-header">
                    <div class="risk-icon">
                        <i class="fas fa-shield-alt"></i>
                    </div>
                    <div class="risk-info">
                        <h2>${riskLevel}</h2>
                        <p>${riskPercentage}</p>
                        <span>${riskDescription}</span>
                    </div>
                </div>
                <div class="risk-meter">
                    <div class="risk-meter-bar">
                        <div class="risk-meter-fill" style="width: ${riskPercentage}"></div>
                    </div>
                    <div class="risk-meter-labels">
                        <span>Low</span>
                        <span>Moderate</span>
                        <span>High</span>
                    </div>
                </div>
            </div>
            
            <div class="analysis-grid">
                <div class="analysis-card">
                    <h3><i class="fas fa-exclamation-triangle"></i> Risk Factors</h3>
                    <div class="factors-list">
                        ${analysis.risk_factors.map(factor => `
                            <div class="factor-item high-risk">
                                <h5>${factor.factor}</h5>
                                <p><strong>Value:</strong> ${factor.value}</p>
                                <p><strong>Impact:</strong> ${factor.impact}</p>
                                <p><strong>Action:</strong> ${factor.action}</p>
                            </div>
                        `).join('')}
                    </div>
                </div>
                
                <div class="analysis-card">
                    <h3><i class="fas fa-shield-check"></i> Protective Factors</h3>
                    <div class="factors-list">
                        ${analysis.protective_factors.map(factor => `
                            <div class="factor-item protective">
                                <h5>${factor.factor}</h5>
                                <p>${factor.description}</p>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
            
            <div class="timeline-card">
                <h3><i class="fas fa-calendar-alt"></i> Recommended Action Timeline</h3>
                <div class="timeline">
                    <div class="timeline-item">
                        <div class="timeline-icon immediate">
                            <i class="fas fa-clock"></i>
                        </div>
                        <div class="timeline-content">
                            <h4>Immediate Action</h4>
                            <p>${analysis.timeline.immediate}</p>
                        </div>
                    </div>
                    <div class="timeline-item">
                        <div class="timeline-icon short-term">
                            <i class="fas fa-calendar-week"></i>
                        </div>
                        <div class="timeline-content">
                            <h4>Short-term (1-4 weeks)</h4>
                            <p>${analysis.timeline.short_term}</p>
                        </div>
                    </div>
                    <div class="timeline-item">
                        <div class="timeline-icon long-term">
                            <i class="fas fa-calendar"></i>
                        </div>
                        <div class="timeline-content">
                            <h4>Long-term (ongoing)</h4>
                            <p>${analysis.timeline.long_term}</p>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="quick-actions">
                <h3><i class="fas fa-bolt"></i> Quick Actions</h3>
                <div class="action-buttons">
                    <button onclick="generateReport()" class="btn btn-secondary">
                        <i class="fas fa-file-medical"></i>
                        Generate Report
                    </button>
                    <button onclick="navigateToSection('tips')" class="btn btn-primary">
                        <i class="fas fa-lightbulb"></i>
                        Get Health Tips
                    </button>
                    <button onclick="retakeAssessment()" class="btn btn-outline">
                        <i class="fas fa-redo"></i>
                        Retake Assessment
                    </button>
                </div>
            </div>
        `;
    }
    
    function showNoResults() {
        document.getElementById('results-loading').style.display = 'none';
        document.getElementById('no-results').style.display = 'block';
    }
    
    // Load Health Tips Content
    async function loadHealthTipsContent() {
        const loadingDiv = document.getElementById('tips-loading');
        const noTipsDiv = document.getElementById('no-tips');
        const contentDiv = document.getElementById('tips-content');
        
        // Show loading
        loadingDiv.style.display = 'block';
        noTipsDiv.style.display = 'none';
        contentDiv.style.display = 'none';
        
        try {
            const response = await fetch('/api/health_tips');
            const data = await response.json();
            
            if (data.success) {
                displayHealthTipsContent(data);
            } else {
                showNoTips();
            }
        } catch (error) {
            console.error('Error loading health tips:', error);
            showNoTips();
        }
    }
    
    function displayHealthTipsContent(data) {
        const loadingDiv = document.getElementById('tips-loading');
        const contentDiv = document.getElementById('tips-content');
        
        loadingDiv.style.display = 'none';
        contentDiv.style.display = 'block';
        
        const tips = data.health_tips;
        
        contentDiv.innerHTML = `
            <div class="risk-banner">
                <div class="risk-banner-content">
                    <div class="risk-banner-icon">
                        <i class="fas fa-info-circle"></i>
                    </div>
                    <div class="risk-banner-text">
                        <h3>Your Current Risk Level: ${data.risk_level}</h3>
                        <p>Assessment completed on ${new Date(data.assessment_date).toLocaleDateString()}</p>
                    </div>
                </div>
            </div>
            
            <div class="tips-navigation">
                <button class="tip-category-btn active" data-category="diet" onclick="showTipCategory('diet')">
                    <i class="fas fa-apple-alt"></i>
                    Diet & Nutrition
                </button>
                <button class="tip-category-btn" data-category="exercise" onclick="showTipCategory('exercise')">
                    <i class="fas fa-dumbbell"></i>
                    Exercise & Fitness
                </button>
                <button class="tip-category-btn" data-category="lifestyle" onclick="showTipCategory('lifestyle')">
                    <i class="fas fa-heart"></i>
                    Lifestyle Changes
                </button>
                <button class="tip-category-btn" data-category="monitoring" onclick="showTipCategory('monitoring')">
                    <i class="fas fa-chart-line"></i>
                    Health Monitoring
                </button>
                <button class="tip-category-btn" data-category="medical" onclick="showTipCategory('medical')">
                    <i class="fas fa-user-md"></i>
                    Medical Care
                </button>
            </div>
            
            <div class="tips-sections">
                <div class="tips-section active" id="diet-tips">
                    <div class="tips-header-section">
                        <h2><i class="fas fa-apple-alt"></i> Diet & Nutrition Recommendations</h2>
                        <p>Personalized dietary guidance to help manage your diabetes risk</p>
                    </div>
                    <div class="tips-list">
                        ${tips.diet.map((tip, index) => `
                            <div class="tip-card">
                                <div class="tip-content">
                                    <div class="tip-icon">
                                        <i class="fas fa-apple-alt"></i>
                                    </div>
                                    <div class="tip-text">
                                        <h4>Nutrition Recommendation #${index + 1}</h4>
                                        <p>${tip}</p>
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
                
                <div class="tips-section" id="exercise-tips">
                    <div class="tips-header-section">
                        <h2><i class="fas fa-dumbbell"></i> Exercise & Fitness Plan</h2>
                        <p>Safe and effective exercise recommendations based on your health profile</p>
                    </div>
                    <div class="tips-list">
                        ${tips.exercise.map((tip, index) => `
                            <div class="tip-card">
                                <div class="tip-content">
                                    <div class="tip-icon">
                                        <i class="fas fa-dumbbell"></i>
                                    </div>
                                    <div class="tip-text">
                                        <h4>Exercise Guidance #${index + 1}</h4>
                                        <p>${tip}</p>
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
                
                <div class="tips-section" id="lifestyle-tips">
                    <div class="tips-header-section">
                        <h2><i class="fas fa-heart"></i> Lifestyle Modifications</h2>
                        <p>Daily habits and lifestyle changes to improve your overall health</p>
                    </div>
                    <div class="tips-list">
                        ${tips.lifestyle.map((tip, index) => `
                            <div class="tip-card">
                                <div class="tip-content">
                                    <div class="tip-icon">
                                        <i class="fas fa-heart"></i>
                                    </div>
                                    <div class="tip-text">
                                        <h4>Lifestyle Change #${index + 1}</h4>
                                        <p>${tip}</p>
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
                
                <div class="tips-section" id="monitoring-tips">
                    <div class="tips-header-section">
                        <h2><i class="fas fa-chart-line"></i> Health Monitoring Guidelines</h2>
                        <p>How to track your progress and monitor important health metrics</p>
                    </div>
                    <div class="tips-list">
                        ${tips.monitoring.map((tip, index) => `
                            <div class="tip-card">
                                <div class="tip-content">
                                    <div class="tip-icon">
                                        <i class="fas fa-chart-line"></i>
                                    </div>
                                    <div class="tip-text">
                                        <h4>Monitoring Guideline #${index + 1}</h4>
                                        <p>${tip}</p>
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
                
                <div class="tips-section" id="medical-tips">
                    <div class="tips-header-section">
                        <h2><i class="fas fa-user-md"></i> Medical Care & Professional Guidance</h2>
                        <p>When and how to seek professional medical care</p>
                    </div>
                    <div class="tips-list">
                        ${tips.medical.map((tip, index) => `
                            <div class="tip-card">
                                <div class="tip-content">
                                    <div class="tip-icon">
                                        <i class="fas fa-user-md"></i>
                                    </div>
                                    <div class="tip-text">
                                        <h4>Medical Recommendation #${index + 1}</h4>
                                        <p>${tip}</p>
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
    }
    
    function showNoTips() {
        document.getElementById('tips-loading').style.display = 'none';
        document.getElementById('no-tips').style.display = 'block';
    }
    
    // Global functions for tip navigation
    window.showTipCategory = function(category) {
        // Update active button
        const categoryButtons = document.querySelectorAll('.tip-category-btn');
        categoryButtons.forEach(btn => btn.classList.remove('active'));
        document.querySelector(`[data-category="${category}"]`).classList.add('active');
        
        // Show corresponding section
        const sections = document.querySelectorAll('.tips-section');
        sections.forEach(section => section.classList.remove('active'));
        document.getElementById(`${category}-tips`).classList.add('active');
    };
    
    window.retakeAssessment = function() {
        if (confirm('Are you sure you want to retake the assessment?')) {
            navigateToSection('home');
            if (form) {
                form.reset();
                resetHealthIndicators();
                currentStep = 1;
                updateStepDisplay();
            }
        }
    };

    // BMI Calculator
    const bmiBtn = document.getElementById('bmi-calculator');
    const bmiModal = document.getElementById('bmi-modal');
    const modalClose = document.querySelector('.modal-close');

    if (bmiBtn) {
        bmiBtn.addEventListener('click', function() {
            bmiModal.style.display = 'block';
        });
    }

    if (modalClose) {
        modalClose.addEventListener('click', function() {
            bmiModal.style.display = 'none';
        });
    }

    // BMI Calculation
    const calculateBmiBtn = document.getElementById('calculate-bmi');
    if (calculateBmiBtn) {
        calculateBmiBtn.addEventListener('click', function() {
            calculateBMI();
        });
    }

    // Dark mode toggle
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', function() {
            document.body.classList.toggle('dark-mode');
            
            if (document.body.classList.contains('dark-mode')) {
                this.innerHTML = '<i class="fas fa-sun"></i>';
                localStorage.setItem('theme', 'dark');
            } else {
                this.innerHTML = '<i class="fas fa-moon"></i>';
                localStorage.setItem('theme', 'light');
            }
        });
    }

    // Initialize theme
    if (localStorage.getItem('theme') === 'dark') {
        document.body.classList.add('dark-mode');
        if (themeToggle) {
            themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
        }
    }

    // Real-time input validation
    const inputs = document.querySelectorAll('input[type="number"]');
    inputs.forEach(input => {
        input.addEventListener('input', function() {
            validateInput(this);
        });
    });

    // Initialize
    updateStepDisplay();
    loadHistory();
});

// Multi-step form functions
function nextStep() {
    currentStep++;
    updateStepDisplay();
}

function prevStep() {
    currentStep--;
    updateStepDisplay();
}

function updateStepDisplay() {
    const sections = document.querySelectorAll('.form-section');
    const steps = document.querySelectorAll('.progress-step');
    const nextBtn = document.getElementById('next-btn');
    const prevBtn = document.getElementById('prev-btn');
    const predictBtn = document.getElementById('predict-btn');

    // Update sections
    sections.forEach((section, index) => {
        section.classList.toggle('active', index + 1 === currentStep);
    });

    // Update progress steps
    steps.forEach((step, index) => {
        step.classList.toggle('active', index + 1 <= currentStep);
    });

    // Update buttons
    if (prevBtn) prevBtn.style.display = currentStep > 1 ? 'block' : 'none';
    if (nextBtn) nextBtn.style.display = currentStep < totalSteps ? 'block' : 'none';
    if (predictBtn) predictBtn.style.display = currentStep === totalSteps ? 'block' : 'none';
}

function validateCurrentStep() {
    const currentSection = document.getElementById(`section-${currentStep}`);
    if (!currentSection) {
        console.error(`Section not found: section-${currentStep}`);
        return false;
    }
    
    const inputs = currentSection.querySelectorAll('input[required]');
    let valid = true;

    inputs.forEach(input => {
        if (!input.value || !validateInput(input)) {
            valid = false;
        }
    });

    if (!valid) {
        showNotification('Please fill in all required fields correctly.', 'error');
    }

    return valid;
}

// Input validation with health indicators
function validateInput(input) {
    const value = parseFloat(input.value);
    const name = input.name;
    const indicator = input.parentNode.querySelector('.health-indicator');
    
    if (isNaN(value) || value === '') {
        indicator.innerHTML = '';
        return false;
    }

    let status = 'normal';
    let message = '';
    let color = '#10b981';

    switch (name) {
        case 'glucose':
            if (value < 70) {
                status = 'low';
                message = 'Low glucose level';
                color = '#f59e0b';
            } else if (value <= 100) {
                status = 'normal';
                message = 'Normal glucose level';
                color = '#10b981';
            } else if (value <= 140) {
                status = 'elevated';
                message = 'Elevated glucose level';
                color = '#f59e0b';
            } else {
                status = 'high';
                message = 'High glucose level';
                color = '#ef4444';
            }
            break;

        case 'bmi':
            if (value < 18.5) {
                status = 'underweight';
                message = 'Underweight';
                color = '#f59e0b';
            } else if (value <= 24.9) {
                status = 'normal';
                message = 'Normal weight';
                color = '#10b981';
            } else if (value <= 29.9) {
                status = 'overweight';
                message = 'Overweight';
                color = '#f59e0b';
            } else {
                status = 'obese';
                message = 'Obese';
                color = '#ef4444';
            }
            break;

        case 'bloodpressure':
            if (value <= 80) {
                status = 'normal';
                message = 'Normal blood pressure';
                color = '#10b981';
            } else if (value <= 90) {
                status = 'elevated';
                message = 'Elevated blood pressure';
                color = '#f59e0b';
            } else {
                status = 'high';
                message = 'High blood pressure';
                color = '#ef4444';
            }
            break;

        case 'age':
            if (value < 30) {
                status = 'low-risk';
                message = 'Lower diabetes risk age';
                color = '#10b981';
            } else if (value < 45) {
                status = 'moderate-risk';
                message = 'Moderate diabetes risk age';
                color = '#f59e0b';
            } else {
                status = 'high-risk';
                message = 'Higher diabetes risk age';
                color = '#ef4444';
            }
            break;

        default:
            status = 'normal';
            message = 'Valid value';
            color = '#10b981';
    }

    indicator.innerHTML = `
        <div class="health-status ${status}" style="color: ${color};">
            <i class="fas fa-circle"></i>
            <span>${message}</span>
        </div>
    `;

    return true;
}

// BMI Calculator
function calculateBMI() {
    const height = parseFloat(document.getElementById('height').value);
    const weight = parseFloat(document.getElementById('weight').value);
    const resultDiv = document.getElementById('bmi-result');

    if (isNaN(height) || isNaN(weight) || height <= 0 || weight <= 0) {
        resultDiv.innerHTML = '<div class="error">Please enter valid height and weight values.</div>';
        return;
    }

    const bmi = (weight / ((height / 100) ** 2)).toFixed(1);
    let category, color;

    if (bmi < 18.5) {
        category = 'Underweight';
        color = '#f59e0b';
    } else if (bmi <= 24.9) {
        category = 'Normal weight';
        color = '#10b981';
    } else if (bmi <= 29.9) {
        category = 'Overweight';
        color = '#f59e0b';
    } else {
        category = 'Obese';
        color = '#ef4444';
    }

    resultDiv.innerHTML = `
        <div class="bmi-result-display">
            <h4>Your BMI Result</h4>
            <div class="bmi-value" style="color: ${color};">${bmi}</div>
            <div class="bmi-category" style="color: ${color};">${category}</div>
            <button class="btn-secondary" onclick="useBMIResult(${bmi})">Use This BMI</button>
        </div>
    `;
}

function useBMIResult(bmi) {
    document.getElementById('bmi').value = bmi;
    document.getElementById('bmi-modal').style.display = 'none';
    validateInput(document.getElementById('bmi'));
    showNotification('BMI value has been added to your form!', 'success');
}

// History management
function loadHistory() {
    fetch('/history')
        .then(response => response.json())
        .then(data => {
            displayHistory(data.history);
            updateHistoryStats(data.history);
        })
        .catch(error => {
            console.error('Error loading history:', error);
        });
}

function displayHistory(history) {
    const historyList = document.getElementById('history-list');
    
    if (history.length === 0) {
        historyList.innerHTML = `
            <div class="no-history">
                <i class="fas fa-clock"></i>
                <h3>No Assessment History</h3>
                <p>Your assessment history will appear here after completing evaluations</p>
                <button class="btn-primary" onclick="switchToSection('home')">
                    <i class="fas fa-play"></i>
                    Start First Assessment
                </button>
            </div>
        `;
        return;
    }

    historyList.innerHTML = history.map((item, index) => `
        <div class="history-item ${item.prediction === 1 ? 'high-risk' : 'low-risk'}">
            <div class="history-header">
                <div class="history-date">
                    <i class="fas fa-calendar"></i>
                    ${new Date(item.timestamp).toLocaleDateString()}
                    <span class="history-time">${new Date(item.timestamp).toLocaleTimeString()}</span>
                </div>
                <div class="history-risk">
                    <span class="risk-badge ${item.prediction === 1 ? 'high' : 'low'}">
                        ${item.prediction === 1 ? 'High Risk' : 'Low Risk'}
                    </span>
                    <span class="risk-percentage">${(item.probability * 100).toFixed(1)}%</span>
                </div>
            </div>
            <div class="history-details">
                <div class="history-metrics">
                    <div class="metric-item">
                        <span class="metric-label">BMI</span>
                        <span class="metric-value">${item.features.bmi}</span>
                    </div>
                    <div class="metric-item">
                        <span class="metric-label">Glucose</span>
                        <span class="metric-value">${item.features.glucose}</span>
                    </div>
                    <div class="metric-item">
                        <span class="metric-label">Age</span>
                        <span class="metric-value">${item.features.age}</span>
                    </div>
                    <div class="metric-item">
                        <span class="metric-label">BP</span>
                        <span class="metric-value">${item.features.bloodpressure}</span>
                    </div>
                </div>
                <div class="history-actions">
                    <button class="btn-secondary" onclick="viewHistoryDetails(${index})">
                        <i class="fas fa-eye"></i>
                        View Details
                    </button>
                    <button class="btn-secondary" onclick="useHistoryData(${index})">
                        <i class="fas fa-copy"></i>
                        Use This Data
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

function updateHistoryStats(history) {
    const totalAssessments = history.length;
    const highRiskCount = history.filter(item => item.prediction === 1).length;
    const avgRisk = history.length > 0 ? 
        (history.reduce((sum, item) => sum + item.probability, 0) / history.length * 100).toFixed(1) : 0;

    document.getElementById('total-assessments').textContent = totalAssessments;
    document.getElementById('high-risk-count').textContent = highRiskCount;
    document.getElementById('avg-risk').textContent = avgRisk + '%';
}

function clearHistory() {
    if (confirm('Are you sure you want to clear all assessment history?')) {
        fetch('/clear_history', {
            method: 'POST'
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                loadHistory();
                showNotification('History cleared successfully!', 'success');
            }
        })
        .catch(error => {
            console.error('Error clearing history:', error);
            showNotification('Error clearing history', 'error');
        });
    }
}

function exportHistory() {
    fetch('/history')
        .then(response => response.json())
        .then(data => {
            if (data.history.length === 0) {
                showNotification('No history data to export', 'info');
                return;
            }
            
            const csvContent = generateCSV(data.history);
            const blob = new Blob([csvContent], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `diabetes_assessment_history_${new Date().toISOString().split('T')[0]}.csv`;
            a.click();
            window.URL.revokeObjectURL(url);
            showNotification('History exported successfully!', 'success');
        })
        .catch(error => {
            console.error('Error exporting history:', error);
            showNotification('Error exporting history', 'error');
        });
}

function generateCSV(history) {
    const headers = ['Date', 'Time', 'Risk Level', 'Probability', 'BMI', 'Glucose', 'Blood Pressure', 'Age', 'Pregnancies', 'Skin Thickness', 'Insulin', 'DPF'];
    const rows = history.map(item => {
        const date = new Date(item.timestamp);
        return [
            date.toLocaleDateString(),
            date.toLocaleTimeString(),
            item.prediction === 1 ? 'High Risk' : 'Low Risk',
            (item.probability * 100).toFixed(1) + '%',
            item.features.bmi,
            item.features.glucose,
            item.features.bloodpressure,
            item.features.age,
            item.features.pregnancies,
            item.features.skinthickness,
            item.features.insulin,
            item.features.dpf
        ];
    });
    
    return [headers, ...rows].map(row => row.join(',')).join('\n');
}

function viewHistoryDetails(index) {
    fetch('/history')
        .then(response => response.json())
        .then(data => {
            const item = data.history[index];
            const modal = document.createElement('div');
            modal.className = 'modal';
            modal.innerHTML = `
                <div class="modal-content">
                    <div class="modal-header">
                        <h3><i class="fas fa-chart-line"></i> Assessment Details</h3>
                        <button class="modal-close" onclick="this.closest('.modal').remove()">&times;</button>
                    </div>
                    <div class="modal-body">
                        <div class="detail-overview">
                            <div class="detail-result ${item.prediction === 1 ? 'high-risk' : 'low-risk'}">
                                <h4>${item.prediction === 1 ? 'High Risk' : 'Low Risk'}</h4>
                                <p>Probability: ${(item.probability * 100).toFixed(1)}%</p>
                                <p>Date: ${new Date(item.timestamp).toLocaleString()}</p>
                            </div>
                            <div class="detail-metrics">
                                <h5>Health Parameters:</h5>
                                <div class="metrics-grid">
                                    <div class="metric-detail">
                                        <span>BMI:</span>
                                        <span>${item.features.bmi}</span>
                                    </div>
                                    <div class="metric-detail">
                                        <span>Glucose:</span>
                                        <span>${item.features.glucose} mg/dL</span>
                                    </div>
                                    <div class="metric-detail">
                                        <span>Blood Pressure:</span>
                                        <span>${item.features.bloodpressure} mmHg</span>
                                    </div>
                                    <div class="metric-detail">
                                        <span>Age:</span>
                                        <span>${item.features.age} years</span>
                                    </div>
                                    <div class="metric-detail">
                                        <span>Pregnancies:</span>
                                        <span>${item.features.pregnancies}</span>
                                    </div>
                                    <div class="metric-detail">
                                        <span>Skin Thickness:</span>
                                        <span>${item.features.skinthickness} mm</span>
                                    </div>
                                    <div class="metric-detail">
                                        <span>Insulin:</span>
                                        <span>${item.features.insulin} μU/mL</span>
                                    </div>
                                    <div class="metric-detail">
                                        <span>Family History:</span>
                                        <span>${item.features.dpf}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);
            modal.style.display = 'block';
        });
}

function useHistoryData(index) {
    fetch('/history')
        .then(response => response.json())
        .then(data => {
            const item = data.history[index];
            const features = item.features;
            
            // Fill form with historical data
            Object.entries(features).forEach(([key, value]) => {
                const input = document.getElementById(key);
                if (input) {
                    input.value = value;
                    validateInput(input);
                }
            });
            
            // Switch to home section
            switchToSection('home');
            showNotification('Historical data loaded into form!', 'success');
        });
}

// Quick health checker functions
function checkGlucose() {
    const glucose = parseFloat(document.getElementById('quick-glucose').value);
    if (isNaN(glucose) || glucose <= 0) {
        showNotification('Please enter a valid glucose value', 'error');
        return;
    }
    
    let result, color, recommendation;
    
    if (glucose < 70) {
        result = 'Low - Hypoglycemia';
        color = '#f59e0b';
        recommendation = 'Consume fast-acting carbs immediately. Contact healthcare provider.';
    } else if (glucose <= 100) {
        result = 'Normal';
        color = '#10b981';
        recommendation = 'Excellent! Maintain current lifestyle.';
    } else if (glucose <= 140) {
        result = 'Elevated - Pre-diabetes range';
        color = '#f59e0b';
        recommendation = 'Consider lifestyle changes. Monitor regularly.';
    } else {
        result = 'High - Diabetes range';
        color = '#ef4444';
        recommendation = 'Seek immediate medical attention. This may indicate diabetes.';
    }
    
    displayQuickResult('Glucose', glucose + ' mg/dL', result, color, recommendation);
}

function checkBMI() {
    const bmi = parseFloat(document.getElementById('quick-bmi').value);
    if (isNaN(bmi) || bmi <= 0) {
        showNotification('Please enter a valid BMI value', 'error');
        return;
    }
    
    let result, color, recommendation;
    
    if (bmi < 18.5) {
        result = 'Underweight';
        color = '#f59e0b';
        recommendation = 'Consider gaining weight through healthy eating and exercise.';
    } else if (bmi <= 24.9) {
        result = 'Normal weight';
        color = '#10b981';
        recommendation = 'Great! Maintain current weight through healthy lifestyle.';
    } else if (bmi <= 29.9) {
        result = 'Overweight';
        color = '#f59e0b';
        recommendation = 'Consider weight loss through diet and exercise.';
    } else {
        result = 'Obese';
        color = '#ef4444';
        recommendation = 'Weight loss is important. Consult healthcare provider for guidance.';
    }
    
    displayQuickResult('BMI', bmi.toFixed(1), result, color, recommendation);
}

function displayQuickResult(type, value, result, color, recommendation) {
    const quickResults = document.getElementById('quick-results');
    quickResults.innerHTML = `
        <div class="quick-result-card" style="border-left-color: ${color};">
            <div class="quick-result-header">
                <h4 style="color: ${color};">${type} Result</h4>
                <span class="quick-value">${value}</span>
            </div>
            <div class="quick-result-status" style="color: ${color};">
                ${result}
            </div>
            <div class="quick-recommendation">
                ${recommendation}
            </div>
        </div>
    `;
}

// Enhanced result display with risk factors
function displayResult(data) {
    const resultContainer = document.getElementById('result');
    
    if (!data.success) {
        showError(data.error || 'An error occurred during prediction');
        return;
    }
    
    const probability = (data.probability * 100).toFixed(1);
    const confidence = ((data.confidence || 0.5) * 100).toFixed(1);
    const confidenceLevel = data.confidence_level || 'Medium';
    const isPositive = data.prediction === 1;
    const riskLevel = getRiskLevel(probability, isPositive);
    
    resultContainer.innerHTML = `
        <div class="result-card ${isPositive ? 'positive' : 'negative'}">
            <div class="result-header">
                <div class="result-icon">
                    <i class="fas ${isPositive ? 'fa-exclamation-triangle' : 'fa-check-circle'}"></i>
                </div>
                <div class="result-info">
                    <h3 class="result-title">
                        ${isPositive ? 'Diabetes Risk Detected' : 'Low Diabetes Risk'}
                    </h3>
                    <p class="result-subtitle">${riskLevel}</p>
                </div>
            </div>
            
            <div class="result-metrics">
                <div class="metrics-row">
                    <div class="metric">
                        <span class="metric-label">Risk Probability</span>
                        <span class="metric-value">${probability}%</span>
                    </div>
                    <div class="metric">
                        <span class="metric-label">Confidence Level</span>
                        <span class="metric-value confidence-${confidenceLevel.toLowerCase()}">${confidenceLevel} (${confidence}%)</span>
                    </div>
                </div>
                <div class="probability-bar">
                    <div class="probability-fill" style="width: ${probability}%"></div>
                </div>
                <div class="confidence-bar">
                    <div class="confidence-fill" style="width: ${confidence}%"></div>
                </div>
            </div>
            
            ${data.prediction_details ? `
                <div class="prediction-details">
                    <div class="detail-item">
                        <span class="detail-label">Risk Category:</span>
                        <span class="detail-value">${data.prediction_details.risk_category}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Medical Priority:</span>
                        <span class="detail-value priority-${data.prediction_details.medical_priority.includes('URGENT') ? 'urgent' : data.prediction_details.medical_priority.includes('HIGH') ? 'high' : 'normal'}">${data.prediction_details.medical_priority}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Model Accuracy:</span>
                        <span class="detail-value">${(data.prediction_details.model_accuracy * 100).toFixed(1)}%</span>
                    </div>
                </div>
            ` : ''}
            
            ${data.feature_importance && data.feature_importance.length > 0 ? `
                <div class="feature-importance">
                    <h4><i class="fas fa-chart-bar"></i> Most Important Factors</h4>
                    <div class="importance-list">
                        ${data.feature_importance.slice(0, 5).map(feature => `
                            <div class="importance-item">
                                <span class="feature-name">${feature.feature}</span>
                                <span class="feature-value">${feature.value}</span>
                                <div class="importance-bar">
                                    <div class="importance-fill ${feature.impact}" style="width: ${(feature.importance * 100).toFixed(1)}%"></div>
                                </div>
                                <span class="importance-score">${(feature.importance * 100).toFixed(1)}%</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            ` : ''}
            
            ${data.risk_factors && data.risk_factors.length > 0 ? `
                <div class="risk-factors">
                    <h4><i class="fas fa-exclamation-triangle"></i> Key Risk Factors</h4>
                    <div class="risk-factors-list">
                        ${data.risk_factors.map(factor => `
                            <div class="risk-factor-item ${factor.level}">
                                <span class="factor-name">${factor.factor}</span>
                                <span class="factor-value">${factor.value}</span>
                                <span class="factor-desc">${factor.description}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            ` : ''}
            
            <div class="result-recommendations">
                <h4><i class="fas fa-medical-kit"></i> ${isPositive ? 'Immediate Actions' : 'Preventive Measures'}</h4>
                <ul>
                    ${(data.recommendations || getRecommendations(isPositive, probability)).map(rec => `<li>${rec}</li>`).join('')}
                </ul>
            </div>

            <div class="result-actions">
                <button class="btn-primary" onclick="switchToSection('results')">
                    <i class="fas fa-chart-line"></i>
                    View Detailed Results
                </button>
                <button class="btn-secondary" onclick="switchToSection('history')">
                    <i class="fas fa-history"></i>
                    View History
                </button>
                <button class="btn-secondary" onclick="generateReport()">
                    <i class="fas fa-file-medical"></i>
                    Generate Report
                </button>
                <button class="btn-secondary" onclick="shareResults()">
                    <i class="fas fa-share-alt"></i>
                    Share Results
                </button>
            </div>
        </div>
    `;
    
    resultContainer.style.display = 'block';
    resultContainer.scrollIntoView({ behavior: 'smooth' });
    
    // Reload history to show new entry
    loadHistory();
}

// Professional Report Functions
function generateReport() {
    const reportModal = document.getElementById('report-modal');
    const reportContent = document.getElementById('report-content');
    
    // Show modal with loading state
    reportModal.style.display = 'block';
    reportContent.innerHTML = `
        <div class="report-loading">
            <div class="spinner"></div>
            <p>Generating comprehensive health report...</p>
        </div>
    `;
    
    // Generate report
    fetch('/generate_report', {
        method: 'POST'
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            displayReport(data.report);
        } else {
            reportContent.innerHTML = `
                <div class="error-message">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>Unable to generate report: ${data.error}</p>
                </div>
            `;
        }
    })
    .catch(error => {
        console.error('Error generating report:', error);
        reportContent.innerHTML = `
            <div class="error-message">
                <i class="fas fa-exclamation-triangle"></i>
                <p>Error generating report. Please try again.</p>
            </div>
        `;
    });
}

function displayReport(report) {
    const reportContent = document.getElementById('report-content');
    
    reportContent.innerHTML = `
        <div class="professional-report">
            <div class="report-header">
                <h2>Health Assessment Report</h2>
                <p class="report-date">Generated: ${new Date().toLocaleDateString()}</p>
            </div>
            
            <div class="report-section">
                <h3><i class="fas fa-user"></i> Patient Summary</h3>
                <div class="summary-grid">
                    <div class="summary-item">
                        <span class="label">Age:</span>
                        <span class="value">${report.patient_summary.age} years</span>
                    </div>
                    <div class="summary-item">
                        <span class="label">BMI:</span>
                        <span class="value">${report.patient_summary.bmi} (${report.patient_summary.bmi_category})</span>
                    </div>
                    <div class="summary-item">
                        <span class="label">Glucose:</span>
                        <span class="value">${report.patient_summary.glucose_level} mg/dL (${report.patient_summary.glucose_status})</span>
                    </div>
                    <div class="summary-item">
                        <span class="label">Blood Pressure:</span>
                        <span class="value">${report.patient_summary.blood_pressure} mmHg (${report.patient_summary.bp_status})</span>
                    </div>
                </div>
            </div>
            
            <div class="report-section">
                <h3><i class="fas fa-exclamation-triangle"></i> Risk Assessment</h3>
                <div class="risk-assessment">
                    <div class="risk-level ${report.risk_assessment.prediction === 'High Risk' ? 'high' : 'low'}">
                        <h4>${report.risk_assessment.prediction}</h4>
                        <p class="probability">${report.risk_assessment.probability}</p>
                        <p class="category">${report.risk_assessment.risk_category}</p>
                    </div>
                    <div class="medical-priority">
                        <h5>Medical Priority:</h5>
                        <p>${report.risk_assessment.medical_priority}</p>
                    </div>
                </div>
            </div>
            
            <div class="report-section">
                <h3><i class="fas fa-clipboard-list"></i> Health Metrics</h3>
                <div class="metrics-grid">
                    <div class="metric-item">
                        <span class="label">Insulin Level:</span>
                        <span class="value">${report.health_metrics.insulin_level} μU/mL</span>
                    </div>
                    <div class="metric-item">
                        <span class="label">Skin Thickness:</span>
                        <span class="value">${report.health_metrics.skin_thickness} mm</span>
                    </div>
                    <div class="metric-item">
                        <span class="label">Pregnancies:</span>
                        <span class="value">${report.health_metrics.pregnancies}</span>
                    </div>
                    <div class="metric-item">
                        <span class="label">Family History:</span>
                        <span class="value">${report.health_metrics.family_history_score}</span>
                    </div>
                </div>
            </div>
            
            <div class="report-section">
                <h3><i class="fas fa-medical-kit"></i> Recommendations</h3>
                <div class="recommendations-list">
                    ${report.recommendations.map((rec, index) => `
                        <div class="recommendation-item">
                            <span class="rec-number">${index + 1}</span>
                            <span class="rec-text">${rec}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
            
            <div class="report-section">
                <h3><i class="fas fa-tasks"></i> Next Steps</h3>
                <div class="next-steps-list">
                    ${report.next_steps.map((step, index) => `
                        <div class="step-item">
                            <span class="step-number">${index + 1}</span>
                            <span class="step-text">${step}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
            
            <div class="report-section">
                <h3><i class="fas fa-heart"></i> Lifestyle Advice</h3>
                <div class="lifestyle-advice">
                    ${report.lifestyle_advice.map(advice => `
                        <div class="advice-item">
                            <i class="fas fa-check-circle"></i>
                            <span>${advice}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
            
            <div class="report-disclaimer">
                <h4><i class="fas fa-exclamation-triangle"></i> Important Disclaimer</h4>
                <p>This report is for educational purposes only and should not be used for medical diagnosis. Always consult healthcare professionals for proper medical advice and diabetes screening.</p>
            </div>
        </div>
    `;
}

function closeReportModal() {
    document.getElementById('report-modal').style.display = 'none';
}

function exportReport() {
    fetch('/export_report', {
        method: 'POST'
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Create downloadable file
            const blob = new Blob([data.report], { type: 'text/plain' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = data.filename;
            a.click();
            window.URL.revokeObjectURL(url);
            showNotification('Report exported successfully!', 'success');
        } else {
            showNotification('Error exporting report: ' + data.error, 'error');
        }
    })
    .catch(error => {
        console.error('Error exporting report:', error);
        showNotification('Error exporting report', 'error');
    });
}

function printReport() {
    const reportContent = document.getElementById('report-content');
    const printWindow = window.open('', '_blank');
    
    printWindow.document.write(`
        <html>
            <head>
                <title>Diabetes Assessment Report</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; }
                    .professional-report { max-width: 800px; margin: 0 auto; }
                    .report-header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px; }
                    .report-section { margin-bottom: 30px; }
                    .report-section h3 { color: #333; border-bottom: 1px solid #ccc; padding-bottom: 10px; }
                    .summary-grid, .metrics-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; margin: 15px 0; }
                    .summary-item, .metric-item { display: flex; justify-content: space-between; padding: 8px; background: #f5f5f5; border-radius: 4px; }
                    .label { font-weight: bold; }
                    .risk-level { text-align: center; padding: 20px; border-radius: 8px; margin: 15px 0; }
                    .risk-level.high { background: #fee2e2; color: #dc2626; }
                    .risk-level.low { background: #dcfce7; color: #16a34a; }
                    .recommendation-item, .step-item, .advice-item { margin: 10px 0; padding: 10px; background: #f9f9f9; border-left: 4px solid #667eea; }
                    .report-disclaimer { background: #fef3c7; padding: 15px; border-radius: 8px; margin-top: 30px; }
                    @media print { body { margin: 0; } }
                </style>
            </head>
            <body>
                ${reportContent.innerHTML}
            </body>
        </html>
    `);
    
    printWindow.document.close();
    printWindow.print();
}

// Close modal when clicking outside
window.addEventListener('click', function(event) {
    const modal = document.getElementById('bmi-modal');
    if (event.target === modal) {
        modal.style.display = 'none';
    }
});

// Navigation function for switching between sections
function switchToSection(sectionId) {
    // Remove active class from all nav links and sections
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('.section');
    
    navLinks.forEach(link => link.classList.remove('active'));
    sections.forEach(section => section.classList.remove('active'));
    
    // Add active class to corresponding nav link
    const navLink = document.querySelector(`a[href="#${sectionId}"]`);
    if (navLink) {
        navLink.classList.add('active');
    }
    
    // Show corresponding section
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.classList.add('active');
    }
}

// Show notification function
function showNotification(message, type = 'info') {
    // Remove existing notification
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // Create notification
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-triangle' : 'fa-info-circle'}"></i>
            <span>${message}</span>
        </div>
        <button class="notification-close" onclick="this.parentElement.remove()">×</button>
    `;
    
    // Add to page
    document.body.appendChild(notification);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 5000);
}

// Share results function
function shareResults() {
    const resultData = getCurrentResultData();
    if (!resultData) {
        showNotification('No results to share. Please complete an assessment first.', 'error');
        return;
    }
    
    const shareText = `My Diabetes Risk Assessment Results:\n\n` +
        `Risk Level: ${resultData.risk_level}\n` +
        `Prediction: ${resultData.prediction}\n` +
        `Confidence: ${resultData.confidence}%\n\n` +
        `Assessed by DiabetesCheck AI - Advanced Machine Learning Health Assessment`;
    
    // Try to use Web Share API if available
    if (navigator.share) {
        navigator.share({
            title: 'Diabetes Risk Assessment Results',
            text: shareText,
            url: window.location.href
        }).catch(err => {
            console.log('Error sharing:', err);
            fallbackShare(shareText);
        });
    } else {
        fallbackShare(shareText);
    }
}

// Fallback share function
function fallbackShare(text) {
    // Copy to clipboard
    navigator.clipboard.writeText(text).then(() => {
        showNotification('Results copied to clipboard!', 'success');
    }).catch(() => {
        // Create a modal with the text to copy
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.style.display = 'block';
        modal.innerHTML = `
            <div class="modal-content">
                <span class="modal-close" onclick="this.closest('.modal').remove()">&times;</span>
                <h3>Share Your Results</h3>
                <textarea readonly style="width: 100%; height: 200px; margin: 10px 0; padding: 10px; font-family: monospace;">${text}</textarea>
                <button class="btn-primary" onclick="this.previousElementSibling.select(); document.execCommand('copy'); this.textContent='Copied!'; setTimeout(() => this.textContent='Copy Text', 2000);">Copy Text</button>
            </div>
        `;
        document.body.appendChild(modal);
    });
}

// Get current result data for sharing
function getCurrentResultData() {
    // Try to get from the most recent result or current session
    const history = JSON.parse(localStorage.getItem('predictionHistory') || '[]');
    return history.length > 0 ? history[history.length - 1] : null;
}
