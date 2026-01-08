import React, { useContext, useState } from "react";
import { AuthContext } from "./context/AuthContext";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { CartContext } from "./context/CartContext";

export const Navbar = () => {
  const { token, logout, isAdmin } = useContext(AuthContext);
  const { cart } = useContext(CartContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav style={styles.navbar}>
      {/* רקע אנימטיבי */}
      <div style={styles.navbarBg}></div>
      
      {/* לוגו */}
      <div style={styles.logoSection}>
        <span style={styles.logoIcon}>🎓</span>
        <h1 style={styles.title}>מערכת הזמנות</h1>
      </div>

      {/* כפתור המבורגר למובייל */}
      <button 
        style={styles.hamburger}
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
      >
        <span style={{...styles.hamburgerLine, ...(mobileMenuOpen ? styles.hamburgerLineOpen1 : {})}}></span>
        <span style={{...styles.hamburgerLine, ...(mobileMenuOpen ? styles.hamburgerLineOpen2 : {})}}></span>
        <span style={{...styles.hamburgerLine, ...(mobileMenuOpen ? styles.hamburgerLineOpen3 : {})}}></span>
      </button>

      {/* קישורי ניווט */}
      <div style={{...styles.links, ...(mobileMenuOpen ? styles.linksOpen : {})}}>
        <Link 
          style={{...styles.link, ...(isActive('/products') ? styles.linkActive : {})}} 
          to="/products"
          onClick={() => setMobileMenuOpen(false)}
        >
          <span style={styles.linkIcon}>🛍️</span>
          מוצרים
        </Link>
        
        {token && (
          <Link 
            style={{...styles.link, ...styles.cartLink, ...(isActive('/cart') ? styles.linkActive : {})}} 
            to="/cart"
            onClick={() => setMobileMenuOpen(false)}
          >
            <span style={styles.linkIcon}>🛒</span>
            עגלה
            {totalItems > 0 && <span style={styles.cartBadge}>{totalItems}</span>}
          </Link>
        )}
        
        {token && (
          <Link 
            style={{...styles.link, ...(isActive('/MyOrders') ? styles.linkActive : {})}} 
            to="/MyOrders"
            onClick={() => setMobileMenuOpen(false)}
          >
            <span style={styles.linkIcon}>📋</span>
            ההזמנות שלי
          </Link>
        )}
        
        {token && isAdmin() && (
          <>
            <div style={styles.divider}></div>
            <span style={styles.adminLabel}>ניהול</span>
            <Link 
              style={{...styles.link, ...styles.adminLink, ...(isActive('/orders') ? styles.linkActive : {})}} 
              to="/orders"
              onClick={() => setMobileMenuOpen(false)}
            >
              <span style={styles.linkIcon}>📦</span>
              הזמנות
            </Link>
            <Link 
              style={{...styles.link, ...styles.adminLink, ...(isActive('/institutions') ? styles.linkActive : {})}} 
              to="/institutions"
              onClick={() => setMobileMenuOpen(false)}
            >
              <span style={styles.linkIcon}>🏫</span>
              מוסדות
            </Link>
            <Link 
              style={{...styles.link, ...styles.adminLink, ...(isActive('/categories') ? styles.linkActive : {})}} 
              to="/categories"
              onClick={() => setMobileMenuOpen(false)}
            >
              <span style={styles.linkIcon}>📂</span>
              קטגוריות
            </Link>
            <Link 
              style={{...styles.link, ...styles.adminLink, ...(isActive('/AdminProductsManager') ? styles.linkActive : {})}} 
              to="/AdminProductsManager"
              onClick={() => setMobileMenuOpen(false)}
            >
              <span style={styles.linkIcon}>⚙️</span>
              ניהול מוצרים
            </Link>
          </>
        )}
      </div>

      {/* כפתורי פעולה */}
      <div style={styles.buttons}>
        {token ? (
          <button style={styles.logoutButton} onClick={handleLogout}>
            <span style={styles.buttonIcon}>🚪</span>
            התנתקות
          </button>
        ) : (
          <button style={styles.loginButton} onClick={() => navigate("/login")}>
            <span style={styles.buttonIcon}>🔑</span>
            התחברות
          </button>
        )}
      </div>
    </nav>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  navbar: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "15px 30px",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    boxShadow: "0 4px 30px rgba(102, 126, 234, 0.3)",
    position: "sticky",
    top: 0,
    zIndex: 1000,
    flexWrap: "wrap",
    gap: "15px",
  },
  navbarBg: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
    opacity: 0.5,
    pointerEvents: "none",
  },
  logoSection: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    zIndex: 1,
  },
  logoIcon: {
    fontSize: "2rem",
    animation: "float 3s ease-in-out infinite",
  },
  title: {
    margin: 0,
    fontSize: "1.6rem",
    fontWeight: 700,
    color: "#fff",
    textShadow: "0 2px 10px rgba(0,0,0,0.2)",
    letterSpacing: "0.5px",
  },
  hamburger: {
    display: "none",
    flexDirection: "column",
    gap: "5px",
    background: "transparent",
    border: "none",
    cursor: "pointer",
    padding: "10px",
    zIndex: 1,
  },
  hamburgerLine: {
    width: "25px",
    height: "3px",
    background: "white",
    borderRadius: "3px",
    transition: "all 0.3s ease",
  },
  hamburgerLineOpen1: {
    transform: "rotate(45deg) translate(5px, 5px)",
  },
  hamburgerLineOpen2: {
    opacity: 0,
  },
  hamburgerLineOpen3: {
    transform: "rotate(-45deg) translate(7px, -6px)",
  },
  links: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    flexWrap: "wrap",
    justifyContent: "center",
    zIndex: 1,
  },
  linksOpen: {},
  link: {
    textDecoration: "none",
    color: "rgba(255,255,255,0.9)",
    fontWeight: 500,
    padding: "10px 18px",
    borderRadius: "12px",
    transition: "all 0.3s ease",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "0.95rem",
    background: "rgba(255,255,255,0.1)",
    backdropFilter: "blur(10px)",
    border: "1px solid rgba(255,255,255,0.1)",
  },
  linkActive: {
    background: "rgba(255,255,255,0.25)",
    boxShadow: "0 4px 15px rgba(0,0,0,0.2)",
    color: "#fff",
  },
  linkIcon: {
    fontSize: "1.1rem",
  },
  cartLink: {
    position: "relative",
  },
  cartBadge: {
    position: "absolute",
    top: "-5px",
    left: "-5px",
    background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
    color: "white",
    fontSize: "0.75rem",
    fontWeight: 700,
    padding: "3px 8px",
    borderRadius: "20px",
    minWidth: "22px",
    textAlign: "center",
    boxShadow: "0 3px 10px rgba(240, 147, 251, 0.5)",
    animation: "pulse 2s infinite",
  },
  divider: {
    width: "2px",
    height: "30px",
    background: "rgba(255,255,255,0.3)",
    margin: "0 10px",
    borderRadius: "2px",
  },
  adminLabel: {
    color: "rgba(255,255,255,0.6)",
    fontSize: "0.75rem",
    fontWeight: 600,
    textTransform: "uppercase",
    letterSpacing: "1px",
    marginRight: "5px",
  },
  adminLink: {
    background: "rgba(240, 147, 251, 0.2)",
    borderColor: "rgba(240, 147, 251, 0.3)",
  },
  buttons: {
    display: "flex",
    gap: "10px",
    zIndex: 1,
  },
  loginButton: {
    padding: "12px 24px",
    fontSize: "1rem",
    fontWeight: 600,
    background: "rgba(255,255,255,0.95)",
    color: "#667eea",
    border: "none",
    borderRadius: "12px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    transition: "all 0.3s ease",
    boxShadow: "0 4px 15px rgba(0,0,0,0.2)",
  },
  logoutButton: {
    padding: "12px 24px",
    fontSize: "1rem",
    fontWeight: 600,
    background: "linear-gradient(135deg, #eb3349 0%, #f45c43 100%)",
    color: "#fff",
    border: "none",
    borderRadius: "12px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    transition: "all 0.3s ease",
    boxShadow: "0 4px 15px rgba(235, 51, 73, 0.4)",
  },
  buttonIcon: {
    fontSize: "1.1rem",
  },
};

// הוספת סגנונות CSS דינמיים
const styleSheet = document.createElement("style");
styleSheet.textContent = `
  @keyframes float {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-5px); }
  }
  
  @keyframes pulse {
    0%, 100% { box-shadow: 0 0 0 0 rgba(240, 147, 251, 0.4); }
    50% { box-shadow: 0 0 0 10px rgba(240, 147, 251, 0); }
  }
  
  nav a:hover {
    background: rgba(255,255,255,0.25) !important;
    transform: translateY(-2px);
    box-shadow: 0 4px 15px rgba(0,0,0,0.2);
  }
  
  nav button:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0,0,0,0.3) !important;
  }
  
  @media (max-width: 900px) {
    nav {
      flex-direction: column;
      padding: 15px !important;
    }
    
    nav > div:nth-child(3) {
      width: 100%;
      justify-content: center;
    }
  }
`;
document.head.appendChild(styleSheet);
