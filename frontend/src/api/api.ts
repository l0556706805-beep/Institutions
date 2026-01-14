import axios, { AxiosRequestConfig, AxiosResponse } from "axios";

// =====================
// Axios instance - Render backend
// =====================
const axiosInstance = axios.create({
  baseURL: "https://institutions-93gl.onrender.com/api",
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

// =====================
// Auth Token handling
// =====================
let currentToken: string | null = null;

export const setAuthToken = (token: string | null) => {
  currentToken = token;

  if (token) {
    axiosInstance.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    localStorage.setItem("token", token);
    console.log("✅ Auth token set");
  } else {
    delete axiosInstance.defaults.headers.common["Authorization"];
    localStorage.removeItem("token");
    console.log("⚠️ Auth token removed");
  }
};

// 🔥 טעינת טוקן בעת עליית האפליקציה
const storedToken = localStorage.getItem("token");
if (storedToken) {
  setAuthToken(storedToken);
}

// =====================
// 401 interceptor
// =====================
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn("⚠️ 401 Unauthorized - logging out");
      setAuthToken(null);
    }
    return Promise.reject(error);
  }
);

// =====================
// API wrapper
// =====================
const api = {
  get: <T = any>(url: string, config?: AxiosRequestConfig) =>
    axiosInstance.get<T>(url, config),

  post: <T = any>(url: string, data?: any, config?: AxiosRequestConfig) =>
    axiosInstance.post<T>(url, data, config),

  put: <T = any>(url: string, data?: any, config?: AxiosRequestConfig) =>
    axiosInstance.put<T>(url, data, config),

  delete: <T = any>(url: string, config?: AxiosRequestConfig) =>
    axiosInstance.delete<T>(url, config),

  patch: <T = any>(url: string, data?: any, config?: AxiosRequestConfig) =>
    axiosInstance.patch<T>(url, data, config),

  defaults: axiosInstance.defaults,
};

console.log("✅ API initialized - Render backend");

export default api;
