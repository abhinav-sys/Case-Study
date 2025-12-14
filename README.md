# 🏠 Real Estate Chatbot - Agent Mira Case Study

A production-ready full-stack real estate chatbot application built with React.js, Node.js, Python (FastAPI), and MongoDB. This application demonstrates advanced full-stack development skills including natural language processing, machine learning integration, and modern web technologies.

## 🎯 Project Overview

This comprehensive real estate chatbot solution showcases:
- **Frontend**: Modern React.js with beautiful, responsive UI and real-time interactions
- **Backend**: Node.js/Express.js RESTful API with advanced data processing
- **ML Service**: Python FastAPI service for AI-powered price predictions
- **Database**: MongoDB for persistent data storage
- **AI Integration**: OpenAI for NLP + Custom ML model for price prediction
- **Data Management**: Intelligent merging and filtering from multiple JSON sources

## ✨ Features

### Core Requirements ✅
- ✅ **Interactive Chatbot Interface** - Natural language property search with intelligent query understanding
- ✅ **Data Merging** - Seamlessly combines data from three separate JSON files (basics, characteristics, images)
- ✅ **Advanced Filtering** - Filter by location, budget, bedrooms, bathrooms, size, and amenities
- ✅ **Property Display** - Beautiful, responsive property cards with images and detailed information
- ✅ **MongoDB Integration** - Full CRUD operations for saving and managing favorite properties
- ✅ **Real-time Search** - Instant property filtering as users type
- ✅ **ML Price Prediction** - AI-powered price predictions using provided ML model

### Bonus Features ✨
- ✨ **NLP Integration** - OpenAI API for intelligent natural language understanding with keyword fallback
- ✨ **Property Comparison** - Side-by-side comparison of up to 3 properties with price analysis
- ✨ **Saved Properties** - Persistent storage with MongoDB, accessible across sessions
- ✨ **Responsive Design** - Mobile-first design that works seamlessly on all devices
- ✨ **Price Analysis** - Visual indicators showing predicted vs actual price with percentage differences
- ✨ **Error Handling** - Graceful degradation when services are unavailable

## 🛠️ Tech Stack

### Frontend
- **React.js 18** - Modern UI framework with hooks and functional components
- **Axios** - HTTP client for API communication
- **Lucide React** - Beautiful, consistent icon library
- **CSS3** - Custom styling with gradients, animations, and responsive design

### Backend
- **Node.js** - JavaScript runtime environment
- **Express.js** - Fast, unopinionated web framework
- **MongoDB** - NoSQL database for flexible data storage
- **Mongoose** - Elegant MongoDB object modeling
- **OpenAI API** - Optional NLP enhancement (with intelligent fallback)

### ML Service
- **Python 3.8+** - ML service runtime
- **FastAPI** - Modern, fast Python web framework
- **Pickle** - Model serialization and loading
- **Uvicorn** - Lightning-fast ASGI server

## 📁 Project Structure

```
junior_case_study_package_v2/
├── backend/
│   ├── models/
│   │   └── SavedProperty.js          # MongoDB schema for saved properties
│   ├── routes/
│   │   └── savedProperties.js       # RESTful API routes
│   ├── server.js                     # Main Express server with data merging & filtering
│   ├── ml_service.py                 # Python FastAPI ML service
│   ├── complex_price_model_v2.pkl    # ML model file (provided)
│   ├── main.py                       # Original ML service (deprecated, kept for reference)
│   ├── start_ml_service.sh           # ML service startup (Linux/Mac)
│   ├── start_ml_service.bat          # ML service startup (Windows)
│   ├── requirements.txt              # Python dependencies
│   ├── package.json                  # Node.js dependencies
│   └── .env                          # Environment variables (create this)
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   ├── Chatbot.js            # Main chatbot with NLP integration
│   │   │   ├── PropertyCard.js        # Property card with price predictions
│   │   │   ├── PropertyList.js        # Property listing with advanced filters
│   │   │   ├── PropertyComparison.js # Side-by-side property comparison
│   │   │   └── SavedProperties.js     # Saved properties management
│   │   ├── App.js                     # Main application component
│   │   ├── App.css                    # Application styles
│   │   ├── index.js                   # React entry point
│   │   └── index.css                  # Global styles
│   └── package.json
├── data/
│   ├── property_basics.json           # Property IDs, titles, prices, locations
│   ├── property_characteristics.json # Bedrooms, bathrooms, size, amenities
│   └── property_images.json          # Property image URLs
├── README.md                          # This file
├── QUICKSTART.md                      # Quick setup guide
├── DEPLOYMENT.md                      # Deployment instructions
├── ML_INTEGRATION_SUMMARY.md          # ML model integration details
└── model_interface.md                 # ML model input schema (provided)
```

## 🚀 Getting Started

### 🐳 Option 1: Docker (Recommended - Easiest)

**Prerequisites:**
- Docker Desktop installed and running

**Start everything with one command:**
```bash
docker-compose up --build
```

**Access the application:**
- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:5000
- **ML Service:** http://localhost:8000

