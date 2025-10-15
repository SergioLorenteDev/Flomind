// src/App.jsx
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

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot" element={<ForgotPassword />} />

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
  );
}
