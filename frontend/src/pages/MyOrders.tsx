import React, { useEffect, useState, useContext } from "react";
import api from "../api/api";
import { AuthContext } from "../context/AuthContext";
import { AxiosError } from "axios";
import { jwtDecode } from "jwt-decode";

interface OrderItem {
  productId: number;
  productName: string;
  price: number;
  quantity: number;
  unit: string;
  imageUrl: string;
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

const statusColors: { [key: string]: string } = {
  Pending: "text-yellow-700 bg-yellow-100",
  Approved: "text-green-700 bg-green-100",
  Rejected: "text-red-700 bg-red-100",
  Delivered: "text-blue-700 bg-blue-100",
};

const MyOrders: React.FC = () => {
  const { token } = useContext(AuthContext);
  const [userId, setUserId] = useState<number | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (token) {
      try {
        const decoded: DecodedToken = jwtDecode(token);
        setUserId(Number(decoded.id));
      } catch (err) {
        console.error("JWT decode failed:", err);
        setError("שגיאה בקריאת פרטי המשתמש");
      }
    }
  }, [token]);

  useEffect(() => {
    if (!token) {
      setError("אנא התחבר כדי לראות את ההזמנות שלך");
      setLoading(false);
      return;
    }
    if (!userId) {
      setError("טוען פרטי משתמש...");
      setLoading(true);
      return;
    }

    const fetchOrders = async () => {
      try {
        setLoading(true);
        setError("");
        const res = await api.get<Order[]>(`/Order/user/${userId}`);
        setOrders(res.data);
      } catch (err) {
        console.error(err);
        if (err instanceof AxiosError) {
          setError(
            `שגיאה בטעינת ההזמנות: ${err.response?.status} ${err.response?.statusText}`
          );
        } else {
          setError("שגיאה לא צפויה בטעינת ההזמנות");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [userId, token]);

  const repeatOrder = async (orderId: number) => {
    try {
      setLoading(true);
      await api.post(`/Order/repeat/${orderId}`);
      alert("ההזמנה נשלחה שוב בהצלחה!");
      // ניתן לרענן את ההזמנות אחרי חזרה
      const res = await api.get<Order[]>(`/Order/user/${userId}`);
      setOrders(res.data);
    } catch (err) {
      console.error("שגיאה בביצוע חזרה להזמנה:", err);
      alert("שגיאה בביצוע חזרה להזמנה, נסה שוב מאוחר יותר");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center mt-20">טוען הזמנות...</div>;
  if (error) return <div className="text-center mt-20 text-red-600">{error}</div>;
  if (orders.length === 0) return <div className="text-center mt-20">אין הזמנות להצגה</div>;

  return (<div className="container mx-auto p-2 text-sm"> {/* padding קטן יותר */}
    <h2 className="text-lg font-bold mb-3 text-center text-blue-800">הזמנות שלי</h2>
    {orders.map((order) => (
      <div
        key={order.id}
        className="mb-4 p-2 border rounded shadow hover:shadow-sm transition-shadow text-sm"
      >
        <div className="flex justify-between items-center mb-1">
          <h3 className="font-semibold text-sm">
            הזמנה #{order.id} - {order.institutionName}
          </h3>
          <span
            className={`px-2 py-0.5 rounded-full font-semibold text-xs ${statusColors[order.status] || "bg-gray-200 text-gray-700"
              }`}
          >
            {order.status}
          </span>
        </div>
        <p className="mb-1">סכום: <strong>{order.totalAmount} ₪</strong></p>
        <p className="mb-1 text-xs">
          תאריך:{" "}
          {new Date(order.createdAt).toLocaleDateString("he-IL", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>

        <table className="w-full border-collapse border border-gray-300 mt-1 text-xs">
          <thead className="bg-gray-100">
            <tr>
              <th className="border p-1">תמונה</th>
              <th className="border p-1">מוצר</th>
              <th className="border p-1">כמות</th>
              <th className="border p-1">מחיר</th>
              <th className="border p-1">יחידה</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item) => (
              <tr key={item.productId} className="hover:bg-gray-50 transition-colors">
                <td className="border p-1 text-center">
                  <img
                    src={item.imageUrl}
                    alt={item.productName}
                    className="w-6 h-4 object-cover rounded" // תמונה קטנה יותר
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        "https://via.placeholder.com/24x16?text=No+Image";
                    }}
                  />
                </td>

                <td className="border p-1">{item.productName}</td>
                <td className="border p-1 text-center">{item.quantity}</td>
                <td className="border p-1 text-center">{item.price} ₪</td>
                <td className="border p-1 text-center">{item.unit}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-2 text-right">
          <button
            onClick={() => repeatOrder(order.id)}
            className="bg-blue-600 text-white px-2 py-0.5 rounded text-xs hover:bg-blue-700 transition-colors"
          >
            חזור להזמנה קודמת
          </button>
        </div>
      </div>
    ))}
  </div>

  );
};

export default MyOrders;
