import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";

// Backend API URL - use baseURL approach which is the standard way
const BACKEND_API_URL = "https://institutions-93gl.onrender.com/api";

// Log immediately to verify this code is loaded
console.log("🔵 api.ts loaded - BACKEND_API_URL:", BACKEND_API_URL);

// Create axios instance WITH baseURL - this is the standard and correct approach
const axiosInstance = axios.create({
  baseURL: BACKEND_API_URL,
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

// 🔍 Request interceptor - simplified, just for logging
axiosInstance.interceptors.request.use(
  (config) => {
    // Log the request details
    const finalUrl = config.baseURL 
      ? `${config.baseURL}${config.url?.startsWith('/') ? config.url : '/' + (config.url || '')}`
      : config.url;
    
    console.log("🔵 Axios request:", {
      method: config.method?.toUpperCase(),
      url: config.url,
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

// Simple helper to normalize paths - just ensure they start with /
const normalizePath = (path: string): string => {
  const clean = (path || '').trim();
  return clean.startsWith('/') ? clean : '/' + clean;
};

// Wrapper API object - simple and clean, using baseURL
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

console.log("✅ API initialized with baseURL:", BACKEND_API_URL);

export default api;
