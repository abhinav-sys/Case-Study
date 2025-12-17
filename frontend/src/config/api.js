// API Configuration
// Uses REACT_APP_API_URL environment variable if set, otherwise falls back to relative paths
const API_BASE_URL = process.env.REACT_APP_API_URL || '';

// Helper function to create full API URL
export const getApiUrl = (endpoint) => {
  // Remove leading slash from endpoint if present
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  
  if (API_BASE_URL) {
    // Remove trailing slash from base URL if present
    const cleanBaseUrl = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL;
    return `${cleanBaseUrl}/${cleanEndpoint}`;
  }
  
  // Fallback to relative path (works with proxy in development)
  return `/${cleanEndpoint}`;
};

export default API_BASE_URL;
