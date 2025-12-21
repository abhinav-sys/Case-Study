# ML-Powered Chatbot Setup Guide

## Overview

The chatbot now includes an **ML-powered intelligence system** that makes conversations more automated and interesting:

### Features:
1. **Intent Classification** - Automatically detects what the user wants (search, question, greeting, etc.)
2. **Entity Extraction** - Extracts location, budget, bedrooms, bathrooms from natural language
3. **Automated Responses** - Generates intelligent responses without always needing OpenAI
4. **Smart Filter Extraction** - Better understanding of user queries

## Architecture

```
User Message
    ↓
ML Service (chatbot_ml.py)
    ├─ Intent Classification (10 intents)
    ├─ Entity Extraction (location, budget, bedrooms, etc.)
    └─ Automated Response Generation
    ↓
Backend (server.js)
    ├─ Uses ML for automation
    ├─ Falls back to OpenAI if available
    └─ Returns intelligent responses
```

## ML Model Details

### Intent Classification Model
- **Algorithm**: Naive Bayes with TF-IDF vectorization
- **Intents Detected**:
  - `greeting` - Hello, hi, greetings
  - `search_property` - Find properties, show homes
  - `price_query` - Price questions
  - `location_query` - Location questions
  - `investment_advice` - Investment questions
  - `property_details` - Property information requests
  - `budget_planning` - Budget help
  - `documents` - Document requirements
  - `goodbye` - Farewell messages
  - `general_question` - Other questions

### Entity Extraction
- **Location**: Extracts city names (New York, Los Angeles, etc.)
- **Budget**: Extracts price ranges ($500k, 1 million, etc.)
- **Bedrooms**: Extracts bedroom count (2 bed, 3 bedrooms, etc.)
- **Bathrooms**: Extracts bathroom count
- **Property Type**: Detects apartment/condo vs house/SFH

## Setup Instructions

### Option 1: Run as Separate Service (Recommended)

1. **Install dependencies**:
```bash
cd backend
pip install -r requirements.txt
```

2. **Start the ML service**:
```bash
python -m uvicorn chatbot_ml:app --host 0.0.0.0 --port 8001
```

3. **Set environment variable in backend**:
```bash
CHATBOT_ML_SERVICE_URL=http://localhost:8001
```

### Option 2: Deploy on Railway/Render

1. **Create a new service** for the chatbot ML:
   - Root Directory: `.` (repo root)
   - Dockerfile Path: `backend/Dockerfile.chatbot-ml`
   - Port: `8001`

2. **Set environment variable** in backend service:
   ```
   CHATBOT_ML_SERVICE_URL=https://your-chatbot-ml-service.up.railway.app
   ```

### Option 3: Run Locally (Development)

```bash
# Terminal 1: Start ML service
cd backend
python chatbot_ml.py

# Terminal 2: Start backend (will automatically use ML service)
cd backend
npm start
```

## How It Works

### 1. User sends message
```
User: "I'm looking for a 3 bedroom house in New York under $500k"
```

### 2. ML Analysis
```json
{
  "intent": "search_property",
  "confidence": 0.92,
  "entities": {
    "location": "New York",
    "bedrooms": 3,
    "budget": 500000,
    "property_type": "SFH"
  },
  "automated_response": "I'd be happy to help you find properties! I see you're interested in New York. You're looking for 3 bedroom properties. For a budget around $500,000, I can help you find suitable options."
}
```

### 3. Backend Processing
- If intent is `search_property` → Proceeds with property search
- If intent is general question → Uses ML automated response (or ChatGPT if available)
- Extracts filters from entities automatically

### 4. Response
- **High confidence (>0.7)**: Uses ML automated response immediately
- **Lower confidence**: Enhances with ChatGPT if available
- **Search queries**: Automatically extracts filters and searches properties

## API Endpoints

### `/analyze` (POST)
Analyze a message and get intent, entities, and automated response.

**Request**:
```json
{
  "message": "I need a 2 bedroom apartment in Miami"
}
```

**Response**:
```json
{
  "success": true,
  "intent": "search_property",
  "confidence": 0.89,
  "entities": {
    "location": "Miami",
    "bedrooms": 2,
    "property_type": "Condo"
  },
  "automated_response": "I'd be happy to help you find properties! I see you're interested in Miami. You're looking for 2 bedroom properties.",
  "suggested_actions": ["search_properties", "ask_budget"]
}
```

### `/classify-intent` (POST)
Classify intent only.

### `/extract-entities` (POST)
Extract entities only.

## Benefits

✅ **Works without OpenAI** - ML provides automated responses even without API key
✅ **Faster responses** - No API calls needed for simple queries
✅ **Better understanding** - Intent classification improves query handling
✅ **Automatic extraction** - Entities extracted automatically from natural language
✅ **More engaging** - Automated responses make conversations flow better

## Testing

Test the ML service directly:
```bash
curl -X POST http://localhost:8001/analyze \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello, I want to find a house"}'
```

## Troubleshooting

1. **ML service not responding**:
   - Check if port 8001 is available
   - Verify dependencies are installed: `pip install scikit-learn numpy`

2. **Low confidence predictions**:
   - This is normal for ambiguous queries
   - System falls back to ChatGPT or asks for clarification

3. **Entity extraction not working**:
   - Check if city names are in the supported list
   - Budget formats: "$500k", "500 thousand", "1 million"

## Future Enhancements

- Add more training data for better accuracy
- Support more cities and locations
- Sentiment analysis for better responses
- Conversation memory and context tracking
- Multi-language support
