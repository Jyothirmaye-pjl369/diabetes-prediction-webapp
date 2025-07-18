# 🚀 Deployment Guide - Diabetes Prediction Web App

## 📋 Prerequisites
- GitHub account
- Render account (free tier available)
- Git installed locally

## 🎯 Quick Deployment Steps

### 1. GitHub Repository
✅ **Already Complete!** Your code is at:
```
https://github.com/Jyothirmaye-pjl369/diabetes-prediction-webapp.git
```

### 2. Deploy to Render

#### Option A: Direct GitHub Integration (Recommended)
1. **Visit Render Dashboard**: Go to [render.com](https://render.com) and log in
2. **Create New Web Service**: Click "New" → "Web Service"
3. **Connect Repository**: 
   - Select "Build and deploy from a Git repository"
   - Connect your GitHub account if needed
   - Choose `diabetes-prediction-webapp` repository
4. **Configure Service**:
   - **Name**: `diabetes-prediction-app` (or your preferred name)
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `gunicorn app_simple:app --bind 0.0.0.0:$PORT --workers 1 --timeout 120`
   - **Instance Type**: `Free` (for testing) or `Starter` (for production)

#### Option B: Using render.yaml (Automatic)
1. Push the `render.yaml` file (already in your repo)
2. Render will automatically detect and use the configuration

### 3. Environment Variables (Optional)
Set these in Render dashboard if needed:
- `FLASK_ENV=production`
- `SECRET_KEY=your-secret-key-here` (optional, app has default)

### 4. Custom Domain (Optional)
- In Render dashboard, go to Settings → Custom Domains
- Add your domain name
- Update DNS records as instructed

## 🔧 Configuration Files Overview

### `requirements.txt`
```
flask>=2.0.0
flask-cors>=3.0.0
pandas>=1.3.0
numpy>=1.21.0
scikit-learn>=1.0.0
matplotlib>=3.5.0
seaborn>=0.11.0
plotly>=5.0.0
gunicorn>=20.1.0
```

### `Procfile`
```
web: gunicorn app_simple:app --bind 0.0.0.0:$PORT
```

### `render.yaml`
```yaml
services:
  - type: web
    name: diabetes-prediction-app
    env: python
    plan: free
    buildCommand: pip install -r requirements.txt
    startCommand: gunicorn app_simple:app --bind 0.0.0.0:$PORT --workers 1 --timeout 120
```

## 🧪 Testing Deployment

### Health Check Endpoints
- **Main App**: `https://your-app.onrender.com/`
- **Health Check**: `https://your-app.onrender.com/health_check`
- **Test Route**: `https://your-app.onrender.com/test`
- **Visualizations**: `https://your-app.onrender.com/visualizations`

### API Endpoints to Test
```bash
# Health check
curl https://your-app.onrender.com/health_check

# Feature importance
curl https://your-app.onrender.com/api/feature_importance

# Feature distribution
curl https://your-app.onrender.com/api/feature_distribution

# Outcome analysis
curl https://your-app.onrender.com/api/outcome_analysis

# Model comparison
curl https://your-app.onrender.com/api/model_comparison
```

## 🚨 Troubleshooting

### Common Issues and Solutions

#### 1. Build Failures
- **Issue**: Package installation errors
- **Solution**: Check `requirements.txt` versions, ensure compatibility

#### 2. App Won't Start
- **Issue**: Import errors or missing dependencies
- **Solution**: Check logs in Render dashboard, verify all imports

#### 3. Model Loading Issues
- **Issue**: Model files not found
- **Solution**: App uses rule-based model (no external files needed)

#### 4. Memory Issues
- **Issue**: App crashes due to memory limits
- **Solution**: Upgrade to Starter plan ($7/month) for more resources

### Checking Logs
1. Go to Render dashboard
2. Select your service
3. Click "Logs" tab
4. Monitor real-time logs for errors

## 🎯 Key Features Deployed

### ✅ User Input Only
- No dataset dependency
- Medical rule-based predictions
- Real-time health tips

### ✅ Interactive Visualizations
- Feature importance charts
- Outcome analysis graphs
- Model comparison metrics
- Responsive Chart.js integration

### ✅ Comprehensive Health Insights
- Risk factor analysis
- Personalized recommendations
- Professional medical reports
- Prediction history tracking

### ✅ Production Ready
- Gunicorn WSGI server
- Error handling
- Health check endpoints
- CORS enabled for API access

## 🔄 Continuous Deployment

### Automatic Updates
- Push changes to `main` branch
- Render automatically rebuilds and deploys
- Zero-downtime deployments

### Manual Deployment
```bash
# Update code
git add .
git commit -m "Your update message"
git push origin main

# Render automatically detects and deploys
```

## 📊 Monitoring

### Built-in Monitoring
- Render provides metrics dashboard
- Monitor response times, memory usage
- Set up alerts for downtime

### Custom Health Checks
The app includes health check endpoint:
```json
{
  "status": "healthy",
  "message": "Diabetes Prediction App is running",
  "model_accuracy": 75.0,
  "timestamp": "2025-07-17T..."
}
```

## 🌐 Post-Deployment

### 1. Test All Features
- [ ] Main prediction form
- [ ] Visualization page
- [ ] Health reports
- [ ] API endpoints
- [ ] Mobile responsiveness

### 2. Share Your App
- Production URL: `https://your-app-name.onrender.com`
- GitHub Repository: `https://github.com/Jyothirmaye-pjl369/diabetes-prediction-webapp`

### 3. Optional Enhancements
- Custom domain setup
- SSL certificate (automatic with Render)
- Database integration (if needed)
- Authentication system
- Email notifications

## 📞 Support

### Resources
- **Render Documentation**: [docs.render.com](https://docs.render.com)
- **Flask Documentation**: [flask.palletsprojects.com](https://flask.palletsprojects.com)
- **Project Repository**: [GitHub Issues](https://github.com/Jyothirmaye-pjl369/diabetes-prediction-webapp/issues)

### Need Help?
1. Check logs in Render dashboard
2. Review `TROUBLESHOOTING.md` in repository
3. Test locally first: `python app_simple.py`
4. Verify all dependencies in `requirements.txt`

---

**🎉 Congratulations!** Your diabetes prediction app is now ready for production deployment with user-input-only predictions, interactive visualizations, and comprehensive health insights!
