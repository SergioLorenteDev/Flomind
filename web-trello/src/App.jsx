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
  const body = document.body;

  if (theme === "dark") {
    root.classList.add("dark");
    body.classList.add("dark");
  } else {
    root.classList.remove("dark");
    body.classList.remove("dark");
  }

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
      <BotonModo />

      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot" element={<ForgotPassword />} />
        <Route path="/tableros/:boardId" element={<BoardPage />} />

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
              <Ajustes />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
      
    </div>
  );
}
