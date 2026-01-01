import React, { useEffect, useState } from "react";
import api from "../api/api";
import { format } from "date-fns";

interface Order {
  id: number;
  institutionId: number;
  userId: number;
  totalAmount: number;
  status: string;
  createdAt: string;
}

const statusColors: Record<string, string> = {
  Pending: "bg-yellow-100 text-yellow-800",
  Approved: "bg-green-100 text-green-800",
  Rejected: "bg-red-100 text-red-800",
  Completed: "bg-blue-100 text-blue-800",
};

const OrdersAdmin: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [institutionFilter, setInstitutionFilter] = useState<number | "">("");
  const [userSearch, setUserSearch] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string | "">("");

  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 10;

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

  const handleStatusChange = async (orderId: number, newStatus: string) => {
    try {
      await api.put(`/order/${orderId}/status`, { newStatus });
      setOrders(prev =>
        prev.map(o => (o.id === orderId ? { ...o, status: newStatus } : o))
      );
    } catch (err) {
      console.error("Failed to update status", err);
      alert("לא הצלחנו לעדכן את הסטטוס");
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const filteredOrders = orders
    .filter(o => (institutionFilter ? o.institutionId === institutionFilter : true))
    .filter(o => (userSearch ? o.userId.toString().includes(userSearch) : true))
    .filter(o => (statusFilter ? o.status === statusFilter : true))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const totalPages = Math.ceil(filteredOrders.length / pageSize);
  const paginatedOrders = filteredOrders.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const uniqueInstitutions = Array.from(new Set(orders.map(o => o.institutionId)));

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">ניהול הזמנות</h2>

      <div className="flex flex-wrap gap-4 mb-4">
        <div>
          <label className="block mb-1">סינון לפי מוסד:</label>
          <select
            value={institutionFilter}
            onChange={e => setInstitutionFilter(e.target.value ? Number(e.target.value) : "")}
            className="border rounded px-2 py-1"
          >
            <option value="">הכל</option>
            {uniqueInstitutions.map(id => (
              <option key={id} value={id}>
                מוסד {id}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block mb-1">חיפוש לפי משתמש:</label>
          <input
            type="text"
            placeholder="User ID"
            value={userSearch}
            onChange={e => setUserSearch(e.target.value)}
            className="border rounded px-2 py-1"
          />
        </div>

        <div>
          <label className="block mb-1">סינון לפי סטטוס:</label>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="border rounded px-2 py-1"
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
      {error && <p className="text-red-500">{error}</p>}

      {!loading && !error && (
        <>
          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-300 rounded">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-2 border-b">#</th>
                  <th className="p-2 border-b">מוסד</th>
                  <th className="p-2 border-b">משתמש</th>
                  <th className="p-2 border-b">סכום כולל</th>
                  <th className="p-2 border-b">סטטוס</th>
                  <th className="p-2 border-b">תאריך</th>
                </tr>
              </thead>
              <tbody>
                {paginatedOrders.map(order => (
                  <tr
                    key={order.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="p-2 border-b text-center">{order.id}</td>
                    <td className="p-2 border-b text-center">{order.institutionId}</td>
                    <td className="p-2 border-b text-center">{order.userId}</td>
                    <td className="p-2 border-b text-center">{order.totalAmount}₪</td>
                    <td className="p-2 border-b text-center">
                      <select
                        value={order.status}
                        onChange={e => handleStatusChange(order.id, e.target.value)}
                        className={`border rounded px-2 py-1 ${statusColors[order.status] || ""}`}
                      >
                        <option value="Pending">ממתין</option>
                        <option value="Approved">מאושר</option>
                        <option value="Rejected">נדחה</option>
                        <option value="Completed">הושלם</option>
                      </select>
                    </td>
                    <td className="p-2 border-b text-center">
                      {format(new Date(order.createdAt), "dd/MM/yyyy HH:mm")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-center gap-2 mt-4">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => prev - 1)}
              className="px-3 py-1 border rounded disabled:opacity-50"
            >
              קודם
            </button>
            <span className="px-3 py-1">{currentPage} / {totalPages}</span>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(prev => prev + 1)}
              className="px-3 py-1 border rounded disabled:opacity-50"
            >
              הבא
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default OrdersAdmin;
