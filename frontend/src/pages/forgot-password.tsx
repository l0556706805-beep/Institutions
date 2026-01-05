import React, { useState } from "react";
import api from "../api/api";
import { useNavigate } from "react-router-dom";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (!email.trim()) {
      setError("יש להזין אימייל תקין.");
      return;
    }

    try {
      // שולחים שדה קטן "email" כמו ש־DTO מחכה לו
      const res = await api.post("/auth/forgot-password", { email });

      setMessage("הקוד נשלח בהצלחה למייל!");
      console.log("Server response:", res.data);

      // מעבר אוטומטי לעמוד איפוס סיסמה
      navigate("/reset-password");
    } catch (err: any) {
      setError("ארעה שגיאה בשרת. נסי שוב.");
      console.error(err.response?.data || err.message);
    }
  };

  return (
    <div className="forgot-page">
      <h2>איפוס סיסמה</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="הכניסי אימייל"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          required
        /><br/>
        <button type="submit">שלחי קוד איפוס</button>
      </form>
      {message && <p style={{ color: "green" }}>{message}</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
};

export default ForgotPassword;
