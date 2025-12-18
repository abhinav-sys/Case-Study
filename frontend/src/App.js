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
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  // Ensure sidebar is always visible on mount and prevent closing
  useEffect(() => {
    setSidebarOpen(true);
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
        // Show success feedback
        alert('Property saved successfully! 💾');
      } else {
        // Show error message from backend
        alert(data.error || 'Failed to save property. Please try again.');
      }
    } catch (error) {
      console.error('Error saving property:', error);
      alert('Unable to save property. Please check your connection and try again.');
    }
  };

  const handlePropertyUnsave = async (propertyId) => {
    try {
      // Find the saved property by propertyId
      const savedProperty = savedProperties.find(sp => sp.propertyId === propertyId || sp.property?.id === propertyId);
      if (!savedProperty) {
        alert('Property not found in saved list.');
        return;
      }

      const response = await fetch(getApiUrl(`api/saved-properties/${savedProperty._id}?userId=default-user`), {
        method: 'DELETE',
      });

      const data = await response.json();
      if (data.success) {
        setSavedProperties(savedProperties.filter(sp => sp._id !== savedProperty._id));
        alert('Property removed from saved list.');
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
      <div className="fixed inset-0 flex bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 overflow-hidden">
        {/* Left Sidebar with Tabs - Always Visible */}
        <motion.aside
          initial={{ width: 300, opacity: 1 }}
          animate={{ width: 300, opacity: 1 }}
          transition={{ duration: 0.3, type: 'spring' }}
          className="flex-shrink-0 bg-slate-800/95 backdrop-blur-2xl border-r-2 border-purple-500/30 flex flex-col shadow-2xl z-40"
        >
              {/* Sidebar Header */}
              <div className="p-4 border-b border-white/10 bg-gradient-to-r from-purple-600/20 to-indigo-600/20">
                <div className="flex items-center justify-center mb-4">
                  <h1 className="text-xl font-bold text-white flex items-center gap-2">
                    <span>🏠</span>
                    <span>Real Estate</span>
                  </h1>
                </div>
              </div>

              {/* Navigation Tabs */}
              <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {tabs.map((tab, index) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <motion.button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`
                        relative w-full px-4 py-4 rounded-xl flex items-center gap-3 text-left transition-all mb-1
                        ${isActive 
                          ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-500/30 border-2 border-purple-400/50' 
                          : 'bg-white/10 hover:bg-white/15 text-white/90 hover:text-white border-2 border-transparent hover:border-purple-400/30'
                        }
                      `}
                      whileHover={{ x: 4, scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      aria-label={tab.label}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Icon size={24} className={isActive ? 'text-white' : 'text-white/80'} />
                      <span className="flex-1 text-base font-bold">{tab.label}</span>
                      {tab.count !== undefined && (
                        <motion.span
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className={`text-xs font-bold px-3 py-1 rounded-full ${
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

        {/* Sidebar Toggle Button (when collapsed) */}
        {!sidebarOpen && (
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => setSidebarOpen(true)}
            className="fixed left-4 top-4 z-50 p-4 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 backdrop-blur-xl border-2 border-white/30 text-white hover:from-purple-500 hover:to-indigo-500 transition-all shadow-2xl shadow-purple-500/50"
            whileHover={{ scale: 1.15, x: 4, rotate: 5 }}
            whileTap={{ scale: 0.9 }}
            aria-label="Open sidebar to see all tabs"
            title="Click to show navigation tabs"
          >
            <Menu size={28} />
          </motion.button>
        )}

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Top Bar (only for non-chatbot tabs) */}
          {activeTab !== 'chatbot' && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="backdrop-blur-xl bg-white/10 border-b border-white/20 shadow-lg p-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {!sidebarOpen && (
                    <motion.button
                      onClick={() => setSidebarOpen(true)}
                      className="p-2 rounded-lg hover:bg-white/10 text-white/80 hover:text-white transition-colors"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      aria-label="Open sidebar"
                    >
                      <Menu size={20} />
                    </motion.button>
                  )}
                  <h2 className="text-xl font-bold text-white">
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
                className={`h-full w-full ${activeTab === 'chatbot' ? '' : 'p-4 md:p-6 lg:p-8'}`}
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
