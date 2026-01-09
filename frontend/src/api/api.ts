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

// יצירת מופע API - Always use the hardcoded backend URL
const correctApiUrl = getApiUrl();
const api = axios.create({
  baseURL: correctApiUrl,
});

// Update defaults to ensure baseURL is always correct
api.defaults.baseURL = correctApiUrl;

// Interceptor to ensure baseURL is always correct on every request
api.interceptors.request.use((config) => {
  // Always override baseURL to ensure it's the backend URL
  const currentCorrectUrl = getApiUrl();
  
  // If URL is relative, ensure baseURL is set correctly
  if (config.url && !config.url.startsWith('http://') && !config.url.startsWith('https://')) {
    // URL is relative, force baseURL to be the correct backend URL
    config.baseURL = currentCorrectUrl;
  } else if (config.url && (config.url.startsWith('http://') || config.url.startsWith('https://'))) {
    // URL is absolute, check if it points to frontend domain
    try {
      const urlObj = new URL(config.url);
      if (urlObj.hostname.includes('.pages.dev') || urlObj.hostname.includes('localhost')) {
        // Extract path and use correct baseURL
        const path = urlObj.pathname + urlObj.search;
        config.url = path;
        config.baseURL = currentCorrectUrl;
        console.log("Fixed absolute URL - extracted path:", path, "using baseURL:", currentCorrectUrl);
      } else {
        // URL is absolute and correct, keep it as is
        config.baseURL = undefined; // Clear baseURL when using absolute URL
      }
    } catch (e) {
      console.error("Error parsing URL:", e);
      config.baseURL = currentCorrectUrl;
    }
  } else {
    // No URL or empty, ensure baseURL is set
    config.baseURL = currentCorrectUrl;
  }
  
  // CRITICAL: Always force baseURL to be the correct backend URL (override ANY previous value)
  // This must be done last to ensure nothing can override it
  config.baseURL = currentCorrectUrl;
  
  // Also update defaults
  api.defaults.baseURL = currentCorrectUrl;
  axios.defaults.baseURL = currentCorrectUrl;
  
  // Final validation - ensure baseURL is never invalid
  if (!config.baseURL || 
      config.baseURL.includes('.pages.dev') || 
      config.baseURL.includes('localhost') || 
      config.baseURL.startsWith('/') ||
      !config.baseURL.startsWith('http')) {
    console.error("INVALID baseURL detected:", config.baseURL, "forcing backend URL:", currentCorrectUrl);
    config.baseURL = currentCorrectUrl;
  }
  
  const fullUrl = config.baseURL ? (config.baseURL + (config.url || '')) : (config.url || '');
  console.log("Request config - baseURL:", config.baseURL, "url:", config.url, "full URL:", fullUrl);
  
  // Final safety check - if fullUrl is still wrong, force it
  if (fullUrl.includes('.pages.dev') || fullUrl.includes('localhost')) {
    console.error("INVALID full URL detected:", fullUrl, "forcing correct URL");
    config.url = config.url?.replace(/^https?:\/\/[^\/]+/, '') || config.url || '';
    config.baseURL = currentCorrectUrl;
  }
  
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
