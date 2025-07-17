#!/bin/bash

# Diabetes Prediction App Deployment Script
# This script helps deploy the app to various platforms

echo "🚀 Diabetes Prediction App Deployment Helper"
echo "============================================="

# Check if Python is installed
if ! command -v python &> /dev/null; then
    echo "❌ Python is not installed. Please install Python 3.7+ first."
    exit 1
fi

# Check if git is installed
if ! command -v git &> /dev/null; then
    echo "❌ Git is not installed. Please install Git first."
    exit 1
fi

echo "✅ Python and Git are installed"

# Install dependencies
echo "📦 Installing Python dependencies..."
pip install -r requirements.txt

# Create production-ready files
echo "🔧 Creating production files..."

# Create Procfile for Heroku
cat > Procfile << EOF
web: python app.py
EOF

# Create runtime.txt for Heroku
cat > runtime.txt << EOF
python-3.11.0
EOF

# Create .gitignore if it doesn't exist
if [ ! -f .gitignore ]; then
    cat > .gitignore << EOF
# Python
__pycache__/
*.py[cod]
*$py.class
*.so
.Python
build/
develop-eggs/
dist/
downloads/
eggs/
.eggs/
lib/
lib64/
parts/
sdist/
var/
wheels/
pip-wheel-metadata/
share/python-wheels/
*.egg-info/
.installed.cfg
*.egg
MANIFEST

# Virtual Environment
venv/
.venv/
env/
ENV/

# IDE
.vscode/
.idea/
*.swp
*.swo
*~

# OS
.DS_Store
Thumbs.db

# Logs
*.log

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Model files (optional - uncomment if you don't want to commit trained models)
# *.pkl
EOF
fi

# Update app.py for production
echo "⚙️  Updating app.py for production..."
cat >> app.py << 'EOF'

# Production configuration
if __name__ == '__main__':
    import os
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False)
EOF

echo "✅ Production files created!"

# Display deployment options
echo ""
echo "🌐 Deployment Options:"
echo "======================"
echo ""
echo "1. 🚀 Render (Recommended):"
echo "   - Push your code to GitHub"
echo "   - Connect GitHub repo to Render"
echo "   - Deploy as Web Service"
echo "   - Build Command: pip install -r requirements.txt"
echo "   - Start Command: python app.py"
echo ""
echo "2. 🟣 Heroku:"
echo "   - heroku create your-app-name"
echo "   - git push heroku main"
echo ""
echo "3. 🔵 Railway:"
echo "   - Connect GitHub repo to Railway"
echo "   - Deploy automatically"
echo ""
echo "4. 🟢 Vercel:"
echo "   - vercel --prod"
echo ""
echo "5. 🌊 Netlify:"
echo "   - Build command: pip install -r requirements.txt"
echo "   - Publish directory: ."
echo ""

# Git setup
echo "📝 Git Setup:"
echo "=============="
echo ""
echo "Run these commands to set up Git:"
echo "git init"
echo "git add ."
echo "git commit -m 'Initial commit: Diabetes Prediction ML App'"
echo "git branch -M main"
echo "git remote add origin https://github.com/yourusername/diabetes-prediction.git"
echo "git push -u origin main"
echo ""

echo "✅ Deployment preparation complete!"
echo "📱 Your app is ready for production deployment!"
echo ""
echo "🔗 Don't forget to:"
echo "   - Update the GitHub repository URL above"
echo "   - Set environment variables if needed"
echo "   - Test the app locally before deploying"
echo "   - Add your domain to CORS settings if needed"
echo ""
echo "🎉 Good luck with your deployment!"
