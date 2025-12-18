# 🔧 Fix Frontend Service on Railway

## Current Error
```
Railpack: No start command was found
```

## ✅ Solution: Switch to Dockerfile

### Step-by-Step:

1. **Go to Railway Dashboard**
   - Click on `realestate-frontend` service

2. **Open Settings Tab**
   - Click "Settings" (top right)

3. **Source Section:**
   - Find "Root Directory"
   - Set to: `frontend`

4. **Build Section:**
   - Find "Builder"
   - Change from `Railpack` to `Dockerfile`
   - After changing, you'll see "Dockerfile Path" field appear
   - Set "Dockerfile Path" to: `Dockerfile` (or leave blank if auto-detected)

5. **Deploy Section:**
   - "Start Command": Leave empty (Dockerfile has CMD)
   - "Healthcheck Path": Leave empty (or `/`)

6. **Variables Section:**
   Click "Variables" tab and add:
   ```
   REACT_APP_API_URL=https://realestate-backend-production-9542.up.railway.app
   ```
   (Use your actual backend URL from Railway)

7. **Save and Deploy:**
   - Click "Update" at bottom of Settings page
   - Go to Deployments tab
   - Click "Redeploy"

## ✅ Expected Result

After fixing:
- ✅ Build uses Dockerfile (not Railpack)
- ✅ Build succeeds (React app builds, then nginx serves it)
- ✅ Service starts with nginx
- ✅ Frontend accessible at Railway URL

## 📝 Settings Summary

```
Root Directory: frontend
Builder: Dockerfile
Dockerfile Path: Dockerfile
Start Command: (empty - uses Dockerfile CMD)
REACT_APP_API_URL: https://your-backend-url.up.railway.app
```

## 🎯 After Frontend is Live

Your app will be accessible at:
- **Frontend:** `https://realestate-frontend-production.up.railway.app`
- **Backend:** `https://realestate-backend-production-9542.up.railway.app`
- **ML Service:** `https://realestate-ml-service-production.up.railway.app`

Share the frontend URL with anyone! 🎉
