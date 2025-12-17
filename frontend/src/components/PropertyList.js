import React, { useState, useEffect, useCallback } from 'react';
import apiClient from '../utils/axiosConfig';
import { motion, AnimatePresence } from 'framer-motion';
import PropertyCard from './PropertyCard';
import { PropertyListSkeleton } from './LoadingSkeleton';
import { Search, X, SlidersHorizontal } from 'lucide-react';

const PropertyList = ({ properties: initialProperties, onPropertySave, onAddToComparison, savedPropertyIds = [], isActive = false }) => {
  const [properties, setProperties] = useState(initialProperties || []);
  const [filteredProperties, setFilteredProperties] = useState(properties);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    location: '',
    maxBudget: '',
    minBudget: '',
    bedrooms: '',
    bathrooms: '',
    minSize: '',
  });

  const loadAllProperties = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.get('/api/properties?predict=true');
      if (response.data.success) {
        setProperties(response.data.data);
        setFilteredProperties(response.data.data);
      }
    } catch (error) {
      console.error('Error loading properties:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Reset filters and load all properties when tab becomes active
  useEffect(() => {
    if (isActive) {
      // Clear all filters
      setFilters({
        location: '',
        maxBudget: '',
        minBudget: '',
        bedrooms: '',
        bathrooms: '',
        minSize: '',
      });
      setSearchQuery('');
      setShowFilters(false);
      
      // Load all properties
      loadAllProperties();
    }
  }, [isActive, loadAllProperties]);

  useEffect(() => {
    if (initialProperties && initialProperties.length > 0 && !isActive) {
      setProperties(initialProperties);
      setFilteredProperties(initialProperties);
    } else if (!isActive && properties.length === 0) {
      loadAllProperties();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialProperties]);

  const applyFilters = useCallback(() => {
    let filtered = [...properties];

    // Search query filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(property =>
        property.title.toLowerCase().includes(query) ||
        property.location.toLowerCase().includes(query) ||
        property.amenities?.some(a => a.toLowerCase().includes(query))
      );
    }

    // Location filter
    if (filters.location) {
      filtered = filtered.filter(p =>
        p.location.toLowerCase().includes(filters.location.toLowerCase())
      );
    }

    // Budget filters
    if (filters.maxBudget) {
      filtered = filtered.filter(p => p.price <= parseInt(filters.maxBudget));
    }
    if (filters.minBudget) {
      filtered = filtered.filter(p => p.price >= parseInt(filters.minBudget));
    }

    // Bedrooms filter
    if (filters.bedrooms) {
      filtered = filtered.filter(p => p.bedrooms >= parseInt(filters.bedrooms));
    }

    // Bathrooms filter
    if (filters.bathrooms) {
      filtered = filtered.filter(p => p.bathrooms >= parseInt(filters.bathrooms));
    }

    // Size filter
    if (filters.minSize) {
      filtered = filtered.filter(p => p.size_sqft >= parseInt(filters.minSize));
    }

    setFilteredProperties(filtered);
  }, [searchQuery, filters, properties]);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      location: '',
      maxBudget: '',
      minBudget: '',
      bedrooms: '',
      bathrooms: '',
      minSize: '',
    });
    setSearchQuery('');
  };

  const hasActiveFilters = Object.values(filters).some(v => v) || searchQuery;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 backdrop-blur-xl bg-white/10 rounded-2xl p-4 md:p-6 border border-white/20 shadow-xl shadow-black/30">
        <motion.h2
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-2xl md:text-3xl font-bold text-white"
        >
          All Properties ({filteredProperties.length})
        </motion.h2>
        <div className="flex items-center gap-3">
          <motion.button
            onClick={() => setShowFilters(!showFilters)}
            className={`
              flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm
              transition-all duration-300 backdrop-blur-sm
              ${showFilters
                ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg shadow-purple-500/30'
                : 'bg-white/20 text-white border border-white/30 hover:bg-white/30 hover:border-purple-400/40'
              }
            `}
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
          >
            <SlidersHorizontal size={18} />
            <span>Filters</span>
          </motion.button>
          {hasActiveFilters && (
            <motion.button
              onClick={clearFilters}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-500/20 text-white border border-red-400/30 hover:bg-red-500/30 backdrop-blur-sm transition-all duration-300 font-semibold text-sm"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <X size={18} />
              <span>Clear</span>
            </motion.button>
          )}
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 text-white/60" size={22} />
        <input
          type="text"
          placeholder="Search by title, location, or amenities..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-14 pr-5 py-5 md:py-6 text-base md:text-lg rounded-2xl bg-white/20 backdrop-blur-xl text-white placeholder-white/60 border-2 border-white/30 focus:border-purple-400/60 focus:outline-none focus:ring-4 focus:ring-purple-400/20 transition-all duration-300 shadow-lg shadow-black/20"
        />
      </div>

      {/* Filters Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden backdrop-blur-xl bg-white/10 rounded-2xl border border-white/20 shadow-xl shadow-black/30"
          >
            <div className="p-4 md:p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-white/90 uppercase tracking-wide">Location</label>
                <input
                  type="text"
                  placeholder="e.g., New York"
                  value={filters.location}
                  onChange={(e) => handleFilterChange('location', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white/20 backdrop-blur-sm text-white placeholder-white/60 border border-white/30 focus:border-purple-400/60 focus:outline-none focus:ring-2 focus:ring-purple-400/20 transition-all duration-300"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-white/90 uppercase tracking-wide">Min Budget</label>
                <input
                  type="number"
                  placeholder="e.g., 200000"
                  value={filters.minBudget}
                  onChange={(e) => handleFilterChange('minBudget', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white/20 backdrop-blur-sm text-white placeholder-white/60 border border-white/30 focus:border-purple-400/60 focus:outline-none focus:ring-2 focus:ring-purple-400/20 transition-all duration-300"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-white/90 uppercase tracking-wide">Max Budget</label>
                <input
                  type="number"
                  placeholder="e.g., 500000"
                  value={filters.maxBudget}
                  onChange={(e) => handleFilterChange('maxBudget', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white/20 backdrop-blur-sm text-white placeholder-white/60 border border-white/30 focus:border-purple-400/60 focus:outline-none focus:ring-2 focus:ring-purple-400/20 transition-all duration-300"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-white/90 uppercase tracking-wide">Min Bedrooms</label>
                <input
                  type="number"
                  placeholder="e.g., 2"
                  value={filters.bedrooms}
                  onChange={(e) => handleFilterChange('bedrooms', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white/20 backdrop-blur-sm text-white placeholder-white/60 border border-white/30 focus:border-purple-400/60 focus:outline-none focus:ring-2 focus:ring-purple-400/20 transition-all duration-300"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-white/90 uppercase tracking-wide">Min Bathrooms</label>
                <input
                  type="number"
                  placeholder="e.g., 2"
                  value={filters.bathrooms}
                  onChange={(e) => handleFilterChange('bathrooms', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white/20 backdrop-blur-sm text-white placeholder-white/60 border border-white/30 focus:border-purple-400/60 focus:outline-none focus:ring-2 focus:ring-purple-400/20 transition-all duration-300"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-white/90 uppercase tracking-wide">Min Size (sqft)</label>
                <input
                  type="number"
                  placeholder="e.g., 1000"
                  value={filters.minSize}
                  onChange={(e) => handleFilterChange('minSize', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white/20 backdrop-blur-sm text-white placeholder-white/60 border border-white/30 focus:border-purple-400/60 focus:outline-none focus:ring-2 focus:ring-purple-400/20 transition-all duration-300"
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results */}
      {isLoading ? (
        <PropertyListSkeleton count={6} />
      ) : filteredProperties.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="backdrop-blur-xl bg-white/10 rounded-2xl p-12 text-center border border-white/20 shadow-xl shadow-black/30"
        >
          <p className="text-white/80 text-lg mb-4">No properties found matching your criteria.</p>
          <motion.button
            onClick={clearFilters}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/40 transition-all duration-300"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Clear all filters
          </motion.button>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {filteredProperties.map((property, index) => (
            <motion.div
              key={property.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <PropertyCard
                property={property}
                onSave={onPropertySave}
                onAddToComparison={onAddToComparison}
                isSaved={savedPropertyIds.includes(property.id)}
              />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PropertyList;
