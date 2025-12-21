"""
ML-Powered Chatbot Intelligence Service
Provides intent classification, sentiment analysis, and automated response generation
"""

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.naive_bayes import MultinomialNB
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import LabelEncoder
import pickle
import os
import json
import re
import numpy as np
from typing import Dict, List, Optional

app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Training data for intent classification
INTENT_TRAINING_DATA = {
    "greeting": [
        "hello", "hi", "hey", "good morning", "good afternoon", "good evening",
        "how are you", "what's up", "greetings", "hi there"
    ],
    "search_property": [
        "find properties", "show me homes", "search for houses", "looking for apartments",
        "find a place", "show properties", "search properties", "find homes",
        "i need a house", "looking for property", "find me a home", "show me listings"
    ],
    "price_query": [
        "what is the price", "how much does it cost", "what's the price range",
        "price of properties", "cost of homes", "property prices", "home prices",
        "what are prices", "how much", "pricing information"
    ],
    "location_query": [
        "where are properties", "what locations", "which areas", "best locations",
        "where to buy", "good areas", "property locations", "best neighborhoods"
    ],
    "investment_advice": [
        "is it a good investment", "investment potential", "should i invest",
        "good for investment", "investment advice", "investment opportunities",
        "return on investment", "investment value"
    ],
    "property_details": [
        "tell me about", "property features", "what amenities", "property details",
        "more information", "property specs", "house features", "what does it have"
    ],
    "budget_planning": [
        "help with budget", "budget planning", "affordability", "what can i afford",
        "budget advice", "financial planning", "loan information", "mortgage help"
    ],
    "documents": [
        "what documents", "required documents", "paperwork needed", "legal documents",
        "buying documents", "sale documents", "property documents"
    ],
    "goodbye": [
        "bye", "goodbye", "see you", "thanks", "thank you", "appreciate it",
        "that's all", "done", "finished"
    ],
    "general_question": [
        "how does", "what is", "explain", "tell me about", "can you help",
        "i want to know", "what are", "how do i", "help me understand"
    ]
}

# Response templates for automated responses
RESPONSE_TEMPLATES = {
    "greeting": [
        "Hello! I'm your real estate assistant. How can I help you find your perfect property today?",
        "Hi there! I'm here to help you with all your real estate needs. What are you looking for?",
        "Welcome! I can help you search for properties, answer questions, and provide real estate guidance. What would you like to know?"
    ],
    "search_property": [
        "I'd be happy to help you find properties! Could you tell me more about what you're looking for? For example, location, budget, or number of bedrooms?",
        "Great! Let me search for properties that match your criteria. What location are you interested in?",
        "I can help you find the perfect property. What are your main requirements - location, price range, or property type?"
    ],
    "price_query": [
        "Property prices vary significantly based on location, size, and features. I can show you specific listings with prices if you'd like to search for properties.",
        "Prices depend on many factors like location, property size, and amenities. Would you like me to search for properties in a specific price range?",
        "I can help you find properties within your budget. What price range are you considering?"
    ],
    "location_query": [
        "We have properties in various locations. The best area depends on your preferences for schools, commute, amenities, and lifestyle. What's most important to you?",
        "Location is key! Different areas offer different benefits - some are great for families, others for professionals. What type of lifestyle are you looking for?",
        "I can help you explore different neighborhoods. Are you looking for a family-friendly area, a vibrant urban setting, or something else?"
    ],
    "investment_advice": [
        "Real estate investment depends on several factors: location growth potential, rental yields, property appreciation, and your financial goals. Would you like to explore investment properties?",
        "Investment potential varies by property type and location. Generally, properties in growing areas with good infrastructure tend to appreciate well. I can show you properties with investment potential.",
        "Good investments typically have strong location fundamentals, growth potential, and rental demand. Would you like me to help you identify properties that might fit investment criteria?"
    ],
    "property_details": [
        "I'd be happy to provide more details! Which property are you interested in, or what specific features are you looking for?",
        "Property details can include size, bedrooms, bathrooms, amenities, and more. What would you like to know about?",
        "I can help you understand property features and specifications. What information are you looking for?"
    ],
    "budget_planning": [
        "Budget planning is important! Generally, experts suggest spending no more than 30% of your income on housing. I can help you find properties within your budget range.",
        "I can help with budget planning. A good starting point is to determine your monthly payment capacity and work backwards. What's your approximate budget?",
        "Budget considerations include down payment, monthly mortgage, taxes, insurance, and maintenance. Would you like me to search for properties in a specific price range?"
    ],
    "documents": [
        "Common documents needed for buying property include: ID proof, income documents, bank statements, property documents (title, sale deed), and loan approval letter if applicable.",
        "Typical documents required: Proof of identity, address proof, financial statements, property title documents, and any loan-related paperwork. The exact list can vary by location.",
        "Documentation typically includes personal identification, financial records, property title documents, and legal clearances. Requirements can vary, so it's best to consult with a local real estate professional."
    ],
    "goodbye": [
        "You're welcome! Feel free to come back anytime if you need help finding properties or have questions.",
        "Happy to help! Good luck with your property search.",
        "Thank you for using our service! If you need anything else, just ask."
    ],
    "general_question": [
        "I'd be happy to help! Could you provide a bit more detail about what you'd like to know?",
        "That's a great question! Let me help you understand that. Could you clarify what specific aspect you're interested in?",
        "I can help with that! What would you like to know more about?"
    ]
}

