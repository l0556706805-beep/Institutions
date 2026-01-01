import React, { useContext } from "react";
import { AuthContext } from "./context/AuthContext";
import { useNavigate, Link } from "react-router-dom";

export const Navbar = () => {
  const { token, logout, isAdmin } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav style={styles.navbar}>
      <h1 style={styles.title}>מערכת הזמנות</h1>

      <div style={styles.buttons}>
        {token ? (
          <button style={styles.button} onClick={handleLogout}>
            התנתקות
          </button>
        ) : (
          <button style={styles.button} onClick={() => navigate("/login")}>
            התחברות
          </button>
        )}
      </div>

      <div style={styles.links}>
        <Link style={styles.link} to="/products">מוצרים</Link>
        {token && isAdmin() && <Link style={styles.link} to="/orders">הזמנות</Link>}
        {token && isAdmin() && <Link style={styles.link} to="/institutions">מוסדות</Link>}
        {token && isAdmin() && <Link style={styles.link} to="/categories">קטגוריות</Link>}
        {token && <Link style={styles.link} to="/MyOrders">ההזמנות שלי</Link>}
        {token && isAdmin() && <Link style={styles.link} to="/AdminProductsManager">ניהול מוצרים</Link>}
      </div>
    </nav>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  navbar: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "15px 20px",
    backgroundColor: "#f5f5f5",
    boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
    gap: "10px",
  },
  title: {
    margin: 0,
    fontSize: "1.8rem",
    color: "#333",
  },
  buttons: {
    display: "flex",
    gap: "10px",
  },
  button: {
    padding: "8px 16px",
    fontSize: "1rem",
    backgroundColor: "#4CAF50",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },
  links: {
    display: "flex",
    gap: "15px",
    flexWrap: "wrap",
    justifyContent: "center",
    marginTop: "10px",
  },
  link: {
    textDecoration: "none",
    color: "#333",
    fontWeight: 500,
    padding: "5px 10px",
    transition: "all 0.2s ease",
  },
};

// כדי להוסיף hover effect (optional):
// ניתן להוסיף ב־CSS נפרד או עם styled-components
