import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { TrendingUp, DollarSign, Home, MapPin, BarChart3, Loader } from 'lucide-react';

const PropertyInsightsDashboard = () => {
  const [properties, setProperties] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadProperties();
  }, []);

  const loadProperties = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get('/api/properties?predict=true');
      if (response.data.success) {
        setProperties(response.data.data);
      }
    } catch (error) {
      console.error('Error loading properties:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Price distribution data
  const priceDistribution = useMemo(() => {
    const ranges = [
      { name: '$0-200k', min: 0, max: 200000, count: 0 },
      { name: '$200-400k', min: 200000, max: 400000, count: 0 },
      { name: '$400-600k', min: 400000, max: 600000, count: 0 },
      { name: '$600-800k', min: 600000, max: 800000, count: 0 },
      { name: '$800k+', min: 800000, max: Infinity, count: 0 },
    ];

    properties.forEach(prop => {
      const price = prop.price || 0;
      ranges.forEach(range => {
        if (price >= range.min && price < range.max) {
          range.count++;
        }
      });
    });

    return ranges;
  }, [properties]);

  // Location distribution
  const locationData = useMemo(() => {
    const locationMap = {};
    properties.forEach(prop => {
      const city = prop.location?.split(',')[0] || 'Unknown';
      locationMap[city] = (locationMap[city] || 0) + 1;
    });

    return Object.entries(locationMap)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  }, [properties]);

  // Bedroom distribution
  const bedroomData = useMemo(() => {
    const bedroomMap = {};
    properties.forEach(prop => {
      const beds = prop.bedrooms || 0;
      bedroomMap[beds] = (bedroomMap[beds] || 0) + 1;
    });

    return Object.entries(bedroomMap)
      .map(([name, value]) => ({ name: `${name} BR`, value }))
      .sort((a, b) => parseInt(a.name) - parseInt(b.name));
  }, [properties]);

  // Price trends (by location)
  const priceTrends = useMemo(() => {
    const locationPrices = {};
    properties.forEach(prop => {
      const city = prop.location?.split(',')[0] || 'Unknown';
      if (!locationPrices[city]) {
        locationPrices[city] = { total: 0, count: 0 };
      }
      locationPrices[city].total += prop.price || 0;
      locationPrices[city].count++;
    });

    return Object.entries(locationPrices)
      .map(([name, data]) => ({
        name,
        average: Math.round(data.total / data.count),
      }))
      .sort((a, b) => b.average - a.average)
      .slice(0, 5);
  }, [properties]);

  // Statistics
  const stats = useMemo(() => {
    if (properties.length === 0) return null;

    const prices = properties.map(p => p.price || 0).filter(p => p > 0);
    const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);

    const totalBedrooms = properties.reduce((sum, p) => sum + (p.bedrooms || 0), 0);
    const avgBedrooms = totalBedrooms / properties.length;

    const totalSize = properties.reduce((sum, p) => sum + (p.size_sqft || 0), 0);
    const avgSize = totalSize / properties.length;

    return {
      totalProperties: properties.length,
      avgPrice: Math.round(avgPrice),
      minPrice,
      maxPrice,
      avgBedrooms: avgBedrooms.toFixed(1),
      avgSize: Math.round(avgSize),
    };
  }, [properties]);

  const COLORS = ['#8b5cf6', '#6366f1', '#ec4899', '#f59e0b', '#10b981'];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader className="animate-spin mx-auto mb-4 text-purple-400" size={48} />
          <p className="text-white/80 text-lg">Loading insights...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="backdrop-blur-xl bg-white/10 rounded-2xl p-6 md:p-8 border border-white/20 shadow-xl shadow-black/30"
      >
        <div className="flex items-center gap-3 mb-2">
          <BarChart3 size={32} className="text-purple-300" />
          <h1 className="text-3xl md:text-4xl font-bold text-white">
            Property Insights Dashboard
          </h1>
        </div>
        <p className="text-white/80 text-lg">
          Comprehensive analytics and statistics for all properties
        </p>
      </motion.div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <StatCard
            icon={Home}
            label="Total Properties"
            value={stats.totalProperties}
            color="purple"
          />
          <StatCard
            icon={DollarSign}
            label="Average Price"
            value={`$${(stats.avgPrice / 1000).toFixed(0)}k`}
            color="indigo"
          />
          <StatCard
            icon={TrendingUp}
            label="Price Range"
            value={`$${(stats.minPrice / 1000).toFixed(0)}k - $${(stats.maxPrice / 1000).toFixed(0)}k`}
            color="pink"
          />
          <StatCard
            icon={Home}
            label="Avg Bedrooms"
            value={stats.avgBedrooms}
            color="purple"
          />
          <StatCard
            icon={Home}
            label="Avg Size"
            value={`${(stats.avgSize / 1000).toFixed(1)}k sqft`}
            color="indigo"
          />
          <StatCard
            icon={MapPin}
            label="Locations"
            value={locationData.length}
            color="pink"
          />
        </div>
      )}

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Price Distribution */}
        <ChartCard title="Price Distribution">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={priceDistribution}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="name" stroke="rgba(255,255,255,0.7)" />
              <YAxis stroke="rgba(255,255,255,0.7)" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(0,0,0,0.8)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '8px',
                  color: '#fff'
                }}
              />
              <Bar dataKey="count" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Location Distribution */}
        <ChartCard title="Top Locations">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={locationData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {locationData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(0,0,0,0.8)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '8px',
                  color: '#fff'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Bedroom Distribution */}
        <ChartCard title="Bedroom Distribution">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={bedroomData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="name" stroke="rgba(255,255,255,0.7)" />
              <YAxis stroke="rgba(255,255,255,0.7)" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(0,0,0,0.8)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '8px',
                  color: '#fff'
                }}
              />
              <Bar dataKey="value" fill="#ec4899" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Average Price by Location */}
        <ChartCard title="Average Price by Location">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={priceTrends}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="name" stroke="rgba(255,255,255,0.7)" />
              <YAxis stroke="rgba(255,255,255,0.7)" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(0,0,0,0.8)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '8px',
                  color: '#fff'
                }}
                formatter={(value) => `$${(value / 1000).toFixed(0)}k`}
              />
              <Line
                type="monotone"
                dataKey="average"
                stroke="#6366f1"
                strokeWidth={3}
                dot={{ fill: '#6366f1', r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
};

// Stat Card Component
const StatCard = ({ icon: Icon, label, value, color }) => {
  const colorClasses = {
    purple: 'from-purple-500 to-purple-600',
    indigo: 'from-indigo-500 to-indigo-600',
    pink: 'from-pink-500 to-pink-600',
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="backdrop-blur-xl bg-white/10 rounded-2xl p-6 border border-white/20 shadow-xl shadow-black/30"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-white/60 text-sm font-semibold uppercase tracking-wide mb-1">
            {label}
          </p>
          <p className="text-3xl font-bold text-white">{value}</p>
        </div>
        <div className={`p-4 rounded-xl bg-gradient-to-br ${colorClasses[color]} shadow-lg`}>
          <Icon size={24} className="text-white" />
        </div>
      </div>
    </motion.div>
  );
};

// Chart Card Component
const ChartCard = ({ title, children }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="backdrop-blur-xl bg-white/10 rounded-2xl p-6 border border-white/20 shadow-xl shadow-black/30"
    >
      <h3 className="text-xl font-bold text-white mb-4">{title}</h3>
      {children}
    </motion.div>
  );
};

export default PropertyInsightsDashboard;

