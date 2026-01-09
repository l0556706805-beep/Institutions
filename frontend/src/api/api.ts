import axios from "axios";

// API URL - Always use the backend API URL, never the frontend domain
// Priority: config.js (runtime) > environment variable (build time) > hardcoded fallback
const BACKEND_API_URL = "https://institutions-93gl.onrender.com/api";

const getApiUrl = () => {
  // Check if config.js has loaded and has a valid API_URL
  const appConfig = (window as any).APP_CONFIG;
  if (appConfig?.API_URL) {
    const configUrl = appConfig.API_URL;
    // Validate that it's not the frontend domain
    if (!configUrl.includes('.pages.dev') && !configUrl.includes('localhost')) {
      console.log("Using API_URL from config.js:", configUrl);
      return configUrl;
    }
    console.warn("config.js contains invalid API_URL (frontend domain), using fallback");
  }
  
  // Fallback to environment variable (set during build) or hardcoded URL
  const envUrl = process.env.REACT_APP_API_URL;
  if (envUrl && !envUrl.includes('.pages.dev') && !envUrl.includes('localhost')) {
    console.log("Using API_URL from environment variable:", envUrl);
    return envUrl;
  }
  
  // Always fallback to the hardcoded backend URL
  console.log("Using hardcoded backend API_URL:", BACKEND_API_URL);
  return BACKEND_API_URL;
};

// יצירת מופע API
const api = axios.create({
  baseURL: getApiUrl(),
});

// Interceptor to update baseURL dynamically if config.js loads after axios is created
api.interceptors.request.use((config) => {
  const currentBaseUrl = getApiUrl();
  if (config.baseURL !== currentBaseUrl) {
    config.baseURL = currentBaseUrl;
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
