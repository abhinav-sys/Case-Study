# 🐳 Docker Deployment Guide (FREE Tier)

Quick guide to deploy your Real Estate Chatbot using Docker on free hosting platforms.

## 🚀 Option 1: Railway (Recommended - Easiest)

**Free Tier:** $5 credit/month (usually enough for small projects)

### Prerequisites
- GitHub account
- Railway account (sign up at https://railway.app)

### Step-by-Step:

#### 1. Set Up MongoDB

**Option A: Use Railway's MongoDB (Recommended)**
1. In Railway dashboard, click "+ New"
2. Select "Database" → "Add MongoDB"
3. Railway creates MongoDB automatically
4. Click on the MongoDB service → "Variables" tab
5. Copy the `MONGO_URL` (you'll need this)

**Option B: Use MongoDB Atlas (Free Forever)**
1. Go to https://www.mongodb.com/cloud/atlas
2. Create free account and cluster
3. Get connection string
4. Use this as your `MONGODB_URI`

#### 2. Deploy ML Service

1. In Railway, click "+ New" → "GitHub Repo"
2. Select your repository
3. Railway will show "Configure Service"
4. Set:
   - **Name:** `realestate-ml-service`
   - **Root Directory:** `backend`
   - **Dockerfile Path:** `Dockerfile.ml.cloud`
   - **Docker Context:** `.` (root directory)
5. Click "Deploy"
6. Wait for deployment (2-3 minutes)
7. Copy the service URL (e.g., `ml-service-production.up.railway.app`)

#### 3. Deploy Backend Service

1. Click "+ New" → "GitHub Repo"
2. Select your repository
3. Set:
   - **Name:** `realestate-backend`
   - **Root Directory:** `backend`
   - **Dockerfile Path:** `Dockerfile.cloud`
   - **Docker Context:** `.` (root directory)
4. Go to "Variables" tab, add:
   ```
   PORT=5000
   MONGODB_URI=<your MongoDB connection string>
   ML_SERVICE_URL=https://<your-ml-service-url>
   NODE_ENV=production
   ```
5. Click "Deploy"
6. Copy the service URL

#### 4. Deploy Frontend

1. Click "+ New" → "GitHub Repo"
2. Select your repository
3. Set:
   - **Name:** `realestate-frontend`
   - **Root Directory:** `frontend`
   - Railway will auto-detect it's a React app
4. Go to "Variables" tab, add:
   ```
   REACT_APP_API_URL=https://<your-backend-url>
   ```
5. Click "Deploy"
6. Your app will be live at the provided URL!

### 🎉 You're Done!

Your app is now live! Share the frontend URL with anyone.

---

## 🚀 Option 2: Render (FREE - Services Sleep After Inactivity)

**Free Tier:** Services sleep after 15 min inactivity (wake up on first request)

### Prerequisites
- GitHub account
- Render account (sign up at https://render.com)

### Step-by-Step:

#### 1. Set Up MongoDB

**Use MongoDB Atlas (Recommended)**
- Go to https://www.mongodb.com/cloud/atlas
- Create free account and cluster
- Get connection string

#### 2. Deploy Using render.yaml (Easiest)

1. **Push render.yaml to GitHub** (already created in your repo)

2. **In Render Dashboard:**
   - Click "New" → "Blueprint"
   - Connect your GitHub repository
   - Render will detect `render.yaml`
   - Click "Apply"

3. **Set Environment Variables:**
   - Go to each service → "Environment"
   - Set `MONGODB_URI` for backend service
   - Render will auto-set `ML_SERVICE_URL` and `REACT_APP_API_URL`

4. **Deploy:**
   - Render will deploy all 3 services automatically
   - Wait 5-10 minutes for first deployment

#### 3. Manual Deployment (Alternative)

If `render.yaml` doesn't work, deploy services manually:

**ML Service:**
- New → Web Service
- Connect GitHub repo
- Root Directory: `backend`
- Environment: `Docker`
- Dockerfile Path: `backend/Dockerfile.ml.cloud`
- Docker Context: `.`

**Backend:**
- New → Web Service
- Connect GitHub repo
- Root Directory: `backend`
- Environment: `Docker`
- Dockerfile Path: `backend/Dockerfile.cloud`
- Docker Context: `.`
- Environment Variables:
  - `MONGODB_URI=<your MongoDB URI>`
  - `ML_SERVICE_URL=<your ML service URL>`

**Frontend:**
- New → Static Site
- Connect GitHub repo
- Root Directory: `frontend`
- Build Command: `npm install && npm run build`
- Publish Directory: `build`
- Environment Variable:
  - `REACT_APP_API_URL=<your backend URL>`

### ⚠️ Important Notes for Render:

- **Free tier services sleep** after 15 minutes of inactivity
- First request after sleep takes ~30 seconds (cold start)
- Perfect for demos/showcases, not ideal for production

---

## 🔧 Troubleshooting

### Build Fails

**Error: "Cannot find data directory"**
- Make sure you're using `Dockerfile.cloud` and `Dockerfile.ml.cloud`
- Docker context should be `.` (root directory), not `./backend`

**Error: "Model file not found"**
- Verify `complex_price_model_v2.pkl` exists in `backend/` directory
- Check it's committed to GitHub

### Services Can't Connect

**Backend can't reach ML Service:**
- Use the full URL (including `https://`)
- Check service URLs in Railway/Render dashboard
- Verify environment variables are set correctly

**Frontend can't reach Backend:**
- Check CORS settings in `backend/server.js`
- Verify `REACT_APP_API_URL` is set correctly
- Use full URL with `https://`

### MongoDB Connection Issues

- Verify connection string is correct
- For MongoDB Atlas: Check IP whitelist (add `0.0.0.0/0` for all IPs)
- For Railway MongoDB: Use the `MONGO_URL` from Railway dashboard

---

## 📝 Environment Variables Checklist

### ML Service
- `PORT=8000` (usually auto-set)

### Backend Service
- `PORT=5000` (usually auto-set)
- `MONGODB_URI=<your MongoDB connection string>`
- `ML_SERVICE_URL=<https://your-ml-service-url>`
- `NODE_ENV=production`
- `OPENAI_API_KEY=<optional, for NLP features>`

### Frontend
- `REACT_APP_API_URL=<https://your-backend-url>`

---

## 🎯 Quick Test After Deployment

1. **Test ML Service:**
   - Visit: `https://your-ml-service-url/health`
   - Should return: `{"status":"healthy"}`

2. **Test Backend:**
   - Visit: `https://your-backend-url/api/health`
   - Should return: `{"status":"ok"}`

3. **Test Frontend:**
   - Visit your frontend URL
   - Try searching for properties
   - Check browser console for errors

---

## 💡 Pro Tips

1. **Use MongoDB Atlas** instead of Railway's MongoDB for better reliability
2. **Set up custom domains** (Railway and Render support this)
3. **Monitor usage** - Free tiers have limits
4. **Use environment variables** - Never hardcode URLs or secrets
5. **Check logs** regularly in Railway/Render dashboard

---

## 🆘 Need Help?

- Railway Docs: https://docs.railway.app
- Render Docs: https://render.com/docs
- Check service logs in dashboard
- Verify all environment variables are set

---

**Your app should now be live and accessible to anyone! 🎉**
