import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";
import { AuthContext } from "../context/AuthContext";
import { CartContext } from "../context/CartContext";
import { jwtDecode } from "jwt-decode";
import "./MyOrders.css";

interface Product {
  productId: number;
  productName: string;
  price: number;
  unit: string;
  imageUrl?: string;
}

interface OrderItem extends Product {
  quantity: number;
}

interface Order {
  id: number;
  institutionId: number;
  institutionName: string;
  userId: number;
  userFullName: string;
  totalAmount: number;
  status: string;
  createdAt: string;
  items: OrderItem[];
}

interface DecodedToken {
  id: string;
  sub: string;
  role: string;
  institutionId?: string;
  [key: string]: any;
}

const statusMap: { [key: string]: string } = {
  Pending: "ממתין",
  Approved: "מאושר",
  Rejected: "נדחה",
  Delivered: "נמסר",
};

const statusColors: { [key: string]: string } = {
  Pending: "status-pending",
  Approved: "status-approved",
  Rejected: "status-rejected",
  Delivered: "status-delivered",
};

const MyOrders: React.FC = () => {
  const { token } = useContext(AuthContext);
  const { clearCart, addToCart } = useContext(CartContext);
  const navigate = useNavigate();

  const [userId, setUserId] = useState<number | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  // --- Fetch token info
  useEffect(() => {
    if (token) {
      try {
        const decoded: DecodedToken = jwtDecode(token);
        setUserId(Number(decoded.id));
      } catch {
        setError("שגיאה בקריאת פרטי המשתמש");
      }
    }
  }, [token]);

  // --- Fetch user's orders
  useEffect(() => {
    if (!token || !userId) return;

    const fetchOrders = async () => {
      try {
        setLoading(true);
        const res = await api.get<Order[]>(`/Order/user/${userId}`);
        setOrders(res.data);
      } catch {
        setError("שגיאה בטעינת ההזמנות");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [userId, token]);

  // --- Handle repeat order
  const handleRepeatOrder = (order: Order) => {
    // נקה את העגלה
    clearCart();

    // הוסף את כל הפריטים מההזמנה לעגלה
    order.items.forEach(item => {
      addToCart({
        id: item.productId,
        name: item.productName,
        price: item.price,
        quantity: item.quantity,
      });
    });

    // נווט לדף המוצרים
    navigate("/products");
  };

  if (loading) return <div className="center-text mt-20">טוען הזמנות...</div>;
  if (error) return <div className="center-text mt-20 error-text">{error}</div>;
  if (orders.length === 0) return <div className="center-text mt-20">אין הזמנות להצגה</div>;

  return (
    <div className="orders-container">
      <h2 className="page-title">הזמנות שלי</h2>

      {orders.map(order => (
        <div key={order.id} className="order-card">
          <div className="order-header">
            <h3>הזמנה #{order.id} - {order.institutionName}</h3>
            <span className={`status-badge ${statusColors[order.status]}`}>
              {statusMap[order.status]}
            </span>
          </div>
          <p>סכום: <strong>{order.totalAmount} ₪</strong></p>
          <p className="order-date">תאריך: {new Date(order.createdAt).toLocaleDateString("he-IL")}</p>
          <table className="items-table">
            <thead>
              <tr>
                <th>מוצר</th>
                <th>כמות</th>
                <th>מחיר</th>
                <th>יחידה</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map(item => (
                <tr key={item.productId}>
                  <td>{item.productName}</td>
                  <td>{item.quantity}</td>
                  <td>{item.price} ₪</td>
                  <td>{item.unit}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="order-actions">
            <button onClick={() => handleRepeatOrder(order)}>
              הזמנה חוזרת עם עריכה
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default MyOrders;
