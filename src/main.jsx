// src/main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { AuthProvider } from "./context/AuthContext";

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").then(
      (registration) => {
        console.log("✅ ServiceWorker registered:", registration);
      },
      (error) => {
        console.error("❌ ServiceWorker registration failed:", error);
      }
    );
  });
}
ReactDOM.createRoot(document.getElementById("root")).render(
  <AuthProvider>
    <App />
  </AuthProvider>
);