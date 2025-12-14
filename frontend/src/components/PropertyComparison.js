import React from 'react';
import { motion } from 'framer-motion';
import { X, Home, MapPin, Bed, Bath, Square, DollarSign, BarChart3 } from 'lucide-react';

const PropertyComparison = ({ properties, onRemove }) => {
  if (properties.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="backdrop-blur-xl bg-white/10 rounded-2xl p-12 md:p-16 text-center border border-white/20 shadow-xl shadow-black/30"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", bounce: 0.4, delay: 0.2 }}
          className="flex justify-center mb-6"
        >
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
            <Home size={48} className="text-white" />
          </div>
        </motion.div>
        <h2 className="text-3xl font-bold text-white mb-4">No Properties to Compare</h2>
        <p className="text-white/80 text-lg mb-2">
          Add properties to comparison by clicking the "Compare" button on any property card.
        </p>
        <p className="text-white/60 text-sm">You can compare up to 3 properties at once.</p>
      </motion.div>
    );
  }

  const formatPrice = (price) => {
    if (price >= 1000000) {
      return `$${(price / 1000000).toFixed(1)}M`;
    } else if (price >= 1000) {
      return `$${(price / 1000).toFixed(0)}k`;
    }
    return `$${price}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="backdrop-blur-xl bg-white/10 rounded-2xl p-6 border border-white/20 shadow-xl shadow-black/30"
      >
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
              <BarChart3 size={28} className="text-purple-300" />
              Property Comparison ({properties.length}/3)
            </h2>
            {properties.length < 3 && (
              <p className="text-white/70 text-sm mt-2">Add more properties to compare</p>
            )}
          </div>
        </div>
      </motion.div>

      {/* Comparison Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {properties.map((property, index) => (
          <motion.div
            key={property.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="relative backdrop-blur-xl bg-white/10 rounded-2xl overflow-hidden border border-white/20 shadow-xl shadow-black/30 hover:shadow-2xl hover:shadow-purple-500/20 transition-all duration-300"
          >
            {/* Remove Button */}
            <motion.button
              onClick={() => onRemove(property.id)}
              className="absolute top-3 right-3 z-10 w-10 h-10 rounded-full bg-red-500/80 backdrop-blur-xl text-white flex items-center justify-center shadow-lg hover:bg-red-500 transition-all duration-300"
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              title="Remove from comparison"
            >
              <X size={20} />
            </motion.button>

            {/* Image */}
            <div className="relative h-48 overflow-hidden">
              {property.image_url ? (
                <img
                  src={property.image_url}
                  alt={property.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-indigo-400 to-purple-600 flex items-center justify-center">
                  <Home size={48} className="text-white opacity-80" />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            </div>

            {/* Content */}
            <div className="p-5 space-y-4">
              <h3 className="text-xl font-bold text-white line-clamp-2">{property.title}</h3>

              {/* Price & Location */}
              <div className="space-y-3 pt-3 border-t border-white/20">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-green-500/20 backdrop-blur-sm">
                    <DollarSign size={18} className="text-green-400" />
                  </div>
                  <div className="flex-1">
                    <span className="text-xs font-semibold text-white/60 uppercase tracking-wide block">Price</span>
                    <span className="text-lg font-bold text-white">{formatPrice(property.price)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-purple-500/20 backdrop-blur-sm">
                    <MapPin size={18} className="text-purple-300" />
                  </div>
                  <div className="flex-1">
                    <span className="text-xs font-semibold text-white/60 uppercase tracking-wide block">Location</span>
                    <span className="text-sm font-medium text-white/90">{property.location}</span>
                  </div>
                </div>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-3 gap-2 pt-3 border-t border-white/20">
                <div className="flex flex-col items-center gap-1 p-2 rounded-xl bg-white/5 backdrop-blur-sm">
                  <Bed size={18} className="text-purple-300" />
                  <span className="text-sm font-bold text-white">{property.bedrooms}</span>
                  <span className="text-xs text-white/60">Bedrooms</span>
                </div>
                <div className="flex flex-col items-center gap-1 p-2 rounded-xl bg-white/5 backdrop-blur-sm">
                  <Bath size={18} className="text-purple-300" />
                  <span className="text-sm font-bold text-white">{property.bathrooms}</span>
                  <span className="text-xs text-white/60">Bathrooms</span>
                </div>
                <div className="flex flex-col items-center gap-1 p-2 rounded-xl bg-white/5 backdrop-blur-sm">
                  <Square size={18} className="text-purple-300" />
                  <span className="text-sm font-bold text-white">{property.size_sqft?.toLocaleString()}</span>
                  <span className="text-xs text-white/60">sqft</span>
                </div>
              </div>

              {/* Amenities */}
              {property.amenities && property.amenities.length > 0 && (
                <div className="pt-3 border-t border-white/20">
                  <span className="text-xs font-semibold text-white/60 uppercase tracking-wide block mb-2">Amenities</span>
                  <div className="flex flex-wrap gap-1.5">
                    {property.amenities.slice(0, 4).map((amenity, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 text-xs font-medium rounded-lg bg-white/10 text-white/90 border border-white/20 backdrop-blur-sm"
                      >
                        {amenity}
                      </span>
                    ))}
                    {property.amenities.length > 4 && (
                      <span className="px-2 py-1 text-xs font-medium rounded-lg bg-purple-500/30 text-white border border-purple-400/30 backdrop-blur-sm">
                        +{property.amenities.length - 4}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Summary */}
      {properties.length > 1 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="backdrop-blur-xl bg-white/10 rounded-2xl p-6 border border-white/20 shadow-xl shadow-black/30"
        >
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <BarChart3 size={24} className="text-purple-300" />
            Quick Summary
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/20">
              <span className="text-xs font-semibold text-white/60 uppercase tracking-wide block mb-1">Average Price</span>
              <span className="text-lg font-bold text-white">
                {formatPrice(
                  properties.reduce((sum, p) => sum + p.price, 0) / properties.length
                )}
              </span>
            </div>
            <div className="p-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/20">
              <span className="text-xs font-semibold text-white/60 uppercase tracking-wide block mb-1">Price Range</span>
              <span className="text-sm font-medium text-white">
                {formatPrice(Math.min(...properties.map(p => p.price)))} - {formatPrice(Math.max(...properties.map(p => p.price)))}
              </span>
            </div>
            <div className="p-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/20">
              <span className="text-xs font-semibold text-white/60 uppercase tracking-wide block mb-1">Total Bedrooms</span>
              <span className="text-lg font-bold text-white">
                {properties.reduce((sum, p) => sum + p.bedrooms, 0)}
              </span>
            </div>
            <div className="p-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/20">
              <span className="text-xs font-semibold text-white/60 uppercase tracking-wide block mb-1">Total Size</span>
              <span className="text-sm font-medium text-white">
                {properties.reduce((sum, p) => sum + (p.size_sqft || 0), 0).toLocaleString()} sqft
              </span>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default PropertyComparison;
