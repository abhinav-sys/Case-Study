# 🚀 Deployment Guide

This guide provides step-by-step instructions for deploying the Real Estate Chatbot application.

## Prerequisites

- GitHub account
- MongoDB Atlas account (or local MongoDB)
- Vercel/Netlify account (for frontend)
- Heroku/Railway/Render account (for backend) - Optional
- OpenAI API key (optional, for NLP features)

## Deployment Options

### Option 1: Vercel (Recommended - Easiest)

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
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/realestate-chatbot
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
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/realestate-chatbot
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

