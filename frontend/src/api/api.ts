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
  // CRITICAL: Use hardcoded string directly - no variables that can be corrupted
  // Build the full absolute URL using string concatenation
  const BACKEND = "https://institutions-93gl.onrender.com/api";
  
  // Get the path from config.url
  let path = config.url || '';
  
  // If URL is absolute, extract just the path
  if (path.startsWith('http://') || path.startsWith('https://')) {
    try {
      const urlObj = new URL(path);
      path = urlObj.pathname + urlObj.search;
    } catch (e) {
      // Fallback: extract path manually
      const match = path.match(/https?:\/\/[^\/]+(\/.*)/);
      path = match ? match[1] : '/';
    }
  }
  
  // Ensure path starts with /
  if (!path.startsWith('/')) {
    path = '/' + path;
  }
  
  // CRITICAL: Build the complete absolute URL using string concatenation
  // Don't use template literals - use direct concatenation to avoid any issues
  const fullUrl = BACKEND + path;
  
  // Verify the URL was built correctly
  if (!fullUrl.startsWith('https://institutions-93gl.onrender.com')) {
    console.error("ERROR: URL was not built correctly! fullUrl:", fullUrl);
    // Force correct URL
    const correctedUrl = "https://institutions-93gl.onrender.com/api" + path;
    config.url = correctedUrl;
    config.baseURL = undefined;
    console.log("Corrected URL:", correctedUrl);
    return config;
  }
  
  // CRITICAL: Override config.url with the full URL
  // Delete any existing baseURL to prevent axios from modifying the URL
  delete config.baseURL;
  config.url = fullUrl;
  
  // Force the URL to be the correct one - prevent any modifications
  try {
    Object.defineProperty(config, 'url', {
      value: fullUrl,
      writable: false,
      configurable: false,
      enumerable: true
    });
  } catch (e) {
    // If defineProperty fails, just set it normally
    config.url = fullUrl;
    console.warn("Could not freeze config.url:", e);
  }
  
  // Debug logging
  console.log("Interceptor Debug:");
  console.log("  BACKEND:", BACKEND);
  console.log("  path:", path);
  console.log("  fullUrl:", fullUrl);
  console.log("  config.url:", config.url);
  console.log("  typeof config.url:", typeof config.url);
  console.log("  fullUrl starts with https://institutions-93gl:", fullUrl.startsWith('https://institutions-93gl'));
  
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


