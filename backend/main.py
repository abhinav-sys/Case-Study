# ⚠️ DEPRECATED: This file is kept for reference
# The ML service has been moved to ml_service.py with enhanced features
# 
# To use the ML service, run:
#   python -m uvicorn ml_service:app --host 0.0.0.0 --port 8000
# Or use the startup scripts: start_ml_service.sh / start_ml_service.bat
#
# The new ml_service.py includes:
# - Enhanced error handling
# - CORS support
# - Batch prediction endpoint
# - Health check endpoint
# - Better validation

from fastapi import FastAPI, Request
import pickle

app = FastAPI()

with open('complex_price_model_v2.pkl', 'rb') as f:
    model = pickle.load(f)

@app.post("/predict")
async def predict_price(request: Request):
    data = await request.json()
    result = model.predict(data)
    return {"predicted_price": result}

# Note: Please use ml_service.py instead for production use
