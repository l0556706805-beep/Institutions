import axios, { AxiosRequestConfig, AxiosResponse } from "axios";

/**
 * IMPORTANT:
 * We do NOT call the Render backend directly from the browser.
 * In production we proxy via Cloudflare Pages Function at /api/* (same-origin).
 * In local dev we proxy via CRA setupProxy.js (also /api/*).
 */

const axiosInstance = axios.create({
  timeout: 10000,
  headers: { "Content-Type": "application/json" },
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

// Build a SAME-ORIGIN API URL (handled by proxy in dev + Pages Function in prod)
const buildApiUrl = (path: string): string => {
  const cleanPath = String(path || "").trim();
  const normalized = cleanPath.startsWith("/") ? cleanPath : "/" + cleanPath;
  return "/api" + normalized;
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

// Wrapper API object - always call SAME-ORIGIN /api/*
const api = {
  get: <T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> => {
    const apiUrl = buildApiUrl(url);
    console.log("🔵 API GET:", url, "->", apiUrl);
    return axiosInstance.get<T>(apiUrl, config);
  },
  
  post: <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> => {
    const apiUrl = buildApiUrl(url);
    console.log("🔵 API POST:", url, "->", apiUrl);
    return axiosInstance.post<T>(apiUrl, data, config);
  },
  
  put: <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> => {
    const apiUrl = buildApiUrl(url);
    console.log("🔵 API PUT:", url, "->", apiUrl);
    return axiosInstance.put<T>(apiUrl, data, config);
  },
  
  delete: <T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> => {
    const apiUrl = buildApiUrl(url);
    console.log("🔵 API DELETE:", url, "->", apiUrl);
    return axiosInstance.delete<T>(apiUrl, config);
  },
  
  patch: <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> => {
    const apiUrl = buildApiUrl(url);
    console.log("🔵 API PATCH:", url, "->", apiUrl);
    return axiosInstance.patch<T>(apiUrl, data, config);
  },
  
  // Expose defaults for backward compatibility
  defaults: axiosInstance.defaults,
};

console.log("✅ API initialized - using same-origin /api/* proxy");

export default api;
