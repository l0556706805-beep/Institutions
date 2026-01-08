import React, { useContext, useEffect, useState } from "react";
import api from "../api/api";
import { CartContext, CartItem } from "../context/CartContext";
import { AuthContext } from "../context/AuthContext";
import { jwtDecode } from "jwt-decode";

interface DecodedToken {
  id: string;          // מזהה מספרי של המשתמש
  sub: string;         // המייל של המשתמש
  role: string;
  institutionId?: string;
  [key: string]: any;
}
interface ProductDto {
  id: number;
  name: string;
  price: number;
  imageUrl?: string;
  stockQuantity: number;
}

interface OrderItem {
  productId: number;
  quantity: number;
}

interface CreateOrderRequest {
  institutionId: number;
  userId: number;
  items: OrderItem[];
}

const Cart: React.FC = () => {
  const { cart, updateQuantity, removeFromCart, clearCart, totalPrice } =
    useContext(CartContext);
    const { token } = useContext(AuthContext);

  const [products, setProducts] = useState<ProductDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // שליפת פרטי מוצרים
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const productIds = cart.map((item) => item.id);
        const responses = await Promise.all(
          productIds.map((id) => api.get<ProductDto>(`/Products/${id}`))
        );
        setProducts(responses.map((res) => res.data));
      } catch (err) {
        setError("נכשלה טעינת פרטי המוצרים");
      }
    };

    if (cart.length > 0) fetchProducts();
  }, [cart]);

  const placeOrder = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!token) {
        setError("אנא התחבר כדי לבצע הזמנה");
        return;
      }

      // פענוח ה-JWT
      const decoded: DecodedToken = jwtDecode(token);

      // בדיקה שה-cart לא ריק
      if (cart.length === 0) {
        setError("העגלה ריקה");
        return;
      }

      const orderRequest: CreateOrderRequest = {
        userId: Number(decoded.id),
        institutionId: Number(decoded.institutionId),
        items: cart.map((item) => ({
          productId: item.id,
          quantity: item.quantity,
        })),
      };

      console.log("Sending order:", orderRequest);

      const res = await api.post("/order", orderRequest, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("Order response:", res.data);
      alert("ההזמנה נשלחה בהצלחה!");
      clearCart();
    } catch (err: any) {
      console.error("שגיאה בביצוע הזמנה:", err);

      if (err.response) {
        console.error("Response data:", err.response.data);
        console.error("Response status:", err.response.status);
        console.error("Response headers:", err.response.headers);
        setError(`נכשלה ביצוע ההזמנה: ${err.response.data?.message || err.response.status}`);
      } else {
        setError("נכשלה ביצוע ההזמנה: " + err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        padding: "40px 20px",
        direction: "rtl",
        textAlign: "right",
        fontFamily: "'Heebo', Arial, sans-serif",
        maxWidth: "700px",
        margin: "0 auto",
        minHeight: "calc(100vh - 150px)",
        background: "linear-gradient(135deg, rgba(102, 126, 234, 0.03) 0%, rgba(118, 75, 162, 0.03) 100%)",
      }}
    >
      <h2 style={{ 
        marginBottom: "35px",
        fontSize: "2.5rem",
        fontWeight: 700,
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        display: "flex",
        alignItems: "center",
        gap: "15px",
        animation: "fadeInUp 0.6s ease-out",
      }}>
        <span style={{ WebkitTextFillColor: "initial" }}>🛒</span>
        עגלת קניות
      </h2>

      {error && (
        <p style={{ 
          color: "#f45c43",
          background: "rgba(244, 92, 67, 0.1)",
          padding: "15px 25px",
          borderRadius: "12px",
          fontWeight: 500,
          marginBottom: "20px",
        }}>{error}</p>
      )}

      {cart.length === 0 ? (
        <div style={{
          textAlign: "center",
          padding: "60px 20px",
          background: "white",
          borderRadius: "24px",
          boxShadow: "0 8px 30px rgba(102, 126, 234, 0.1)",
          animation: "fadeInUp 0.6s ease-out",
        }}>
          <span style={{ fontSize: "4rem", display: "block", marginBottom: "20px" }}>🛒</span>
          <p style={{ fontSize: "1.3rem", color: "#4a5568", margin: 0 }}>העגלה ריקה</p>
          <p style={{ fontSize: "1rem", color: "#718096", marginTop: "10px" }}>הוסיפו מוצרים כדי להמשיך</p>
        </div>
      ) : (
        <div style={{ animation: "fadeInUp 0.6s ease-out" }}>
          <ul style={{ padding: 0, listStyle: "none", margin: 0 }}>
            {cart.map((item: CartItem, index: number) => {
              const product = products.find((p) => p.id === item.id);
              return product ? (
                <li
                  key={product.id}
                  style={{
                    marginBottom: "18px",
                    display: "flex",
                    alignItems: "center",
                    background: "white",
                    padding: "20px",
                    borderRadius: "20px",
                    boxShadow: "0 8px 30px rgba(102, 126, 234, 0.1)",
                    transition: "all 0.3s ease",
                    border: "1px solid rgba(102, 126, 234, 0.08)",
                    animationDelay: `${index * 0.1}s`,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-5px)";
                    e.currentTarget.style.boxShadow = "0 15px 40px rgba(102, 126, 234, 0.15)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "0 8px 30px rgba(102, 126, 234, 0.1)";
                  }}
                >
                  {product.imageUrl && (
                    <div style={{
                      width: "80px",
                      height: "80px",
                      marginLeft: "20px",
                      borderRadius: "14px",
                      overflow: "hidden",
                      boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
                    }}>
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                    </div>
                  )}

                  <div style={{ flexGrow: 1 }}>
                    <strong style={{ 
                      fontSize: "1.1rem", 
                      color: "#2d3748",
                      display: "block",
                      marginBottom: "8px",
                    }}>{product.name}</strong>
                    <span style={{
                      background: "rgba(102, 126, 234, 0.1)",
                      padding: "5px 12px",
                      borderRadius: "20px",
                      fontSize: "0.9rem",
                      color: "#667eea",
                      fontWeight: 600,
                    }}>
                      ₪{product.price.toFixed(2)} × {item.quantity}
                    </span>
                  </div>

                  <div style={{ display: "flex", gap: "8px" }}>
                    <button
                      onClick={() => updateQuantity(item.id, 1)}
                      style={{ 
                        padding: "10px 16px",
                        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                        color: "white",
                        border: "none",
                        borderRadius: "10px",
                        cursor: "pointer",
                        fontSize: "1rem",
                        fontWeight: 700,
                        transition: "all 0.2s ease",
                        boxShadow: "0 4px 12px rgba(102, 126, 234, 0.3)",
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.1)"}
                      onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
                    >
                      +
                    </button>

                    <button
                      onClick={() => updateQuantity(item.id, -1)}
                      disabled={item.quantity <= 1}
                      style={{ 
                        padding: "10px 16px",
                        background: item.quantity <= 1 
                          ? "linear-gradient(135deg, #a0aec0 0%, #718096 100%)"
                          : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                        color: "white",
                        border: "none",
                        borderRadius: "10px",
                        cursor: item.quantity <= 1 ? "not-allowed" : "pointer",
                        fontSize: "1rem",
                        fontWeight: 700,
                        transition: "all 0.2s ease",
                        opacity: item.quantity <= 1 ? 0.6 : 1,
                      }}
                    >
                      −
                    </button>

                    <button
                      onClick={() => removeFromCart(item.id)}
                      style={{
                        background: "linear-gradient(135deg, #eb3349 0%, #f45c43 100%)",
                        color: "white",
                        padding: "10px 18px",
                        border: "none",
                        borderRadius: "10px",
                        cursor: "pointer",
                        fontSize: "0.9rem",
                        fontWeight: 600,
                        transition: "all 0.2s ease",
                        boxShadow: "0 4px 12px rgba(235, 51, 73, 0.3)",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = "scale(1.05)";
                        e.currentTarget.style.boxShadow = "0 8px 20px rgba(235, 51, 73, 0.4)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = "scale(1)";
                        e.currentTarget.style.boxShadow = "0 4px 12px rgba(235, 51, 73, 0.3)";
                      }}
                    >
                      🗑️ הסר
                    </button>
                  </div>
                </li>
              ) : null;
            })}
          </ul>

          <div style={{
            background: "white",
            padding: "25px",
            borderRadius: "20px",
            marginTop: "25px",
            boxShadow: "0 8px 30px rgba(102, 126, 234, 0.1)",
          }}>
            <p style={{ 
              fontSize: "1.5rem", 
              margin: "0 0 20px 0",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}>
              <span style={{ color: "#4a5568" }}>💰 סה״כ לתשלום:</span>
              <strong style={{
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                fontSize: "2rem",
              }}>₪{totalPrice.toFixed(2)}</strong>
            </p>

            <button
              onClick={placeOrder}
              disabled={loading}
              style={{
                width: "100%",
                padding: "18px",
                fontSize: "1.2rem",
                fontWeight: 700,
                fontFamily: "'Heebo', sans-serif",
                background: loading 
                  ? "linear-gradient(135deg, #a0aec0 0%, #718096 100%)"
                  : "linear-gradient(135deg, #11998e 0%, #38ef7d 100%)",
                color: "white",
                border: "none",
                borderRadius: "16px",
                cursor: loading ? "not-allowed" : "pointer",
                transition: "all 0.3s ease",
                boxShadow: loading ? "none" : "0 8px 25px rgba(56, 239, 125, 0.4)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "10px",
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.currentTarget.style.transform = "translateY(-3px)";
                  e.currentTarget.style.boxShadow = "0 12px 35px rgba(56, 239, 125, 0.5)";
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 8px 25px rgba(56, 239, 125, 0.4)";
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
                  שולח הזמנה...
                </>
              ) : (
                <>
                  ✓ בצע הזמנה
                </>
              )}
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default Cart;
