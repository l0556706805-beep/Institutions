import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";

// Create axios instance WITHOUT baseURL - we'll build full URLs ourselves
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

// Helper to build full URL - NO baseURL dependency
const buildFullUrl = (path: string): string => {
  // Normalize path
  const cleanPath = path.startsWith('/') ? path : '/' + path;
  
  // Check if we're in production
  if (typeof window === 'undefined') {
    return '/api' + cleanPath;
  }
  
  const hostname = window.location.hostname;
  const isProduction = hostname !== 'localhost' && 
                       hostname !== '127.0.0.1' &&
                       !hostname.includes('localhost');
  
  if (isProduction) {
    // In production, build full URL directly
    return 'https://institutions-93gl.onrender.com/api' + cleanPath;
  }
  
  // In development, use relative path
  return '/api' + cleanPath;
};

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

// Wrapper API object - build full URLs directly, NO baseURL
const api = {
  get: <T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> => {
    const fullUrl = buildFullUrl(url);
    console.log("🔵 API GET:", url, "->", fullUrl);
    return axiosInstance.get<T>(fullUrl, config);
  },
  
  post: <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> => {
    const fullUrl = buildFullUrl(url);
    console.log("🔵 API POST:", url, "->", fullUrl);
    return axiosInstance.post<T>(fullUrl, data, config);
  },
  
  put: <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> => {
    const fullUrl = buildFullUrl(url);
    console.log("🔵 API PUT:", url, "->", fullUrl);
    return axiosInstance.put<T>(fullUrl, data, config);
  },
  
  delete: <T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> => {
    const fullUrl = buildFullUrl(url);
    console.log("🔵 API DELETE:", url, "->", fullUrl);
    return axiosInstance.delete<T>(fullUrl, config);
  },
  
  patch: <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> => {
    const fullUrl = buildFullUrl(url);
    console.log("🔵 API PATCH:", url, "->", fullUrl);
    return axiosInstance.patch<T>(fullUrl, data, config);
  },
  
  // Expose defaults for backward compatibility
  defaults: axiosInstance.defaults,
};

console.log("✅ API initialized - building full URLs directly");

export default api;
