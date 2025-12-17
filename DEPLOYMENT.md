# 🚀 Deployment Guide

This guide provides step-by-step instructions for deploying the Real Estate Chatbot application.

## Prerequisites

- GitHub account
- MongoDB Atlas account (or local MongoDB)
- Vercel/Netlify account (for frontend)
- Heroku/Railway/Render account (for backend) - Optional
- OpenAI API key (optional, for NLP features)

## Deployment Options

> **🐳 Quick Docker Deployment?** See [DEPLOYMENT_DOCKER.md](./DEPLOYMENT_DOCKER.md) for step-by-step guide to deploy with Docker on Railway or Render (FREE tiers available).

### Option 1: Railway (Recommended for Docker - FREE Tier Available) 🐳

**Best for:** Full-stack Docker Compose deployments  
**Free Tier:** $5 credit/month (enough for small projects)  
**Pros:** Easy Docker Compose support, automatic HTTPS, MongoDB included

#### Step-by-Step Deployment:

1. **Sign up for Railway**
   - Go to https://railway.app
   - Sign up with GitHub (free tier available)

2. **Create New Project**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Connect your GitHub account
   - Select your repository (`abhinav-sys/Case-Study`)

3. **Add MongoDB Service**
   - In your Railway project, click "+ New"
   - Select "Database" → "Add MongoDB"
   - Railway will automatically create a MongoDB instance
   - Copy the `MONGO_URL` connection string (you'll need this)

4. **Deploy with Docker Compose**
   - Railway will detect `docker-compose.yml` automatically
   - However, Railway doesn't support full docker-compose with multiple services
   - **Alternative: Deploy services separately** (recommended approach)

#### Recommended: Deploy Services Separately on Railway

Since Railway works better with individual services, here's the approach:

**A. Deploy MongoDB (or use Railway's MongoDB service)**
- Use the MongoDB service from step 3 above

**B. Deploy ML Service**
- Click "+ New" → "GitHub Repo"
- Select your repo
- Railway will detect it's a Python service
- Set root directory to `/backend`
- Add environment variable: `PORT=8000`
- Railway will auto-detect and build from `Dockerfile.ml`

**C. Deploy Backend Service**
- Click "+ New" → "GitHub Repo"
- Select your repo
- Set root directory to `/backend`
- Add environment variables:
  ```
  PORT=5000
  MONGODB_URI=<from MongoDB service>
  ML_SERVICE_URL=<from ML service URL>
  NODE_ENV=production
  ```
- Railway will auto-detect and build from `Dockerfile`

**D. Deploy Frontend**
- Click "+ New" → "GitHub Repo"
- Select your repo
- Set root directory to `/frontend`
- Add environment variable:
  ```
  REACT_APP_API_URL=<your backend service URL>
  ```
- Railway will auto-detect and build from `Dockerfile`

5. **Get Your URLs**
   - Each service gets a unique URL (e.g., `your-app.up.railway.app`)
   - Update frontend's `REACT_APP_API_URL` with backend URL
   - Update backend's `ML_SERVICE_URL` with ML service URL

6. **Set Custom Domains (Optional)**
   - Railway provides free `.railway.app` domains
   - You can add custom domains in settings

---

### Option 2: Render (FREE Tier - Services Sleep After Inactivity) 🐳

**Best for:** Docker deployments with free tier  
**Free Tier:** Services sleep after 15 minutes of inactivity (wake up on first request)  
**Pros:** Free tier, Docker support, easy setup

#### Step-by-Step Deployment:

1. **Sign up for Render**
   - Go to https://render.com
   - Sign up with GitHub (free tier available)

2. **Deploy MongoDB (or use MongoDB Atlas)**
   - **Option A:** Use MongoDB Atlas (recommended - always available)
   - **Option B:** Deploy MongoDB as a service on Render
     - New → Web Service
     - Use Docker image: `mongo:7`
     - Add environment: `MONGO_INITDB_DATABASE=realestate-chatbot`

3. **Deploy ML Service**
   - New → Web Service
   - Connect your GitHub repo
   - Set:
     - **Name:** `realestate-ml-service`
     - **Root Directory:** `backend`
     - **Environment:** `Docker`
     - **Dockerfile Path:** `backend/Dockerfile.ml`
   - Add environment variable: `PORT=8000`

4. **Deploy Backend Service**
   - New → Web Service
   - Connect your GitHub repo
   - Set:
     - **Name:** `realestate-backend`
     - **Root Directory:** `backend`
     - **Environment:** `Docker`
     - **Dockerfile Path:** `backend/Dockerfile`
   - Add environment variables:
     ```
     PORT=5000
     MONGODB_URI=<your MongoDB connection string>
     ML_SERVICE_URL=<your ML service URL>
     NODE_ENV=production
     ```

5. **Deploy Frontend**
   - New → Static Site
   - Connect your GitHub repo
   - Set:
     - **Root Directory:** `frontend`
     - **Build Command:** `npm install && npm run build`
     - **Publish Directory:** `build`
   - Add environment variable:
     ```
     REACT_APP_API_URL=<your backend service URL>
     ```

6. **Get Your URLs**
   - Each service gets a URL like `your-service.onrender.com`
   - Update environment variables with the correct URLs

**Note:** Free tier services on Render sleep after 15 minutes of inactivity. First request after sleep takes ~30 seconds to wake up.

---

### Option 3: Fly.io (FREE Tier Available) 🐳

**Best for:** Docker deployments with global edge network  
**Free Tier:** 3 shared-cpu VMs, 3GB persistent volumes  
**Pros:** Fast global network, good Docker support

#### Quick Setup:

1. **Install Fly CLI**
   ```bash
   # Windows (PowerShell)
   powershell -Command "iwr https://fly.io/install.ps1 -useb | iex"
   
   # Mac/Linux
   curl -L https://fly.io/install.sh | sh
   ```

2. **Sign up and Login**
   ```bash
   fly auth signup
   fly auth login
   ```

3. **Deploy Services**
   - Fly.io works best with individual `fly.toml` files per service
   - You can deploy each service separately
   - See Fly.io docs for multi-service deployments

---

### Option 4: Vercel (Separate Services - No Docker Compose)

#### Backend Deployment on Vercel

1. **Prepare Backend**
   ```bash
   cd backend
   ```

2. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

3. **Create vercel.json** (if not exists)
   ```json
   {
     "version": 2,
     "builds": [
       {
         "src": "server.js",
         "use": "@vercel/node"
       }
     ],
     "routes": [
       {
         "src": "/(.*)",
         "dest": "server.js"
       }
     ]
   }
   ```

4. **Deploy**
   ```bash
   vercel
   vercel --prod
   ```

5. **Set Environment Variables in Vercel Dashboard**
   - Go to your project settings
   - Add environment variables:
     - `MONGODB_URI`
     - `OPENAI_API_KEY` (optional)
     - `PORT` (optional, Vercel sets this automatically)

#### Frontend Deployment on Vercel

1. **Update API URL** (if backend is on different domain)
   - Update `frontend/package.json` proxy or use environment variable
   - Or update axios base URL in components

2. **Deploy**
   ```bash
   cd frontend
   vercel
   vercel --prod
   ```

### Option 2: GitHub Pages (Frontend Only)

1. **Install gh-pages**
   ```bash
   cd frontend
   npm install --save-dev gh-pages
   ```

2. **Update package.json**
   ```json
   {
     "homepage": "https://yourusername.github.io/real-estate-chatbot",
     "scripts": {
       "predeploy": "npm run build",
       "deploy": "gh-pages -d build"
     }
   }
   ```

3. **Update API URL**
   - Create `.env.production` file:
     ```
     REACT_APP_API_URL=https://your-backend-url.vercel.app
     ```

4. **Deploy**
   ```bash
   npm run deploy
   ```

### Option 3: Heroku (Backend)

1. **Install Heroku CLI**
   ```bash
   # Download from https://devcenter.heroku.com/articles/heroku-cli
   ```

2. **Prepare Backend**
   ```bash
   cd backend
   ```

3. **Create Procfile**
   ```
   web: node server.js
   ```

4. **Deploy**
   ```bash
   heroku create your-app-name
   heroku config:set MONGODB_URI=your_mongodb_uri
   heroku config:set OPENAI_API_KEY=your_openai_key  # Optional
   git push heroku main
   ```

### Option 4: Netlify (Frontend)

1. **Build Frontend**
   ```bash
   cd frontend
   npm run build
   ```

2. **Deploy via Netlify Dashboard**
   - Drag and drop the `build` folder
   - Or connect GitHub repository

3. **Set Environment Variables**
   - In Netlify dashboard, go to Site settings > Environment variables
   - Add `REACT_APP_API_URL`

## MongoDB Setup

### MongoDB Atlas (Cloud - Recommended)

1. **Create Account**
   - Go to https://www.mongodb.com/cloud/atlas
   - Sign up for free account

2. **Create Cluster**
   - Click "Build a Database"
   - Choose free tier (M0)
   - Select region closest to you

3. **Create Database User**
   - Go to Database Access
   - Add new database user
   - Save username and password

4. **Whitelist IP Address**
   - Go to Network Access
   - Add IP address (0.0.0.0/0 for all IPs - development only)

5. **Get Connection String**
   - Go to Clusters
   - Click "Connect"
   - Choose "Connect your application"
   - Copy connection string
   - Replace `<password>` with your password

6. **Update Environment Variable**
   ```
   MONGODB_URI=your_mongodb_atlas_connection_string_here
   ```

### Local MongoDB

1. **Install MongoDB**
   - Download from https://www.mongodb.com/try/download/community

2. **Start MongoDB**
   ```bash
   # Windows
   mongod

   # macOS
   brew services start mongodb-community

   # Linux
   sudo systemctl start mongod
   ```

3. **Connection String**
   ```
   MONGODB_URI=mongodb://localhost:27017/realestate-chatbot
   ```

## Environment Variables

### Backend (.env)
```env
PORT=5000
MONGODB_URI=your_mongodb_atlas_connection_string_here
OPENAI_API_KEY=sk-...  # Optional
```

### Frontend (.env.production)
```env
REACT_APP_API_URL=https://your-backend-url.vercel.app
```

## Post-Deployment Checklist

- [ ] Backend is accessible and returns health check
- [ ] MongoDB connection is working
- [ ] Frontend can communicate with backend
- [ ] CORS is properly configured
- [ ] Environment variables are set correctly
- [ ] Properties are loading correctly
- [ ] Saved properties feature works
- [ ] Chatbot is responding
- [ ] Mobile responsive design works

## Troubleshooting

### CORS Errors
- Ensure backend CORS is configured to allow frontend domain
- Update `cors` middleware in `server.js` if needed

### MongoDB Connection Issues
- Verify connection string is correct
- Check IP whitelist in MongoDB Atlas
- Verify database user credentials

### API Not Responding
- Check backend logs
- Verify environment variables
- Ensure port is correct

### Frontend Build Errors
- Clear `node_modules` and reinstall
- Check for missing dependencies
- Verify Node.js version compatibility

## Production Considerations

1. **Security**
   - Never commit `.env` files
   - Use environment variables in deployment platform
   - Enable HTTPS
   - Validate all user inputs

2. **Performance**
   - Enable compression
   - Use CDN for static assets
   - Optimize images
   - Implement caching

3. **Monitoring**
   - Set up error tracking (Sentry, etc.)
   - Monitor API response times
   - Track MongoDB connection health

4. **Scaling**
   - Use MongoDB Atlas for automatic scaling
   - Consider Redis for caching
   - Implement rate limiting

## Support

For issues or questions:
- Check the README.md for setup instructions
- Review error logs
- Verify all environment variables are set correctly

