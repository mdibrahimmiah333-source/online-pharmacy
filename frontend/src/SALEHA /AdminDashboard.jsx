import React from "react";

export default function AdminDashboard() {
  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        fontFamily: "Arial",
      }}
    >
      <div
        style={{
          width: "250px",
          background: "#1e293b",
          color: "white",
          padding: "20px",
        }}
      >
        <h2>Admin Panel</h2>

        <ul style={{ listStyle: "none", padding: 0 }}>
          <li style={{ margin: "20px 0" }}>Dashboard</li>
          <li style={{ margin: "20px 0" }}>Orders</li>
          <li style={{ margin: "20px 0" }}>Products</li>
          <li style={{ margin: "20px 0" }}>Customers</li>
        </ul>
      </div>

      <div
        style={{
          flex: 1,
          padding: "30px",
          background: "#f1f5f9",
        }}
      >
        <h1>Welcome Admin</h1>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "20px",
            marginTop: "30px",
          }}
        >
          <div
            style={{
              background: "white",
              padding: "20px",
              borderRadius: "10px",
            }}
          >
            <h3>Total Orders</h3>
            <p>120</p>
          </div>

          <div
            style={{
              background: "white",
              padding: "20px",
              borderRadius: "10px",
            }}
          >
            <h3>Total Products</h3>
            <p>58</p>
          </div>

          <div
            style={{
              background: "white",
              padding: "20px",
              borderRadius: "10px",
            }}
          >
            <h3>Total Customers</h3>
            <p>240</p>
          </div>
        </div>
      </div>
    </div>
  );
}