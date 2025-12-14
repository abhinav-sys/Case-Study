import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';
import OpenAI from 'openai';
import fetch from 'node-fetch';
import savedPropertyRoutes from './routes/savedProperties.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;
const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:8000';

// Middleware
app.use(cors());
app.use(express.json());

// Initialize OpenAI (optional, for NLP bonus feature)
let openai = null;
if (process.env.OPENAI_API_KEY) {
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
  console.log('✅ OpenAI initialized successfully');
} else {
  console.log('⚠️  OPENAI_API_KEY not found - ChatGPT features disabled');
}

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/realestate-chatbot';
mongoose.connect(MONGODB_URI, {
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
})
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err.message);
    console.log('⚠️  Continuing without MongoDB (saving features will not work)');
  });

// Load JSON data files
const loadJSONFile = (filename) => {
  try {
    const filePath = join(__dirname, '..', 'data', filename);
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error loading ${filename}:`, error);
    return [];
  }
};

// Merge all property data
const mergePropertyData = () => {
  const basics = loadJSONFile('property_basics.json');
  const characteristics = loadJSONFile('property_characteristics.json');
  const images = loadJSONFile('property_images.json');

  return basics.map(basic => {
    const char = characteristics.find(c => c.id === basic.id);
    const img = images.find(i => i.id === basic.id);
    
    return {
      ...basic,
      ...char,
      ...img
    };
  });
};

// Filter properties based on user preferences
const filterProperties = (properties, filters) => {
  return properties.filter(property => {
    // Location filter (case-insensitive partial match)
    if (filters.location) {
      const locationMatch = property.location.toLowerCase().includes(filters.location.toLowerCase());
      if (!locationMatch) return false;
    }

    // Budget filter (max price)
    if (filters.maxBudget) {
      if (property.price > filters.maxBudget) return false;
    }
    if (filters.minBudget) {
      if (property.price < filters.minBudget) return false;
    }

    // Bedrooms filter
    if (filters.bedrooms) {
      if (property.bedrooms < filters.bedrooms) return false;
    }

    // Bathrooms filter
    if (filters.bathrooms) {
      if (property.bathrooms < filters.bathrooms) return false;
    }

    // Size filter (minimum)
    if (filters.minSize) {
      if (property.size_sqft < filters.minSize) return false;
    }

    // Amenities filter (at least one must match)
    if (filters.amenities && filters.amenities.length > 0) {
      const hasAmenity = filters.amenities.some(amenity =>
        property.amenities.some(p => p.toLowerCase().includes(amenity.toLowerCase()))
      );
      if (!hasAmenity) return false;
    }

    return true;
  });
};

// Extract filters from natural language using OpenAI (bonus feature)
const extractFiltersFromNLP = async (userMessage) => {
  if (!openai) {
    // Fallback to simple keyword extraction
    return extractFiltersSimple(userMessage);
  }

  try {
    const prompt = `Extract real estate search criteria from this user message. Return ONLY a JSON object with these fields (use null if not mentioned): location, maxBudget, minBudget, bedrooms, bathrooms, minSize, amenities (array). User message: "${userMessage}"`;
    
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "You are a real estate assistant. Extract search criteria from user messages and return only valid JSON." },
        { role: "user", content: prompt }
      ],
      temperature: 0.3,
    });

    const response = completion.choices[0].message.content;
    // Try to parse JSON from response
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return extractFiltersSimple(userMessage);
  } catch (error) {
    console.error('OpenAI error:', error);
    return extractFiltersSimple(userMessage);
  }
};

// Simple keyword-based filter extraction (fallback)
const extractFiltersSimple = (message) => {
  const filters = {};
  const lowerMessage = message.toLowerCase();

  // Extract location (look for city names or "in [location]")
  const locationMatch = lowerMessage.match(/(?:in|at|near)\s+([a-z\s,]+?)(?:\s|$|,|\.)/);
  if (locationMatch) {
    filters.location = locationMatch[1].trim();
  }

  // Extract budget
  const budgetMatch = lowerMessage.match(/(?:budget|price|cost|under|below|max|maximum)\s*(?:of|is|:)?\s*\$?(\d+[kkm]?)/);
  if (budgetMatch) {
    let budget = budgetMatch[1].replace(/[km]/gi, '');
    budget = parseInt(budget) * (budgetMatch[1].toLowerCase().includes('k') ? 1000 : 1);
    filters.maxBudget = budget;
  }

  // Extract bedrooms
  const bedroomsMatch = lowerMessage.match(/(\d+)\s*(?:bed|bedroom|bhk)/);
  if (bedroomsMatch) {
    filters.bedrooms = parseInt(bedroomsMatch[1]);
  }

  // Extract bathrooms
  const bathroomsMatch = lowerMessage.match(/(\d+)\s*(?:bath|bathroom)/);
  if (bathroomsMatch) {
    filters.bathrooms = parseInt(bathroomsMatch[1]);
  }

  return filters;
};

// Map property data to ML model input format
const mapPropertyToMLInput = (property) => {
  // Determine property type based on title/amenities
  const title = property.title?.toLowerCase() || '';
  const amenities = property.amenities || [];
  
  // Check if it's a condo/apartment or house
  const isCondo = title.includes('apartment') || title.includes('condo') || title.includes('studio') || title.includes('penthouse');
  const propertyType = isCondo ? 'Condo' : 'SFH';
  
  // Check for pool and garage in amenities
  const hasPool = amenities.some(a => 
    a.toLowerCase().includes('pool') || 
    a.toLowerCase().includes('swimming')
  );
  const hasGarage = amenities.some(a => 
    a.toLowerCase().includes('garage') || 
    a.toLowerCase().includes('parking')
  );
  
  // Use size_sqft for building_area (Condo) or lot_area (SFH)
  const size = property.size_sqft || 1500; // Default size
  
  // Estimate year built (random between 1990-2023 for demo)
  // In production, this would come from actual data
  const yearBuilt = property.year_built || 2010;
  
  // Estimate school rating (random between 7-10 for demo)
  // In production, this would come from actual data
  const schoolRating = property.school_rating || 8;
  
  return {
    property_type: propertyType,
    lot_area: propertyType === 'SFH' ? size : 0,
    building_area: propertyType === 'Condo' ? size : 0,
    bedrooms: property.bedrooms || 2,
    bathrooms: property.bathrooms || 2,
    year_built: yearBuilt,
    has_pool: hasPool,
    has_garage: hasGarage,
    school_rating: schoolRating
  };
};

// Call ML service for price prediction
const predictPrice = async (property) => {
  try {
    const mlInput = mapPropertyToMLInput(property);
    const response = await fetch(`${ML_SERVICE_URL}/predict`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(mlInput),
    });
    
    if (!response.ok) {
      throw new Error(`ML service error: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data.predicted_price;
  } catch (error) {
    console.error('Price prediction error:', error);
    return null; // Return null if prediction fails
  }
};

