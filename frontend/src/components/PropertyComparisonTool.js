import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { Home, MapPin, Bed, Bath, Square, TrendingUp, TrendingDown, Loader, AlertCircle, CheckCircle2 } from 'lucide-react';

const PropertyComparisonTool = () => {
  const [address1, setAddress1] = useState('');
  const [address2, setAddress2] = useState('');
  const [property1, setProperty1] = useState(null);
  const [property2, setProperty2] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [allProperties, setAllProperties] = useState([]);
  const [addressSuggestions1, setAddressSuggestions1] = useState([]);
  const [addressSuggestions2, setAddressSuggestions2] = useState([]);

  useEffect(() => {
    loadAllProperties();
  }, []);

  const loadAllProperties = async () => {
    try {
      const response = await axios.get('/api/properties?predict=true');
      if (response.data.success) {
        setAllProperties(response.data.data);
      }
    } catch (error) {
      console.error('Error loading properties:', error);
    }
  };

  // Map address to property (fuzzy matching on location)
  const findPropertyByAddress = (address) => {
    if (!address.trim()) return null;
    
    const addressLower = address.toLowerCase();
    
    // Try exact match first
    let match = allProperties.find(p => 
      p.location.toLowerCase() === addressLower
    );
    
    // Try partial match
    if (!match) {
      match = allProperties.find(p => 
        p.location.toLowerCase().includes(addressLower) ||
        addressLower.includes(p.location.toLowerCase())
      );
    }
    
    // Try matching by city name
    if (!match) {
      const cityMatch = addressLower.split(',')[0].trim();
      match = allProperties.find(p => 
        p.location.toLowerCase().includes(cityMatch)
      );
    }
    
    return match || null;
  };

  const handleAddress1Change = (value) => {
    setAddress1(value);
    setProperty1(null);
    
    if (value.length > 2) {
      const suggestions = allProperties
        .filter(p => p.location.toLowerCase().includes(value.toLowerCase()))
        .slice(0, 5)
        .map(p => p.location);
      setAddressSuggestions1(suggestions);
    } else {
      setAddressSuggestions1([]);
    }
  };

  const handleAddress2Change = (value) => {
    setAddress2(value);
    setProperty2(null);
    
    if (value.length > 2) {
      const suggestions = allProperties
        .filter(p => p.location.toLowerCase().includes(value.toLowerCase()))
        .slice(0, 5)
        .map(p => p.location);
      setAddressSuggestions2(suggestions);
    } else {
      setAddressSuggestions2([]);
    }
  };

  const handleCompare = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      const prop1 = findPropertyByAddress(address1);
      const prop2 = findPropertyByAddress(address2);
      
      if (!prop1) {
        setError(`Property not found for address: "${address1}". Please try a location from the property list.`);
        setIsLoading(false);
        return;
      }
      
      if (!prop2) {
        setError(`Property not found for address: "${address2}". Please try a location from the property list.`);
        setIsLoading(false);
        return;
      }
      
      // Get predictions for both properties
      const [pred1, pred2] = await Promise.all([
        axios.post('/api/properties/predict', { property: prop1 }).catch(() => ({ data: { predicted_price: null } })),
        axios.post('/api/properties/predict', { property: prop2 }).catch(() => ({ data: { predicted_price: null } }))
      ]);
      
      setProperty1({
        ...prop1,
        predicted_price: pred1.data.predicted_price,
        price_difference: pred1.data.predicted_price ? pred1.data.predicted_price - prop1.price : null,
        price_difference_percent: pred1.data.predicted_price 
          ? ((pred1.data.predicted_price - prop1.price) / prop1.price * 100).toFixed(1)
          : null
      });
      
      setProperty2({
        ...prop2,
        predicted_price: pred2.data.predicted_price,
        price_difference: pred2.data.predicted_price ? pred2.data.predicted_price - prop2.price : null,
        price_difference_percent: pred2.data.predicted_price 
          ? ((pred2.data.predicted_price - prop2.price) / prop2.price * 100).toFixed(1)
          : null
      });
      
    } catch (error) {
      setError('Error comparing properties. Please try again.');
      console.error('Comparison error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="backdrop-blur-xl bg-white/10 rounded-2xl p-6 md:p-8 border border-white/20 shadow-xl shadow-black/30"
      >
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
          🏠 Property Comparison Tool
        </h1>
        <p className="text-white/80 text-lg">
          Enter two property addresses to compare them side-by-side with AI-powered price predictions
        </p>
      </motion.div>

      {/* Input Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="backdrop-blur-xl bg-white/10 rounded-2xl p-6 md:p-8 border border-white/20 shadow-xl shadow-black/30"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Address 1 */}
          <div className="space-y-2">
            <label className="text-white font-semibold text-lg flex items-center gap-2">
              <MapPin size={20} className="text-purple-300" />
              Property 1 Address
            </label>
            <div className="relative">
              <input
                type="text"
                value={address1}
                onChange={(e) => handleAddress1Change(e.target.value)}
                placeholder="e.g., New York, NY or Los Angeles, CA"
                className="w-full px-4 py-3 rounded-xl bg-white/20 backdrop-blur-xl text-white placeholder-white/60 border-2 border-white/30 focus:border-purple-400/60 focus:outline-none focus:ring-4 focus:ring-purple-400/20 transition-all duration-300"
              />
              {addressSuggestions1.length > 0 && (
                <div className="absolute z-10 w-full mt-2 bg-white/20 backdrop-blur-xl rounded-xl border border-white/30 shadow-xl overflow-hidden">
                  {addressSuggestions1.map((suggestion, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setAddress1(suggestion);
                        setAddressSuggestions1([]);
                      }}
                      className="w-full px-4 py-2 text-left text-white hover:bg-white/30 transition-colors"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Address 2 */}
          <div className="space-y-2">
            <label className="text-white font-semibold text-lg flex items-center gap-2">
              <MapPin size={20} className="text-purple-300" />
              Property 2 Address
            </label>
            <div className="relative">
              <input
                type="text"
                value={address2}
                onChange={(e) => handleAddress2Change(e.target.value)}
                placeholder="e.g., Miami, FL or San Francisco, CA"
                className="w-full px-4 py-3 rounded-xl bg-white/20 backdrop-blur-xl text-white placeholder-white/60 border-2 border-white/30 focus:border-purple-400/60 focus:outline-none focus:ring-4 focus:ring-purple-400/20 transition-all duration-300"
              />
              {addressSuggestions2.length > 0 && (
                <div className="absolute z-10 w-full mt-2 bg-white/20 backdrop-blur-xl rounded-xl border border-white/30 shadow-xl overflow-hidden">
                  {addressSuggestions2.map((suggestion, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setAddress2(suggestion);
                        setAddressSuggestions2([]);
                      }}
                      className="w-full px-4 py-2 text-left text-white hover:bg-white/30 transition-colors"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-4 rounded-xl bg-red-500/20 border border-red-400/30 backdrop-blur-sm flex items-center gap-3"
          >
            <AlertCircle size={20} className="text-red-400" />
            <p className="text-red-200 text-sm">{error}</p>
          </motion.div>
        )}

        {/* Compare Button */}
        <motion.button
          onClick={handleCompare}
          disabled={!address1 || !address2 || isLoading}
          className="w-full md:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold text-lg shadow-xl shadow-purple-500/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
          whileHover={{ scale: isLoading ? 1 : 1.05 }}
          whileTap={{ scale: isLoading ? 1 : 0.95 }}
        >
          {isLoading ? (
            <>
              <Loader className="animate-spin" size={20} />
              <span>Comparing...</span>
            </>
          ) : (
            <>
              <CheckCircle2 size={20} />
              <span>Compare Properties</span>
            </>
          )}
        </motion.button>
      </motion.div>

      {/* Comparison Results */}
      <AnimatePresence>
        {property1 && property2 && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-6"
          >
            {/* Property 1 */}
            <PropertyComparisonCard property={property1} index={1} />
            
            {/* Property 2 */}
            <PropertyComparisonCard property={property2} index={2} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Help Text */}
      {!property1 && !property2 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="backdrop-blur-xl bg-white/10 rounded-2xl p-6 border border-white/20 shadow-xl shadow-black/30"
        >
          <h3 className="text-white font-semibold mb-3">💡 How to use:</h3>
          <ul className="text-white/80 space-y-2 text-sm">
            <li>• Enter property locations (e.g., "New York", "Los Angeles", "Miami")</li>
            <li>• Use the autocomplete suggestions to find matching properties</li>
            <li>• Click "Compare Properties" to see side-by-side comparison</li>
            <li>• View actual prices, AI predictions, and detailed features</li>
          </ul>
        </motion.div>
      )}
    </div>
  );
};

// Property Comparison Card Component
const PropertyComparisonCard = ({ property, index }) => {
  const formatPrice = (price) => {
    if (!price) return 'N/A';
    if (price >= 1000000) {
      return `$${(price / 1000000).toFixed(1)}M`;
    } else if (price >= 1000) {
      return `$${(price / 1000).toFixed(0)}k`;
    }
    return `$${price}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: index === 1 ? -30 : 30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      className="backdrop-blur-xl bg-white/10 rounded-2xl overflow-hidden border border-white/20 shadow-xl shadow-black/30"
    >
      {/* Image */}
      <div className="relative h-64 overflow-hidden">
        {property.image_url ? (
          <img
            src={property.image_url}
            alt={property.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-indigo-400 to-purple-600 flex items-center justify-center">
            <Home size={64} className="text-white opacity-80" />
          </div>
        )}
        <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-indigo-500/80 backdrop-blur-xl text-white font-bold">
          Property {index}
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-4">
        <h3 className="text-2xl font-bold text-white">{property.title}</h3>
        
        {/* Location */}
        <div className="flex items-center gap-2 text-white/80">
          <MapPin size={18} className="text-purple-300" />
          <span>{property.location}</span>
        </div>

        {/* Price Section */}
        <div className="space-y-3 pt-3 border-t border-white/20">
          <div>
            <span className="text-sm font-semibold text-white/60 uppercase tracking-wide">Actual Price</span>
            <div className="text-3xl font-bold text-white mt-1">
              {formatPrice(property.price)}
            </div>
          </div>

          {property.predicted_price && (
            <div className="p-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20">
              <span className="text-xs font-semibold text-white/60 uppercase tracking-wide block mb-2">AI Predicted Price</span>
              <div className="flex items-center gap-3">
                {property.price_difference >= 0 ? (
                  <TrendingUp size={20} className="text-green-400" />
                ) : (
                  <TrendingDown size={20} className="text-red-400" />
                )}
                <span className={`text-2xl font-bold ${property.price_difference >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {formatPrice(property.predicted_price)}
                </span>
                {property.price_difference_percent && (
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    property.price_difference >= 0 
                      ? 'bg-green-400/20 text-green-300' 
                      : 'bg-red-400/20 text-red-300'
                  }`}>
                    {property.price_difference >= 0 ? '+' : ''}{property.price_difference_percent}%
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-3 gap-3 pt-3 border-t border-white/20">
          <div className="flex flex-col items-center gap-1 p-3 rounded-xl bg-white/5 backdrop-blur-sm">
            <Bed size={20} className="text-purple-300" />
            <span className="text-lg font-bold text-white">{property.bedrooms}</span>
            <span className="text-xs text-white/60">Bedrooms</span>
          </div>
          <div className="flex flex-col items-center gap-1 p-3 rounded-xl bg-white/5 backdrop-blur-sm">
            <Bath size={20} className="text-purple-300" />
            <span className="text-lg font-bold text-white">{property.bathrooms}</span>
            <span className="text-xs text-white/60">Bathrooms</span>
          </div>
          <div className="flex flex-col items-center gap-1 p-3 rounded-xl bg-white/5 backdrop-blur-sm">
            <Square size={20} className="text-purple-300" />
            <span className="text-lg font-bold text-white">{property.size_sqft?.toLocaleString()}</span>
            <span className="text-xs text-white/60">sqft</span>
          </div>
        </div>

        {/* Amenities */}
        {property.amenities && property.amenities.length > 0 && (
          <div className="pt-3 border-t border-white/20">
            <span className="text-xs font-semibold text-white/60 uppercase tracking-wide block mb-2">Amenities</span>
            <div className="flex flex-wrap gap-2">
              {property.amenities.slice(0, 5).map((amenity, idx) => (
                <span
                  key={idx}
                  className="px-2 py-1 text-xs font-medium rounded-lg bg-white/10 text-white/90 border border-white/20 backdrop-blur-sm"
                >
                  {amenity}
                </span>
              ))}
              {property.amenities.length > 5 && (
                <span className="px-2 py-1 text-xs font-medium rounded-lg bg-purple-500/30 text-white border border-purple-400/30 backdrop-blur-sm">
                  +{property.amenities.length - 5} more
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default PropertyComparisonTool;
