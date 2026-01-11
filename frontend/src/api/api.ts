import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";

// Function to get API base URL dynamically - checks config on every call
const getApiBaseUrl = (): string => {
  // Check if we're in browser environment
  if (typeof window === 'undefined') {
    return '/api';
  }
  
  // Try to get config from window.APP_CONFIG (loaded from config.js)
  const appConfig = (window as any).APP_CONFIG;
  if (appConfig?.API_URL) {
    const configUrl = String(appConfig.API_URL).trim();
    if (configUrl && configUrl.startsWith('http')) {
      console.log("✅ Using external config:", configUrl);
      return configUrl;
    }
  }
  
  // Check if we're in production by checking the hostname
  // If not localhost and not 127.0.0.1, assume production
  const isProduction = window.location.hostname !== 'localhost' && 
                       window.location.hostname !== '127.0.0.1' &&
                       !window.location.hostname.includes('localhost');
  
  if (isProduction) {
    // In production without config, use hardcoded backend URL
    console.warn("⚠️ No external config found, using hardcoded backend URL");
    return 'https://institutions-93gl.onrender.com/api';
  }
  
  // In development, use relative path - proxy will handle it
  return '/api';
};

// Create axios instance - baseURL will be set dynamically
const axiosInstance = axios.create({
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

// 🔍 Request interceptor - set baseURL dynamically on every request
axiosInstance.interceptors.request.use(
  (config) => {
    // Get base URL dynamically (checks config.js on every request)
    const baseUrl = getApiBaseUrl().trim();
    
    // Set baseURL if not already set or if it's different
    if (!config.baseURL || config.baseURL !== baseUrl) {
      config.baseURL = baseUrl;
    }
    
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
    
    console.log("🔵 API Request:", {
      method: config.method?.toUpperCase(),
      path: config.url,
      baseURL: config.baseURL,
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

// Log initialization
const initialBaseUrl = getApiBaseUrl();
console.log("✅ API initialized");
console.log("📋 Initial baseURL:", initialBaseUrl);
console.log("📋 Hostname:", typeof window !== 'undefined' ? window.location.hostname : 'unknown');
console.log("📋 APP_CONFIG available:", typeof window !== 'undefined' && !!(window as any).APP_CONFIG);
if (typeof window !== 'undefined' && (window as any).APP_CONFIG) {
  console.log("📋 APP_CONFIG.API_URL:", (window as any).APP_CONFIG.API_URL);
}

export default api;
