// Central Axios instance. Automatically attaches the JWT (if present) and
// normalizes error messages so components never need to touch raw Axios
// error objects.
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const api = axios.create({ baseURL: API_BASE_URL });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('busyway_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Friendly, consistent error messages for the UI. Never surfaces raw
// server/network internals to the user.
export const getErrorMessage = (error) => {
  if (error.response) {
    return error.response.data?.message || 'Something went wrong. Please try again.';
  }
  if (error.request) {
    return 'Cannot reach the BUSy Way server right now. Please check your connection and try again.';
  }
  return 'Something went wrong. Please try again.';
};

export default api;
