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
      // שולח את השדה עם האות הגדולה E
      const res = await api.post("/auth/forgot-password", { Email: email });
      console.log("RESET CODE (dev only):", res.data.resetCode);

      setMessage("הקוד נשלח בהצלחה למייל!");
      // מעבר אוטומטי לעמוד איפוס סיסמה
      navigate("/reset-password");

    } catch (err: any) {
      setError("ארעה שגיאה. נסי שוב.");
      console.error(err);
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
        /><br/>
        <button type="submit">שלחי קוד איפוס</button>
      </form>
      {message && <p style={{ color: "green" }}>{message}</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
};

export default ForgotPassword;
