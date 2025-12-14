import React from 'react';
import { motion } from 'framer-motion';

const PropertyCardSkeleton = () => {
  return (
    <div className="bg-white/10 backdrop-blur-xl rounded-2xl overflow-hidden border border-white/20 shadow-xl">
      {/* Image Skeleton */}
      <div className="h-48 md:h-56 bg-gradient-to-r from-white/10 via-white/5 to-white/10 animate-pulse" />
      
      {/* Content Skeleton */}
      <div className="p-4 md:p-5 space-y-3">
        {/* Title Skeleton */}
        <div className="h-6 bg-white/10 rounded-lg w-3/4 animate-pulse" />
        
        {/* Price Skeleton */}
        <div className="h-8 bg-white/10 rounded-lg w-1/2 animate-pulse" />
        
        {/* Location Skeleton */}
        <div className="h-4 bg-white/10 rounded-lg w-2/3 animate-pulse" />
        
        {/* Details Grid Skeleton */}
        <div className="grid grid-cols-3 gap-3 pt-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-white/10 rounded-xl animate-pulse" />
          ))}
        </div>
        
        {/* Button Skeleton */}
        <div className="h-10 bg-white/10 rounded-xl animate-pulse" />
      </div>
    </div>
  );
};

export const PropertyListSkeleton = ({ count = 6 }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <PropertyCardSkeleton />
        </motion.div>
      ))}
    </div>
  );
};

export default PropertyCardSkeleton;

