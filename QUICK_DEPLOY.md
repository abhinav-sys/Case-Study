# 🚀 Quick Deploy to Railway (Get Live Link in 10 Minutes)

Follow these simple steps to get your app live:

## Step 1: Sign Up for Railway (2 minutes)

1. Go to https://railway.app
2. Click "Start a New Project"
3. Sign up with your GitHub account
4. Authorize Railway to access your repositories

## Step 2: Set Up MongoDB Atlas (3 minutes)

1. Go to https://www.mongodb.com/cloud/atlas
2. Sign up for free account
3. Create a free cluster (M0)
4. Create a database user:
   - Go to "Database Access" → "Add New Database User"
   - Username: `realestate-user`
   - Password: (save this!)
5. Whitelist IP:
   - Go to "Network Access" → "Add IP Address"
   - Click "Allow Access from Anywhere" (0.0.0.0/0)
6. Get connection string:
   - Go to "Clusters" → Click "Connect"
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your password
   - Example: `mongodb+srv://realestate-user:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/realestate-chatbot?retryWrites=true&w=majority`

## Step 3: Deploy ML Service (2 minutes)

1. In Railway dashboard, click **"+ New"** → **"GitHub Repo"**
2. Select your repository: `abhinav-sys/Case-Study`
3. Railway will show configuration:
   - **Name:** `realestate-ml-service`
   - **Root Directory:** `backend`
   - **Dockerfile Path:** `Dockerfile.ml.cloud`
   - **Docker Context:** `.` (dot, meaning root directory)
4. Click **"Deploy"**
5. Wait 2-3 minutes for deployment
6. **Copy the service URL** (e.g., `ml-service-production.up.railway.app`)

## Step 4: Deploy Backend Service (2 minutes)

1. Click **"+ New"** → **"GitHub Repo"**
2. Select your repository again
3. Configuration:
   - **Name:** `realestate-backend`
   - **Root Directory:** `backend`
   - **Dockerfile Path:** `Dockerfile.cloud`
   - **Docker Context:** `.`
4. Go to **"Variables"** tab, add these:
   ```
   PORT=5000
   MONGODB_URI=<paste your MongoDB Atlas connection string>
   ML_SERVICE_URL=https://<paste your ML service URL>
   NODE_ENV=production
   ```
5. Click **"Deploy"**
6. Wait 2-3 minutes
7. **Copy the backend URL**

## Step 5: Deploy Frontend (1 minute)

1. Click **"+ New"** → **"GitHub Repo"**
2. Select your repository
3. Railway will auto-detect React app
4. Configuration:
   - **Name:** `realestate-frontend`
   - **Root Directory:** `frontend`
5. Go to **"Variables"** tab, add:
   ```
   REACT_APP_API_URL=https://<paste your backend URL>
   ```
6. Click **"Deploy"**
7. Wait 2-3 minutes
8. **🎉 Your app is live!** Copy the frontend URL

## ✅ Test Your Deployment

1. Visit your frontend URL
2. Try searching: "Show me 3 bedroom apartments in New York"
3. Check if properties load with price predictions
4. Try saving a property

## 🆘 Troubleshooting

**Services won't start:**
- Check logs in Railway dashboard
- Verify environment variables are set correctly
- Make sure URLs use `https://` not `http://`

**Frontend can't connect to backend:**
- Verify `REACT_APP_API_URL` is set correctly
- Check backend logs for CORS errors
- Make sure backend URL includes `https://`

**MongoDB connection fails:**
- Verify connection string is correct
- Check MongoDB Atlas IP whitelist
- Make sure password doesn't have special characters (or URL-encode them)

## 📝 Your Live URLs

After deployment, you'll have:
- **Frontend:** `https://realestate-frontend-production.up.railway.app`
- **Backend:** `https://realestate-backend-production.up.railway.app`
- **ML Service:** `https://ml-service-production.up.railway.app`

**Share the frontend URL with anyone!** 🎉
