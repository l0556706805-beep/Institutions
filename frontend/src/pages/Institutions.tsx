import React, { useEffect, useState } from "react";
import api, { setAuthToken } from "../api/api";

interface Institution {
  id: number;
  name: string;
  address: string;
  phone: string;
  contactName: string;
  createdAt?: string;
}

interface User {
  id: number;
  institutionId: number;
  fullName: string;
  email: string;
  role: string;
  password?: string;
  createdAt?: string;
}

const Institutions = () => {
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [newInstitution, setNewInstitution] = useState({ name: "", address: "", phone: "", contactName: "" });
  const [editingInstitution, setEditingInstitution] = useState<Institution | null>(null);

  const [institutionUsers, setInstitutionUsers] = useState<User[]>([]);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [newUser, setNewUser] = useState({ fullName: "", email: "", password: "", role: "" });

  const token = localStorage.getItem("token");
  useEffect(() => {
    setAuthToken(token);
  }, [token]);

  const loadInstitutions = async () => {
    try {
      const res = await api.get("/Institutions");
      setInstitutions(res.data);
    } catch (err) {
      console.error("שגיאה בטעינת מוסדות", err);
    }
  };

  const loadUsers = async (institutionId: number) => {
    try {
      const res = await api.get(`/Institutions/${institutionId}/Users`);
      setInstitutionUsers(res.data);
    } catch (err) {
      console.error("שגיאה בטעינת משתמשים", err);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      await loadInstitutions();
    };
    fetchData();
  }, []);

  const addInstitution = async () => {
    const { name, address, phone, contactName } = newInstitution;
    if (!name || !address || !phone || !contactName) {
      alert("יש למלא את כל השדות של המוסד");
      return;
    }
    try {
      await api.post("/Institutions", { name, address, phone, contactName });
      setNewInstitution({ name: "", address: "", phone: "", contactName: "" });
      loadInstitutions();
    } catch (err: any) {
      if (err.response?.status === 401) alert("אין לך הרשאה לבצע פעולה זו");
      else console.error("שגיאה בהוספת מוסד", err);
    }
  };

  const updateInstitution = async () => {
    if (!editingInstitution) return;
    const { name, address, phone, contactName } = editingInstitution;
    if (!name || !address || !phone || !contactName) {
      alert("יש למלא את כל השדות של המוסד");
      return;
    }
    try {
      await api.put(`/Institutions/${editingInstitution.id}`, { name, address, phone, contactName });
      setEditingInstitution(null);
      loadInstitutions();
    } catch (err: any) {
      if (err.response?.status === 401) alert("אין לך הרשאה לבצע פעולה זו");
      else console.error("שגיאה בעדכון מוסד", err);
    }
  };

  const addUser = async () => {
    if (!editingInstitution) return;
    const { fullName, email, role, password } = newUser;
    if (!fullName || !email || !role || !password) {
      alert("יש למלא את כל השדות של המשתמש");
      return;
    }
    try {
      await api.post("/Users", { institutionId: editingInstitution.id, fullName, email, password, role });
      setNewUser({ fullName: "", email: "", password: "", role: "" });
      loadUsers(editingInstitution.id);
    } catch (err: any) {
      if (err.response?.status === 401) alert("אין לך הרשאה לבצע פעולה זו");
      else console.error("שגיאה בהוספת משתמש", err);
    }
  };

  const updateUser = async () => {
    if (!editingUser || !editingInstitution) return;
    const payload: any = {
      institutionId: editingInstitution.id,
      fullName: editingUser.fullName ?? "",
      email: editingUser.email ?? "",
      role: editingUser.role ?? "",
    };
    if (editingUser.password && editingUser.password.trim() !== "") {
      payload.password = editingUser.password;
    }
    try {
      await api.put(`/Users/${editingUser.id}`, payload);
      setEditingUser(null);
      loadUsers(editingInstitution.id);
    } catch (err: any) {
      if (err.response?.status === 401) alert("אין לך הרשאה לבצע פעולה זו");
      else console.error("שגיאה בעדכון משתמש", err);
    }
  };

  const deleteUser = async (userId: number) => {
    if (!editingInstitution) return;
    if (!window.confirm("בטוח שברצונך למחוק את המשתמש?")) return;
    try {
      await api.delete(`/Users/${userId}`);
      loadUsers(editingInstitution.id);
    } catch (err: any) {
      if (err.response?.status === 401) alert("אין לך הרשאה לבצע פעולה זו");
      else console.error("שגיאה במחיקת משתמש", err);
    }
  };

  return (
    <div className="container" style={{ direction: "rtl" }}>
      <style>{`
        body { background: #f4f6fb; font-family: "Inter", "Segoe UI", sans-serif; }
        .container { max-width: 1200px; margin: auto; padding: 30px; }
        h2 { text-align: center; margin-bottom: 30px; color: #1e293b; }
        h3, h4 { margin-top: 20px; color: #334155; }
        table { width: 100%; border-collapse: collapse; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.05); }
        thead { background: #3b82f6; color: white; }
        th, td { padding: 14px 12px; text-align: right; }
        tbody tr { border-bottom: 1px solid #e5e7eb; }
        tbody tr:hover { background: #f1f5f9; }
        th { font-weight: 600; }
        button { padding: 10px 16px; border-radius: 8px; border: none; cursor: pointer; font-weight: 600; font-size: 14px; transition: all 0.2s ease; }
        button:hover { opacity: 0.9; }
        button:active { transform: scale(0.97); }
        .btn-save { background: #3b82f6; color: white; }
        .btn-delete { background: #ef4444; color: white; }
        .btn-close { position: absolute; top: 15px; left: 15px; background: transparent; color: #64748b; font-size: 22px; font-weight: bold; }
        .btn-close:hover { color: #ef4444; }
        input { width: 100%; padding: 10px 12px; border-radius: 8px; border: 1px solid #d1d5db; margin-bottom: 10px; font-size: 14px; }
        input:focus { outline: none; border-color: #3b82f6; box-shadow: 0 0 0 2px rgba(59,130,246,0.15); }
        .form-section { background: white; margin-top: 30px; padding: 20px; border-radius: 14px; box-shadow: 0 10px 25px rgba(0,0,0,0.05); }
        .modal-backdrop { position: fixed; inset: 0; background: rgba(15, 23, 42, 0.55); display: flex; justify-content: center; align-items: flex-start; padding-top: 50px; z-index: 1000; }
        .modal-content { display: flex; flex-direction: column; background: white; width: 90%; max-width: 850px; max-height: 90vh; border-radius: 16px; padding: 25px; position: relative; animation: fadeIn 0.25s ease; }
        .modal-body { flex: 1; overflow-y: auto; margin-bottom: 15px; }
        .modal-footer { display: flex; justify-content: flex-end; gap: 10px; padding-top: 10px; border-top: 1px solid #e5e7eb; background: white; position: sticky; bottom: 0; z-index: 10; }
        .users-table { margin-top: 15px; }
        .users-table th { background: #f1f5f9; color: #334155; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } 
      `}</style>

      <h2>ניהול מוסדות</h2>

      <table className="institutions-table">
        <thead>
          <tr>
            <th>שם</th>
            <th>כתובת</th>
            <th>טלפון</th>
            <th>איש קשר</th>
            <th>נוצר בתאריך</th>
            <th>פעולות</th>
          </tr>
        </thead>
        <tbody>
          {institutions.map(inst => (
            <tr key={inst.id}>
              <td>{inst.name}</td>
              <td>{inst.address}</td>
              <td>{inst.phone}</td>
              <td>{inst.contactName}</td>
              <td>{inst.createdAt || ""}</td>
              <td>
                <button className="btn-save" onClick={() => { setEditingInstitution(inst); loadUsers(inst.id); }}>ערוך</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="form-section">
        <h3>הוספת מוסד חדש</h3>
        <input placeholder="שם" value={newInstitution.name} onChange={e => setNewInstitution({ ...newInstitution, name: e.target.value })} />
        <input placeholder="כתובת" value={newInstitution.address} onChange={e => setNewInstitution({ ...newInstitution, address: e.target.value })} />
        <input placeholder="טלפון" value={newInstitution.phone} onChange={e => setNewInstitution({ ...newInstitution, phone: e.target.value })} />
        <input placeholder="איש קשר" value={newInstitution.contactName} onChange={e => setNewInstitution({ ...newInstitution, contactName: e.target.value })} />
        <button className="btn-save" onClick={addInstitution}>שמור מוסד</button>
      </div>

      {editingInstitution && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <button className="btn-close" onClick={() => { setEditingInstitution(null); setEditingUser(null); }}>×</button>

            <div className="modal-body">
              <h3>עריכת מוסד: {editingInstitution.name}</h3>
              <input placeholder="שם" value={editingInstitution.name} onChange={e => setEditingInstitution({ ...editingInstitution, name: e.target.value })} />
              <input placeholder="כתובת" value={editingInstitution.address} onChange={e => setEditingInstitution({ ...editingInstitution, address: e.target.value })} />
              <input placeholder="טלפון" value={editingInstitution.phone} onChange={e => setEditingInstitution({ ...editingInstitution, phone: e.target.value })} />
              <input placeholder="איש קשר" value={editingInstitution.contactName} onChange={e => setEditingInstitution({ ...editingInstitution, contactName: e.target.value })} />

              {/* כפתור שמירה של המוסד לפני רשימת המשתמשים */}
              <button className="btn-save" onClick={updateInstitution}>שמור שינויים מוסד</button>

              <h4>משתמשי מוסד</h4>
              <table className="users-table">
                <thead>
                  <tr>
                    <th>שם מלא</th>
                    <th>אימייל</th>
                    <th>תפקיד</th>
                    <th>פעולות</th>
                  </tr>
                </thead>
                <tbody>
                  {institutionUsers.map(user => (
                    <tr key={user.id}>
                      <td>{user.fullName}</td>
                      <td>{user.email}</td>
                      <td>{user.role}</td>
                      <td>
                        <button className="btn-save" onClick={() => setEditingUser(user)}>ערוך</button>
                        <button className="btn-delete" onClick={() => deleteUser(user.id)}>מחק</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {editingUser ? (
                <>
                  <h4>עריכת משתמש: {editingUser.fullName}</h4>
                  <input placeholder="שם מלא" value={editingUser.fullName} onChange={e => setEditingUser({ ...editingUser, fullName: e.target.value })} />
                  <input placeholder="אימייל" value={editingUser.email} onChange={e => setEditingUser({ ...editingUser, email: e.target.value })} />
                  <input placeholder="תפקיד" value={editingUser.role} onChange={e => setEditingUser({ ...editingUser, role: e.target.value })} />
                  <input placeholder="סיסמה חדשה (ריק = ללא שינוי)" value={editingUser.password || ""} onChange={e => setEditingUser({ ...editingUser, password: e.target.value })} />
                </>
              ) : (
                <>
                  <h4>הוספת משתמש חדש</h4>
                  <input placeholder="שם מלא" value={newUser.fullName} onChange={e => setNewUser({ ...newUser, fullName: e.target.value })} />
                  <input placeholder="אימייל" value={newUser.email} onChange={e => setNewUser({ ...newUser, email: e.target.value })} />
                  <input placeholder="סיסמה" value={newUser.password} onChange={e => setNewUser({ ...newUser, password: e.target.value })} />
                  <input placeholder="תפקיד" value={newUser.role} onChange={e => setNewUser({ ...newUser, role: e.target.value })} />
                </>
              )}
            </div>

            <div className="modal-footer">
              {editingUser ? (
                <button className="btn-save" onClick={updateUser}>שמור שינויים משתמש</button>
              ) : (
                <button className="btn-save" onClick={addUser}>הוסף משתמש</button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Institutions;
