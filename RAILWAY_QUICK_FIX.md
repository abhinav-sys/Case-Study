# ⚡ Railway Quick Fix - Copy These Settings

## 🎯 The Problem
Railway is using the wrong Dockerfile for each service. Fix it in 2 minutes:

## ✅ Fix Each Service (Do This Now)

### 1️⃣ ML Service (realestate-ml-service)
**Settings → Build & Deploy:**
```
Root Directory: backend
Dockerfile Path: Dockerfile.ml.cloud  
Docker Context: .
```

### 2️⃣ Backend Service (realestate-backend)
**Settings → Build & Deploy:**
```
Root Directory: backend
Dockerfile Path: Dockerfile.cloud
Docker Context: .
```

### 3️⃣ Frontend Service (realestate-frontend)
**Settings → Build & Deploy:**
```
Root Directory: frontend
Dockerfile Path: Dockerfile
Docker Context: (leave blank)
```

## 📸 Where to Find Settings

1. Click on the service name (e.g., `realestate-ml-service`)
2. Click **"Settings"** tab (top right)
3. Scroll down to **"Build & Deploy"** section
4. Update the three fields above
5. Click **"Save"**
6. Click **"Redeploy"** button

## ✅ After Fixing

All services should build successfully! 

**Check:**
- ✅ Build logs show "Build succeeded"
- ✅ Service shows "Active" status
- ✅ You get a Railway URL (e.g., `realestate-frontend-production.up.railway.app`)

## 🆘 Still Failing?

**Check Environment Variables:**
- Backend needs: `MONGODB_URI`, `ML_SERVICE_URL`, `NODE_ENV=production`
- Frontend needs: `REACT_APP_API_URL`
- ML Service: Usually no env vars needed

**Check Build Logs:**
- Look for red error messages
- Common: "file not found" = wrong Dockerfile path
- Common: "module not found" = missing dependencies
