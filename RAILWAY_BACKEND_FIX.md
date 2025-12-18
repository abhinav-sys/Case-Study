# 🔧 Fix Backend Service on Railway

## Current Error
```
Railpack could not determine how to build the app
```

## ✅ Solution: Switch to Dockerfile

### Step-by-Step:

1. **Go to Railway Dashboard**
   - Click on `realestate-backend` service

2. **Open Settings Tab**
   - Click "Settings" (top right)

3. **Source Section:**
   - Find "Root Directory"
   - Change from `backend` to `.` (just a dot)
   - This sets build context to repo root

4. **Build Section:**
   - Find "Builder"
   - Change from `Railpack` to `Dockerfile`
   - After changing, you'll see "Dockerfile Path" field appear
   - Set "Dockerfile Path" to: `backend/Dockerfile.cloud`

5. **Deploy Section:**
   - "Start Command": Leave empty (or `node server.js`)
   - "Healthcheck Path": `/api/health`

6. **Variables Section:**
   Click "Variables" tab and add:
   ```
   PORT=5000
   MONGODB_URI=<your MongoDB Atlas connection string>
   ML_SERVICE_URL=https://realestate-ml-service-production.up.railway.app
   NODE_ENV=production
   ```

7. **Save and Deploy:**
   - Click "Update" at bottom of Settings page
   - Go to Deployments tab
   - Click "Redeploy"

## ✅ Expected Result

After fixing:
- ✅ Build uses Dockerfile (not Railpack)
- ✅ Build succeeds
- ✅ Service starts with Node.js
- ✅ Healthcheck passes at `/api/health`

## 📝 Settings Summary

```
Root Directory: .
Builder: Dockerfile
Dockerfile Path: backend/Dockerfile.cloud
Start Command: (empty or node server.js)
Healthcheck Path: /api/health
```
