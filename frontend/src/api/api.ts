import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";

// Determine if we're in production (has external config) or development
const isProduction = typeof window !== 'undefined' && 
  (window as any).APP_CONFIG?.API_URL && 
  String((window as any).APP_CONFIG.API_URL).trim().startsWith('http');

// Get API base URL - use external config in production, relative path in development
const getApiBaseUrl = (): string => {
  if (isProduction) {
    const configUrl = String((window as any).APP_CONFIG.API_URL).trim();
    if (configUrl && configUrl.startsWith('http')) {
      return configUrl;
    }
  }
  
  // Always use relative path in development - proxy will handle it
  return '/api';
};

// Get and clean the base URL - ensure no whitespace
const apiBaseUrl = getApiBaseUrl().trim() || '/api';

console.log("🔵 Initializing API...");
console.log("🔵 isProduction:", isProduction);
console.log("🔵 apiBaseUrl:", `"${apiBaseUrl}"`);
console.log("🔵 apiBaseUrl length:", apiBaseUrl.length);
console.log("🔵 apiBaseUrl type:", typeof apiBaseUrl);

// Create axios instance
const axiosInstance = axios.create({
  baseURL: apiBaseUrl,
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

// 🔍 Request interceptor - ensure URLs are clean
axiosInstance.interceptors.request.use(
  (config) => {
    // Force clean baseURL and url - remove any whitespace
    if (config.baseURL) {
      config.baseURL = String(config.baseURL).trim();
    }
    if (config.url) {
      config.url = String(config.url).trim();
    }
    
    // Ensure baseURL is set correctly
    if (!config.baseURL || config.baseURL === '') {
      config.baseURL = '/api';
    }
    
    // Build final URL for logging
    const base = config.baseURL || '';
    const path = config.url || '';
    const finalUrl = base && base !== '/api'
      ? `${base}${path.startsWith('/') ? path : '/' + path}`
      : `${base}${path.startsWith('/') ? path : '/' + path}`;
    
    console.log("🔵 API Request:", {
      method: config.method?.toUpperCase(),
      path: config.url,
      baseURL: `"${config.baseURL}"`,
      baseURLLength: config.baseURL?.length || 0,
      finalUrl: finalUrl,
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

console.log("✅ API initialized successfully");

export default api;
