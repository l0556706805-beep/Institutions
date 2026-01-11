import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";

// Backend API URL - hardcoded directly in function to prevent any build/minification issues
const BACKEND_API_URL = "https://institutions-93gl.onrender.com/api";

// Log immediately to verify this code is loaded
console.log("🔵 api.ts loaded - BACKEND_API_URL:", BACKEND_API_URL);

// Create a clean axios instance without baseURL to avoid any conflicts
const axiosInstance = axios.create();

// Set default headers
let authToken: string | null = null;

// פונקציה שמגדירה את הטוקן בגלובל
export const setAuthToken = (token: string | null) => {
  authToken = token;
  if (token) {
    axiosInstance.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    localStorage.setItem("token", token);
  } else {
    delete axiosInstance.defaults.headers.common["Authorization"];
    localStorage.removeItem("token");
  }
};

// 🔥 בעת טעינת האפליקציה — אם יש טוקן ב־localStorage נטען אותו
const storedToken = localStorage.getItem("token");
if (storedToken) {
  setAuthToken(storedToken);
}

// 🔍 Request interceptor to log and ensure correct URL
axiosInstance.interceptors.request.use(
  (config) => {
    console.log("🔵 Axios request interceptor:", {
      url: config.url,
      baseURL: config.baseURL,
      method: config.method,
      fullUrl: config.url?.startsWith('http') ? config.url : (config.baseURL || '') + (config.url || '')
    });
    
    // Ensure URL is absolute
    if (config.url && !config.url.startsWith('http://') && !config.url.startsWith('https://')) {
      console.error("❌ ERROR: Relative URL detected in interceptor:", config.url);
      // Force absolute URL
      const backendBase = "https://institutions-93gl.onrender.com/api";
      config.url = backendBase + (config.url.startsWith('/') ? config.url : '/' + config.url);
      console.log("🔵 Fixed URL to:", config.url);
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ⛔ טיפול אוטומטי בשגיאת 401 — טוקן לא תקף / פג
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // מוחק טוקן לא תקין
      setAuthToken(null);
    }
    return Promise.reject(error);
  }
);

// Helper to build URL - inline to prevent any variable issues
const getApiUrl = (path: string): string => {
  // Log input
  console.log("🔵 getApiUrl called with path:", path);
  
  // If already full URL, return as-is (shouldn't happen, but safety check)
  if (path.startsWith('http://') || path.startsWith('https://')) {
    console.warn("⚠️ getApiUrl received full URL:", path);
    return path;
  }
  
  const normalized = path.startsWith('/') ? path : '/' + path;
  
  // Direct string concatenation - hardcoded backend URL
  const backendBase = "https://institutions-93gl.onrender.com/api";
  const fullUrl = backendBase + normalized;
  
  // Log output
  console.log("🔵 getApiUrl result:", { path, normalized, backendBase, fullUrl });
  
  return fullUrl;
};

// Wrapper API object that handles all routes and ensures they go to backend
const api = {
  get: <T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> => {
    const fullUrl = getApiUrl(url);
    console.log("API GET:", url, "->", fullUrl);
    return axiosInstance.get<T>(fullUrl, config);
  },
  
  post: <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> => {
    const fullUrl = getApiUrl(url);
    console.log("🔵 API POST wrapper:", { originalUrl: url, fullUrl, type: typeof fullUrl });
    
    // Use the full URL directly as first parameter - axios.post(url, data, config)
    return axiosInstance.post<T>(fullUrl, data, config);
  },
  
  put: <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> => {
    const fullUrl = getApiUrl(url);
    console.log("API PUT:", url, "->", fullUrl);
    return axiosInstance.put<T>(fullUrl, data, config);
  },
  
  delete: <T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> => {
    const fullUrl = getApiUrl(url);
    console.log("API DELETE:", url, "->", fullUrl);
    return axiosInstance.delete<T>(fullUrl, config);
  },
  
  patch: <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> => {
    const fullUrl = getApiUrl(url);
    console.log("API PATCH:", url, "->", fullUrl);
    return axiosInstance.patch<T>(fullUrl, data, config);
  },
  
  // Expose defaults for backward compatibility
  defaults: axiosInstance.defaults,
};

console.log("API initialized with backend URL:", BACKEND_API_URL);

export default api;


