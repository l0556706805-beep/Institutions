import React, { useState, useContext } from "react";
import api from "../api/api";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { token, login, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
     const res = await api.post("/auth/login", {
  email: email.trim().toLowerCase(),
  password,
});
console.log(res.data);

      login(res.data.token);
      navigate("/products");
    } catch {
      setError("שגיאת התחברות. בדקי את הפרטים.");
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const goToForgotPassword = () => {
    navigate("/forgot-password");
  };

  if (token) {
    return (
      <div>
        <h2>שלום! את/ה מחובר/ת</h2>
        <button onClick={handleLogout}>התנתקות</button>
      </div>
    );
  }

  return (
    <div className="login-page">
      <h2>התחברות למערכת</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="אימייל"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        /><br/>
        <input
          type="password"
          placeholder="סיסמה"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        /><br/>
        <button type="submit">כניסה</button>
      </form>

      <button 
        style={{ marginTop: "10px", background: "none", border: "none", color: "blue", cursor: "pointer" }}
        onClick={goToForgotPassword}
      >
        שכחתי סיסמה
      </button>

      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
};

export default Login;
