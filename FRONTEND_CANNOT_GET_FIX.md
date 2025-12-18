# 🔧 Fix "Cannot GET" Error on Frontend

## Problem
You're seeing "Cannot GET" error when accessing the frontend URL, but deploy logs show Nginx is running successfully.

## Root Cause
This usually means:
- ✅ Nginx container is running
- ❌ React build files are missing or not copied correctly
- ❌ Build may have failed silently

## ✅ Solution: Check BUILD Logs

### Step 1: View BUILD Logs (Not Deploy Logs)

1. **Go to Railway Dashboard**
   - Click on `realestate-frontend` service

2. **Open the Latest Deployment**
   - Click on the deployment (e.g., `6c952e4b`)

3. **Click "Build Logs" Tab** (NOT "Deploy Logs")
   - This shows if `npm run build` succeeded
   - Look for errors during the build stage

4. **What to Look For:**
   ```
   ✅ Good: "Build verification: Files in /app/build:" followed by file list
   ✅ Good: "Nginx html directory contents:" followed by index.html
   ❌ Bad: "ERROR: Build directory not found!"
   ❌ Bad: "ERROR: index.html not found in build!"
   ❌ Bad: Any npm build errors
   ```

### Step 2: Verify Railway Settings

Go to **Settings** tab and verify:

```
Root Directory: frontend
Builder: Dockerfile
Dockerfile Path: Dockerfile
Start Command: (empty)
```

### Step 3: Common Issues & Fixes

#### Issue A: Build Failed (Missing Dependencies)
**Symptoms:** Build logs show npm errors
**Fix:** 
- Check if all dependencies are in `package.json`
- Verify `npm install` completed successfully in build logs

#### Issue B: Build Output Not Copied
**Symptoms:** Build succeeds but files missing in nginx
**Fix:**
- Verify Dockerfile has the verification steps (already added)
- Check build logs for "Build verification" messages

#### Issue C: Wrong Build Context
**Symptoms:** COPY commands fail in build logs
**Fix:**
- Ensure Root Directory is set to `frontend` (not `.` or empty)
- Ensure Dockerfile Path is `Dockerfile` (relative to Root Directory)

### Step 4: Force Rebuild

If build logs look good but still getting "Cannot GET":

1. **Go to Deployments tab**
2. **Click "Redeploy"** (or create new deployment)
3. **Watch BUILD logs** (not deploy logs) during rebuild
4. **Check for verification messages:**
   ```
   Build verification: Files in /app/build:
   Nginx html directory contents:
   ```

### Step 5: Test Locally (Optional)

To verify Dockerfile works:

```bash
cd frontend
docker build -t frontend-test .
docker run -p 8080:80 frontend-test
# Visit http://localhost:8080
# Should see your React app, not "Cannot GET"
```

## 🎯 Expected Build Log Output

After the fix, you should see in **BUILD logs**:

```
Step 8/12 : RUN npm run build
...
Creating an optimized production build...
Compiled successfully!

Step 9/12 : RUN ls -la /app/build || (echo "ERROR: Build directory not found!" && exit 1)
total 1234
-rw-r--r--    1 root     root      1234 Dec 18 04:19 index.html
drwxr-xr-x    2 root     root      4096 Dec 18 04:19 static
...

Step 10/12 : RUN ls -la /app/build/index.html || (echo "ERROR: index.html not found in build!" && exit 1)
-rw-r--r--    1 root     root      1234 Dec 18 04:19 index.html

Build verification: Files in /app/build:
index.html
static/
...

Step 15/12 : RUN ls -la /usr/share/nginx/html/ || (echo "ERROR: Files not copied to nginx!" && exit 1)
total 1234
-rw-r--r--    1 root     root      1234 Dec 18 04:19 index.html
drwxr-xr-x    2 root     root      4096 Dec 18 04:19 static
```

## 📝 Quick Checklist

- [ ] Checked BUILD logs (not deploy logs)
- [ ] Build completed without errors
- [ ] "Build verification" messages appear in build logs
- [ ] Root Directory = `frontend`
- [ ] Builder = `Dockerfile`
- [ ] Dockerfile Path = `Dockerfile`
- [ ] Redeployed after fixing settings

## 🆘 Still Not Working?

If build logs show everything is correct but still getting "Cannot GET":

1. **Check HTTP Logs** in Railway:
   - Go to "HTTP Logs" tab
   - See what requests are being made
   - Check if 404 errors appear

2. **Verify Nginx Config:**
   - The `nginx.conf` should have `root /usr/share/nginx/html;`
   - And `index index.html;`

3. **Check Environment Variables:**
   - Ensure `REACT_APP_API_URL` is set (if needed)
   - But this shouldn't cause "Cannot GET" - that's a build issue

4. **Contact Support:**
   - Share the BUILD logs (not deploy logs)
   - Share your Railway settings screenshot
