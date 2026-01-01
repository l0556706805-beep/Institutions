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

  return (
    <div>
      <h2>קטגוריות</h2>
      <ul>{categories.map(c => <li key={c.id}>{c.name}</li>)}</ul>
      <input
        type="text"
        placeholder="שם קטגוריה"
        value={newCategory}
        onChange={e => setNewCategory(e.target.value)}
      />
      <button onClick={addCategory}>הוסף</button>

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
