# 🔧 Force Railway to Use Correct Dockerfile

## 🔴 Problem
Railway is auto-detecting `backend/Dockerfile` (Node.js) instead of `backend/Dockerfile.ml.cloud` (Python).

## ✅ Solution 1: Verify Settings Are Saved

1. **Go to ML Service Settings**
2. **Source Section:**
   - Root Directory: `.` (repo root)
3. **Build Section:**
   - Builder: `Dockerfile` (NOT Railpack)
   - **Dockerfile Path:** Make sure it says `backend/Dockerfile.ml.cloud` (exact path)
4. **Click "Update" or "Save"**
5. **Verify it saved** - refresh page and check if setting is still there

## ✅ Solution 2: Temporary Workaround (If Settings Don't Work)

If Railway still ignores the Dockerfile Path setting, temporarily rename the regular Dockerfile:

1. **In your local repo:**
   ```bash
   # Rename the regular Dockerfile so Railway can't auto-detect it
   git mv backend/Dockerfile backend/Dockerfile.backend
   git commit -m "Rename Dockerfile to prevent auto-detection"
   git push
   ```

2. **This forces Railway to use the Dockerfile Path you specified**

3. **After ML service works, you can rename it back if needed**

## ✅ Solution 3: Use Railway Config File (Recommended)

Create `railway.json` in repo root to explicitly control builds:

```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "DOCKERFILE",
    "dockerfilePath": "backend/Dockerfile.ml.cloud"
  }
}
```

But Railway might not read this per-service. Better to ensure settings are saved correctly.

## 🎯 Most Likely Issue

The **Dockerfile Path** setting might not be saving. Try:

1. Set Root Directory to `.`
2. Set Builder to `Dockerfile`
3. **Type the Dockerfile Path manually:** `backend/Dockerfile.ml.cloud`
4. **Click "Update"** (not just Save)
5. **Wait for confirmation message**
6. **Refresh the page** and verify the setting is still there
7. **Redeploy**

If it still doesn't work, use Solution 2 (rename Dockerfile temporarily).
