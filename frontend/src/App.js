import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";

function Home() {
  return (
    <div style={{ padding: "40px" }}>
      <h1>SALEHA MEDI PHARMA</h1>
      <p>Frontend Working Successfully</p>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/admin" element={<AdminLogin />} />
        <Route
          path="/admin-dashboard"
          element={<AdminDashboard />}
        />
            </Routes>
    </BrowserRouter>
  );
}