**Stop services:**
```bash
docker-compose down
```

**View logs:**
```bash
docker-compose logs -f
```

See `QUICKSTART.md` for detailed setup instructions.

---

### 💻 Option 2: Manual Setup

**Prerequisites:**
- **Node.js** v16 or higher (tested with v21.5.0)
- **Python** 3.8 or higher (tested with 3.11.9)
- **MongoDB** - Local installation or MongoDB Atlas account (optional but recommended)
- **npm** or **yarn** package manager
- **(Optional)** OpenAI API key for enhanced NLP features

### Installation

1. **Clone or navigate to the project directory**
   ```bash
   cd junior_case_study_package_v2
   ```

2. **Install Backend Dependencies (Node.js)**
   ```bash
   cd backend
   npm install
   ```

3. **Install ML Service Dependencies (Python)**
   ```bash
   # Still in backend directory
   pip install -r requirements.txt
   # Or: pip3 install -r requirements.txt
   ```

4. **Install Frontend Dependencies**
   ```bash
   cd ../frontend
   npm install
   ```

5. **Set Up Environment Variables**

   Create a `.env` file in the `backend` directory:
   ```env
   PORT=5000
   MONGODB_URI=your_mongodb_connection_string_here
   ML_SERVICE_URL=http://localhost:8000
   OPENAI_API_KEY=your_openai_api_key_here  # Optional
   ```

   **For MongoDB Atlas:**
   - Sign up at https://www.mongodb.com/cloud/atlas
   - Create a free cluster
   - Create a database user
   - Get connection string and replace in `.env`
   - Whitelist your IP address in Network Access

### Running the Application (Manual Setup)

**First, install Python packages (one-time):**
```bash
cd backend
pip install -r requirements.txt
```

**Then run THREE services in separate terminals:**

1. **Start the ML Service (Python FastAPI)**
   ```bash
   cd backend
   python -m uvicorn ml_service:app --host 0.0.0.0 --port 8000
   ```
   **Expected:** `✅ ML Model loaded successfully` and `Uvicorn running on http://0.0.0.0:8000`

2. **Start the Backend Server (Node.js)**
   ```bash
   cd backend
   npm start
   ```
   **Expected:** `✅ Connected to MongoDB` and `🚀 Server running on http://localhost:5000`

3. **Start the Frontend Development Server (React)**
   ```bash
   cd frontend
   npm start
   ```
   **Expected:** Browser opens automatically to `http://localhost:3000`

## 📖 Usage Guide

### Using the Chatbot

1. **Natural Language Queries**
   - Type queries like: "Show me 3 bedroom apartments in New York under $500,000"
   - The chatbot intelligently extracts filters and displays matching properties
   - Properties show **AI-predicted prices** alongside actual prices

2. **Price Predictions**
   - Each property card displays:
     - **Actual Price** (from JSON data)
     - **AI Predicted Price** (from ML model)
     - **Price Difference** (percentage and visual indicator)
   - Green = Predicted higher than actual (potential good deal)
   - Red = Predicted lower than actual

3. **Quick Filters**
   - Use quick filter buttons for common searches
   - Filters can be combined for more specific results

### Property Management

1. **Saving Properties**
   - Click the heart icon on any property card to save it
   - Saved properties are stored in MongoDB
   - View all saved properties in the "Saved" tab

2. **Comparing Properties**
   - Click "Compare" button on property cards
   - Add up to 3 properties for comparison
   - View side-by-side comparison with price predictions and summary statistics

3. **Filtering Properties**
   - Use the "All Properties" tab to browse all listings
   - Apply filters for location, budget, bedrooms, bathrooms, and size
   - Use the search bar for text-based filtering
   - Filters work in real-time

## 🔧 API Endpoints

### Properties
- `GET /api/properties?predict=true` - Get all merged properties with optional price predictions
- `POST /api/properties/search` - Search properties with filters or NLP
- `GET /api/properties/search?q=...` - Real-time search query
- `POST /api/properties/predict` - Get price prediction for a single property

### ML Service (Python FastAPI)
- `GET /` - Service status
- `GET /health` - Health check endpoint
- `POST /predict` - Predict price for a single property
- `POST /predict/batch` - Predict prices for multiple properties

### Saved Properties
- `GET /api/saved-properties?userId=...` - Get saved properties for a user
- `POST /api/saved-properties` - Save a property
- `DELETE /api/saved-properties/:id?userId=...` - Remove saved property
- `GET /api/saved-properties/check/:propertyId` - Check if property is saved

### Health Check
- `GET /api/health` - Server health status

## 🤖 ML Model Integration

The ML model (`complex_price_model_v2.pkl`) predicts property prices based on:

**Input Features:**
- `property_type`: "SFH" (Single Family Home) or "Condo"
- `lot_area`: Lot area in sqft (for SFH)
- `building_area`: Building area in sqft (for Condo)
- `bedrooms`: Number of bedrooms
- `bathrooms`: Number of bathrooms
- `year_built`: Year the property was built
- `has_pool`: Boolean (true/false)
- `has_garage`: Boolean (true/false)
- `school_rating`: School rating (1-10 scale)

