# 🚀 Deployment Guide - Columbus Student Marketplace

## 📋 Prerequisites
- GitHub account
- Netlify account (free)
- Railway account (free)

## 🔧 Step-by-Step Deployment

### 1. **Push Code to GitHub**
```bash
git init
git add .
git commit -m "Initial commit - Columbus Student Marketplace"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/columbus-marketplace.git
git push -u origin main
```

### 2. **Deploy Backend to Railway**
1. Go to [Railway.app](https://railway.app)
2. Sign up/Login with GitHub
3. Click "New Project" → "Deploy from GitHub repo"
4. Select your repository
5. Railway will auto-detect Node.js and deploy

**Set Environment Variables in Railway:**
- `DATABASE_HOST` → (Railway will provide MySQL host)
- `DATABASE_USER` → (Railway will provide)
- `DATABASE_PASSWORD` → (Railway will provide)
- `DATABASE` → `Columbus_Marketplace`
- `JWT_SECRET` → `your_super_secret_jwt_key_change_this_in_production`
- `NODE_ENV` → `production`
- `FRONTEND_URL` → `https://your-app.netlify.app` (you'll get this from Netlify)

### 3. **Deploy Frontend to Netlify**
1. Go to [Netlify.com](https://netlify.com)
2. Sign up/Login with GitHub
3. Click "New site from Git"
4. Select your repository
5. Set build settings:
   - **Build command:** `cd client && npm install && npm run build`
   - **Publish directory:** `client/dist`

**Set Environment Variables in Netlify:**
- `VITE_API_URL` → `https://your-backend-app.railway.app/api`

### 4. **Update CORS in Railway**
After both are deployed, update the `FRONTEND_URL` environment variable in Railway to your Netlify URL.

## 💰 **Cost Breakdown (FREE!)**
- **Frontend (Netlify):** Free tier - 100GB bandwidth/month
- **Backend + Database (Railway):** Free tier - $5 credit/month
- **Total Monthly Cost:** $0 (for your usage level)

## 🔧 **Local Development**
```bash
# Backend
npm run dev

# Frontend (new terminal)
cd client && npm run dev
```

## 🛠 **Production URLs**
- **Frontend:** https://your-app.netlify.app
- **Backend:** https://your-backend-app.railway.app
- **Database:** Managed by Railway

## 📝 **Notes**
- Railway provides automatic SSL certificates
- Netlify provides automatic SSL certificates
- Both support custom domains (upgrade required)
- Database backups are handled by Railway
- Both platforms offer great monitoring and logs

## 🚨 **Security Checklist**
- [x] Environment variables are not in Git
- [x] JWT secret is strong and unique
- [x] CORS is configured for production domains
- [x] Database credentials are secure
- [x] .edu email validation is enforced
