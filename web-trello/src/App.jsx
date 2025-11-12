import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import ForgotPassword from "./pages/ForgotPassword.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import ProtectedRoute from "./routes/ProtectedRoute.jsx";
import Perfil from "./pages/Perfil.jsx";
import VerTableros from "./pages/VerTableros.jsx";
import NuevoTablero from "./pages/NuevoTablero.jsx";
import Ajustes from "./pages/Ajustes.jsx";
import BoardPage from "./pages/BoardPage.jsx";
import Subscription from "./pages/Subscription.jsx";
import SuccessPage from "./pages/SuccessPage.jsx";
import CancelPage from "./pages/CancelPage.jsx";
import SubscriptionButton from "./components/ui/SubscriptionButton.jsx";
import "./App.css";
import BotonModo from "./components/ui/BotonModo.jsx";

export default function App() {
  const getInitialTheme = () => {
    const stored = localStorage.getItem("theme");
    if (stored) return stored;
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  };

  const [theme, setTheme] = useState(getInitialTheme);

  useEffect(() => {
  const root = document.documentElement;

  root.classList.toggle("dark", theme === "dark");

  localStorage.setItem("theme", theme);
  console.log("Tema actual:", theme);
}, [theme]);

  const toggleTheme = () => {
    const root = document.documentElement;
    root.setAttribute("data-theme-transition", "true");

    setTheme((prev) => (prev === "dark" ? "light" : "dark"));

    setTimeout(() => {
      root.removeAttribute("data-theme-transition");
    }, 400);
  };

  return (
    <div>
      <BotonModo theme={theme} toggleTheme={toggleTheme} />

      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot" element={<ForgotPassword />} />
        <Route path="/tableros/:boardId" element={<BoardPage />} />
        <Route path="/suscripcion/" element={<Subscription />} />

        {/* --- RUTAS DE CONFIRMACIÓN DE PAGO (STRIPE) --- */}
        <Route path="/suscripcion/exito" element={<SuccessPage />} />
        <Route path="/suscripcion/fallo" element={<CancelPage />} />
        {/* ----------------------------------------------- */}

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/tableros"
          element={
            <ProtectedRoute>
              <VerTableros />
            </ProtectedRoute>
          }
        />

        <Route
          path="/perfil"
          element={
            <ProtectedRoute>
              <Perfil />
            </ProtectedRoute>
          }
        />

        <Route
          path="/tableros/nuevo"
          element={
            <ProtectedRoute>
              <NuevoTablero />
            </ProtectedRoute>
          }
        />

        <Route
  path="/ajustes"
  element={
    <ProtectedRoute>
      <Ajustes theme={theme} setTheme={setTheme} />
    </ProtectedRoute>
  }
/>


        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
      
    </div>
  );
}
