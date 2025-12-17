import axios from 'axios';

// Get API base URL from environment variable
const API_BASE_URL = process.env.REACT_APP_API_URL || '';

// Create axios instance with base URL
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default apiClient;
