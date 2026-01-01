import React, { useContext } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Products from "./pages/products";
import Orders from "./pages/Orders";
import Institutions from "./pages/Institutions";
import Categories from "./pages/Categories";
import Login from "./pages/login";
import { AuthProvider, AuthContext } from "./context/AuthContext";
import { Navbar } from "./Navbar";
import { CartProvider } from "./context/CartContext";
import Cart from "./pages/cart";
import ProductsAdmin from "./pages/AdminProductsManager";
import ForgotPassword from "./pages/forgot-password";
import ResetPassword from "./pages/reset-password";
import MyOrders from "./pages/MyOrders";
import './App.css'; 

// קומפוננטות Route מוגנות לפי הרשאות
const UserRoute = ({ children }: { children: React.ReactNode }): React.ReactElement => {
  const { token } = useContext(AuthContext);
  if (!token) return <Navigate to="/login" />;
  return <>{children}</>;
};

const AdminRoute = ({ children }: { children: React.ReactNode }): React.ReactElement => {
  const { token, isAdmin } = useContext(AuthContext);
  if (!token) return <Navigate to="/login" />;
  if (!isAdmin()) return <Navigate to="/products" />;
  return <>{children}</>;
};

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>
          <Navbar />

          <Routes>
            {/* דפי ציבור */}
            <Route path="/login" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />

            {/* דפי משתמש רגיל או מנהל */}
            <Route
              path="/products"
              element={
                <UserRoute>
                  <Products />
                </UserRoute>
              }
            />
            <Route
              path="/cart"
              element={
                <UserRoute>
                  <Cart />
                </UserRoute>
              }
            />
            <Route
              path="/MyOrders"
              element={
                <UserRoute>
                  <MyOrders />
                </UserRoute>
              }
            />

            {/* דפי מנהל בלבד */}
            <Route
              path="/orders"
              element={
                <AdminRoute>
                  <Orders />
                </AdminRoute>
              }
            />
            <Route
              path="/institutions"
              element={
                <AdminRoute>
                  <Institutions />
                </AdminRoute>
              }
            />
            <Route
              path="/categories"
              element={
                <AdminRoute>
                  <Categories />
                </AdminRoute>
              }
            />
            <Route
              path="/AdminProductsManager"
              element={
                <AdminRoute>
                  <ProductsAdmin />
                </AdminRoute>
              }
            />

            {/* כל שאר הנתיבים → products */}
            <Route path="*" element={<Navigate to="/products" />} />
          </Routes>
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
