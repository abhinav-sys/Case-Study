from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
import pickle
import os

app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify exact origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load the ML model
MODEL_PATH = os.path.join(os.path.dirname(__file__), 'complex_price_model_v2.pkl')

# Try alternative paths for Docker
if not os.path.exists(MODEL_PATH):
    MODEL_PATH = '/app/complex_price_model_v2.pkl'

try:
    with open(MODEL_PATH, 'rb') as f:
        model = pickle.load(f)
    print(f"✅ ML Model loaded successfully from {MODEL_PATH}")
except FileNotFoundError:
    print(f"❌ Model file not found at {MODEL_PATH}")
    print("⚠️  Continuing without ML model (predictions will not work)")
    model = None
except Exception as e:
    print(f"❌ Error loading model: {e}")
    print("⚠️  Continuing without ML model (predictions will not work)")
    model = None

@app.get("/")
async def root():
    return {
        "status": "ok",
        "message": "ML Price Prediction Service",
        "model_loaded": model is not None
    }

@app.get("/health")
async def health():
    return {
        "status": "ok",
        "model_loaded": model is not None
    }

@app.post("/predict")
async def predict_price(request: Request):
    """
    Predict property price based on features.
    
    Expected input format:
    {
        "property_type": "SFH" or "Condo",
        "lot_area": int (for SFH),
        "building_area": int (for Condo),
        "bedrooms": int,
        "bathrooms": int,
        "year_built": int,
        "has_pool": bool,
        "has_garage": bool,
        "school_rating": int (1-10)
    }
    """
    if model is None:
        raise HTTPException(status_code=503, detail="ML model not loaded")
    
    try:
        data = await request.json()
        
        # Validate required fields
        required_fields = ["property_type", "bedrooms", "bathrooms", "year_built", "has_pool", "has_garage", "school_rating"]
        for field in required_fields:
            if field not in data:
                raise HTTPException(status_code=400, detail=f"Missing required field: {field}")
        
        # Validate property_type
        if data["property_type"] not in ["SFH", "Condo"]:
            raise HTTPException(status_code=400, detail="property_type must be 'SFH' or 'Condo'")
        
        # Validate area based on property type
        if data["property_type"] == "SFH":
            if "lot_area" not in data:
                raise HTTPException(status_code=400, detail="lot_area required for SFH properties")
            data["building_area"] = 0  # Not used for SFH
        else:  # Condo
            if "building_area" not in data:
                raise HTTPException(status_code=400, detail="building_area required for Condo properties")
            data["lot_area"] = 0  # Not used for Condo
        
        # Ensure boolean values
        data["has_pool"] = bool(data["has_pool"])
        data["has_garage"] = bool(data["has_garage"])
        
        # Predict
        prediction = model.predict(data)
        
        return {
            "success": True,
            "predicted_price": float(prediction) if hasattr(prediction, '__float__') else float(prediction[0]) if isinstance(prediction, (list, tuple)) else float(prediction),
            "input_data": data
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")

@app.post("/predict/batch")
async def predict_price_batch(request: Request):
    """
    Predict prices for multiple properties at once.
    """
    if model is None:
        raise HTTPException(status_code=503, detail="ML model not loaded")
    
    try:
        data = await request.json()
        properties = data.get("properties", [])
        
        if not isinstance(properties, list):
            raise HTTPException(status_code=400, detail="properties must be an array")
        
        predictions = []
        for prop in properties:
            try:
                # Validate and prepare data (same as single predict)
                required_fields = ["property_type", "bedrooms", "bathrooms", "year_built", "has_pool", "has_garage", "school_rating"]
                for field in required_fields:
                    if field not in prop:
                        raise ValueError(f"Missing required field: {field}")
                
                if prop["property_type"] == "SFH":
                    if "lot_area" not in prop:
                        raise ValueError("lot_area required for SFH")
                    prop["building_area"] = 0
                else:
                    if "building_area" not in prop:
                        raise ValueError("building_area required for Condo")
                    prop["lot_area"] = 0
                
                prop["has_pool"] = bool(prop["has_pool"])
                prop["has_garage"] = bool(prop["has_garage"])
                
                prediction = model.predict(prop)
                predictions.append({
                    "success": True,
                    "predicted_price": float(prediction) if hasattr(prediction, '__float__') else float(prediction[0]) if isinstance(prediction, (list, tuple)) else float(prediction),
                    "input_data": prop
                })
            except Exception as e:
                predictions.append({
                    "success": False,
                    "error": str(e),
                    "input_data": prop
                })
        
        return {
            "success": True,
            "predictions": predictions,
            "count": len(predictions)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Batch prediction error: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

