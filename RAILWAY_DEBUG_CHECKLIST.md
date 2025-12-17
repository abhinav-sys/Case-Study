# 🔍 Railway Debug Checklist

## ✅ Step 1: Verify Settings Were Applied

For EACH service, check if settings were saved:

### ML Service (realestate-ml-service)
1. Click on `realestate-ml-service`
2. Go to **Settings** tab
3. Scroll to **"Build & Deploy"** section
4. **Verify these exact values:**
   - ✅ Root Directory: `backend`
   - ✅ Dockerfile Path: `Dockerfile.ml.cloud`
   - ✅ Docker Context: `.` (just a dot)

### Backend Service (realestate-backend)
1. Click on `realestate-backend`
2. Go to **Settings** tab
3. Scroll to **"Build & Deploy"** section
4. **Verify these exact values:**
   - ✅ Root Directory: `backend`
   - ✅ Dockerfile Path: `Dockerfile.cloud`
   - ✅ Docker Context: `.` (just a dot)

### Frontend Service (realestate-frontend)
1. Click on `realestate-frontend`
2. Go to **Settings** tab
3. Scroll to **"Build & Deploy"** section
4. **Verify these exact values:**
   - ✅ Root Directory: `frontend`
   - ✅ Dockerfile Path: `Dockerfile`
   - ✅ Docker Context: (should be empty/blank)

## ✅ Step 2: Get Latest Build Logs

**For EACH failed service:**

1. Click on the service name
2. Click **"Deploy Logs"** tab (NOT Build Logs)
3. Scroll to the **BOTTOM** (most recent)
4. Look for the **FIRST RED ERROR** message
5. Copy the error and share it

## ✅ Step 3: Check if Settings Were Saved

**Common Issue:** Settings might not have been saved!

After updating settings:
1. Click **"Save"** button (bottom of settings page)
2. You should see a confirmation message
3. Then click **"Redeploy"** button (top right of service page)

## ✅ Step 4: Force Redeploy

If settings are correct but still failing:

1. Go to each service
2. Click **"..."** menu (three dots, top right)
3. Select **"Redeploy"**
4. Wait for new build to start
5. Check new build logs

## 🆘 Common Issues

### Issue 1: "Dockerfile not found"
**Fix:** Make sure Dockerfile Path is correct:
- ML: `Dockerfile.ml.cloud` (not `Dockerfile.ml`)
- Backend: `Dockerfile.cloud` (not `Dockerfile`)

### Issue 2: "routes not found"
**Fix:** Docker Context must be `.` (dot) for backend and ML services

### Issue 3: "Module not found"
**Fix:** Check if `package.json` or `requirements.txt` exists in the root directory

### Issue 4: Settings not saving
**Fix:** 
- Make sure you click "Save" after changing settings
- Refresh the page and verify settings are still there
- Try clearing browser cache

## 📝 What to Share

If still failing, share:
1. ✅ Screenshot of Settings → Build & Deploy for ONE service
2. ✅ Latest error from Deploy Logs (the FIRST red error, not the last line)
3. ✅ Which service is failing (or all three?)
