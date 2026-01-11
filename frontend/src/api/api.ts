import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";

// Backend API URL - hardcoded to prevent any issues
const BACKEND_API_URL = "https://institutions-93gl.onrender.com/api";

// Helper function to build full URL from relative path
const buildFullUrl = (path: string): string => {
  // Ensure path starts with /
  const normalizedPath = path.startsWith('/') ? path : '/' + path;
  // Build full URL using hardcoded backend URL
  return BACKEND_API_URL + normalizedPath;
};

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

// Wrapper API object that handles all routes and ensures they go to backend
const api = {
  get: <T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> => {
    const fullUrl = buildFullUrl(url);
    console.log("API GET:", url, "->", fullUrl);
    return axiosInstance.get<T>(fullUrl, config);
  },
  
  post: <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> => {
    const fullUrl = buildFullUrl(url);
    console.log("API POST:", url, "->", fullUrl);
    return axiosInstance.post<T>(fullUrl, data, config);
  },
  
  put: <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> => {
    const fullUrl = buildFullUrl(url);
    console.log("API PUT:", url, "->", fullUrl);
    return axiosInstance.put<T>(fullUrl, data, config);
  },
  
  delete: <T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> => {
    const fullUrl = buildFullUrl(url);
    console.log("API DELETE:", url, "->", fullUrl);
    return axiosInstance.delete<T>(fullUrl, config);
  },
  
  patch: <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> => {
    const fullUrl = buildFullUrl(url);
    console.log("API PATCH:", url, "->", fullUrl);
    return axiosInstance.patch<T>(fullUrl, data, config);
  },
  
  // Expose defaults for backward compatibility
  defaults: axiosInstance.defaults,
};

console.log("API initialized with backend URL:", BACKEND_API_URL);

export default api;


