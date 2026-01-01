import React, { createContext, useState, useEffect, ReactNode } from "react";
import { setAuthToken } from "../api/api";
import {jwtDecode} from "jwt-decode";

interface AuthContextType {
  token: string | null;
  role: string | null;
  login: (token: string) => void;
  logout: () => void;
  isAdmin: () => boolean; // 👈 פונקציה לבדיקה אם המשתמש מנהל
}

export const AuthContext = createContext<AuthContextType>({
  token: null,
  role: null,
  login: () => {},
  logout: () => {},
  isAdmin: () => false,
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(
    localStorage.getItem("token")
  );
  const [role, setRole] = useState<string | null>(null);

  // טעינת טוקן ו-role בעת התחלת האפליקציה
  useEffect(() => {
    if (token) {
      setAuthToken(token);
      try {
        const decoded: any = jwtDecode(token);
        setRole(decoded.role || null);
      } catch (error) {
        console.error("JWT decode failed:", error);
        setRole(null);
      }
    } else {
      setAuthToken(null);
      setRole(null);
    }
  }, [token]);

  const login = (newToken: string) => {
    setToken(newToken);
    localStorage.setItem("token", newToken);
    setAuthToken(newToken);

    try {
      const decoded: any = jwtDecode(newToken);
      setRole(decoded.role || null);
    } catch (error) {
      console.error("JWT decode failed:", error);
      setRole(null);
    }
  };

  const logout = () => {
    setToken(null);
    setRole(null);
    localStorage.removeItem("token");
    setAuthToken(null);
  };

  // פונקציה נוחה לבדוק אם המשתמש מנהל
  const isAdmin = () => role === "Admin";

  return (
    <AuthContext.Provider value={{ token, role, login, logout, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};
