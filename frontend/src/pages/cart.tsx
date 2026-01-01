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

      const res = await api.post("/Order", orderRequest, {
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
        padding: "20px",
        direction: "rtl",
        textAlign: "right",
        fontFamily: "Arial",
        maxWidth: "600px",
        margin: "0 auto",
      }}
    >
      <h2 style={{ marginBottom: "20px" }}>עגלת קניות</h2>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {cart.length === 0 ? (
        <p>העגלה ריקה</p>
      ) : (
        <div>
          <ul style={{ padding: 0, listStyle: "none" }}>
            {cart.map((item: CartItem) => {
              const product = products.find((p) => p.id === item.id);
              return product ? (
                <li
                  key={product.id}
                  style={{
                    marginBottom: "15px",
                    display: "flex",
                    alignItems: "center",
                    background: "#f8f8f8",
                    padding: "10px",
                    borderRadius: "10px",
                  }}
                >
                  {product.imageUrl && (
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      style={{
                        width: "60px",
                        height: "60px",
                        objectFit: "cover",
                        marginLeft: "10px",
                        borderRadius: "8px",
                      }}
                    />
                  )}

                  <div style={{ flexGrow: 1 }}>
                    <strong>{product.name}</strong>
                    <br />
                    ₪{product.price.toFixed(2)} × {item.quantity}
                  </div>

                  <div style={{ display: "flex", gap: "5px" }}>
                    <button
                      onClick={() => updateQuantity(item.id, 1)}
                      style={{ padding: "5px 10px" }}
                    >
                      +
                    </button>

                    <button
                      onClick={() => updateQuantity(item.id, -1)}
                      disabled={item.quantity <= 1}
                      style={{ padding: "5px 10px" }}
                    >
                      -
                    </button>

                    <button
                      onClick={() => removeFromCart(item.id)}
                      style={{
                        background: "crimson",
                        color: "white",
                        padding: "5px 10px",
                        border: "none",
                        borderRadius: "5px",
                      }}
                    >
                      הסר
                    </button>
                  </div>
                </li>
              ) : null;
            })}
          </ul>

          <p style={{ fontSize: "18px", marginTop: "20px" }}>
            סה״כ: <strong>₪{totalPrice.toFixed(2)}</strong>
          </p>

          <button
            onClick={placeOrder}
            disabled={loading}
            style={{
              width: "100%",
              padding: "12px",
              fontSize: "16px",
              background: "#4caf50",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              marginTop: "15px",
            }}
          >
            {loading ? "שולח הזמנה..." : "בצע הזמנה"}
          </button>
        </div>
      )}
    </div>
  );
};

export default Cart;
