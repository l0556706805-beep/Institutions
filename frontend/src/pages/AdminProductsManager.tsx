import React, { useEffect, useState } from "react";
import api from "../api/api";

interface Product {
  id: number;
  categoryId: number;
  categoryName: string;
  name: string;
  description: string;
  price: number;
  unit: string;
  imageUrl: string;
  stock: number;
  isActive: boolean;
  file?: File;
}

interface Category {
  id: number;
  name: string;
}

const API_BASE_URL = "https://localhost:44378"; // כתובת ה-API שלך

const ProductsAdmin: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [modalProduct, setModalProduct] = useState<Partial<Product>>({ stock: 0, isActive: true });

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await api.get<Product[]>("/Products");
      setProducts(res.data);
    } catch (err) {
      console.error("שגיאה בטעינת מוצרים", err);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await api.get<Category[]>("/Categories");
      setCategories(res.data);
    } catch (err) {
      console.error("שגיאה בטעינת קטגוריות", err);
    }
  };

  const openModal = (product?: Product) => {
    setModalProduct(product || { stock: 0, isActive: true });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setModalProduct({ stock: 0, isActive: true });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setModalProduct(prev => ({ ...prev, imageUrl: reader.result as string, file }));
    };
    reader.readAsDataURL(file);
  };

  const saveProduct = async () => {
    try {
      if (!modalProduct.name || !modalProduct.categoryId) {
        alert("אנא מלא שם מוצר וקטגוריה");
        return;
      }

      let imageUrl = modalProduct.imageUrl;

      if (modalProduct.file) {
        const formData = new FormData();
        formData.append("file", modalProduct.file);

        const res = await api.post<{ url: string }>("/Products/upload-image", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        imageUrl = res.data.url;
      }

      const payload = {
        categoryId: Number(modalProduct.categoryId),
        name: modalProduct.name,
        description: modalProduct.description || "",
        price: modalProduct.price ? Number(modalProduct.price) : 0,
        unit: modalProduct.unit || "",
        imageUrl: imageUrl || null,
        isActive: modalProduct.isActive ?? true,
      };

      let productId = modalProduct.id;

      if (productId) {
        await api.put(`/Products/${productId}`, payload);
      } else {
        const res = await api.post("/Products", payload);
        productId = res.data.id;
      }

      if (productId && !isNaN(modalProduct.stock ?? 0)) {
        await api.put(`/Products/${productId}/stock`, { newStock: Number(modalProduct.stock) });
      }

      closeModal();
      fetchProducts();
    } catch (err) {
      console.error("שגיאה בשמירת מוצר:", err);
      alert("שגיאה בעדכון המוצר, בדקי את הנתונים ושהשרת פעיל");
    }
  };

  const updateStock = async (productId: number, stock: number) => {
    try {
      if (!isNaN(stock)) {
        await api.put(`/Products/${productId}/stock`, { newStock: stock });
        setProducts(prev => prev.map(p => (p.id === productId ? { ...p, stock } : p)));
      }
    } catch (err) {
      console.error("שגיאה בעדכון מלאי", err);
    }
  };

  const deleteProduct = async (productId: number) => {
    if (window.confirm("בטוח שברצונך למחוק את המוצר?")) {
      try {
        await api.delete(`/Products/${productId}`);
        fetchProducts();
      } catch (err) {
        console.error("שגיאה במחיקת מוצר:", err);
      }
    }
  };

  return (
    <div style={{ padding: 30, fontFamily: "Arial, sans-serif", backgroundColor: "#e3f2fd", minHeight: "100vh" }}>
      <h1 style={{ textAlign: "center", marginBottom: 20, color: "#0d47a1" }}>ניהול מוצרים</h1>
      <div style={{ textAlign: "center", marginBottom: 20 }}>
        <button onClick={() => openModal()} style={{ backgroundColor: "#64b5f6", color: "white", padding: "10px 20px", border: "none", borderRadius: 5, cursor: "pointer" }}>
          הוסף מוצר חדש
        </button>
      </div>

      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", backgroundColor: "white", boxShadow: "0 0 5px rgba(0,0,0,0.1)" }}>
          <thead>
            <tr style={{ backgroundColor: "#90caf9", color: "#0d47a1" }}>
              <th style={{ padding: 10 }}>ID</th>
              <th style={{ padding: 10 }}>שם מוצר</th>
              <th style={{ padding: 10 }}>מחיר</th>
              <th style={{ padding: 10 }}>קטגוריה</th>
              <th style={{ padding: 10 }}>מלאי</th>
              <th style={{ padding: 10 }}>פעיל</th>
              <th style={{ padding: 10 }}>תמונה</th>
              <th style={{ padding: 10 }}>פעולות</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p, i) => (
              <tr key={p.id} style={{ backgroundColor: i % 2 === 0 ? "#e3f2fd" : "#ffffff", borderBottom: "1px solid #bbdefb" }}>
                <td style={{ padding: 8 }}>{p.id}</td>
                <td style={{ padding: 8 }}>{p.name}</td>
                <td style={{ padding: 8 }}>{p.price} ₪</td>
                <td style={{ padding: 8 }}>{p.categoryName}</td>
                <td style={{ padding: 8 }}>
                  <input type="number" value={p.stock ?? 0} onChange={e => updateStock(p.id, parseInt(e.target.value) || 0)} style={{ width: 60, padding: 4, borderRadius: 4, border: "1px solid #64b5f6" }} />
                </td>
                <td style={{ padding: 8 }}><input type="checkbox" checked={p.isActive} readOnly /></td>
                <td style={{ padding: 8 }}>
                  {p.imageUrl && (
                    <img src={`${API_BASE_URL}${p.imageUrl}`} alt={p.name} style={{ width: 60, height: 40, objectFit: "cover", borderRadius: 4 }} />
                  )}
                </td>
                <td style={{ padding: 8, display: "flex", gap: 5 }}>
                  <button onClick={() => openModal(p)} style={{ backgroundColor: "#64b5f6", border: "none", borderRadius: 4, padding: "5px 10px", cursor: "pointer", color: "white" }}>ערוך</button>
                  <button onClick={() => deleteProduct(p.id)} style={{ backgroundColor: "#2196f3", border: "none", borderRadius: 4, padding: "5px 10px", cursor: "pointer", color: "white" }}>מחק</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div     onClick={closeModal}
    style={{
      position: "fixed",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      background: "rgba(13,71,161,0.2)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
     }}>
          <div style={{
            background: "#e3f2fd",
            padding: 20,
            borderRadius: 10,
            minWidth: 350,
            maxWidth: 500,
            maxHeight: "85vh",      // ⭐ חשוב
            overflowY: "auto",      // ⭐ חשוב
            boxShadow: "0 4px 15px rgba(0,0,0,0.2)"
          }}>
            <h2 style={{ marginBottom: 15, color: "#0d47a1" }}>{modalProduct.id ? "עריכת מוצר" : "מוצר חדש"}</h2>

            <input placeholder="שם מוצר" value={modalProduct.name ?? ""} onChange={e => setModalProduct({ ...modalProduct, name: e.target.value })} style={{ width: "100%", marginBottom: 10, padding: 6, borderRadius: 4, border: "1px solid #64b5f6" }} />
            <textarea placeholder="תיאור" value={modalProduct.description ?? ""} onChange={e => setModalProduct({ ...modalProduct, description: e.target.value })} style={{ width: "100%", marginBottom: 10, padding: 6, borderRadius: 4, border: "1px solid #64b5f6" }} />
            <input placeholder="יחידה" value={modalProduct.unit ?? ""} onChange={e => setModalProduct({ ...modalProduct, unit: e.target.value })} style={{ width: "100%", marginBottom: 10, padding: 6, borderRadius: 4, border: "1px solid #64b5f6" }} />
            <input type="number" placeholder="מחיר" value={modalProduct.price ?? 0} onChange={e => setModalProduct({ ...modalProduct, price: parseFloat(e.target.value) || 0 })} style={{ width: "100%", marginBottom: 10, padding: 6, borderRadius: 4, border: "1px solid #64b5f6" }} />
            <input type="number" placeholder="מלאי" value={modalProduct.stock ?? 0} onChange={e => setModalProduct({ ...modalProduct, stock: parseInt(e.target.value) || 0 })} style={{ width: "100%", marginBottom: 10, padding: 6, borderRadius: 4, border: "1px solid #64b5f6" }} />

            <select value={modalProduct.categoryId ?? ""} onChange={e => setModalProduct({ ...modalProduct, categoryId: parseInt(e.target.value) })} style={{ width: "100%", marginBottom: 10, padding: 6, borderRadius: 4, border: "1px solid #64b5f6" }}>
              {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
            </select>

            <div style={{ marginBottom: 10 }}>
              <label>תמונה:</label>
              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <input type="file" accept="image/*" onChange={handleImageUpload} />
                <input
                  type="text"
                  placeholder="או הזן URL לתמונה"
                  value={modalProduct.imageUrl ?? ""}
                  onChange={e => setModalProduct({ ...modalProduct, imageUrl: e.target.value, file: undefined })}
                  style={{ flex: 1, padding: 6, borderRadius: 4, border: "1px solid #64b5f6" }}
                />
              </div>
              {modalProduct.imageUrl && (
                <img
                  src={modalProduct.imageUrl.startsWith("http") ? modalProduct.imageUrl : `${API_BASE_URL}${modalProduct.imageUrl}`}
                  alt="preview"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "https://via.placeholder.com/100x60?text=No+Image";
                  }}
                  style={{ width: 100, height: 60, objectFit: "cover", marginTop: 5, borderRadius: 4 }}
                />
              )}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 15 }}>
              <label>פעיל:</label>
              <input type="checkbox" checked={modalProduct.isActive ?? true} onChange={e => setModalProduct({ ...modalProduct, isActive: e.target.checked })} />
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
              <button onClick={saveProduct} style={{ backgroundColor: "#64b5f6", color: "white", padding: "8px 15px", border: "none", borderRadius: 4, cursor: "pointer" }}>שמירה</button>
              <button onClick={closeModal} style={{ padding: "8px 15px", border: "1px solid #64b5f6", borderRadius: 4, cursor: "pointer" }}>ביטול</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductsAdmin;
