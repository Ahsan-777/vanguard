import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login2 from "./login2.tsx";
import Intro2 from "./intro2.tsx";
import Explore from "./explore.tsx";
import Register2 from "./register.tsx";
import BuyerPage from "./buyerpage.tsx";
import InventoryPage from "./inventorypage.tsx";
import AdminPage from "./adminpage.tsx";
import AccountantPage from "./accountantpage.tsx";
import POSPage from "./POSPage.tsx";
import ProtectedRoute from "./ProtectedRoute.tsx";
import RecoverPass from "./RecoverPass.tsx";

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Intro2 />} />
        <Route path="/login" element={<Login2 />} />
        <Route path="/explore" element={<Explore />} />
        <Route path="/register" element={<Register2 />} />
        <Route path="/RecoverPass" element={<RecoverPass />} /> {/* <-- Fixed here */}

        {/* User Route */}
        <Route
          path="/user"
          element={
            <ProtectedRoute allowedRoles={["user", "admin"]}>
              <BuyerPage />
            </ProtectedRoute>
          }
        />

        {/* POS Routes */}
        <Route
          path="/pos"
          element={
            <ProtectedRoute allowedRoles={["pos", "admin"]}>
              <POSPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/POSPage"
          element={
            <ProtectedRoute allowedRoles={["pos", "admin"]}>
              <POSPage />
            </ProtectedRoute>
          }
        />

        {/* Protected Dashboard Routes */}
        <Route
          path="/buyer"
          element={
            <ProtectedRoute allowedRoles={["buyer", "admin"]}>
              <BuyerPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/inventory"
          element={
            <ProtectedRoute allowedRoles={["inventory", "inventorymanager", "admin"]}>
              <InventoryPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/accountant"
          element={
            <ProtectedRoute allowedRoles={["accountant", "admin"]}>
              <AccountantPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;