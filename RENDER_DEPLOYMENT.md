# 🚀 Render Deployment Guide

## Step-by-Step Deployment Instructions

### 1. **Prepare Your Repository**
Your project is already configured for Render deployment with:
- ✅ `requirements.txt` with proper versions
- ✅ `Procfile` configured for gunicorn
- ✅ `render.yaml` for automated deployment
- ✅ `runtime.txt` specifying Python version
- ✅ Production-ready Flask configuration

### 2. **Deploy on Render**

#### Option A: Using Render Dashboard (Recommended)

1. **Sign Up/Login to Render**
   - Go to [https://render.com](https://render.com)
   - Sign up or login with your GitHub account

2. **Create New Web Service**
   - Click "New +" in the top right
   - Select "Web Service"
   - Choose "Build and deploy from a Git repository"

3. **Connect Your Repository**
   - Connect your GitHub account if not already connected
   - Select your repository: `diabetes-prediction-webapp`
   - Click "Connect"

4. **Configure Deployment Settings**
   ```
   Name: diabetes-prediction-app
   Environment: Python 3
   Region: Choose your preferred region
   Branch: main
   Build Command: pip install -r requirements.txt
   Start Command: gunicorn app_simple:app
   ```

5. **Set Environment Variables**
   - Add environment variable:
     - Key: `FLASK_ENV`
     - Value: `production`
   - Render will automatically generate a `SECRET_KEY`

6. **Deploy**
   - Click "Create Web Service"
   - Wait for deployment to complete (5-10 minutes)

#### Option B: Using render.yaml (Automated)

1. **Infrastructure as Code**
   - Your project includes `render.yaml`
   - This allows for automated deployment
   - Simply push changes to trigger deployments

### 3. **Verify Deployment**

Once deployed, your app will be available at:
```
https://diabetes-prediction-app.onrender.com
```

### 4. **Post-Deployment Testing**

Test the following features:
- ✅ Main page loads correctly
- ✅ Form submission works
- ✅ Prediction results display
- ✅ Dark mode toggle
- ✅ History functionality
- ✅ Export features

### 5. **Monitoring & Maintenance**

#### Render Dashboard Features:
- **Logs**: View application logs
- **Metrics**: Monitor performance
- **Auto-deploy**: Automatic deployments on git push
- **Custom Domain**: Add your own domain
- **SSL**: Automatic HTTPS

#### Health Checks:
- Render automatically monitors your app
- Health check endpoint: `/` (home page)
- Auto-restart on failures

### 6. **Environment Variables**

Configure these in Render Dashboard:
```
FLASK_ENV=production
SECRET_KEY=<auto-generated-by-render>
```

### 7. **Scaling Options**

#### Free Tier:
- 512 MB RAM
- 0.1 CPU
- Sleeps after 15 minutes of inactivity
- 750 hours/month

#### Paid Plans:
- More RAM and CPU
- No sleep mode
- Custom domains
- Priority support

### 8. **Common Issues & Solutions**

#### Build Failures:
```bash
# Check requirements.txt format
# Ensure all dependencies are listed
# Verify Python version compatibility
```

#### Runtime Errors:
```bash
# Check application logs in Render dashboard
# Verify environment variables
# Test locally first
```

#### Performance Issues:
```bash
# Monitor memory usage
# Optimize model loading
# Consider upgrading plan
```

### 9. **Custom Domain Setup**

1. **Purchase Domain** (optional)
2. **Configure DNS** in Render
3. **Add Custom Domain** in dashboard
4. **SSL Certificate** (automatic)

### 10. **Continuous Deployment**

Every push to `main` branch will:
1. Trigger automatic rebuild
2. Run tests (if configured)
3. Deploy new version
4. Zero-downtime deployment

## 🔗 Useful Links

- **Render Documentation**: https://render.com/docs
- **Python Deployment Guide**: https://render.com/docs/deploy-flask
- **Your App URL**: https://diabetes-prediction-app.onrender.com (after deployment)

## 📞 Support

If you encounter issues:
1. Check Render logs
2. Review this guide
3. Contact Render support
4. Check GitHub issues

---

**🎉 Your diabetes prediction app will be live and accessible worldwide after deployment!**