# Initialize ML models
intent_classifier = None
vectorizer = None
label_encoder = None

def train_intent_classifier():
    """Train the intent classification model"""
    global intent_classifier, vectorizer, label_encoder
    
    # Prepare training data
    texts = []
    labels = []
    
    for intent, examples in INTENT_TRAINING_DATA.items():
        for example in examples:
            texts.append(example.lower())
            labels.append(intent)
    
    # Create and train pipeline
    vectorizer = TfidfVectorizer(max_features=1000, ngram_range=(1, 2), stop_words='english')
    label_encoder = LabelEncoder()
    
    X = vectorizer.fit_transform(texts)
    y = label_encoder.fit_transform(labels)
    
    intent_classifier = MultinomialNB(alpha=0.1)
    intent_classifier.fit(X, y)
    
    print("✅ Intent classifier trained successfully")
    return True

def predict_intent(message: str) -> Dict[str, any]:
    """Predict user intent from message"""
    if intent_classifier is None or vectorizer is None:
        return {"intent": "general_question", "confidence": 0.5}
    
    try:
        message_lower = message.lower()
        X = vectorizer.transform([message_lower])
        probabilities = intent_classifier.predict_proba(X)[0]
        predicted_idx = np.argmax(probabilities)
        confidence = probabilities[predicted_idx]
        
        intent = label_encoder.inverse_transform([predicted_idx])[0]
        
        # Get top 3 intents
        top_indices = np.argsort(probabilities)[-3:][::-1]
        top_intents = [
            {
                "intent": label_encoder.inverse_transform([idx])[0],
                "confidence": float(probabilities[idx])
            }
            for idx in top_indices
        ]
        
        return {
            "intent": intent,
            "confidence": float(confidence),
            "top_intents": top_intents
        }
    except Exception as e:
        print(f"Intent prediction error: {e}")
        return {"intent": "general_question", "confidence": 0.5}

def extract_entities(message: str) -> Dict[str, any]:
    """Extract entities from user message using regex patterns"""
    entities = {
        "location": None,
        "budget": None,
        "bedrooms": None,
        "bathrooms": None,
        "property_type": None
    }
    
    message_lower = message.lower()
    
    # Extract location (common city names)
    cities = ["new york", "los angeles", "chicago", "houston", "phoenix", "philadelphia",
              "san antonio", "san diego", "dallas", "san jose", "miami", "atlanta",
              "boston", "seattle", "denver", "detroit", "minneapolis", "portland"]
    for city in cities:
        if city in message_lower:
            entities["location"] = city.title()
            break
    
    # Extract budget
    budget_patterns = [
        r'\$?(\d+)\s*(?:million|mil|m)',
        r'\$?(\d+)\s*(?:thousand|k)',
        r'\$?(\d{1,3}(?:,\d{3})*(?:\.\d+)?)',
        r'under\s+\$?(\d+)',
        r'below\s+\$?(\d+)',
        r'less than\s+\$?(\d+)'
    ]
    for pattern in budget_patterns:
        match = re.search(pattern, message_lower)
        if match:
            value = match.group(1).replace(',', '')
            if 'million' in match.group(0) or 'mil' in match.group(0) or 'm' in match.group(0):
                entities["budget"] = int(float(value) * 1000000)
            elif 'thousand' in match.group(0) or 'k' in match.group(0):
                entities["budget"] = int(float(value) * 1000)
            else:
                entities["budget"] = int(float(value))
            break
    
    # Extract bedrooms
    bedroom_match = re.search(r'(\d+)\s*(?:bed|bedroom|br|beds)', message_lower)
    if bedroom_match:
        entities["bedrooms"] = int(bedroom_match.group(1))
    
    # Extract bathrooms
    bathroom_match = re.search(r'(\d+)\s*(?:bath|bathroom|ba)', message_lower)
    if bathroom_match:
        entities["bathrooms"] = int(bathroom_match.group(1))
    
    # Extract property type
    if any(word in message_lower for word in ["apartment", "condo", "condominium"]):
        entities["property_type"] = "Condo"
    elif any(word in message_lower for word in ["house", "home", "single family", "sfh"]):
        entities["property_type"] = "SFH"
    
    return entities

