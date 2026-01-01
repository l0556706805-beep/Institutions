import React, { useEffect, useState } from "react";
import api, { setAuthToken } from "../api/api";
import "./Institutions.css";

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
loadInstitutions();
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

return ( <div className="container"> <h2>ניהול מוסדות</h2> <table className="institutions-table"> <thead> <tr> <th>שם</th> <th>כתובת</th> <th>טלפון</th> <th>איש קשר</th> <th>נוצר בתאריך</th> <th>פעולות</th> </tr> </thead> <tbody>
{institutions.map(inst => ( <tr key={inst.id}> <td>{inst.name}</td> <td>{inst.address}</td> <td>{inst.phone}</td> <td>{inst.contactName}</td> <td>{inst.createdAt || ""}</td> <td>
<button onClick={() => { setEditingInstitution(inst); loadUsers(inst.id); }}>ערוך</button> </td> </tr>
))} </tbody> </table>

  <div className="form-section">
    <h3>הוספת מוסד חדש</h3>
    <input placeholder="שם" value={newInstitution.name} onChange={e => setNewInstitution({ ...newInstitution, name: e.target.value })} />
    <input placeholder="כתובת" value={newInstitution.address} onChange={e => setNewInstitution({ ...newInstitution, address: e.target.value })} />
    <input placeholder="טלפון" value={newInstitution.phone} onChange={e => setNewInstitution({ ...newInstitution, phone: e.target.value })} />
    <input placeholder="איש קשר" value={newInstitution.contactName} onChange={e => setNewInstitution({ ...newInstitution, contactName: e.target.value })} />
    <button onClick={addInstitution}>שמור מוסד</button>
  </div>

  {editingInstitution && (
    <div className="modal-backdrop">
      <div className="modal-content">
        <button onClick={() => { setEditingInstitution(null); setEditingUser(null); }}>X</button>
        <h3>עריכת מוסד: {editingInstitution.name}</h3>
        <input placeholder="שם" value={editingInstitution.name} onChange={e => setEditingInstitution({ ...editingInstitution, name: e.target.value })} />
        <input placeholder="כתובת" value={editingInstitution.address} onChange={e => setEditingInstitution({ ...editingInstitution, address: e.target.value })} />
        <input placeholder="טלפון" value={editingInstitution.phone} onChange={e => setEditingInstitution({ ...editingInstitution, phone: e.target.value })} />
        <input placeholder="איש קשר" value={editingInstitution.contactName} onChange={e => setEditingInstitution({ ...editingInstitution, contactName: e.target.value })} />
        <button onClick={updateInstitution}>שמור שינויים מוסד</button>

        <h4>משתמשי מוסד</h4>
        <table className="users-table">
          <thead>
            <tr><th>שם מלא</th><th>אימייל</th><th>תפקיד</th><th>פעולות</th></tr>
          </thead>
          <tbody>
            {institutionUsers.map(user => (
              <tr key={user.id}>
                <td>{user.fullName}</td>
                <td>{user.email}</td>
                <td>{user.role}</td>
                <td>
                  <button onClick={() => setEditingUser(user)}>ערוך</button>
                  <button onClick={() => deleteUser(user.id)}>מחק</button>
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
            <button onClick={updateUser}>שמור שינויים משתמש</button>
          </>
        ) : (
          <>
            <h4>הוספת משתמש חדש</h4>
            <input placeholder="שם מלא" value={newUser.fullName} onChange={e => setNewUser({ ...newUser, fullName: e.target.value })} />
            <input placeholder="אימייל" value={newUser.email} onChange={e => setNewUser({ ...newUser, email: e.target.value })} />
            <input placeholder="סיסמה" value={newUser.password} onChange={e => setNewUser({ ...newUser, password: e.target.value })} />
            <input placeholder="תפקיד" value={newUser.role} onChange={e => setNewUser({ ...newUser, role: e.target.value })} />
            <button onClick={addUser}>הוסף משתמש</button>
          </>
        )}
      </div>
    </div>
  )}
</div>

);
};

export default Institutions;
