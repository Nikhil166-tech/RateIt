import axios from "axios";

// Create axios instance
const api = axios.create({
  baseURL: "http://localhost:3000", // backend server URL
});

// Attach token automatically if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth endpoints
export const login = (email, password) =>
  api.post("/auth/login", { email, password });

export const signup = (payload) =>
  api.post("/auth/signup", payload);

// Example: fetch stores
export const getStores = () => api.get("/stores");

// Example: submit rating
export const submitRating = (storeId, rating) =>
  api.post(`/stores/${storeId}/ratings`, { rating });

export default api;