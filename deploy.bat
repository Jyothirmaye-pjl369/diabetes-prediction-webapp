@echo off
echo 🚀 Diabetes Prediction App Deployment Helper
echo =============================================

REM Check if Python is installed
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Python is not installed. Please install Python 3.7+ first.
    pause
    exit /b 1
)

echo ✅ Python is installed

REM Install dependencies
echo 📦 Installing Python dependencies...
pip install -r requirements.txt

REM Create production files
echo 🔧 Creating production files...

REM Create Procfile for Heroku
echo web: python app.py > Procfile

REM Create runtime.txt for Heroku
echo python-3.11.0 > runtime.txt

REM Create .gitignore if it doesn't exist
if not exist .gitignore (
    echo # Python > .gitignore
    echo __pycache__/ >> .gitignore
    echo *.py[cod] >> .gitignore
    echo venv/ >> .gitignore
    echo .venv/ >> .gitignore
    echo .env >> .gitignore
    echo *.log >> .gitignore
)

echo ✅ Production files created!

echo.
echo 🌐 Deployment Options:
echo ======================
echo.
echo 1. 🚀 Render (Recommended):
echo    - Push your code to GitHub
echo    - Connect GitHub repo to Render
echo    - Deploy as Web Service
echo    - Build Command: pip install -r requirements.txt
echo    - Start Command: python app.py
echo.
echo 2. 🟣 Heroku:
echo    - heroku create your-app-name
echo    - git push heroku main
echo.
echo 3. 🔵 Railway:
echo    - Connect GitHub repo to Railway
echo    - Deploy automatically
echo.

echo 📝 Git Setup:
echo ==============
echo.
echo Run these commands to set up Git:
echo git init
echo git add .
echo git commit -m "Initial commit: Diabetes Prediction ML App"
echo git branch -M main
echo git remote add origin https://github.com/yourusername/diabetes-prediction.git
echo git push -u origin main
echo.

echo ✅ Deployment preparation complete!
echo 📱 Your app is ready for production deployment!
echo.
echo 🎉 Good luck with your deployment!
pause
