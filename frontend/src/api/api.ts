import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";

// Hardcoded backend URL - always use this in production
const BACKEND_API_URL = 'https://institutions-93gl.onrender.com/api';

// Function to get API base URL - simple and reliable
const getApiBaseUrl = (): string => {
  // Check if we're in browser environment
  if (typeof window === 'undefined') {
    console.log("🔵 getApiBaseUrl: window is undefined, returning /api");
    return '/api';
  }
  
  // Check if we're in production by checking the hostname
  const hostname = window.location.hostname;
  console.log("🔵 getApiBaseUrl: hostname =", hostname);
  
  const isProduction = hostname !== 'localhost' && 
                       hostname !== '127.0.0.1' &&
                       !hostname.includes('localhost');
  
  console.log("🔵 getApiBaseUrl: isProduction =", isProduction);
  console.log("🔵 getApiBaseUrl: BACKEND_API_URL =", BACKEND_API_URL);
  
  if (isProduction) {
    // In production, ALWAYS use hardcoded backend URL
    // Don't rely on config.js - it might not be loaded or might be empty
    console.log("🔵 getApiBaseUrl: Returning BACKEND_API_URL:", BACKEND_API_URL);
    return BACKEND_API_URL;
  }
  
  // In development, use relative path - proxy will handle it
  console.log("🔵 getApiBaseUrl: Returning /api for development");
  return '/api';
};

// Get initial base URL - ensure it's never empty
const initialBaseUrl = typeof window !== 'undefined' ? getApiBaseUrl() : '/api';

console.log("🔵 Creating axios instance with baseURL:", initialBaseUrl);
console.log("🔵 Hostname:", typeof window !== 'undefined' ? window.location.hostname : 'unknown');

// Create axios instance - set baseURL immediately
const axiosInstance = axios.create({
  baseURL: initialBaseUrl,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

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

// 🔍 Request interceptor - FORCE baseURL on every request
axiosInstance.interceptors.request.use(
  (config) => {
    // Get base URL - always reliable
    const correctBaseUrl = getApiBaseUrl();
    
    // CRITICAL: Delete any existing baseURL first, then set it fresh
    delete config.baseURL;
    config.baseURL = correctBaseUrl;
    
    // Also update the instance defaults to prevent override
    axiosInstance.defaults.baseURL = correctBaseUrl;
    
    // Clean URLs
    if (config.baseURL) {
      config.baseURL = String(config.baseURL).trim();
    }
    if (config.url) {
      config.url = String(config.url).trim();
    }
    
    // Build final URL for logging
    const base = config.baseURL || '';
    const path = config.url || '';
    const finalUrl = base.startsWith('http')
      ? `${base}${path.startsWith('/') ? path : '/' + path}`
      : `${base}${path.startsWith('/') ? path : '/' + path}`;
    
    // Verify baseURL is correct (not frontend domain) - FORCE fix if wrong
    const currentHostname = typeof window !== 'undefined' ? window.location.origin : '';
    if (config.baseURL && currentHostname && config.baseURL.includes(currentHostname)) {
      console.error("❌ CRITICAL: baseURL is frontend domain! Forcing correct URL...");
      delete config.baseURL;
      config.baseURL = correctBaseUrl;
      axiosInstance.defaults.baseURL = correctBaseUrl;
    }
    
    // Final verification - if still wrong, force it one more time
    if (!config.baseURL || config.baseURL === '' || (currentHostname && config.baseURL.includes(currentHostname))) {
      console.error("❌ CRITICAL: baseURL still wrong after fix! Forcing again...");
      config.baseURL = correctBaseUrl;
      axiosInstance.defaults.baseURL = correctBaseUrl;
    }
    
    console.log("🔵 API Request:", {
      method: config.method?.toUpperCase(),
      path: config.url,
      baseURL: config.baseURL,
      baseURLFromFunction: correctBaseUrl,
      instanceDefaultsBaseURL: axiosInstance.defaults.baseURL,
      finalUrl: finalUrl,
      hostname: typeof window !== 'undefined' ? window.location.hostname : 'unknown',
    });
    
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

// Helper to normalize paths - ensure they start with /
const normalizePath = (path: string): string => {
  const clean = String(path || '').trim();
  return clean.startsWith('/') ? clean : '/' + clean;
};

// Wrapper API object - all paths are relative, handled by proxy/config
const api = {
  get: <T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> => {
    return axiosInstance.get<T>(normalizePath(url), config);
  },
  
  post: <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> => {
    return axiosInstance.post<T>(normalizePath(url), data, config);
  },
  
  put: <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> => {
    return axiosInstance.put<T>(normalizePath(url), data, config);
  },
  
  delete: <T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> => {
    return axiosInstance.delete<T>(normalizePath(url), config);
  },
  
  patch: <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> => {
    return axiosInstance.patch<T>(normalizePath(url), data, config);
  },
  
  // Expose defaults for backward compatibility
  defaults: axiosInstance.defaults,
};

console.log("✅ API initialized with baseURL:", initialBaseUrl);

export default api;
