import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Heart, MapPin, Bed, Bath, Square, DollarSign, GitCompare, Home, TrendingUp, TrendingDown, Share2, Download } from 'lucide-react';
import jsPDF from 'jspdf';

const PropertyCard = ({ property, onSave, onAddToComparison, isSaved: initialIsSaved = false, onUnsave }) => {
  const [isSaved, setIsSaved] = useState(initialIsSaved);
  const [imageError, setImageError] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);

  // Sync isSaved state with prop changes
  useEffect(() => {
    setIsSaved(initialIsSaved);
  }, [initialIsSaved]);

  const handleSave = async (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    if (isSaved && onUnsave) {
      // onUnsave will be called with the saved property's _id from parent
      // For now, we'll pass property.id and let parent handle finding the _id
      await onUnsave(property.id);
      setIsSaved(false);
    } else if (onSave) {
      try {
        await onSave(property);
        setIsSaved(true);
      } catch (error) {
        // Error handling is done in parent component
        console.error('Error in handleSave:', error);
        setIsSaved(false);
      }
    }
  };

  const handleCompare = () => {
    if (onAddToComparison) {
      onAddToComparison(property);
    }
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    const pageHeight = doc.internal.pageHeight;
    const margin = 20;
    let yPos = margin;

    // Title
    doc.setFontSize(20);
    doc.setTextColor(139, 92, 246); // Purple
    doc.text(property.title || 'Property Details', margin, yPos);
    yPos += 15;

    // Price
    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0);
    doc.text(`Price: ${formatPrice(property.price)}`, margin, yPos);
    yPos += 10;

    // Location
    doc.setFontSize(12);
    doc.text(`Location: ${property.location || 'N/A'}`, margin, yPos);
    yPos += 10;

    // Details
    doc.text(`Bedrooms: ${property.bedrooms || 'N/A'}`, margin, yPos);
    yPos += 8;
    doc.text(`Bathrooms: ${property.bathrooms || 'N/A'}`, margin, yPos);
    yPos += 8;
    doc.text(`Size: ${property.size_sqft?.toLocaleString() || 'N/A'} sqft`, margin, yPos);
    yPos += 10;

    // Predicted Price
    if (property.predicted_price) {
      doc.setFontSize(12);
      doc.setTextColor(16, 185, 129); // Green
      doc.text(`AI Predicted Price: ${formatPrice(property.predicted_price)}`, margin, yPos);
      yPos += 10;
    }

    // Amenities
    if (property.amenities && property.amenities.length > 0) {
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.text('Amenities:', margin, yPos);
      yPos += 8;
      property.amenities.slice(0, 5).forEach(amenity => {
        doc.setFontSize(10);
        doc.text(`• ${amenity}`, margin + 5, yPos);
        yPos += 7;
        if (yPos > pageHeight - margin) {
          doc.addPage();
          yPos = margin;
        }
      });
    }

    // Footer
    doc.setFontSize(8);
    doc.setTextColor(128, 128, 128);
    doc.text(`Generated from Real Estate Chatbot - ${new Date().toLocaleDateString()}`, margin, pageHeight - 10);

    doc.save(`${property.title?.replace(/[^a-z0-9]/gi, '_') || 'property'}_details.pdf`);
    setShowShareMenu(false);
  };

  const handleShare = async () => {
    const shareData = {
      title: property.title || 'Property Listing',
      text: `Check out this property: ${property.title} - ${formatPrice(property.price)} in ${property.location}`,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        // Fallback: Copy to clipboard
        await navigator.clipboard.writeText(
          `${property.title} - ${formatPrice(property.price)} - ${property.location}\n${window.location.href}`
        );
        alert('Property details copied to clipboard!');
      }
    } catch (error) {
      if (error.name !== 'AbortError') {
        // Fallback: Copy to clipboard
        navigator.clipboard.writeText(
          `${property.title} - ${formatPrice(property.price)} - ${property.location}\n${window.location.href}`
        );
        alert('Property details copied to clipboard!');
      }
    }
    setShowShareMenu(false);
  };

  const formatPrice = (price) => {
    if (price >= 1000000) {
      return `$${(price / 1000000).toFixed(1)}M`;
    } else if (price >= 1000) {
      return `$${(price / 1000).toFixed(0)}k`;
    }
    return `$${price}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -8, transition: { duration: 0.2 } }}
      className="group relative bg-white/10 backdrop-blur-xl rounded-2xl overflow-hidden border border-white/20 shadow-xl shadow-black/30 hover:shadow-2xl hover:shadow-purple-500/20 transition-all duration-300"
    >
      {/* Image Container */}
      <div className="relative h-48 md:h-56 overflow-hidden">
        {!imageError ? (
          <motion.img
            src={property.image_url}
            alt={property.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-indigo-400 to-purple-600 flex flex-col items-center justify-center text-white">
            <Home size={48} className="mb-2 opacity-80" />
            <span className="text-sm font-medium">No Image</span>
          </div>
        )}
        
        {/* Action Buttons */}
        <div className="absolute top-3 right-3 flex gap-2 z-50">
          {/* Share Button */}
          <div className="relative z-50">
            <motion.button
              onClick={(e) => {
                e.stopPropagation();
                setShowShareMenu(!showShareMenu);
              }}
              className="w-10 h-10 rounded-full backdrop-blur-xl bg-white/20 text-white hover:bg-white/30 border border-white/30 flex items-center justify-center transition-all duration-300 shadow-lg cursor-pointer"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              title="Share or export"
            >
              <Share2 size={18} />
            </motion.button>

            {/* Share Menu */}
            {showShareMenu && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute right-0 top-12 mt-2 w-48 backdrop-blur-xl bg-white/20 rounded-xl border border-white/30 shadow-xl overflow-hidden z-[60]"
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleShare();
                  }}
                  className="w-full px-4 py-3 text-left text-white hover:bg-white/20 flex items-center gap-3 transition-colors cursor-pointer"
                >
                  <Share2 size={18} />
                  <span className="text-sm font-medium">Share Property</span>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleExportPDF();
                  }}
                  className="w-full px-4 py-3 text-left text-white hover:bg-white/20 flex items-center gap-3 transition-colors cursor-pointer"
                >
                  <Download size={18} />
                  <span className="text-sm font-medium">Export as PDF</span>
                </button>
              </motion.div>
            )}
          </div>

          {/* Save Button */}
          <motion.button
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              handleSave();
            }}
            className={`
              w-10 h-10 rounded-full backdrop-blur-xl flex items-center justify-center
              transition-all duration-300 shadow-lg cursor-pointer
              ${isSaved 
                ? 'bg-gradient-to-r from-pink-500 to-red-500 text-white' 
                : 'bg-white/20 text-white hover:bg-white/30 border border-white/30'
              }
            `}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            title={isSaved ? 'Remove from saved' : 'Save property'}
            type="button"
          >
            <Heart size={18} fill={isSaved ? 'currentColor' : 'none'} />
          </motion.button>
        </div>

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      {/* Click outside to close share menu */}
      {showShareMenu && (
        <div
          className="fixed inset-0 z-[45]"
          onClick={() => setShowShareMenu(false)}
        />
      )}

      {/* Content */}
      <div className="p-4 md:p-5 space-y-3">
        {/* Title */}
        <h3 className="text-lg md:text-xl font-bold text-white line-clamp-2 group-hover:text-purple-200 transition-colors">
          {property.title}
        </h3>

        {/* Price Section */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <DollarSign size={20} className="text-green-400" />
            <span className="text-2xl md:text-3xl font-bold text-white">
              {formatPrice(property.price)}
            </span>
          </div>

          {/* Predicted Price */}
          {property.predicted_price && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20"
            >
              {property.price_difference >= 0 ? (
                <TrendingUp size={16} className="text-green-400" />
              ) : (
                <TrendingDown size={16} className="text-red-400" />
              )}
              <span className="text-xs font-medium text-white/80">AI Predicted:</span>
              <span className={`text-sm font-bold ${property.price_difference >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {formatPrice(property.predicted_price)}
              </span>
              {property.price_difference_percent && (
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                  property.price_difference >= 0 
                    ? 'bg-green-400/20 text-green-300' 
                    : 'bg-red-400/20 text-red-300'
                }`}>
                  {property.price_difference >= 0 ? '+' : ''}{property.price_difference_percent}%
                </span>
              )}
            </motion.div>
          )}
        </div>

        {/* Location */}
        <div className="flex items-center gap-2 text-white/80">
          <MapPin size={16} className="text-purple-300" />
          <span className="text-sm md:text-base">{property.location}</span>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-3 gap-3 pt-2 border-t border-white/20">
          <div className="flex flex-col items-center gap-1 p-2 rounded-xl bg-white/5 backdrop-blur-sm">
            <Bed size={18} className="text-purple-300" />
            <span className="text-xs font-medium text-white/90">{property.bedrooms}</span>
            <span className="text-xs text-white/60">Bed{property.bedrooms !== 1 ? 's' : ''}</span>
          </div>
          <div className="flex flex-col items-center gap-1 p-2 rounded-xl bg-white/5 backdrop-blur-sm">
            <Bath size={18} className="text-purple-300" />
            <span className="text-xs font-medium text-white/90">{property.bathrooms}</span>
            <span className="text-xs text-white/60">Bath{property.bathrooms !== 1 ? 's' : ''}</span>
          </div>
          <div className="flex flex-col items-center gap-1 p-2 rounded-xl bg-white/5 backdrop-blur-sm">
            <Square size={18} className="text-purple-300" />
            <span className="text-xs font-medium text-white/90">{property.size_sqft.toLocaleString()}</span>
            <span className="text-xs text-white/60">sqft</span>
          </div>
        </div>

        {/* Amenities */}
        {property.amenities && property.amenities.length > 0 && (
          <div className="pt-2 border-t border-white/20">
            <div className="text-xs font-semibold text-white/80 mb-2 uppercase tracking-wide">Amenities:</div>
            <div className="flex flex-wrap gap-2">
              {property.amenities.slice(0, 3).map((amenity, idx) => (
                <motion.span
                  key={idx}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.05 }}
                  className="px-2 py-1 text-xs font-medium rounded-lg bg-white/10 text-white/90 border border-white/20 backdrop-blur-sm"
                >
                  {amenity}
                </motion.span>
              ))}
              {property.amenities.length > 3 && (
                <span className="px-2 py-1 text-xs font-medium rounded-lg bg-purple-500/30 text-white border border-purple-400/30 backdrop-blur-sm">
                  +{property.amenities.length - 3} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* AI Analysis */}
        {property.ai_analysis && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="pt-2 border-t border-white/20"
          >
            <div className="flex items-center gap-2 mb-2">
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              >
                <TrendingUp size={16} className="text-purple-300" />
              </motion.div>
              <span className="text-xs font-semibold text-purple-300 uppercase tracking-wide">AI Insights</span>
            </div>
            <p className="text-sm text-white/90 leading-relaxed italic">
              "{property.ai_analysis}"
            </p>
          </motion.div>
        )}

        {/* Actions */}
        <div className="pt-2">
          <motion.button
            onClick={handleCompare}
            className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/40 transition-all duration-300"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            title="Add to comparison"
          >
            <GitCompare size={16} />
            <span>Compare</span>
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default PropertyCard;
