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
    // Trim and clean the URL to remove any whitespace issues
    if (config.url) {
      config.url = config.url.trim();
    }
    
    // Log BEFORE any modifications
    const originalUrl = config.url;
    const isAbsolute = config.url?.startsWith('http://') || config.url?.startsWith('https://');
    
    console.log("🔵 Axios request interceptor:", {
      url: config.url,
      baseURL: config.baseURL,
      method: config.method,
      isAbsolute: isAbsolute,
      fullUrl: isAbsolute ? config.url : (config.baseURL || '') + (config.url || '')
    });
    
    // Ensure URL is absolute - only fix if it's truly relative
    // This should NOT happen if getApiUrl is working correctly
    if (config.url && !isAbsolute) {
      console.error("❌ ERROR: Relative URL detected in interceptor:", config.url);
      console.error("❌ This should not happen - getApiUrl should return absolute URLs");
      // Force absolute URL using hardcoded string literal directly
      const backendUrl = "https://institutions-93gl.onrender.com/api";
      const cleanUrl = config.url.trim();
      config.url = backendUrl + (cleanUrl.startsWith('/') ? cleanUrl : '/' + cleanUrl);
      console.log("🔵 Fixed URL to:", config.url);
    }
    
    // Final verification - ensure URL is valid
    if (config.url && !config.url.startsWith('https://') && !config.url.startsWith('http://')) {
      console.error("❌ CRITICAL: URL is still not absolute after interceptor:", config.url);
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

// Helper to build URL - use hardcoded string directly, NO variables at all
const getApiUrl = (path: string): string => {
  // Trim and clean the path to remove any whitespace
  const cleanPath = (path || '').trim();
  
  // Log input
  console.log("🔵 getApiUrl called with path:", cleanPath);
  
  // If already full URL, return as-is (shouldn't happen, but safety check)
  if (cleanPath.startsWith('http://') || cleanPath.startsWith('https://')) {
    console.warn("⚠️ getApiUrl received full URL:", cleanPath);
    return cleanPath.trim();
  }
  
  // Normalize path - ensure it starts with / and convert to lowercase for consistency
  const normalizedPath = cleanPath.startsWith('/') ? cleanPath : '/' + cleanPath;
  const normalized = normalizedPath.toLowerCase();
  
  // Hardcoded string literal directly - NO variable references to prevent minification issues
  // Build URL with explicit concatenation to avoid any whitespace issues
  const baseUrl = "https://institutions-93gl.onrender.com/api";
  const fullUrl = baseUrl + normalized;
  
  // Verify the URL is correct
  const trimmedUrl = fullUrl.trim();
  if (!trimmedUrl.startsWith('https://')) {
    console.error("❌ CRITICAL: getApiUrl did not produce a valid HTTPS URL:", trimmedUrl);
  }
  
  // Log output
  console.log("🔵 getApiUrl result:", { 
    path: cleanPath, 
    normalized, 
    fullUrl: trimmedUrl,
    "fullUrl startsWith https": trimmedUrl.startsWith('https://'),
    "fullUrl length": trimmedUrl.length
  });
  
  return trimmedUrl;
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
    
    // Ensure the URL is clean and properly formatted - double check
    const cleanUrl = (fullUrl || '').trim();
    
    // Verify URL before sending
    if (!cleanUrl.startsWith('https://')) {
      console.error("❌ CRITICAL ERROR: POST URL is not valid HTTPS URL:", cleanUrl);
      throw new Error(`Invalid URL constructed: ${cleanUrl}`);
    }
    
    console.log("🔵 API POST wrapper:", { 
      originalUrl: url, 
      fullUrl: cleanUrl, 
      type: typeof cleanUrl,
      "startsWith https": cleanUrl.startsWith('https://')
    });
    
    // Use the full URL directly as first parameter - axios.post(url, data, config)
    return axiosInstance.post<T>(cleanUrl, data, config);
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

console.log("API initialized with backend URL: https://institutions-93gl.onrender.com/api");

export default api;


