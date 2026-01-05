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
    gap: 15,
    padding: 20,
    flexDirection: "row-reverse",
    backgroundColor: "#f0f4f8",
    minHeight: "100vh",
    fontFamily: "Arial, sans-serif",
    alignItems: "flex-start",
  };

  const productsGridStyle: React.CSSProperties = {
    display: "flex",
    flexWrap: "wrap",
    gap: 15,
    flex: 1,
  };

  const cardStyle: React.CSSProperties = {
    backgroundColor: "#e3f2fd",
    borderRadius: 10,
    padding: 10,
    width: 180,
    boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    cursor: "pointer",
    transition: "all 0.3s ease",
    position: "relative",
  };

  const cardOutOfStockStyle: React.CSSProperties = {
    opacity: 0.5,
    filter: "grayscale(80%)",
    cursor: "not-allowed",
    pointerEvents: "none",
  };

  const overlayStyle: React.CSSProperties = {
    position: "absolute",
    top: 5,
    right: 5,
    background: "rgba(0,0,0,0.7)",
    color: "white",
    padding: "3px 8px",
    borderRadius: 6,
    fontSize: 12,
  };

  const buttonStyle: React.CSSProperties = {
    padding: "6px 12px",
    margin: "4px 0",
    border: "none",
    borderRadius: "4px",
    backgroundColor: "#4a90e2",
    color: "#fff",
    cursor: "pointer",
    transition: "all 0.2s",
    fontSize: 12,
  };

  const disabledButtonStyle: React.CSSProperties = {
    ...buttonStyle,
    backgroundColor: "#a0a0a0",
    cursor: "not-allowed",
  };

  const cartStyle: React.CSSProperties = {
    minWidth: 220,
    maxHeight: "80vh",
    padding: 10,
    borderRadius: 10,
    backgroundColor: "#bbdefb",
    position: "sticky",
    top: 20,
    overflowY: "auto",
  };

  const cartItemStyle: React.CSSProperties = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
    padding: 4,
    borderRadius: 6,
    backgroundColor: "#e3f2fd",
    fontSize: 12,
  };

  const smallButtonStyle: React.CSSProperties = {
    ...buttonStyle,
    padding: "2px 6px",
    fontSize: 10,
    marginLeft: 2,
  };

  // --------------------------------------
  // UI
  // --------------------------------------
  return (
    <div>
      {/* TOP BAR */}
      <div
        style={{
          marginBottom: 15,
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-end",
          padding: "0 20px",
          gap: 10,
        }}
      >
        <input
          type="text"
          placeholder="חיפוש מוצר..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            padding: "8px",
            borderRadius: "6px",
            border: "1px solid #ccc",
            width: "200px",
          }}
        />

        <select
          value={categoryFilter}
          onChange={(e) =>
            setCategoryFilter(e.target.value === "" ? "" : Number(e.target.value))
          }
          style={{
            padding: "8px",
            borderRadius: "6px",
            border: "1px solid #ccc",
            minWidth: "180px",
          }}
        >
          <option value="">כל הקטגוריות</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>

        <button
          onClick={() => setShowInStock((prev) => !prev)}
          style={{ ...buttonStyle, backgroundColor: showInStock ? "#2ecc71" : "#4a90e2" }}
        >
          {showInStock ? "הצג הכל" : "הצג רק מוצרים קיימים במלאי"}
        </button>
      </div>

      {/* PRODUCTS + CART */}
      <div style={containerStyle}>
        <div style={productsGridStyle}>
          {filteredProducts.map((p) => {
            const isOutOfStock = p.stock === 0;

            return (
              <div
                key={p.id}
                style={{
                  ...cardStyle,
                  ...(isOutOfStock ? cardOutOfStockStyle : {}),
                }}
                onMouseEnter={(e) => {
                  if (!isOutOfStock) {
                    e.currentTarget.style.backgroundColor = "#d0e7fb";
                    e.currentTarget.style.transform = "scale(1.05)";
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "#e3f2fd";
                  e.currentTarget.style.transform = "scale(1)";
                }}
              >
                {isOutOfStock && <div style={overlayStyle}>אזל מהמלאי</div>}

                {p.imageUrl && (
                  <img
                    src={p.imageUrl}
                    alt={p.name}
                    style={{
                      width: "100%",
                      height: 100,
                      objectFit: "cover",
                      borderRadius: 6,
                    }}
                  />
                )}

                <h4 style={{ margin: "8px 0 4px 0", fontSize: 14 }}>{p.name}</h4>
                <p style={{ margin: 0, fontSize: 12, color: "#555" }}>{p.categoryName}</p>
                <p style={{ margin: 4, fontWeight: 600, fontSize: 14 }}>{p.price} ₪</p>

                <button
                  style={isOutOfStock ? disabledButtonStyle : buttonStyle}
                  disabled={isOutOfStock}
                  onClick={() =>
                    addToCart({ id: p.id, name: p.name, price: p.price, quantity: 1 })
                  }
                >
                  {isOutOfStock ? "לא זמין" : "הוספה לעגלה"}
                </button>

                {!isOutOfStock && getQuantityInCart(p.id) > 0 && (
                  <p style={{ marginTop: 4, fontSize: 12 }}>
                    כמות בעגלה: {getQuantityInCart(p.id)}
                  </p>
                )}
              </div>
            );
          })}
        </div>

        {/* CART */}
        <div style={cartStyle}>
          <h3 style={{ fontSize: 16 }}>הזמנה נוכחית</h3>

          {cart.length > 0 ? (
            <>
              <ul style={{ paddingLeft: 0 }}>
                {cart.map((c: CartItem) => (
                  <li key={c.id} style={cartItemStyle}>
                    <span>
                      {c.name} - {c.price} ₪ × {c.quantity}
                    </span>

                    <span>
                      <button style={smallButtonStyle} onClick={() => updateQuantity(c.id, -1)}>
                        -
                      </button>
                      <button style={smallButtonStyle} onClick={() => updateQuantity(c.id, 1)}>
                        +
                      </button>
                      <button
                        style={{ ...smallButtonStyle, backgroundColor: "#e74c3c" }}
                        onClick={() => removeFromCart(c.id)}
                      >
                        הסר
                      </button>
                    </span>
                  </li>
                ))}
              </ul>

              <p style={{ fontSize: 14 }}>
                <strong>סה״כ לתשלום: {totalPrice} ₪</strong>
              </p>

              <button style={buttonStyle} onClick={() => navigate("/cart")}>
                סיום הזמנה
              </button>

              <button
                style={{ ...buttonStyle, backgroundColor: "#e74c3c", marginTop: 5 }}
                onClick={clearCart}
              >
                רוקן עגלה
              </button>
            </>
          ) : (
            <p style={{ fontSize: 12 }}>לא נבחרו מוצרים</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Products;
