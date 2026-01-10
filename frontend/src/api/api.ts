import axios from "axios";

// API URL - Always use the backend API URL, never the frontend domain
// Priority: config.js (runtime) > environment variable (build time) > hardcoded fallback
const BACKEND_API_URL = "https://institutions-93gl.onrender.com/api";

const getApiUrl = () => {
  // Always use the hardcoded backend URL to ensure correct API endpoint
  // This prevents issues with config.js or environment variables pointing to frontend domain
  const appConfig = (window as any).APP_CONFIG;
  const configUrl = appConfig?.API_URL;
  const envUrl = process.env.REACT_APP_API_URL;
  
  // Validate config.js URL if it exists
  if (configUrl && !configUrl.includes('.pages.dev') && !configUrl.includes('localhost') && configUrl.includes('institutions-93gl.onrender.com')) {
    console.log("Using API_URL from config.js:", configUrl);
    return configUrl;
  }
  
  // Validate environment variable URL if it exists
  if (envUrl && !envUrl.includes('.pages.dev') && !envUrl.includes('localhost') && envUrl.includes('institutions-93gl.onrender.com')) {
    console.log("Using API_URL from environment variable:", envUrl);
    return envUrl;
  }
  
  // Always fallback to the hardcoded backend URL
  if (configUrl && (configUrl.includes('.pages.dev') || configUrl.includes('localhost'))) {
    console.warn("config.js contains invalid API_URL (frontend domain), using hardcoded backend URL");
  }
  console.log("Using hardcoded backend API_URL:", BACKEND_API_URL);
  return BACKEND_API_URL;
};

// יצירת מופע API - Always use the hardcoded backend URL directly
const BACKEND_BASE_URL = "https://institutions-93gl.onrender.com/api";
const api = axios.create({
  baseURL: BACKEND_BASE_URL,
});

// Update defaults to ensure baseURL is always correct
api.defaults.baseURL = BACKEND_BASE_URL;
axios.defaults.baseURL = BACKEND_BASE_URL;

// Interceptor to ensure baseURL is always correct on every request
api.interceptors.request.use((config) => {
  // CRITICAL: Always force baseURL to be the backend URL
  config.baseURL = BACKEND_BASE_URL;
  api.defaults.baseURL = BACKEND_BASE_URL;
  axios.defaults.baseURL = BACKEND_BASE_URL;
  
  // If URL is absolute and points to frontend domain, extract path
  if (config.url && (config.url.startsWith('http://') || config.url.startsWith('https://'))) {
    try {
      const urlObj = new URL(config.url);
      if (urlObj.hostname.includes('.pages.dev') || urlObj.hostname.includes('localhost')) {
        // Extract path and use baseURL
        config.url = urlObj.pathname + urlObj.search;
        config.baseURL = BACKEND_BASE_URL;
      }
    } catch (e) {
      // If parsing fails, ensure baseURL is set
      config.baseURL = BACKEND_BASE_URL;
    }
  }
  
  // Debug logging
  console.log("Interceptor Debug:");
  console.log("  BACKEND_BASE_URL:", BACKEND_BASE_URL);
  console.log("  config.url:", config.url);
  console.log("  config.baseURL:", config.baseURL);
  console.log("  Full URL will be:", config.baseURL ? (config.baseURL + (config.url || '')) : config.url);
  
  return config;
});

// פונקציה שמגדירה את הטוקן בגלובל
export const setAuthToken = (token: string | null) => {
  if (token) {
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    localStorage.setItem("token", token);
  } else {
    delete api.defaults.headers.common["Authorization"];
    localStorage.removeItem("token");
  }
};

// 🔥 בעת טעינת האפליקציה — אם יש טוקן ב־localStorage נטען אותו
const storedToken = localStorage.getItem("token");
if (storedToken) {
  api.defaults.headers.common["Authorization"] = `Bearer ${storedToken}`;
}

// ⛔ טיפול אוטומטי בשגיאת 401 — טוקן לא תקף / פג
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // מוחק טוקן לא תקין
      setAuthToken(null);
    }

    return Promise.reject(error);
  }
);

console.log("API baseURL:", getApiUrl());

export default api;

