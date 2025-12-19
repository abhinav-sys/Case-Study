import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Chatbot from './components/Chatbot';
import PropertyList from './components/PropertyList';
import PropertyComparison from './components/PropertyComparison';
import PropertyComparisonTool from './components/PropertyComparisonTool';
import PropertyInsightsDashboard from './components/PropertyInsightsDashboard';
import SavedProperties from './components/SavedProperties';
import ErrorBoundary from './components/ErrorBoundary';
import { Home, MessageSquare, Heart, GitCompare, Scale, BarChart3, Menu } from 'lucide-react';
import { getApiUrl } from './config/api';

function App() {
  const [activeTab, setActiveTab] = useState('chatbot');
  const [properties, setProperties] = useState([]);
  const [savedProperties, setSavedProperties] = useState([]);
  const [comparisonProperties, setComparisonProperties] = useState([]);
  
  // Initialize mobile state immediately to prevent flash
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < 768;
    }
    return false;
  });
  
  // Initialize sidebar state based on screen size
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth >= 768; // Closed on mobile, open on desktop
    }
    return true;
  });
  
  // Check if mobile on resize
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      // Auto-close sidebar on mobile, open on desktop
      if (mobile) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };
    
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Load saved properties only when needed (when viewing properties or saved tabs)
  useEffect(() => {
    if (activeTab === 'properties' || activeTab === 'saved') {
      loadSavedProperties();
    }
  }, [activeTab]);

  const loadSavedProperties = async () => {
    try {
      const response = await fetch(getApiUrl('api/saved-properties?userId=default-user'));
      const data = await response.json();
      if (data.success) {
        setSavedProperties(data.data);
      }
    } catch (error) {
      console.error('Error loading saved properties:', error);
    }
  };

  const handlePropertySave = async (property) => {
    try {
      const response = await fetch(getApiUrl('api/saved-properties'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: 'default-user',
          propertyId: property.id,
          property: property,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setSavedProperties([...savedProperties, data.data]);
        // Success - property saved (heart icon will update automatically)
      } else {
        // Show error message from backend
        alert(data.error || 'Failed to save property. Please try again.');
      }
    } catch (error) {
      console.error('Error saving property:', error);
      alert('Unable to save property. Please check your connection and try again.');
    }
  };

  const handlePropertyUnsave = async (savedPropertyIdOrPropertyId) => {
    try {
      // Check if it's already a saved property _id (from SavedProperties component)
      let savedProperty = savedProperties.find(sp => sp._id === savedPropertyIdOrPropertyId);
      
      // If not found, try to find by propertyId (from PropertyCard component)
      if (!savedProperty) {
        savedProperty = savedProperties.find(sp => 
          sp.propertyId === savedPropertyIdOrPropertyId || 
          sp.property?.id === savedPropertyIdOrPropertyId
        );
      }

      if (!savedProperty) {
        console.error('Property not found:', savedPropertyIdOrPropertyId, 'Available:', savedProperties.map(sp => ({ _id: sp._id, propertyId: sp.propertyId })));
        alert('Property not found in saved list.');
        return;
      }

      const response = await fetch(getApiUrl(`api/saved-properties/${savedProperty._id}?userId=default-user`), {
        method: 'DELETE',
      });

      const data = await response.json();
      if (data.success) {
        setSavedProperties(savedProperties.filter(sp => sp._id !== savedProperty._id));
        // Don't show alert for successful removal - it's cleaner UX
      } else {
        alert(data.error || 'Failed to remove property. Please try again.');
      }
    } catch (error) {
      console.error('Error unsaving property:', error);
      alert('Unable to remove property. Please try again.');
    }
  };

  const handleAddToComparison = (property) => {
    if (comparisonProperties.length < 3 && !comparisonProperties.find(p => p.id === property.id)) {
      setComparisonProperties([...comparisonProperties, property]);
    }
  };

  const handleRemoveFromComparison = (propertyId) => {
    setComparisonProperties(comparisonProperties.filter(p => p.id !== propertyId));
  };

  const tabs = [
    { id: 'chatbot', label: 'Chatbot', icon: MessageSquare },
    { id: 'properties', label: 'All Properties', icon: Home },
    { id: 'insights', label: 'Insights', icon: BarChart3 },
    { id: 'compare-tool', label: 'Compare Tool', icon: Scale },
    { id: 'saved', label: `Saved`, icon: Heart, count: savedProperties.length },
    { id: 'compare', label: `Compare`, icon: GitCompare, count: comparisonProperties.length },
  ];

  return (
    <ErrorBoundary>
      <div className={`fixed inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 overflow-hidden ${isMobile ? '' : 'flex'}`}>
        {/* Mobile Overlay */}
        {isMobile && sidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-30 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
        
        {/* Left Sidebar with Tabs - Responsive */}
        <motion.aside
          initial={false}
          animate={{ 
            x: isMobile ? (sidebarOpen ? 0 : '-100%') : 0,
            width: isMobile ? '280px' : (sidebarOpen ? '300px' : '0px')
          }}
          transition={{ duration: 0.3, type: 'spring' }}
          className={`bg-slate-800/95 backdrop-blur-2xl border-r-2 border-purple-500/30 flex flex-col shadow-2xl z-40 ${
            isMobile ? 'fixed inset-y-0 left-0' : 'flex-shrink-0'
          }`}
          style={{
            pointerEvents: isMobile && !sidebarOpen ? 'none' : 'auto',
            overflow: 'hidden',
            visibility: isMobile && !sidebarOpen ? 'hidden' : 'visible'
          }}
        >
              {/* Sidebar Header */}
              <div className="p-3 md:p-4 border-b border-white/10 bg-gradient-to-r from-purple-600/20 to-indigo-600/20">
                <div className="flex items-center justify-between mb-4">
                  <h1 className="text-lg md:text-xl font-bold text-white flex items-center gap-2">
                    <span>🏠</span>
                    <span>Real Estate</span>
                  </h1>
                  {/* Close button for mobile */}
                  {isMobile && (
                    <motion.button
                      onClick={() => setSidebarOpen(false)}
                      className="p-2 rounded-lg hover:bg-white/10 text-white/80 hover:text-white transition-colors md:hidden"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      aria-label="Close sidebar"
                    >
                      <Menu size={20} />
                    </motion.button>
                  )}
                </div>
              </div>

              {/* Navigation Tabs */}
              <div className="flex-1 overflow-y-auto p-2 md:p-4 space-y-1 md:space-y-2">
                {tabs.map((tab, index) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <motion.button
                      key={tab.id}
                      onClick={() => {
                        setActiveTab(tab.id);
                        // Close sidebar on mobile after selecting tab
                        if (isMobile) {
                          setSidebarOpen(false);
                        }
                      }}
                      className={`
                        relative w-full px-3 md:px-4 py-3 md:py-4 rounded-xl flex items-center gap-2 md:gap-3 text-left transition-all mb-1
                        ${isActive 
                          ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-500/30 border-2 border-purple-400/50' 
                          : 'bg-white/10 hover:bg-white/15 text-white/90 hover:text-white border-2 border-transparent hover:border-purple-400/30'
                        }
                      `}
                      whileHover={{ x: isMobile ? 0 : 4, scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      aria-label={tab.label}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Icon size={20} className={`${isActive ? 'text-white' : 'text-white/80'} md:w-6 md:h-6`} />
                      <span className="flex-1 text-sm md:text-base font-bold">{tab.label}</span>
                      {tab.count !== undefined && (
                        <motion.span
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className={`text-xs font-bold px-2 md:px-3 py-1 rounded-full ${
                            isActive ? 'bg-white/40 text-white' : 'bg-purple-500/40 text-purple-200'
                          }`}
                        >
                          {tab.count || 0}
                        </motion.span>
                      )}
                      {isActive && (
                        <motion.div
                          layoutId="activeTabIndicator"
                          className="absolute right-2 w-1.5 h-10 bg-white rounded-full shadow-lg"
                          transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                        />
                      )}
                    </motion.button>
                  );
                })}
              </div>

              {/* Sidebar Footer */}
              <div className="p-4 border-t border-white/10">
                <p className="text-white/40 text-xs text-center">
                  Agent Mira Case Study
                </p>
              </div>
        </motion.aside>

        {/* Sidebar Toggle Button (show when sidebar is closed) */}
        {!sidebarOpen && (
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => setSidebarOpen(true)}
            className="fixed left-2 md:left-4 top-2 md:top-4 z-50 p-3 md:p-4 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 backdrop-blur-xl border-2 border-white/30 text-white hover:from-purple-500 hover:to-indigo-500 transition-all shadow-2xl shadow-purple-500/50"
            whileHover={{ scale: 1.15, x: 4, rotate: 5 }}
            whileTap={{ scale: 0.9 }}
            aria-label="Open sidebar to see all tabs"
            title="Click to show navigation tabs"
          >
            <Menu size={24} className="md:w-7 md:h-7" />
          </motion.button>
        )}

        {/* Main Content Area */}
        <div className={`flex flex-col min-w-0 overflow-hidden ${isMobile ? 'w-full h-full' : 'flex-1'}`}>
          {/* Top Bar (only for non-chatbot tabs) */}
          {activeTab !== 'chatbot' && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="backdrop-blur-xl bg-white/10 border-b border-white/20 shadow-lg p-3 md:p-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 md:gap-3">
                  {(isMobile || !sidebarOpen) && (
                    <motion.button
                      onClick={() => setSidebarOpen(true)}
                      className="p-2 rounded-lg hover:bg-white/10 text-white/80 hover:text-white transition-colors"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      aria-label="Open sidebar"
                    >
                      <Menu size={18} className="md:w-5 md:h-5" />
                    </motion.button>
                  )}
                  <h2 className="text-lg md:text-xl font-bold text-white">
                    {tabs.find(t => t.id === activeTab)?.label}
                  </h2>
                </div>
              </div>
            </motion.div>
          )}

          {/* Content */}
          <div className={`flex-1 overflow-hidden ${activeTab === 'chatbot' ? '' : 'overflow-y-auto'}`}>
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className={`h-full w-full ${activeTab === 'chatbot' ? '' : 'p-3 sm:p-4 md:p-6 lg:p-8'}`}
              >
                {activeTab === 'chatbot' && (
                  <Chatbot
                    onPropertiesFound={setProperties}
                    onPropertySave={handlePropertySave}
                    onAddToComparison={handleAddToComparison}
                    sidebarOpen={sidebarOpen}
                    setSidebarOpen={setSidebarOpen}
                  />
                )}
                {activeTab === 'properties' && (
                  <PropertyList
                    properties={properties}
                    onPropertySave={handlePropertySave}
                    onAddToComparison={handleAddToComparison}
                    savedPropertyIds={savedProperties.map(sp => sp.propertyId)}
                    isActive={activeTab === 'properties'}
                  />
                )}
                {activeTab === 'insights' && (
                  <PropertyInsightsDashboard />
                )}
                {activeTab === 'compare-tool' && (
                  <PropertyComparisonTool />
                )}
                {activeTab === 'saved' && (
                  <SavedProperties
                    savedProperties={savedProperties}
                    onUnsave={handlePropertyUnsave}
                    onAddToComparison={handleAddToComparison}
                  />
                )}
                {activeTab === 'compare' && (
                  <PropertyComparison
                    properties={comparisonProperties}
                    onRemove={handleRemoveFromComparison}
                  />
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
}

export default App;
