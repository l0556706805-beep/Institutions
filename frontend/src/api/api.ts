import axios from "axios";

// Get API URL from runtime config (loaded in index.html) or fallback to env var or /api
const getApiUrl = () => {
  if (typeof window !== 'undefined' && (window as any).APP_CONFIG?.API_URL) {
    return (window as any).APP_CONFIG.API_URL;
  }
  return process.env.REACT_APP_API_URL || "/api";
};

// יצירת מופע API
const api = axios.create({
  baseURL: getApiUrl(),
});

// פונקציה שמגדירה את הטוקן בגלובל
export const setAuthToken = (token: string | null) => {
  if (token) {
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    localStorage.setItem("token", token);
  } else {
    delete api.defaults.headers.common["Authorization"];
    localStorage.removeItem("token");
  }
};

// 🔥 בעת טעינת האפליקציה — אם יש טוקן ב־localStorage נטען אותו
const storedToken = localStorage.getItem("token");
if (storedToken) {
  api.defaults.headers.common["Authorization"] = `Bearer ${storedToken}`;
}

// ⛔ טיפול אוטומטי בשגיאת 401 — טוקן לא תקף / פג
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // מוחק טוקן לא תקין
      setAuthToken(null);
    }

    return Promise.reject(error);
  }
);

export default api;
