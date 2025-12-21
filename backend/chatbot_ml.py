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

# Enhanced training data for intent classification (more examples = better accuracy)
INTENT_TRAINING_DATA = {
    "greeting": [
        "hello", "hi", "hey", "good morning", "good afternoon", "good evening",
        "how are you", "what's up", "greetings", "hi there", "hello there",
        "hey there", "good day", "morning", "afternoon", "evening", "greetings",
        "howdy", "what's happening", "nice to meet you", "pleased to meet you"
    ],
    "search_property": [
        "find properties", "show me homes", "search for houses", "looking for apartments",
        "find a place", "show properties", "search properties", "find homes",
        "i need a house", "looking for property", "find me a home", "show me listings",
        "i want to buy", "i'm looking for", "can you find", "help me find",
        "show available", "what properties", "list properties", "browse homes",
        "search listings", "find apartments", "show houses", "property search",
        "home search", "looking to buy", "want to rent", "need a property",
        "find me something", "what do you have", "show me options", "available properties"
    ],
    "price_query": [
        "what is the price", "how much does it cost", "what's the price range",
        "price of properties", "cost of homes", "property prices", "home prices",
        "what are prices", "how much", "pricing information", "price range",
        "how expensive", "what costs", "price information", "average price",
        "typical price", "price per square foot", "cost per sqft", "market price"
    ],
    "location_query": [
        "where are properties", "what locations", "which areas", "best locations",
        "where to buy", "good areas", "property locations", "best neighborhoods",
        "what areas", "which cities", "best places", "good neighborhoods",
        "safe areas", "popular locations", "growing areas", "upcoming areas"
    ],
    "investment_advice": [
        "is it a good investment", "investment potential", "should i invest",
        "good for investment", "investment advice", "investment opportunities",
        "return on investment", "investment value", "worth investing",
        "investment returns", "roi", "appreciation potential", "rental yield",
        "investment property", "buy to rent", "investment strategy"
    ],
    "property_details": [
        "tell me about", "property features", "what amenities", "property details",
        "more information", "property specs", "house features", "what does it have",
        "property info", "details about", "more about", "specifications",
        "what features", "amenities included", "property amenities", "house specs"
    ],
    "budget_planning": [
        "help with budget", "budget planning", "affordability", "what can i afford",
        "budget advice", "financial planning", "loan information", "mortgage help",
        "down payment", "monthly payment", "mortgage calculator", "affordability calculator",
        "how much can i afford", "budget calculator", "loan eligibility", "mortgage rates"
    ],
    "documents": [
        "what documents", "required documents", "paperwork needed", "legal documents",
        "buying documents", "sale documents", "property documents", "documents needed",
        "required paperwork", "legal paperwork", "buying process", "sale process",
        "what papers", "documentation needed", "required papers", "legal requirements"
    ],
    "goodbye": [
        "bye", "goodbye", "see you", "thanks", "thank you", "appreciate it",
        "that's all", "done", "finished", "thank you very much", "thanks a lot",
        "appreciate your help", "that's everything", "all done", "no more questions"
    ],
    "general_question": [
        "how does", "what is", "explain", "tell me about", "can you help",
        "i want to know", "what are", "how do i", "help me understand",
        "what does", "how can", "what should", "how to", "can you explain",
        "i don't understand", "clarify", "what means", "help me with"
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
        "I'd be happy to help you find properties! Let me search for options that match your criteria.",
        "Great! I'll search for properties that fit your needs. Give me a moment to find the best matches.",
        "Perfect! Let me find properties that match what you're looking for. I'll show you the best options available.",
        "I can help you find the perfect property. Let me search our listings for you right away.",
        "Excellent! I'll search for properties matching your requirements. You'll see the results shortly."
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

# Conversation memory (simple in-memory store, can be replaced with Redis/DB)
conversation_memory = {}

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
    
    # Create and train pipeline with better parameters
    vectorizer = TfidfVectorizer(
        max_features=1500,  # Increased features for better accuracy
        ngram_range=(1, 3),  # Include trigrams for better context
        stop_words='english',
        min_df=1,  # Minimum document frequency
        max_df=0.95,  # Maximum document frequency
        sublinear_tf=True  # Apply sublinear tf scaling
    )
    label_encoder = LabelEncoder()
    
    X = vectorizer.fit_transform(texts)
    y = label_encoder.fit_transform(labels)
    
    # Use better alpha for smoothing
    intent_classifier = MultinomialNB(alpha=0.05)  # Lower alpha for better sensitivity
    intent_classifier.fit(X, y)
    
    # Calculate and log training accuracy
    train_predictions = intent_classifier.predict(X)
    train_accuracy = (train_predictions == y).mean()
    print(f"✅ Intent classifier trained successfully (training accuracy: {train_accuracy*100:.1f}%)")
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
    
    # Extract location (extended city names list)
    cities = [
        "new york", "los angeles", "chicago", "houston", "phoenix", "philadelphia",
        "san antonio", "san diego", "dallas", "san jose", "miami", "atlanta",
        "boston", "seattle", "denver", "detroit", "minneapolis", "portland",
        "austin", "jacksonville", "fort worth", "columbus", "charlotte", "san francisco",
        "indianapolis", "washington", "memphis", "baltimore", "milwaukee", "el paso",
        "nashville", "oklahoma city", "las vegas", "louisville", "portland", "tucson",
        "fresno", "sacramento", "kansas city", "mesa", "atlanta", "omaha", "raleigh",
        "virginia beach", "oakland", "minneapolis", "tulsa", "arlington", "tampa"
    ]
    
    # Also check for state abbreviations and common patterns
    state_patterns = {
        "california": ["california", "ca", "cali"],
        "texas": ["texas", "tx"],
        "florida": ["florida", "fl"],
        "new york": ["new york", "ny", "nyc"],
        "illinois": ["illinois", "il", "chicago"],
        "pennsylvania": ["pennsylvania", "pa", "philadelphia"]
    }
    
    # Check for city names first
    for city in cities:
        if city in message_lower:
            entities["location"] = city.title()
            break
    
    # If no city found, check for state patterns
    if not entities["location"]:
        for state, patterns in state_patterns.items():
            if any(pattern in message_lower for pattern in patterns):
                # Try to find a city in that state
                for city in cities:
                    if city in message_lower:
                        entities["location"] = city.title()
                        break
                break
    
    # Extract budget (enhanced patterns)
    budget_patterns = [
        r'\$?(\d+\.?\d*)\s*(?:million|mil|m)\b',
        r'\$?(\d+\.?\d*)\s*(?:thousand|k)\b',
        r'\$?(\d{1,3}(?:,\d{3})*(?:\.\d+)?)',
        r'under\s+\$?(\d{1,3}(?:,\d{3})*(?:\.\d+)?)',
        r'below\s+\$?(\d{1,3}(?:,\d{3})*(?:\.\d+)?)',
        r'less than\s+\$?(\d{1,3}(?:,\d{3})*(?:\.\d+)?)',
        r'max\s+\$?(\d{1,3}(?:,\d{3})*(?:\.\d+)?)',
        r'maximum\s+\$?(\d{1,3}(?:,\d{3})*(?:\.\d+)?)',
        r'up to\s+\$?(\d{1,3}(?:,\d{3})*(?:\.\d+)?)',
        r'around\s+\$?(\d{1,3}(?:,\d{3})*(?:\.\d+)?)',
        r'about\s+\$?(\d{1,3}(?:,\d{3})*(?:\.\d+)?)',
        r'approximately\s+\$?(\d{1,3}(?:,\d{3})*(?:\.\d+)?)',
        r'budget\s+(?:of|is)?\s+\$?(\d{1,3}(?:,\d{3})*(?:\.\d+)?)'
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
    
    # Extract bedrooms (enhanced patterns)
    bedroom_patterns = [
        r'(\d+)\s*(?:bed|bedroom|br|beds|bedrooms)\b',
        r'(\d+)\s*(?:bedroom|bed)\s+(?:property|home|house|apartment)',
        r'(\d+)\s*(?:br|bed)',
        r'(\d+)\s*(?:room|rooms)',
        r'(\d+)\s*(?:bedroom|bed)'
    ]
    for pattern in bedroom_patterns:
        bedroom_match = re.search(pattern, message_lower)
        if bedroom_match:
            entities["bedrooms"] = int(bedroom_match.group(1))
            break
    
    # Extract bathrooms (enhanced patterns)
    bathroom_patterns = [
        r'(\d+)\s*(?:bath|bathroom|ba|baths|bathrooms)\b',
        r'(\d+)\s*(?:bathroom|bath)',
        r'(\d+)\s*(?:ba|bath)',
        r'(\d+(?:\.\d+)?)\s*(?:bath|bathroom)'  # Handle 1.5, 2.5 bathrooms
    ]
    for pattern in bathroom_patterns:
        bathroom_match = re.search(pattern, message_lower)
        if bathroom_match:
            try:
                entities["bathrooms"] = float(bathroom_match.group(1))
            except:
                entities["bathrooms"] = int(float(bathroom_match.group(1)))
            break
    
    # Extract property type
    if any(word in message_lower for word in ["apartment", "condo", "condominium"]):
        entities["property_type"] = "Condo"
    elif any(word in message_lower for word in ["house", "home", "single family", "sfh"]):
        entities["property_type"] = "SFH"
    
    return entities

def extract_conversation_entities(conversation_context: List) -> Dict:
    """Extract entities from conversation history"""
    if not conversation_context:
        return {}
    
    entities = {}
    for msg in conversation_context:
        if isinstance(msg, dict) and msg.get("content"):
            msg_entities = extract_entities(msg["content"])
            # Merge entities (later messages override earlier ones)
            for key, value in msg_entities.items():
                if value is not None:
                    entities[key] = value
    return entities

def generate_automated_response(intent: str, entities: Dict, confidence: float, conversation_context: List = None) -> str:
    """Generate an automated response based on intent and entities"""
    import random
    
    # Get base response
    templates = RESPONSE_TEMPLATES.get(intent, RESPONSE_TEMPLATES["general_question"])
    response = random.choice(templates)
    
    # Extract entities from conversation context for continuity
    if conversation_context:
        context_entities = extract_conversation_entities(conversation_context)
        # Merge context entities (fill in missing ones)
        for key, value in context_entities.items():
            if entities.get(key) is None and value is not None:
                entities[key] = value
    
    # Enhance response with entity information (more natural flow)
    entity_parts = []
    
    if entities.get("location"):
        entity_parts.append(f"in {entities['location']}")
    
    if entities.get("bedrooms"):
        entity_parts.append(f"{entities['bedrooms']} bedroom{'s' if entities['bedrooms'] > 1 else ''}")
    
    if entities.get("bathrooms"):
        bathrooms = entities['bathrooms']
        if isinstance(bathrooms, float) and bathrooms % 1 != 0:
            entity_parts.append(f"{bathrooms} bathrooms")
        else:
            entity_parts.append(f"{int(bathrooms)} bathroom{'s' if bathrooms > 1 else ''}")
    
    if entities.get("budget"):
        budget_str = f"${entities['budget']:,}"
        entity_parts.append(f"around {budget_str}")
    
    # Build natural response based on intent
    if intent == "search_property":
        if entity_parts:
            # More natural phrasing
            if len(entity_parts) == 1:
                response = f"I'd be happy to help you find properties {entity_parts[0]}! Let me search for you."
            elif len(entity_parts) == 2:
                response = f"Perfect! I'll search for {entity_parts[0]} properties {entity_parts[1]}. Give me a moment."
            else:
                response = f"Great! I'll find properties with {', '.join(entity_parts[:-1])}, and {entity_parts[-1]}. Searching now!"
        else:
            # No entities extracted, use base response
            response = random.choice(RESPONSE_TEMPLATES["search_property"])
    else:
        # For other intents, add entity info more naturally
        if entity_parts:
            response += f" I notice you mentioned {', '.join(entity_parts)}."
    
    # Add follow-up question for low confidence or missing info
    if confidence < 0.6:
        response += " Could you provide a bit more detail about what you're looking for?"
    elif intent == "search_property" and not entities.get("location") and not entities.get("budget"):
        response += " What location or budget range are you considering?"
    
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
        conversation_context = data.get("conversation_history", [])
        
        if not message or not isinstance(message, str):
            raise HTTPException(status_code=400, detail="Message is required and must be a string")
        
        # Clean and normalize message
        message = message.strip()
        if len(message) < 1:
            raise HTTPException(status_code=400, detail="Message cannot be empty")
        
        # Predict intent
        intent_result = predict_intent(message)
        
        # Extract entities
        entities = extract_entities(message)
        
        # Generate automated response with context
        automated_response = generate_automated_response(
            intent_result["intent"],
            entities,
            intent_result["confidence"],
            conversation_context
        )
        
        # Calculate response quality score
        quality_score = calculate_response_quality(intent_result, entities)
        
        return {
            "success": True,
            "intent": intent_result["intent"],
            "confidence": intent_result["confidence"],
            "top_intents": intent_result.get("top_intents", []),
            "entities": entities,
            "automated_response": automated_response,
            "suggested_actions": get_suggested_actions(intent_result["intent"], entities),
            "quality_score": quality_score,
            "should_use_ml_response": intent_result["confidence"] > 0.65 and quality_score > 0.6
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"Analysis error: {e}")
        raise HTTPException(status_code=500, detail=f"Analysis error: {str(e)}")

def calculate_response_quality(intent_result: Dict, entities: Dict) -> float:
    """Calculate quality score for the response (0-1)"""
    score = 0.0
    
    # Intent confidence contributes 50%
    score += intent_result.get("confidence", 0) * 0.5
    
    # Entity extraction contributes 30%
    entity_count = sum(1 for v in entities.values() if v is not None)
    entity_score = min(entity_count / 5.0, 1.0)  # Max 5 entities
    score += entity_score * 0.3
    
    # Intent clarity contributes 20%
    top_intents = intent_result.get("top_intents", [])
    if top_intents and len(top_intents) > 0:
        # Higher score if top intent is much more confident than second
        if len(top_intents) > 1:
            confidence_diff = top_intents[0]["confidence"] - top_intents[1]["confidence"]
            clarity_score = min(confidence_diff * 2, 1.0)  # Normalize
        else:
            clarity_score = 1.0
        score += clarity_score * 0.2
    
    return min(score, 1.0)

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
