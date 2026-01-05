import React, { useEffect, useState } from "react";
import api from "../api/api";
import { format } from "date-fns";
import "./Orders.css";

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
  createdAt: string;
  status: string;
  totalAmount: number;
  items: OrderItem[];
}

const statusColors: Record<string, string> = {
  Pending: "pending",
  Approved: "approved",
  Rejected: "rejected",
  Completed: "completed",
};

const OrdersAdmin: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [institutionFilter, setInstitutionFilter] = useState<number | "">("");
  const [userSearch, setUserSearch] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string | "">("");

  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 10;

  const [showItemsForOrder, setShowItemsForOrder] = useState<number | null>(null);

  // ------------------- Fetch Orders -------------------
  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await api.get<Order[]>("/order");
      setOrders(res.data);
    } catch (err) {
      setError("שגיאה בטעינת ההזמנות");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // ------------------- Update Status -------------------
  const handleStatusChange = async (orderId: number, newStatus: string) => {
    try {
      await api.put(`/order/${orderId}/status`, { newStatus });
      setOrders(prev =>
        prev.map(o => (o.id === orderId ? { ...o, status: newStatus } : o))
      );
    } catch (err) {
      console.error(err);
      alert("לא הצלחנו לעדכן את הסטטוס");
    }
  };

  // ------------------- Toggle Items -------------------
  const toggleItems = (orderId: number) => {
    setShowItemsForOrder(showItemsForOrder === orderId ? null : orderId);
  };

  // ------------------- Print Order -------------------
  const printOrder = (order: Order) => {
    const content = `
הזמנה מספר: ${order.id}
מוסד: ${order.institutionName}
משתמש: ${order.userFullName}
סטטוס: ${order.status}
תאריך: ${format(new Date(order.createdAt), "dd/MM/yyyy HH:mm")}
סכום כולל: ${order.totalAmount}₪

פריטים:
${order.items.map(i => `- ${i.productName} x${i.quantity} (${i.price}₪)`).join("\n")}
    `;
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(`<pre>${content}</pre>`);
      printWindow.document.close();
      printWindow.print();
    }
  };

  // ------------------- Filter & Pagination -------------------
  const filteredOrders = orders
    .filter(o => (institutionFilter ? o.institutionId === institutionFilter : true))
    .filter(o => (userSearch ? o.userFullName.toLowerCase().includes(userSearch.toLowerCase()) : true))
    .filter(o => (statusFilter ? o.status === statusFilter : true))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const totalPages = Math.ceil(filteredOrders.length / pageSize);
  const paginatedOrders = filteredOrders.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const uniqueInstitutions = Array.from(new Set(orders.map(o => o.institutionId)));

  return (
    <div className="orders-container">
      <h2>ניהול הזמנות</h2>

      {/* Filters */}
      <div className="filters">
        <div className="filter-item">
          <label>סינון לפי מוסד:</label>
          <select
            value={institutionFilter}
            onChange={e => setInstitutionFilter(e.target.value ? Number(e.target.value) : "")}
          >
            <option value="">הכל</option>
            {uniqueInstitutions.map(id => {
              const name = orders.find(o => o.institutionId === id)?.institutionName || `מוסד ${id}`;
              return <option key={id} value={id}>{name}</option>;
            })}
          </select>
        </div>

        <div className="filter-item">
          <label>חיפוש לפי משתמש:</label>
          <input
            type="text"
            placeholder="שם משתמש"
            value={userSearch}
            onChange={e => setUserSearch(e.target.value)}
          />
        </div>

        <div className="filter-item">
          <label>סינון לפי סטטוס:</label>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
          >
            <option value="">הכל</option>
            <option value="Pending">ממתין</option>
            <option value="Approved">מאושר</option>
            <option value="Rejected">נדחה</option>
            <option value="Completed">הושלם</option>
          </select>
        </div>
      </div>

      {loading && <p>טוען הזמנות...</p>}
      {error && <p className="error-text">{error}</p>}

      {!loading && !error && (
        <>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>מוסד</th>
                  <th>משתמש</th>
                  <th>סכום כולל</th>
                  <th>סטטוס</th>
                  <th>תאריך</th>
                  <th>פעולות</th>
                </tr>
              </thead>
              <tbody>
                {paginatedOrders.map(order => (
                  <React.Fragment key={order.id}>
                    <tr>
                      <td>{order.id}</td>
                      <td>{order.institutionName}</td>
                      <td>{order.userFullName}</td>
                      <td>{order.totalAmount}₪</td>
                      <td>
                        <select
                          value={order.status}
                          onChange={e => handleStatusChange(order.id, e.target.value)}
                          className={`status-select ${order.status.toLowerCase()}`}
                        >
                          <option value="Pending">ממתין</option>
                          <option value="Approved">מאושר</option>
                          <option value="Rejected">נדחה</option>
                          <option value="Completed">הושלם</option>
                        </select>
                      </td>
                      <td>{format(new Date(order.createdAt), "dd/MM/yyyy HH:mm")}</td>
                      <td>
                        <button onClick={() => toggleItems(order.id)}>פריטים</button>
                        <button onClick={() => printOrder(order)}>הדפסה</button>
                      </td>
                    </tr>

                    {/* Items with Images */}
                    {showItemsForOrder === order.id && order.items && (
                      <tr className="items-row">
                        <td colSpan={7}>
                          <ul className="order-items-list">
                            {order.items.map(item => (
                              <li key={item.productId} className="order-item">
                                <img src={item.imageUrl} alt={item.productName} className="item-img" />
                                <span>{item.productName} x{item.quantity} - {item.price}₪</span>
                              </li>
                            ))}
                          </ul>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="pagination">
            <button disabled={currentPage === 1} onClick={() => setCurrentPage(prev => prev - 1)}>קודם</button>
            <span>{currentPage} / {totalPages}</span>
            <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(prev => prev + 1)}>הבא</button>
          </div>
        </>
      )}
    </div>
  );
};

export default OrdersAdmin;
