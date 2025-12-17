# 🚨 Railway Deployment Fix - Step by Step

Your services are failing because Railway is using the wrong Dockerfiles. Follow these steps:

## 🔴 Problem
Railway is auto-detecting `backend/Dockerfile` for ALL services, but:
- **ML Service** needs Python (not Node.js)
- **Backend** needs correct build context
- **Frontend** needs its own Dockerfile

## ✅ Solution: Configure Each Service Correctly

### Step 1: Fix ML Service (realestate-ml-service)

1. **Go to Railway Dashboard** → Click `realestate-ml-service`
2. **Settings Tab** → Scroll to "Build & Deploy"
3. **Set these values:**
   - **Root Directory:** `backend`
   - **Dockerfile Path:** `Dockerfile.ml.cloud`
   - **Docker Context:** `.` (dot = root of repo)
4. **Save** and **Redeploy**

### Step 2: Fix Backend Service (realestate-backend)

1. **Go to Railway Dashboard** → Click `realestate-backend`
2. **Settings Tab** → Scroll to "Build & Deploy"
3. **Set these values:**
   - **Root Directory:** `backend`
   - **Dockerfile Path:** `Dockerfile.cloud`
   - **Docker Context:** `.` (dot = root of repo)
4. **Save** and **Redeploy**

### Step 3: Fix Frontend Service (realestate-frontend)

1. **Go to Railway Dashboard** → Click `realestate-frontend`
2. **Settings Tab** → Scroll to "Build & Deploy"
3. **Set these values:**
   - **Root Directory:** `frontend`
   - **Dockerfile Path:** `Dockerfile` (or leave blank if auto-detected)
   - **Docker Context:** Leave blank (default)
4. **Save** and **Redeploy**

## 📝 Visual Guide

### ML Service Settings:
```
Root Directory: backend
Dockerfile Path: Dockerfile.ml.cloud
Docker Context: .
```

### Backend Service Settings:
```
Root Directory: backend
Dockerfile Path: Dockerfile.cloud
Docker Context: .
```

### Frontend Service Settings:
```
Root Directory: frontend
Dockerfile Path: Dockerfile
Docker Context: (leave blank)
```

## ⚠️ Important Notes

1. **Docker Context = `.`** means Railway builds from the repository root
2. **Root Directory** tells Railway which folder contains the service code
3. **Dockerfile Path** is relative to the Root Directory

## ✅ After Fixing

All three services should:
- ✅ Build successfully
- ✅ Deploy without errors
- ✅ Be accessible via their Railway URLs

## 🆘 If Still Failing

Check the build logs again. Common issues:
- **Missing data files** → Make sure `data/` folder is in repo root
- **Missing model file** → Verify `backend/complex_price_model_v2.pkl` exists
- **Environment variables** → Set `MONGODB_URI`, `ML_SERVICE_URL`, etc.
