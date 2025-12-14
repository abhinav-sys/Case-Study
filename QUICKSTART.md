# ⚡ Quick Start Guide

Get the Real Estate Chatbot up and running in 5 minutes!

## 🚀 Fast Setup

### 1. Install Dependencies

**Backend (Node.js):**
```bash
cd backend
npm install
```

**ML Service (Python):**
```bash
# Still in backend directory
pip install -r requirements.txt
# Or: pip3 install -r requirements.txt
```

**Frontend:**
```bash
cd ../frontend
npm install
```

### 2. Set Up MongoDB

**Option A: MongoDB Atlas (Cloud - Recommended)**
1. Go to https://www.mongodb.com/cloud/atlas
2. Create free account and cluster
3. Get connection string
4. Create `.env` file in `backend/`:
   ```
   MONGODB_URI=your_mongodb_atlas_connection_string_here
   PORT=5000
   ML_SERVICE_URL=http://localhost:8000
   ```

**Option B: Local MongoDB**
1. Install MongoDB locally
2. Start MongoDB service
3. Create `.env` file in `backend/`:
   ```
   MONGODB_URI=mongodb://localhost:27017/realestate-chatbot
   PORT=5000
   ML_SERVICE_URL=http://localhost:8000
   ```

### 3. Start All Services

**You need to run THREE services in separate terminals:**

**Terminal 1 - ML Service (Python):**
```bash
cd backend

# Windows
start_ml_service.bat
# Or: python -m uvicorn ml_service:app --host 0.0.0.0 --port 8000

# Linux/Mac
./start_ml_service.sh
# Or: python3 -m uvicorn ml_service:app --host 0.0.0.0 --port 8000
```
✅ Should see: "✅ ML Model loaded successfully" and "Application startup complete"

**Terminal 2 - Backend (Node.js):**
```bash
cd backend
npm start
```
✅ Should see: "✅ Connected to MongoDB" and "🚀 Server running on http://localhost:5000"

**Terminal 3 - Frontend (React):**
```bash
cd frontend
npm start
```
✅ Should open browser at `http://localhost:3000`

## ✅ Verify It's Working

1. Open `http://localhost:3000`
2. You should see the chatbot interface
3. Try asking: "Show me 3 bedroom apartments in New York under $500,000"
4. Properties should appear with:
   - Actual price (from JSON)
   - **AI Predicted Price** (from ML model)
   - Price difference percentage

## 🎯 Test All Features

- ✅ ML service loads model successfully
- ✅ Chatbot search with price predictions
- ✅ Property filtering
- ✅ Save properties (heart icon)
- ✅ Compare properties (up to 3) with price predictions
- ✅ View saved properties tab
- ✅ Real-time search

## 🔧 Troubleshooting

**ML Service won't start:**
- Check Python version: `python --version` (need 3.8+)
- Install dependencies: `pip install -r requirements.txt`
- Check if `complex_price_model_v2.pkl` exists in `backend/` directory
- Verify port 8000 is available

**Backend won't start:**
- Check if MongoDB is running
- Verify `.env` file exists and has correct MONGODB_URI
- Check if port 5000 is available
- Verify ML service is running (backend tries to connect to it)

**Frontend won't start:**
- Make sure backend is running first
- Check if port 3000 is available
- Clear `node_modules` and reinstall: `rm -rf node_modules && npm install`

**No properties showing:**
- Check browser console for errors
- Verify backend is running on port 5000
- Check network tab for API calls
- Verify ML service is running (predictions won't work without it)

**No price predictions showing:**
- Verify ML service is running on port 8000
- Check ML service logs for errors
- Verify `complex_price_model_v2.pkl` file exists
- Check browser console for API errors

**MongoDB connection error:**
- Verify connection string in `.env`
- Check MongoDB Atlas IP whitelist (if using cloud)
- Ensure MongoDB service is running (if local)

## 📝 Important Notes

1. **Three Services Required:**
   - ML Service (Python) - Port 8000
   - Backend (Node.js) - Port 5000
   - Frontend (React) - Port 3000

2. **ML Service is Optional:**
   - If ML service is not running, properties will still work
   - Price predictions just won't be available
   - Backend will gracefully handle ML service unavailability

3. **Order of Starting:**
   - Start ML service first (optional but recommended)
   - Then backend
   - Then frontend

## 📝 Next Steps

- Read full README.md for detailed documentation
- Check DEPLOYMENT.md for production deployment
- Customize the UI and add your own features!