**How It Works:**
1. Property data from JSON files is automatically mapped to ML model input format
2. Property type is intelligently determined from title/amenities
3. Pool and garage are detected from amenities list
4. ML model predicts the price
5. Predicted price is displayed alongside actual price with visual indicators

See `ML_INTEGRATION_SUMMARY.md` for detailed technical information.

## 🎨 Key Features Explained

### Data Merging
The application merges data from three separate JSON files:
- `property_basics.json` - Core property information (ID, title, price, location)
- `property_characteristics.json` - Property details (bedrooms, bathrooms, size, amenities)
- `property_images.json` - Property images

All data is merged using the `id` field as the key, ensuring complete property information.

### Natural Language Processing
When OpenAI API key is provided:
- User queries are processed using GPT-3.5-turbo
- Filters are intelligently extracted from natural language
- Falls back to keyword-based extraction if API is unavailable

### MongoDB Schema
```javascript
{
  userId: String,
  propertyId: Number,
  property: Object,  // Full property data
  savedAt: Date
}
```

## 🚢 Deployment

### ML Service Deployment

The Python ML service can be deployed separately:
- **Heroku**: Add `Procfile` with `web: uvicorn ml_service:app --host 0.0.0.0 --port $PORT`
- **Railway**: Auto-detects FastAPI
- **Render**: Use Python environment

Update `ML_SERVICE_URL` in backend `.env` to point to deployed service.

### Backend & Frontend Deployment

See `DEPLOYMENT.md` for detailed deployment instructions for:
- Vercel
- Heroku
- Netlify
- GitHub Pages
- MongoDB Atlas setup

## 🧪 Testing

### Manual Testing Checklist
- [ ] ML service starts and loads model successfully
- [ ] Backend can communicate with ML service
- [ ] Properties show predicted prices
- [ ] Chatbot responds to natural language queries
- [ ] Properties are filtered correctly
- [ ] Properties can be saved and unsaved
- [ ] Property comparison works with price predictions
- [ ] Real-time search filters properties
- [ ] All tabs navigate correctly
- [ ] Responsive design works on mobile

## 📝 Approach & Challenges

### Approach

1. **Architecture Design**
   - Separated frontend, backend, and ML service for scalability
   - Used RESTful API design for clear separation of concerns
   - Implemented MongoDB for persistent data storage

2. **ML Integration**
   - Created Python FastAPI service for ML model
   - Mapped JSON property data to ML model input format
   - Added intelligent property type detection
   - Implemented error handling for ML service unavailability

3. **Data Merging Strategy**
   - Created utility function to merge JSON data by ID
   - Ensured all properties have complete information
   - Handled missing data gracefully

4. **User Experience**
   - Designed intuitive chatbot interface
   - Implemented real-time search for instant feedback
   - Added property comparison with price predictions
   - Visual indicators for price differences

### Challenges & Solutions

1. **Challenge: Integrating Python ML Service with Node.js**
   - **Solution:** Created separate FastAPI service and used HTTP calls from Node.js

2. **Challenge: Mapping JSON Data to ML Model Format**
   - **Solution:** Created intelligent mapping function that detects property type, amenities, and estimates missing fields

3. **Challenge: ML Service Availability**
   - **Solution:** Implemented graceful fallback - properties still work without predictions

4. **Challenge: Natural Language Understanding**
   - **Solution:** Implemented dual approach - OpenAI API for advanced parsing with keyword-based fallback

5. **Challenge: Real-time Filtering**
   - **Solution:** Used React hooks and optimized search performance

## 🎯 Future Enhancements

- [ ] User authentication and personalized saved properties
- [ ] Advanced property recommendations using ML
- [ ] Image upload and property listing feature
- [ ] Email notifications for saved properties
- [ ] Property map view integration
- [ ] Multi-language support
- [ ] Property favoriting with categories
- [ ] Advanced analytics dashboard
- [ ] Model retraining pipeline
- [ ] Historical price trend predictions

## 📄 License

This project is created for Agent Mira case study evaluation.

## 👤 Author

Built for Agent Mira Full Stack Developer Position

---

## ✅ Project Completion Checklist

### Core Requirements
- [x] User input handling (location, budget, preferences)
- [x] Data merging from 3 JSON files
- [x] Property filtering based on user preferences
- [x] Chatbot UI with React.js
- [x] MongoDB integration for saved properties
- [x] Deployment-ready configuration

### Bonus Features
- [x] NLP integration with OpenAI (with fallback)
- [x] Property comparison feature
- [x] Real-time search functionality

### Code Quality
- [x] Clean, readable code
- [x] Proper error handling
- [x] Comprehensive documentation
- [x] Production-ready structure

---

**Note:** This project demonstrates proficiency in:
- Full-stack JavaScript development
- React.js and modern frontend practices
- Node.js and Express.js backend development
- Python and FastAPI for ML services
- MongoDB database integration
- ML model integration and deployment
- API design and RESTful principles
- Natural language processing integration
- Responsive web design
- Deployment and production considerations