// Enhance properties with predicted prices
const enhancePropertiesWithPredictions = async (properties) => {
  // Check if ML service is available
  try {
    const healthCheck = await fetch(`${ML_SERVICE_URL}/health`);
    if (!healthCheck.ok) {
      console.log('⚠️ ML service not available, skipping predictions');
      return properties;
    }
  } catch (error) {
    console.log('⚠️ ML service not available, skipping predictions');
    return properties;
  }
  
  // Enhance properties with predictions (limit to avoid too many requests)
  const enhancedProperties = await Promise.all(
    properties.map(async (property) => {
      const predictedPrice = await predictPrice(property);
      return {
        ...property,
        predicted_price: predictedPrice,
        price_difference: predictedPrice ? predictedPrice - property.price : null,
        price_difference_percent: predictedPrice 
          ? ((predictedPrice - property.price) / property.price * 100).toFixed(1)
          : null
      };
    })
  );
  
  return enhancedProperties;
};

// Routes
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Real Estate Chatbot API is running',
    ml_service_url: ML_SERVICE_URL
  });
});

// Get all merged properties
app.get('/api/properties', async (req, res) => {
  try {
    const properties = mergePropertyData();
    const includePredictions = req.query.predict === 'true';
    
    if (includePredictions) {
      const enhancedProperties = await enhancePropertiesWithPredictions(properties);
      res.json({ success: true, data: enhancedProperties, count: enhancedProperties.length });
    } else {
      res.json({ success: true, data: properties, count: properties.length });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Search/filter properties (handles both GET and POST)
app.get('/api/properties/search', async (req, res) => {
  try {
    const { q, location, maxPrice, minPrice, bedrooms, bathrooms, minSize } = req.query;
    
    const filters = {};
    if (q) filters.location = q;
    if (location) filters.location = location;
    if (maxPrice) filters.maxBudget = parseInt(maxPrice);
    if (minPrice) filters.minBudget = parseInt(minPrice);
    if (bedrooms) filters.bedrooms = parseInt(bedrooms);
    if (bathrooms) filters.bathrooms = parseInt(bathrooms);
    if (minSize) filters.minSize = parseInt(minSize);

    const allProperties = mergePropertyData();
    const filteredProperties = filterProperties(allProperties, filters);
    
    res.json({
      success: true,
      data: filteredProperties,
      count: filteredProperties.length,
      filters: filters
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Advanced AI Property Analysis using ChatGPT
const analyzePropertyWithAI = async (property, allProperties) => {
  if (!openai) return null;
  
  try {
    const similarProperties = allProperties
      .filter(p => p.id !== property.id && p.location === property.location)
      .slice(0, 3);
    
    const prompt = `Analyze this real estate property and provide insights:

Property: ${property.title}
Location: ${property.location}
Price: $${property.price.toLocaleString()}
Bedrooms: ${property.bedrooms}, Bathrooms: ${property.bathrooms}
Size: ${property.size_sqft} sqft
Amenities: ${property.amenities?.join(', ') || 'None'}

${property.predicted_price ? `ML Predicted Price: $${property.predicted_price.toLocaleString()}` : ''}
${property.price_difference_percent ? `Price Difference: ${property.price_difference_percent}%` : ''}

Similar properties in area: ${similarProperties.map(p => `${p.title} - $${p.price.toLocaleString()}`).join(', ')}

Provide a brief analysis (2-3 sentences) covering:
1. Value assessment (is it a good deal?)
2. Key features/amenities highlight
3. Market positioning

Be concise and helpful.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "You are a real estate expert providing property analysis and investment insights." },
        { role: "user", content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 200,
    });

    return completion.choices[0].message.content;
  } catch (error) {
    console.error('Property analysis error:', error);
    return null;
  }
};

// Intelligent Property Recommendations using ML + AI
const getIntelligentRecommendations = async (userFilters, allProperties, foundProperties) => {
  if (!openai || foundProperties.length > 0) return null;
  
  try {
    // Find similar properties with relaxed criteria
    const relaxedFilters = { ...userFilters };
    if (relaxedFilters.maxBudget) relaxedFilters.maxBudget = relaxedFilters.maxBudget * 1.2;
    if (relaxedFilters.bedrooms) relaxedFilters.bedrooms = relaxedFilters.bedrooms - 1;
    
    const similarProperties = filterProperties(allProperties, relaxedFilters).slice(0, 5);
    
    if (similarProperties.length === 0) return null;
    
    const prompt = `The user searched for properties with these criteria: ${JSON.stringify(userFilters)}
No exact matches were found, but we have ${similarProperties.length} similar properties available.

Similar properties:
${similarProperties.map((p, i) => `${i+1}. ${p.title} in ${p.location} - $${p.price.toLocaleString()} (${p.bedrooms} bed, ${p.bathrooms} bath)`).join('\n')}

Provide a helpful response (2-3 sentences) that:
1. Acknowledges no exact match
2. Mentions we found similar properties
3. Suggests they might want to see these alternatives
4. Be encouraging and helpful`;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "You are a helpful real estate assistant. Suggest similar properties when exact matches aren't found." },
        { role: "user", content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 150,
    });

    return {
      message: completion.choices[0].message.content,
      properties: similarProperties
    };
  } catch (error) {
    console.error('Recommendations error:', error);
    return null;
  }
};

// Enhanced ChatGPT conversation handler with advanced AI features
const handleChatGPTConversation = async (userMessage, conversationHistory = [], allProperties = []) => {
  if (!openai) {
    return null; // No OpenAI API key, return null to use fallback
  }

  try {
    // Check if message is a property search query
    const searchKeywords = ['find', 'search', 'show', 'properties', 'homes', 'houses', 'apartments', 'condos', 'buy', 'rent', 'bedroom', 'bathroom', 'budget', 'price', 'location', 'area', 'tell me', 'can you', 'i need', 'looking for'];
    const isSearchQuery = searchKeywords.some(keyword => 
      userMessage.toLowerCase().includes(keyword)
    );

    // If it's a search query, extract filters and return null to proceed with property search
    if (isSearchQuery) {
      return null;
    }

    // Enhanced system prompt with property data context
    const propertyContext = allProperties.length > 0 ? `
Available property data: ${allProperties.length} properties in locations: ${[...new Set(allProperties.map(p => p.location).filter(Boolean))].slice(0, 5).join(', ')}
Price range: $${Math.min(...allProperties.map(p => p.price).filter(Boolean)).toLocaleString()} - $${Math.max(...allProperties.map(p => p.price).filter(Boolean)).toLocaleString()}
` : '';

    // For general conversation, use ChatGPT with enhanced context
    const messages = [
      {
        role: "system",
        content: `You are an expert real estate assistant chatbot for Agent Mira, a real estate technology company. 
${propertyContext}
You help users with:
- Real estate questions and advice
- Property investment insights
- Market trends and analysis
- Home buying/selling guidance
- Property feature explanations
- Budget planning advice

Be knowledgeable, friendly, and professional. Reference the available property data when relevant.`
      },
      ...conversationHistory.slice(-5), // Keep last 5 messages for context
      {
        role: "user",
        content: userMessage
      }
    ];

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: messages,
      temperature: 0.7,
      max_tokens: 600,
    });

    return completion.choices[0].message.content;
  } catch (error) {
    console.error('ChatGPT conversation error:', error);
    return null; // Fallback to property search
  }
};

app.post('/api/properties/search', async (req, res) => {
  try {
    const { filters, message, predict, conversationHistory } = req.body;
    
    const allProperties = mergePropertyData();
    
    // First, try ChatGPT for general conversation (if OpenAI is available)
    if (message && openai) {
      const chatResponse = await handleChatGPTConversation(message, conversationHistory || [], allProperties);
      
      // If ChatGPT provided a response and it's not a search query, return it
      if (chatResponse) {
        return res.json({
          success: true,
          isConversation: true,
          message: chatResponse,
          data: [],
          count: 0,
          filters: null
        });
      }
    }
    
    // Otherwise, proceed with property search
    let searchFilters = filters;
    
    // If message is provided, try NLP extraction
    if (message && !filters) {
      searchFilters = await extractFiltersFromNLP(message);
    }

    let filteredProperties = filterProperties(allProperties, searchFilters || {});
    
    // Add price predictions if requested
    if (predict === true) {
      filteredProperties = await enhancePropertiesWithPredictions(filteredProperties);
      
      // Add AI analysis to properties if ChatGPT is available
      if (openai && filteredProperties.length > 0) {
        // Analyze top 3 properties with AI
        const topProperties = filteredProperties.slice(0, 3);
        for (const property of topProperties) {
          const analysis = await analyzePropertyWithAI(property, allProperties);
          if (analysis) {
            property.ai_analysis = analysis;
          }
        }
      }
    }
    
    // If no properties found, try intelligent recommendations
    if (filteredProperties.length === 0 && openai && message) {
      console.log('🔍 No properties found, trying intelligent recommendations...');
      
      // First, try to get intelligent recommendations
      const recommendations = await getIntelligentRecommendations(searchFilters, allProperties, filteredProperties);
      
      if (recommendations && recommendations.properties.length > 0) {
        // Add predictions to recommended properties
        let recommendedProperties = recommendations.properties;
        if (predict === true) {
          recommendedProperties = await enhancePropertiesWithPredictions(recommendedProperties);
        }
        
        return res.json({
          success: true,
          isConversation: true,
          message: recommendations.message,
          data: recommendedProperties,
          count: recommendedProperties.length,
          filters: searchFilters,
          isRecommendation: true
        });
      }
      
      // If no recommendations, provide helpful ChatGPT response
      console.log('🔍 No recommendations, using ChatGPT to provide helpful response...');
      try {
        // Get available locations from properties
        const availableLocations = [...new Set(allProperties.map(p => p.location).filter(Boolean))].slice(0, 10);
        const availablePriceRange = {
          min: Math.min(...allProperties.map(p => p.price).filter(Boolean)),
          max: Math.max(...allProperties.map(p => p.price).filter(Boolean))
        };
        
        // Get more detailed statistics
        const totalProperties = allProperties.length;
        const locationCounts = {};
        allProperties.forEach(p => {
          if (p.location) {
            locationCounts[p.location] = (locationCounts[p.location] || 0) + 1;
          }
        });
        const locationList = Object.keys(locationCounts).sort();
        const bedroomOptions = [...new Set(allProperties.map(p => p.bedrooms).filter(Boolean))].sort((a, b) => a - b);
        const bathroomOptions = [...new Set(allProperties.map(p => p.bathrooms).filter(Boolean))].sort((a, b) => a - b);
        
        // Determine the specific reason for no results
        let reason = '';
        if (searchFilters.location && !locationList.some(loc => loc.toLowerCase().includes(searchFilters.location.toLowerCase()))) {
          reason = `The location "${searchFilters.location}" is not in our database. Our dataset contains properties only in US cities: ${locationList.join(', ')}.`;
        } else if (searchFilters.maxBudget && searchFilters.maxBudget < availablePriceRange.min) {
          reason = `The budget of $${searchFilters.maxBudget.toLocaleString()} is below our minimum property price of $${availablePriceRange.min.toLocaleString()}.`;
        } else if (searchFilters.minBudget && searchFilters.minBudget > availablePriceRange.max) {
          reason = `The minimum budget of $${searchFilters.minBudget.toLocaleString()} exceeds our maximum property price of $${availablePriceRange.max.toLocaleString()}.`;
        } else if (searchFilters.bedrooms && !bedroomOptions.includes(searchFilters.bedrooms) && searchFilters.bedrooms > Math.max(...bedroomOptions)) {
          reason = `Properties with ${searchFilters.bedrooms} bedrooms are not available. Our database has properties with ${bedroomOptions.join(', ')} bedrooms.`;
        } else {
          reason = `No properties match the combination of your search criteria.`;
        }
        
        const chatPrompt = `IMPORTANT: You MUST mention that the data comes from JSON files.

User searched for: "${message}"
Search filters: ${JSON.stringify(searchFilters)}
Result: No properties found

DATASET INFORMATION (MUST MENTION IN RESPONSE):
- Data source: JSON files (property_basics.json, property_characteristics.json, property_images.json)
- Total properties: ${totalProperties}
- Locations available: ${locationList.join(', ')} (US cities only)
- Price range: $${availablePriceRange.min.toLocaleString()} - $${availablePriceRange.max.toLocaleString()}
- Bedrooms available: ${bedroomOptions.join(', ')}
- Bathrooms available: ${bathroomOptions.join(', ')}

REASON: ${reason}

Write a response that MUST include:
1. "Our dataset is sourced from JSON files" or "Our data comes from JSON files"
2. "Properties are limited to US cities: [list cities]"
3. The specific reason (${reason})
4. Suggest actual alternatives from the list above
5. Be transparent and accurate

Response format: Start with acknowledging the search, then explain the JSON data source and limitations, then suggest alternatives.`;

        const completion = await openai.chat.completions.create({
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "system",
              content: "You are a real estate chatbot that uses data from JSON files (property_basics.json, property_characteristics.json, property_images.json). Be transparent: mention that the dataset comes from JSON files and is limited to US cities. Always be accurate about what data is actually available. Use phrases like 'our current dataset contains', 'our JSON data includes', or 'based on our available data'."
            },
            {
              role: "user",
              content: chatPrompt
            }
          ],
          temperature: 0.7,
          max_tokens: 400,
        });

        const helpfulMessage = completion.choices[0].message.content;
        console.log('✅ ChatGPT provided helpful response');
        
        return res.json({
          success: true,
          isConversation: true,
          message: helpfulMessage,
          data: [],
          count: 0,
          filters: searchFilters,
          suggestions: {
            availableLocations: availableLocations,
            priceRange: availablePriceRange
          }
        });
      } catch (error) {
        console.error('❌ ChatGPT helpful response error:', error.message);
        // Fall through to return empty results
      }
    } else if (filteredProperties.length === 0) {
      console.log('⚠️  No properties found but ChatGPT not available or no message');
    }
    
    // Add intelligent insights for found properties
    let responseMessage = null;
    if (filteredProperties.length > 0 && openai && message) {
      try {
        const insightsPrompt = `The user searched: "${message}"
Found ${filteredProperties.length} properties matching their criteria.

Provide a brief, friendly response (1-2 sentences) that:
1. Confirms we found properties
2. Highlights key features if relevant
3. Encourages them to explore the results

Be concise and enthusiastic.`;

        const insightsCompletion = await openai.chat.completions.create({
          model: "gpt-3.5-turbo",
          messages: [
            { role: "system", content: "You are a helpful real estate assistant. Provide brief, friendly confirmations when properties are found." },
            { role: "user", content: insightsPrompt }
          ],
          temperature: 0.7,
          max_tokens: 100,
        });
        
        responseMessage = insightsCompletion.choices[0].message.content;
      } catch (error) {
        console.error('Insights generation error:', error);
      }
    }
    
    res.json({
      success: true,
      isConversation: responseMessage ? true : false,
      message: responseMessage,
      data: filteredProperties,
      count: filteredProperties.length,
      filters: searchFilters
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Advanced AI Market Analysis Endpoint
app.post('/api/properties/analyze', async (req, res) => {
  try {
    const { propertyId } = req.body;
    if (!openai) {
      return res.status(400).json({ success: false, error: 'OpenAI API not configured' });
    }

    const allProperties = mergePropertyData();
    const property = allProperties.find(p => p.id === propertyId);
    
    if (!property) {
      return res.status(404).json({ success: false, error: 'Property not found' });
    }

    // Get price prediction
    let predictedPrice = null;
    try {
      const mlInput = mapPropertyToMLInput(property);
      const mlResponse = await fetch(`${ML_SERVICE_URL}/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mlInput),
      });
      if (mlResponse.ok) {
        const mlData = await mlResponse.json();
        predictedPrice = mlData.predicted_price;
      }
    } catch (error) {
      console.error('ML prediction error:', error);
    }

    // Get AI analysis
    const analysis = await analyzePropertyWithAI(property, allProperties);
    
    // Get market insights
    const similarProperties = allProperties
      .filter(p => p.id !== property.id && p.location === property.location)
      .slice(0, 5);
    
    const avgPrice = similarProperties.length > 0
      ? similarProperties.reduce((sum, p) => sum + p.price, 0) / similarProperties.length
      : property.price;

    const insightsPrompt = `Analyze this property for investment potential:

Property: ${property.title}
Location: ${property.location}
Price: $${property.price.toLocaleString()}
${predictedPrice ? `ML Predicted: $${predictedPrice.toLocaleString()}` : ''}
Bedrooms: ${property.bedrooms}, Bathrooms: ${property.bathrooms}
Size: ${property.size_sqft} sqft
Average price in area: $${avgPrice.toLocaleString()}

Provide investment insights (2-3 sentences) covering:
1. Value assessment vs market
2. Investment potential
3. Key considerations

Be professional and helpful.`;

    const insightsCompletion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "You are a real estate investment analyst providing market insights." },
        { role: "user", content: insightsPrompt }
      ],
      temperature: 0.7,
      max_tokens: 250,
    });

    res.json({
      success: true,
      analysis: analysis,
      investmentInsights: insightsCompletion.choices[0].message.content,
      predictedPrice: predictedPrice,
      marketAverage: avgPrice,
      similarPropertiesCount: similarProperties.length
    });
  } catch (error) {
    console.error('Analysis error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Price prediction endpoint
app.post('/api/properties/predict', async (req, res) => {
  try {
    const { property } = req.body;
    
    if (!property) {
      return res.status(400).json({ success: false, error: 'Property data is required' });
    }
    
    const mlInput = mapPropertyToMLInput(property);
    const response = await fetch(`${ML_SERVICE_URL}/predict`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(mlInput),
    });
    
    if (!response.ok) {
      throw new Error(`ML service error: ${response.statusText}`);
    }
    
    const data = await response.json();
    res.json({
      success: true,
      predicted_price: data.predicted_price,
      input_data: mlInput
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Use saved properties routes
app.use('/api/saved-properties', savedPropertyRoutes);

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