def generate_automated_response(intent: str, entities: Dict, confidence: float) -> str:
    """Generate an automated response based on intent and entities"""
    import random
    
    # Get base response
    templates = RESPONSE_TEMPLATES.get(intent, RESPONSE_TEMPLATES["general_question"])
    response = random.choice(templates)
    
    # Enhance response with entity information
    if entities.get("location"):
        response += f" I see you're interested in {entities['location']}."
    
    if entities.get("budget"):
        budget_str = f"${entities['budget']:,}"
        response += f" For a budget around {budget_str}, I can help you find suitable options."
    
    if entities.get("bedrooms"):
        response += f" You're looking for {entities['bedrooms']} bedroom properties."
    
    if entities.get("bathrooms"):
        response += f" With {entities['bathrooms']} bathrooms."
    
    # Add follow-up question for low confidence
    if confidence < 0.6:
        response += " Could you provide a bit more detail about what you're looking for?"
    
    return response

# Train model on startup
try:
    train_intent_classifier()
except Exception as e:
    print(f"⚠️  Error training intent classifier: {e}")

@app.get("/")
async def root():
    return {
        "status": "ok",
        "message": "Chatbot ML Intelligence Service",
        "model_loaded": intent_classifier is not None
    }

@app.get("/health")
async def health():
    return {
        "status": "ok",
        "model_loaded": intent_classifier is not None
    }

@app.post("/analyze")
async def analyze_message(request: Request):
    """
    Analyze user message and provide intent, entities, and automated response
    """
    if intent_classifier is None:
        raise HTTPException(status_code=503, detail="ML model not loaded")
    
    try:
        data = await request.json()
        message = data.get("message", "")
        
        if not message:
            raise HTTPException(status_code=400, detail="Message is required")
        
        # Predict intent
        intent_result = predict_intent(message)
        
        # Extract entities
        entities = extract_entities(message)
        
        # Generate automated response
        automated_response = generate_automated_response(
            intent_result["intent"],
            entities,
            intent_result["confidence"]
        )
        
        return {
            "success": True,
            "intent": intent_result["intent"],
            "confidence": intent_result["confidence"],
            "top_intents": intent_result.get("top_intents", []),
            "entities": entities,
            "automated_response": automated_response,
            "suggested_actions": get_suggested_actions(intent_result["intent"], entities)
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis error: {str(e)}")

def get_suggested_actions(intent: str, entities: Dict) -> List[str]:
    """Get suggested actions based on intent"""
    actions = []
    
    if intent == "search_property":
        actions.append("search_properties")
        if not entities.get("location"):
            actions.append("ask_location")
        if not entities.get("budget"):
            actions.append("ask_budget")
    
    elif intent == "price_query":
        actions.append("show_price_range")
        actions.append("search_by_budget")
    
    elif intent == "location_query":
        actions.append("show_available_locations")
        actions.append("explore_neighborhoods")
    
    elif intent == "investment_advice":
        actions.append("show_investment_properties")
        actions.append("provide_market_insights")
    
    return actions

@app.post("/classify-intent")
async def classify_intent(request: Request):
    """Classify user intent only"""
    if intent_classifier is None:
        raise HTTPException(status_code=503, detail="ML model not loaded")
    
    try:
        data = await request.json()
        message = data.get("message", "")
        
        if not message:
            raise HTTPException(status_code=400, detail="Message is required")
        
        result = predict_intent(message)
        return {
            "success": True,
            "intent": result["intent"],
            "confidence": result["confidence"],
            "top_intents": result.get("top_intents", [])
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Classification error: {str(e)}")

@app.post("/extract-entities")
async def extract_entities_endpoint(request: Request):
    """Extract entities from message"""
    try:
        data = await request.json()
        message = data.get("message", "")
        
        if not message:
            raise HTTPException(status_code=400, detail="Message is required")
        
        entities = extract_entities(message)
        return {
            "success": True,
            "entities": entities
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Entity extraction error: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
