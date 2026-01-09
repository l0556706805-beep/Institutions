import axios from "axios";

// API URL - priority: config.js (runtime) > environment variable (build time) > hardcoded fallback
// Note: window.APP_CONFIG is loaded from /config.js at runtime, so it works after deployment
const getApiUrl = () => {
  // Check if config.js has loaded
  if ((window as any).APP_CONFIG?.API_URL) {
    return (window as any).APP_CONFIG.API_URL;
  }
  // Fallback to environment variable (set during build) or hardcoded URL
  return process.env.REACT_APP_API_URL || "https://institutions-93gl.onrender.com/api";
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
