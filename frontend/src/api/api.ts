import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";

// Get API URL from external config layer (window.APP_CONFIG) or use relative path
const getApiBaseUrl = (): string => {
  // In production, use the external config if available
  if (typeof window !== 'undefined' && (window as any).APP_CONFIG?.API_URL) {
    return (window as any).APP_CONFIG.API_URL;
  }
  
  // In development or if config not available, use relative path
  // This will work with proxy in development
  return '/api';
};

// Create axios instance - use relative paths, proxy will handle routing
const axiosInstance = axios.create({
  baseURL: getApiBaseUrl(),
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

// 🔍 Request interceptor - simple logging
axiosInstance.interceptors.request.use(
  (config) => {
    const finalUrl = config.baseURL 
      ? `${config.baseURL}${config.url?.startsWith('/') ? config.url : '/' + (config.url || '')}`
      : config.url;
    
    console.log("🔵 API Request:", {
      method: config.method?.toUpperCase(),
      path: config.url,
      baseURL: config.baseURL,
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
  const clean = (path || '').trim();
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
const apiBaseUrl = getApiBaseUrl();
console.log("✅ API initialized with baseURL:", apiBaseUrl);
console.log("📋 Using external config:", typeof window !== 'undefined' && !!(window as any).APP_CONFIG);

export default api;
