import React, { useState } from "react";
import api from "../api/api";
import { useNavigate } from "react-router-dom";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (!email.trim()) {
      setError("יש להזין אימייל תקין.");
      return;
    }

    setLoading(true);
    try {
      // שולחים שדה קטן "email" כמו ש־DTO מחכה לו
      const res = await api.post("/auth/forgot-password", { email });

      setMessage("הקוד נשלח בהצלחה למייל!");
      console.log("Server response:", res.data);

      // מעבר אוטומטי לעמוד איפוס סיסמה
      setTimeout(() => navigate("/reset-password"), 2000);
    } catch (err: any) {
      setError("ארעה שגיאה בשרת. נסי שוב.");
      console.error(err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  const containerStyle: React.CSSProperties = {
    minHeight: "calc(100vh - 150px)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "40px 20px",
    fontFamily: "'Heebo', sans-serif",
    background: "linear-gradient(135deg, rgba(102, 126, 234, 0.03) 0%, rgba(118, 75, 162, 0.03) 100%)",
  };

  const titleStyle: React.CSSProperties = {
    fontSize: "2.5rem",
    fontWeight: 700,
    marginBottom: "40px",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    display: "flex",
    alignItems: "center",
    gap: "15px",
  };

  const formStyle: React.CSSProperties = {
    background: "white",
    padding: "50px 40px",
    borderRadius: "24px",
    boxShadow: "0 20px 60px rgba(102, 126, 234, 0.15)",
    width: "100%",
    maxWidth: "420px",
    position: "relative",
    overflow: "hidden",
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "16px 20px",
    marginBottom: "25px",
    border: "2px solid #e2e8f0",
    borderRadius: "14px",
    fontSize: "1rem",
    fontFamily: "'Heebo', sans-serif",
    transition: "all 0.3s ease",
    background: "#f8faff",
  };

  const buttonStyle: React.CSSProperties = {
    width: "100%",
    padding: "16px",
    background: loading 
      ? "linear-gradient(135deg, #a0aec0 0%, #718096 100%)"
      : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "white",
    border: "none",
    borderRadius: "14px",
    fontSize: "1.1rem",
    fontWeight: 600,
    fontFamily: "'Heebo', sans-serif",
    cursor: loading ? "not-allowed" : "pointer",
    transition: "all 0.3s ease",
    boxShadow: loading ? "none" : "0 8px 25px rgba(102, 126, 234, 0.35)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
  };

  return (
    <div style={containerStyle}>
      <h2 style={titleStyle}>
        <span style={{ WebkitTextFillColor: "initial" }}>🔐</span>
        איפוס סיסמה
      </h2>
      
      <form onSubmit={handleSubmit} style={formStyle}>
        <div style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "5px",
          background: "linear-gradient(90deg, #667eea, #764ba2, #f093fb)",
        }}></div>
        
        <p style={{ 
          textAlign: "center", 
          color: "#718096", 
          marginBottom: "30px",
          fontSize: "1rem",
        }}>
          הזיני את כתובת המייל שלך ונשלח לך קוד לאיפוס הסיסמה
        </p>
        
        <input
          type="email"
          placeholder="📧 כתובת אימייל"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          required
          style={inputStyle}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = "#667eea";
            e.currentTarget.style.boxShadow = "0 0 0 4px rgba(102, 126, 234, 0.15)";
            e.currentTarget.style.background = "white";
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = "#e2e8f0";
            e.currentTarget.style.boxShadow = "none";
            e.currentTarget.style.background = "#f8faff";
          }}
        />
        
        <button 
          type="submit"
          style={buttonStyle}
          disabled={loading}
          onMouseEnter={(e) => {
            if (!loading) {
              e.currentTarget.style.transform = "translateY(-3px)";
              e.currentTarget.style.boxShadow = "0 12px 35px rgba(102, 126, 234, 0.4)";
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "0 8px 25px rgba(102, 126, 234, 0.35)";
          }}
        >
          {loading ? (
            <>
              <span style={{
                width: "20px",
                height: "20px",
                border: "3px solid rgba(255,255,255,0.3)",
                borderTopColor: "white",
                borderRadius: "50%",
                animation: "spin 1s linear infinite",
              }}></span>
              שולח...
            </>
          ) : (
            "📨 שלח קוד איפוס"
          )}
        </button>
        
        <button
          type="button"
          onClick={() => navigate("/login")}
          style={{
            width: "100%",
            padding: "14px",
            marginTop: "15px",
            background: "transparent",
            color: "#667eea",
            border: "2px solid #e2e8f0",
            borderRadius: "14px",
            fontSize: "1rem",
            fontWeight: 500,
            fontFamily: "'Heebo', sans-serif",
            cursor: "pointer",
            transition: "all 0.3s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "#667eea";
            e.currentTarget.style.background = "rgba(102, 126, 234, 0.05)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "#e2e8f0";
            e.currentTarget.style.background = "transparent";
          }}
        >
          ← חזרה להתחברות
        </button>
      </form>
      
      {message && (
        <p style={{ 
          color: "#0d9f5f",
          background: "rgba(56, 239, 125, 0.1)",
          padding: "15px 30px",
          borderRadius: "12px",
          marginTop: "20px",
          fontWeight: 500,
          display: "flex",
          alignItems: "center",
          gap: "10px",
        }}>
          ✓ {message}
        </p>
      )}
      
      {error && (
        <p style={{ 
          color: "#f45c43",
          background: "rgba(244, 92, 67, 0.1)",
          padding: "15px 30px",
          borderRadius: "12px",
          marginTop: "20px",
          fontWeight: 500,
        }}>
          ⚠️ {error}
        </p>
      )}
      
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default ForgotPassword;
