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
  
  // ALWAYS build the full absolute URL directly
  // This is the most reliable way to ensure the correct backend URL is used
  if (config.url) {
    let path = config.url;
    
    // If URL is absolute, extract the path
    if (config.url.startsWith('http://') || config.url.startsWith('https://')) {
      try {
        const urlObj = new URL(config.url);
        path = urlObj.pathname + urlObj.search;
      } catch (e) {
        // If parsing fails, try to extract path manually
        const match = config.url.match(/https?:\/\/[^\/]+(\/.*)/);
        if (match) {
          path = match[1];
        }
      }
    }
    
    // Ensure path starts with /
    if (!path.startsWith('/')) {
      path = '/' + path;
    }
    
    // Build the full absolute URL
    const fullUrl = currentCorrectUrl.replace(/\/$/, '') + path;
    config.url = fullUrl;
    config.baseURL = undefined; // Clear baseURL when using absolute URL
    
    console.log("Built full URL:", fullUrl);
  } else {
    // No URL, use baseURL
    config.baseURL = currentCorrectUrl;
  }
  
  // Final check - ensure URL is correct
  const finalUrl = config.url || (config.baseURL ? (config.baseURL + (config.url || '')) : '');
  if (finalUrl.includes('.pages.dev') || finalUrl.includes('localhost')) {
    console.error("ERROR: URL still contains frontend domain:", finalUrl);
    // Force correct URL
    if (config.url) {
      const path = config.url.replace(/^https?:\/\/[^\/]+/, '') || config.url;
      config.url = currentCorrectUrl.replace(/\/$/, '') + (path.startsWith('/') ? path : '/' + path);
      config.baseURL = undefined;
    } else {
      config.baseURL = currentCorrectUrl;
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
