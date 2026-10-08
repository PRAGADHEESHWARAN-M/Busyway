// Central Axios instance. Automatically attaches the JWT (if present) and
// normalizes error messages so components never need to touch raw Axios
// error objects.
import axios from 'axios';
import { Capacitor } from '@capacitor/core';

const BACKEND_URL = 'https://busyway-ifk2.onrender.com/api';

// On the web, '/api' is proxied to the Render backend by netlify.toml (and by
// the Vite dev server). The native app has no proxy, so it calls Render directly.
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || (Capacitor.isNativePlatform() ? BACKEND_URL : '/api');

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
