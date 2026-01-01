import React, { useState } from "react";
import api from "../api/api";
import { useNavigate } from "react-router-dom";

const ResetPassword = () => {
  const [token, setToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();

    setMessage("");
    setError("");

    if (!token.trim()) {
      setError("יש להזין קוד איפוס תקף.");
      return;
    }

    if (!newPassword.trim()) {
      setError("יש להזין סיסמה חדשה.");
      return;
    }

    try {
      // שולח את השדות עם אותיות גדולות כפי שה־API דורש
      const res = await api.post("/auth/reset-password", {
        Token: token,
        NewPassword: newPassword
      });
      setMessage("הסיסמה אופסה בהצלחה! מעבירה למסך התחברות...");
      console.log("Reset password response:", res.data);
      setTimeout(() => navigate("/login"), 2000);
    } catch (err: any) {
      setError("הקוד אינו תקין או שפג תוקפו.");
      console.error(err);
    }
  };

  return (
    <div className="reset-page">
      <h2>איפוס סיסמה</h2>
      <form onSubmit={handleReset}>
        <input
          type="text"
          placeholder="הדבק כאן את קוד האיפוס"
          value={token}
          onChange={(e) => setToken(e.target.value)}
        /><br/>
        <input
          type="password"
          placeholder="סיסמה חדשה"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          autoComplete="new-password"
        /><br/>
        <button type="submit">אפס סיסמה</button>
      </form>
      {message && <p style={{ color: "green" }}>{message}</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
};

export default ResetPassword;
