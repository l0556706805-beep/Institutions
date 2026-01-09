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
  
  // Build the full URL directly to avoid any baseURL issues
  let finalUrl: string;
  
  if (config.url) {
    // If URL is absolute, check if it points to frontend domain
    if (config.url.startsWith('http://') || config.url.startsWith('https://')) {
      try {
        const urlObj = new URL(config.url);
        if (urlObj.hostname.includes('.pages.dev') || urlObj.hostname.includes('localhost')) {
          // Extract path and build full URL with backend
          const path = urlObj.pathname + urlObj.search;
          finalUrl = currentCorrectUrl + path;
          config.url = finalUrl;
          config.baseURL = undefined; // Clear baseURL when using absolute URL
          console.log("Fixed absolute URL - using full URL:", finalUrl);
        } else {
          // URL is absolute and correct, keep it as is
          finalUrl = config.url;
          config.baseURL = undefined; // Clear baseURL when using absolute URL
        }
      } catch (e) {
        console.error("Error parsing URL:", e);
        // Fallback: build full URL from relative path
        finalUrl = currentCorrectUrl + config.url;
        config.url = finalUrl;
        config.baseURL = undefined;
      }
    } else {
      // URL is relative, build full URL with backend
      finalUrl = currentCorrectUrl + config.url;
      config.url = finalUrl;
      config.baseURL = undefined; // Clear baseURL when using absolute URL
    }
  } else {
    // No URL, use baseURL
    config.baseURL = currentCorrectUrl;
    finalUrl = currentCorrectUrl;
  }
  
  // CRITICAL: Always set baseURL to undefined when using absolute URL
  // This prevents axios from modifying the URL
  if (config.url && (config.url.startsWith('http://') || config.url.startsWith('https://'))) {
    config.baseURL = undefined;
  } else {
    config.baseURL = currentCorrectUrl;
  }
  
  // Also update defaults
  api.defaults.baseURL = currentCorrectUrl;
  axios.defaults.baseURL = currentCorrectUrl;
  
  // Final validation - ensure URL is never invalid
  const checkUrl = config.url || (config.baseURL ? (config.baseURL + (config.url || '')) : '');
  if (checkUrl.includes('.pages.dev') || checkUrl.includes('localhost')) {
    console.error("INVALID URL detected:", checkUrl, "forcing correct URL");
    if (config.url && !config.url.startsWith('http')) {
      // URL is relative, build full URL
      config.url = currentCorrectUrl + config.url;
      config.baseURL = undefined;
    } else {
      // URL is absolute but wrong, extract path and rebuild
      try {
        const urlObj = new URL(checkUrl);
        const path = urlObj.pathname + urlObj.search;
        config.url = currentCorrectUrl + path;
        config.baseURL = undefined;
      } catch (e) {
        // Fallback
        config.url = currentCorrectUrl + (config.url || '');
        config.baseURL = undefined;
      }
    }
  }
  
  const finalCheckUrl = config.url || (config.baseURL ? (config.baseURL + (config.url || '')) : '');
  console.log("Request config - baseURL:", config.baseURL, "url:", config.url, "final URL:", finalCheckUrl);
  
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
