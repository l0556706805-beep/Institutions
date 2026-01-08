import React, { useContext, useEffect, useState } from "react";
import api from "../api/api";
import { useNavigate, useLocation } from "react-router-dom";
import { CartContext } from "../context/CartContext";

// --------------------------------------
// INTERFACES
// --------------------------------------
interface Product {
  id: number;
  name: string;
  price: number;
  categoryId: number;
  categoryName: string;
  stock: number;
  imageUrl?: string;
}

interface Category {
  id: number;
  name: string;
}

interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
}

// --------------------------------------
// COMPONENT
// --------------------------------------
const Products = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { cart, addToCart, removeFromCart, updateQuantity, clearCart, totalPrice } =
    useContext(CartContext);

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<number | "">("");
  const [showInStock, setShowInStock] = useState(false);

  // --------------------------------------
  // LOAD DATA
  // --------------------------------------
  useEffect(() => {
    loadProducts();
    api.get("/Categories").then((res) => setCategories(res.data));
  }, []);

  const loadProducts = async () => {
    const res = await api.get("/Products");
    setProducts(res.data);
  };

  // --------------------------------------
  // LOAD PREVIOUS ORDER INTO CART
  // --------------------------------------
  useEffect(() => {
    if (location.state?.orderItems) {
      location.state.orderItems.forEach((item: CartItem) => {
        addToCart(item);
      });
    }
  }, [location.state, addToCart]);

  // --------------------------------------
  // FILTER + SEARCH
  // --------------------------------------
  const filteredProducts = products
    .filter((p) => {
      const matchesSearch = p.name.toLowerCase().includes(searchTerm.trim().toLowerCase());
      const matchesCategory = categoryFilter === "" ? true : p.categoryId === categoryFilter;
      const matchesStock = showInStock ? p.stock > 0 : true;
      return matchesSearch && matchesCategory && matchesStock;
    });

  const getQuantityInCart = (productId: number) => {
    const item = cart.find((c) => c.id === productId);
    return item ? item.quantity : 0;
  };

  // --------------------------------------
  // STYLES
  // --------------------------------------
  const containerStyle: React.CSSProperties = {
    display: "flex",
    gap: 25,
    padding: 30,
    flexDirection: "row-reverse",
    background: "linear-gradient(135deg, rgba(102, 126, 234, 0.03) 0%, rgba(118, 75, 162, 0.03) 100%)",
    minHeight: "100vh",
    fontFamily: "'Heebo', Arial, sans-serif",
    alignItems: "flex-start",
  };

  const productsGridStyle: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
    gap: 25,
    flex: 1,
    animation: "fadeInUp 0.6s ease-out",
  };

  const cardStyle: React.CSSProperties = {
    background: "linear-gradient(145deg, #ffffff 0%, #f8faff 100%)",
    borderRadius: 20,
    padding: 20,
    boxShadow: "0 8px 30px rgba(102, 126, 234, 0.12)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    cursor: "pointer",
    transition: "all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
    position: "relative",
    border: "1px solid rgba(102, 126, 234, 0.08)",
    overflow: "hidden",
  };

  const cardOutOfStockStyle: React.CSSProperties = {
    opacity: 0.6,
    filter: "grayscale(60%)",
    cursor: "not-allowed",
    pointerEvents: "none",
  };

  const overlayStyle: React.CSSProperties = {
    position: "absolute",
    top: 15,
    right: 15,
    background: "linear-gradient(135deg, #eb3349 0%, #f45c43 100%)",
    color: "white",
    padding: "6px 14px",
    borderRadius: 20,
    fontSize: 12,
    fontWeight: 600,
    boxShadow: "0 4px 15px rgba(235, 51, 73, 0.3)",
    zIndex: 10,
  };

  const buttonStyle: React.CSSProperties = {
    padding: "10px 20px",
    margin: "6px 0",
    border: "none",
    borderRadius: 12,
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "#fff",
    cursor: "pointer",
    transition: "all 0.3s ease",
    fontSize: 13,
    fontWeight: 600,
    boxShadow: "0 4px 15px rgba(102, 126, 234, 0.3)",
  };

  const disabledButtonStyle: React.CSSProperties = {
    ...buttonStyle,
    background: "linear-gradient(135deg, #a0aec0 0%, #718096 100%)",
    cursor: "not-allowed",
    boxShadow: "none",
  };

  const cartStyle: React.CSSProperties = {
    minWidth: 280,
    maxWidth: 320,
    maxHeight: "calc(100vh - 180px)",
    padding: 25,
    borderRadius: 24,
    background: "linear-gradient(145deg, #667eea 0%, #764ba2 100%)",
    position: "sticky",
    top: 100,
    overflowY: "auto",
    boxShadow: "0 20px 60px rgba(102, 126, 234, 0.35)",
    animation: "fadeInLeft 0.6s ease-out",
  };

  const cartItemStyle: React.CSSProperties = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    padding: 12,
    borderRadius: 12,
    background: "rgba(255, 255, 255, 0.15)",
    backdropFilter: "blur(10px)",
    fontSize: 13,
    color: "white",
    border: "1px solid rgba(255, 255, 255, 0.1)",
  };

  const smallButtonStyle: React.CSSProperties = {
    padding: "6px 10px",
    fontSize: 12,
    marginLeft: 4,
    border: "none",
    borderRadius: 8,
    background: "rgba(255, 255, 255, 0.2)",
    color: "white",
    cursor: "pointer",
    transition: "all 0.2s ease",
    fontWeight: 600,
  };

  // --------------------------------------
  // UI
  // --------------------------------------
  return (
    <div style={{ paddingTop: 20 }}>
      {/* TOP BAR */}
      <div
        style={{
          marginBottom: 25,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "20px 30px",
          gap: 15,
          background: "white",
          borderRadius: 20,
          margin: "0 30px 25px 30px",
          boxShadow: "0 8px 30px rgba(102, 126, 234, 0.1)",
          flexWrap: "wrap",
        }}
      >
        <div style={{ position: "relative" }}>
          <span style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", fontSize: 18 }}>🔍</span>
          <input
            type="text"
            placeholder="חיפוש מוצר..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              padding: "14px 45px 14px 20px",
              borderRadius: 14,
              border: "2px solid #e2e8f0",
              width: 250,
              fontSize: 14,
              transition: "all 0.3s ease",
              fontFamily: "'Heebo', sans-serif",
            }}
          />
        </div>

        <select
          value={categoryFilter}
          onChange={(e) =>
            setCategoryFilter(e.target.value === "" ? "" : Number(e.target.value))
          }
          style={{
            padding: "14px 20px",
            borderRadius: 14,
            border: "2px solid #e2e8f0",
            minWidth: 200,
            fontSize: 14,
            cursor: "pointer",
            fontFamily: "'Heebo', sans-serif",
            background: "white",
            transition: "all 0.3s ease",
          }}
        >
          <option value="">📂 כל הקטגוריות</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>

        <button
          onClick={() => setShowInStock((prev) => !prev)}
          style={{ 
            padding: "14px 24px",
            borderRadius: 14,
            border: "none",
            fontSize: 14,
            fontWeight: 600,
            cursor: "pointer",
            transition: "all 0.3s ease",
            fontFamily: "'Heebo', sans-serif",
            background: showInStock 
              ? "linear-gradient(135deg, #11998e 0%, #38ef7d 100%)" 
              : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            color: "white",
            boxShadow: showInStock 
              ? "0 4px 15px rgba(56, 239, 125, 0.3)"
              : "0 4px 15px rgba(102, 126, 234, 0.3)",
          }}
        >
          {showInStock ? "✓ הצג הכל" : "📦 הצג רק במלאי"}
        </button>
      </div>

      {/* PRODUCTS + CART */}
      <div style={containerStyle}>
        <div style={productsGridStyle}>
          {filteredProducts.map((p, index) => {
            const isOutOfStock = p.stock === 0;

            return (
              <div
                key={p.id}
                style={{
                  ...cardStyle,
                  ...(isOutOfStock ? cardOutOfStockStyle : {}),
                  animationDelay: `${index * 0.05}s`,
                }}
                onMouseEnter={(e) => {
                  if (!isOutOfStock) {
                    e.currentTarget.style.transform = "translateY(-10px) scale(1.02)";
                    e.currentTarget.style.boxShadow = "0 20px 50px rgba(102, 126, 234, 0.25)";
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0) scale(1)";
                  e.currentTarget.style.boxShadow = "0 8px 30px rgba(102, 126, 234, 0.12)";
                }}
              >
                {/* גרדיינט דקורטיבי */}
                <div style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  height: 4,
                  background: "linear-gradient(90deg, #667eea, #764ba2, #f093fb)",
                  borderRadius: "20px 20px 0 0",
                }}></div>

                {isOutOfStock && <div style={overlayStyle}>😢 אזל מהמלאי</div>}

                {p.imageUrl && (
                  <div style={{
                    width: "100%",
                    height: 140,
                    borderRadius: 14,
                    overflow: "hidden",
                    marginBottom: 15,
                    boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
                  }}>
                    <img
                      src={p.imageUrl}
                      alt={p.name}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        transition: "transform 0.5s ease",
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.1)"}
                      onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
                    />
                  </div>
                )}

                <h4 style={{ 
                  margin: "8px 0", 
                  fontSize: 16, 
                  fontWeight: 700,
                  color: "#2d3748",
                }}>{p.name}</h4>
                <p style={{ 
                  margin: 0, 
                  fontSize: 13, 
                  color: "#667eea",
                  fontWeight: 500,
                  background: "rgba(102, 126, 234, 0.1)",
                  padding: "4px 12px",
                  borderRadius: 20,
                }}>{p.categoryName}</p>
                <p style={{ 
                  margin: "12px 0", 
                  fontWeight: 800, 
                  fontSize: 22,
                  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}>{p.price} ₪</p>

                <button
                  style={isOutOfStock ? disabledButtonStyle : buttonStyle}
                  disabled={isOutOfStock}
                  onClick={() =>
                    addToCart({ id: p.id, name: p.name, price: p.price, quantity: 1 })
                  }
                  onMouseEnter={(e) => {
                    if (!isOutOfStock) {
                      e.currentTarget.style.transform = "scale(1.05)";
                      e.currentTarget.style.boxShadow = "0 8px 25px rgba(102, 126, 234, 0.4)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "scale(1)";
                    e.currentTarget.style.boxShadow = "0 4px 15px rgba(102, 126, 234, 0.3)";
                  }}
                >
                  {isOutOfStock ? "לא זמין" : "🛒 הוספה לעגלה"}
                </button>

                {!isOutOfStock && getQuantityInCart(p.id) > 0 && (
                  <p style={{ 
                    marginTop: 8, 
                    fontSize: 13,
                    background: "linear-gradient(135deg, #11998e 0%, #38ef7d 100%)",
                    color: "white",
                    padding: "6px 14px",
                    borderRadius: 20,
                    fontWeight: 600,
                  }}>
                    ✓ בעגלה: {getQuantityInCart(p.id)}
                  </p>
                )}
              </div>
            );
          })}
        </div>

        {/* CART */}
        <div style={cartStyle}>
          <h3 style={{ 
            fontSize: 20, 
            color: "white", 
            marginBottom: 20,
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}>
            <span style={{ fontSize: 24 }}>🛒</span>
            הזמנה נוכחית
          </h3>

          {cart.length > 0 ? (
            <>
              <ul style={{ paddingLeft: 0, listStyle: "none", margin: 0 }}>
                {cart.map((c: CartItem) => (
                  <li key={c.id} style={cartItemStyle}>
                    <span style={{ fontWeight: 500 }}>
                      {c.name}
                      <br />
                      <span style={{ opacity: 0.8, fontSize: 12 }}>
                        {c.price} ₪ × {c.quantity}
                      </span>
                    </span>

                    <span style={{ display: "flex", gap: 4 }}>
                      <button 
                        style={smallButtonStyle} 
                        onClick={() => updateQuantity(c.id, -1)}
                        onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.35)"}
                        onMouseLeave={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.2)"}
                      >
                        −
                      </button>
                      <button 
                        style={smallButtonStyle} 
                        onClick={() => updateQuantity(c.id, 1)}
                        onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.35)"}
                        onMouseLeave={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.2)"}
                      >
                        +
                      </button>
                      <button
                        style={{ ...smallButtonStyle, background: "rgba(235, 51, 73, 0.8)" }}
                        onClick={() => removeFromCart(c.id)}
                        onMouseEnter={(e) => e.currentTarget.style.background = "rgba(235, 51, 73, 1)"}
                        onMouseLeave={(e) => e.currentTarget.style.background = "rgba(235, 51, 73, 0.8)"}
                      >
                        ✕
                      </button>
                    </span>
                  </li>
                ))}
              </ul>

              <div style={{
                background: "rgba(255, 255, 255, 0.2)",
                padding: 15,
                borderRadius: 14,
                marginTop: 15,
                marginBottom: 15,
              }}>
                <p style={{ fontSize: 18, color: "white", margin: 0, fontWeight: 700 }}>
                  💰 סה״כ: {totalPrice} ₪
                </p>
              </div>

              <button 
                style={{
                  width: "100%",
                  padding: "14px 20px",
                  borderRadius: 14,
                  border: "none",
                  background: "white",
                  color: "#667eea",
                  fontSize: 15,
                  fontWeight: 700,
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                  boxShadow: "0 4px 15px rgba(0,0,0,0.2)",
                }} 
                onClick={() => navigate("/cart")}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow = "0 8px 25px rgba(0,0,0,0.3)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 4px 15px rgba(0,0,0,0.2)";
                }}
              >
                ✓ סיום הזמנה
              </button>

              <button
                style={{
                  width: "100%",
                  padding: "12px 20px",
                  borderRadius: 14,
                  border: "2px solid rgba(255,255,255,0.3)",
                  background: "transparent",
                  color: "white",
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                  marginTop: 10,
                }}
                onClick={clearCart}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(235, 51, 73, 0.8)";
                  e.currentTarget.style.borderColor = "transparent";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.3)";
                }}
              >
                🗑️ רוקן עגלה
              </button>
            </>
          ) : (
            <div style={{
              textAlign: "center",
              color: "rgba(255,255,255,0.8)",
              padding: 30,
            }}>
              <span style={{ fontSize: 48, display: "block", marginBottom: 15 }}>🛒</span>
              <p style={{ margin: 0 }}>העגלה ריקה</p>
              <p style={{ margin: "10px 0 0 0", fontSize: 13, opacity: 0.7 }}>
                הוסיפו מוצרים להזמנה
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Products;
