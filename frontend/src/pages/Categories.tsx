import React, { useEffect, useState } from "react";
import api from "../api/api";

interface Category {
  id: number;
  name: string;
}

// interface Supplier {
//   id: number;
//   name: string;
//   phone: string;
// }

const Categories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
//   const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [newCategory, setNewCategory] = useState("");
//   const [newSupplier, setNewSupplier] = useState({ name: "", phone: "" });

  useEffect(() => {
    api.get("/Categories").then(res => setCategories(res.data));
    // api.get("/suppliers").then(res => setSuppliers(res.data));
  }, []);

  const addCategory = async () => {
    if (!newCategory.trim()) return;
    await api.post("/Categories", { name: newCategory });
    const res = await api.get("/Categories");
    setCategories(res.data);
    setNewCategory("");
  };

//   const addSupplier = async () => {
//     await api.post("/suppliers", newSupplier);
//     const res = await api.get("/suppliers");
//     setSuppliers(res.data);
//     setNewSupplier({ name: "", phone: "" });
//   };

  const containerStyle: React.CSSProperties = {
    maxWidth: "900px",
    margin: "0 auto",
    padding: "40px 30px",
    fontFamily: "'Heebo', sans-serif",
    minHeight: "100vh",
    background: "linear-gradient(135deg, rgba(102, 126, 234, 0.03) 0%, rgba(118, 75, 162, 0.03) 100%)",
  };

  const titleStyle: React.CSSProperties = {
    fontSize: "2.5rem",
    fontWeight: 700,
    marginBottom: "35px",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    display: "flex",
    alignItems: "center",
    gap: "15px",
  };

  const cardStyle: React.CSSProperties = {
    background: "white",
    borderRadius: "24px",
    padding: "30px",
    boxShadow: "0 8px 30px rgba(102, 126, 234, 0.1)",
    marginBottom: "30px",
  };

  const listStyle: React.CSSProperties = {
    listStyle: "none",
    padding: 0,
    margin: 0,
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
    gap: "15px",
  };

  const itemStyle: React.CSSProperties = {
    background: "linear-gradient(135deg, rgba(102, 126, 234, 0.08) 0%, rgba(118, 75, 162, 0.08) 100%)",
    padding: "18px 24px",
    borderRadius: "14px",
    fontWeight: 500,
    color: "#4a5568",
    display: "flex",
    alignItems: "center",
    gap: "10px",
    transition: "all 0.3s ease",
    cursor: "default",
    border: "1px solid rgba(102, 126, 234, 0.1)",
  };

  const inputStyle: React.CSSProperties = {
    padding: "14px 20px",
    borderRadius: "14px",
    border: "2px solid #e2e8f0",
    fontSize: "1rem",
    fontFamily: "'Heebo', sans-serif",
    transition: "all 0.3s ease",
    width: "300px",
    marginLeft: "15px",
    background: "#f8faff",
  };

  const buttonStyle: React.CSSProperties = {
    padding: "14px 30px",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "white",
    border: "none",
    borderRadius: "14px",
    fontSize: "1rem",
    fontWeight: 600,
    fontFamily: "'Heebo', sans-serif",
    cursor: "pointer",
    transition: "all 0.3s ease",
    boxShadow: "0 4px 15px rgba(102, 126, 234, 0.3)",
  };

  return (
    <div style={containerStyle}>
      <h2 style={titleStyle}>
        <span style={{ WebkitTextFillColor: "initial" }}>📂</span>
        קטגוריות
      </h2>
      
      <div style={cardStyle}>
        <h3 style={{ 
          fontSize: "1.3rem", 
          color: "#4a5568", 
          marginBottom: "20px",
          fontWeight: 600,
        }}>
          הקטגוריות הקיימות ({categories.length})
        </h3>
        
        {categories.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px", color: "#718096" }}>
            <span style={{ fontSize: "3rem", display: "block", marginBottom: "15px" }}>📭</span>
            <p>אין קטגוריות עדיין</p>
          </div>
        ) : (
          <ul style={listStyle}>
            {categories.map((c, index) => (
              <li 
                key={c.id} 
                style={{
                  ...itemStyle,
                  animationDelay: `${index * 0.05}s`,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-3px)";
                  e.currentTarget.style.boxShadow = "0 8px 20px rgba(102, 126, 234, 0.15)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                <span style={{ 
                  width: "32px", 
                  height: "32px", 
                  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  borderRadius: "8px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                  fontSize: "0.9rem",
                  fontWeight: 700,
                }}>
                  {index + 1}
                </span>
                {c.name}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div style={cardStyle}>
        <h3 style={{ 
          fontSize: "1.3rem", 
          color: "#4a5568", 
          marginBottom: "20px",
          fontWeight: 600,
        }}>
          ➕ הוסף קטגוריה חדשה
        </h3>
        
        <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: "15px" }}>
          <input
            type="text"
            placeholder="שם הקטגוריה"
            value={newCategory}
            onChange={e => setNewCategory(e.target.value)}
            style={inputStyle}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = "#667eea";
              e.currentTarget.style.boxShadow = "0 0 0 4px rgba(102, 126, 234, 0.15)";
              e.currentTarget.style.background = "white";
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = "#e2e8f0";
              e.currentTarget.style.boxShadow = "none";
              e.currentTarget.style.background = "#f8faff";
            }}
            onKeyPress={(e) => e.key === 'Enter' && addCategory()}
          />
          <button 
            onClick={addCategory}
            style={buttonStyle}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-3px)";
              e.currentTarget.style.boxShadow = "0 8px 25px rgba(102, 126, 234, 0.4)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 4px 15px rgba(102, 126, 234, 0.3)";
            }}
          >
            ➕ הוסף קטגוריה
          </button>
        </div>
      </div>

      {/* <h2>ספקים</h2>
      <ul>{suppliers.map(s => <li key={s.id}>{s.name} - {s.phone}</li>)}</ul>
      <input
        type="text"
        placeholder="שם ספק"
        value={newSupplier.name}
        onChange={e => setNewSupplier({ ...newSupplier, name: e.target.value })} 
    //   /><br/>
    //   <input
    //     type="text"
    //     placeholder="טלפון"
    //     value={newSupplier.phone}
    //     onChange={e => setNewSupplier({ ...newSupplier, phone: e.target.value })}
    //   /><br/>
    //   <button onClick={addSupplier}>הוסף ספק</button>*/}
    </div>
  );
};

export default Categories;
