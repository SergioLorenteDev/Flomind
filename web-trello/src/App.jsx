import { Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
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

export default function App() {
  // === Obtener tema inicial ===
  const getInitialTheme = () => {
    const stored = localStorage.getItem("theme");
    if (stored) return stored;
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  };

  const [theme, setTheme] = useState(getInitialTheme);

  useEffect(() => {
    const html = document.documentElement;
    html.setAttribute("data-theme", theme);

    if (theme === "dark") {
      html.classList.add("dark");
    } else {
      html.classList.remove("dark");
    }

    localStorage.setItem("theme", theme);
    console.log("Tema actual:", theme);
  }, [theme]);

  // === Alternar tema ===
  const toggleTheme = () =>
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));

  // === Render ===
  return (
    <div>
      {/* Botón para cambiar modo */}
      <button
        onClick={toggleTheme}
        className="fixed bottom-4 right-4 z-[9999] bg-purple-600 text-white px-3 py-2 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
      >
        Cambiar a modo {theme === "dark" ? "claro" : "oscuro"}
      </button>

      {/* Rutas principales */}
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

        {/* Cualquier otra ruta redirige al login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </div>
  );
}
