import React from 'react';
import { motion } from 'framer-motion';
import PropertyCard from './PropertyCard';
import { Heart, Trash2 } from 'lucide-react';

const SavedProperties = ({ savedProperties, onUnsave, onAddToComparison }) => {
  if (savedProperties.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="backdrop-blur-xl bg-white/10 rounded-2xl p-12 md:p-16 text-center border border-white/20 shadow-xl shadow-black/30"
      >
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", bounce: 0.4, delay: 0.2 }}
          className="flex justify-center mb-6"
        >
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-pink-500 to-red-500 flex items-center justify-center">
            <Heart size={48} className="text-white" fill="currentColor" />
          </div>
        </motion.div>
        <h2 className="text-3xl font-bold text-white mb-4">No Saved Properties Yet</h2>
        <p className="text-white/80 text-lg">
          Start saving properties you like by clicking the heart icon on any property card.
        </p>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="backdrop-blur-xl bg-white/10 rounded-2xl p-6 border border-white/20 shadow-xl shadow-black/30"
      >
        <h2 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
          >
            <Heart size={28} className="text-pink-400" fill="currentColor" />
          </motion.div>
          Saved Properties ({savedProperties.length})
        </h2>
      </motion.div>

      {/* Properties Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {savedProperties.map((savedProperty, index) => (
          <motion.div
            key={savedProperty._id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="relative group"
          >
            <PropertyCard
              property={savedProperty.property}
              onSave={() => {}}
              onAddToComparison={onAddToComparison}
              isSaved={true}
              onUnsave={() => onUnsave(savedProperty._id)}
            />
            <motion.button
              onClick={() => onUnsave(savedProperty._id)}
              className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 px-4 py-2 rounded-xl bg-red-500/80 backdrop-blur-xl text-white font-semibold text-sm flex items-center gap-2 shadow-lg hover:bg-red-500 transition-all duration-300 opacity-0 group-hover:opacity-100"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              title="Remove from saved"
            >
              <Trash2 size={16} />
              <span>Remove</span>
            </motion.button>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default SavedProperties;
