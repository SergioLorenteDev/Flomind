<<<<<<< HEAD
// src/pages/Login.jsx
=======
import { useState } from "react";
>>>>>>> b262b3c (Arreglo de back Cors, Logo, error log in invalido, eliminacion de codigo redundante)
import { useForm } from "react-hook-form";
import { Link, useLocation, useNavigate } from "react-router-dom";
import AuthCard from "../components/ui/AuthCard.jsx";
import Input from "../components/ui/Input.jsx";
import Checkbox from "../components/ui/Checkbox.jsx";
import Button from "../components/ui/Button.jsx";
import { useAuth } from "../modules/auth/AuthContext.jsx";
import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import { motion } from "framer-motion";

export default function Login() {
  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const { state } = useLocation();
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm({ defaultValues: { remember: true } });

  // --- Config de animación ---
  const LOGO_SRC = "/Logo_transparente_morado.png";
  const duration = 2;            // velocidad del movimiento
  const startScale = 3.0;           // tamaño inicial
  const endScale = 0.55;            // tamaño final 
  const endTop = -260;                // distancia de arriba

  async function onSubmit({ email, password, remember }) {
    setError("");
    try {
      await login(email, password, remember);
      navigate(state?.from?.pathname || "/dashboard", { replace: true });
    } catch (err) {
      console.error("LOGIN ERROR UI:", err);
      setError("Credenciales incorrectas. Revisa email y contraseña.");
    }
  }

  const handleGoogleSuccess = (credentialResponse) => {
    const decoded = jwtDecode(credentialResponse.credential);
    loginWithGoogle(decoded);
    navigate("/dashboard", { replace: true });
  };
<<<<<<< HEAD
  const handleGoogleError = () => alert("Error al iniciar sesión");

  return (
    <div className="relative min-h-screen flex items-start justify-center bg-gradient-to-br from-violet-100 via-white to-violet-50 overflow-hidden pt-40">
      <motion.img
        src={LOGO_SRC}
        alt="Logo"
        className="absolute left-1/2 -translate-x-1/2 select-none drop-shadow-2xl"
        style={{ top: `calc(50vh - 28px)` }} 
        initial={{ scale: startScale, y: "-50vh", opacity: 1 }}
        animate={{ scale: endScale, y: `calc(${endTop}px - 50vh)`, opacity: 1 }}
        transition={{ duration, ease: [0.22, 1, 0.36, 1] }}
        draggable="false"
      />

      {/* Tarjeta de Login: aparece después del movimiento del logo */}
      <motion.div
        className="w-full max-w-md px-4"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: duration * 0.7, duration: 0.45 }}
      >
        <AuthCard
          title="Bienvenido"
          subtitle="Inicia sesión para continuar."
          footer={
            <p>
              ¿Aún no tienes una cuenta?{" "}
              <Link to="/register" className="text-violet-600 hover:underline font-medium">
                ¡Regístrate!
              </Link>
            </p>
          }
        >
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Email"
              type="email"
              name="email"
              placeholder="Introduce tu correo electrónico"
              register={register}
              required
            />
            <Input
              label="Contraseña"
              type="password"
              name="password"
              placeholder="Introduce tu contraseña"
              register={register}
              required
            />

            <div className="flex items-center justify-between">
              <Checkbox label="Recordarme" name="remember" register={register} defaultChecked />
              <Link to="/forgot" className="text-sm text-violet-600 hover:underline">
                He olvidado mi contraseña
              </Link>
            </div>

            <Button type="submit" variant="primary" full disabled={isSubmitting}>
              {isSubmitting ? "Iniciando sesión..." : "Iniciar sesión"}
            </Button>
          </form>

          {/* Botón login con Google */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500 mb-3">O usa tu cuenta de Google</p>
            <div className="flex justify-center">
              <GoogleLogin onSuccess={handleGoogleSuccess} onError={handleGoogleError} />
            </div>
          </div>
        </AuthCard>
      </motion.div>
    </div>
=======

  const handleGoogleError = () => {
    alert("Error al iniciar sesion");
  };

  return (
    <AuthCard
      title="Bienvenido"
      subtitle="Inicia sesion para continuar."
      footer={
        <p>
          Aun no tienes una cuenta?{" "}
          <Link to="/register" className="text-violet-600 hover:underline font-medium">
            Registrate
          </Link>
        </p>
      }
    >
      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <Input
          label="Email"
          type="email"
          name="email"
          placeholder="Introduce tu correo electronico"
          register={register}
          required
        />
        <Input
          label="Contrasena"
          type="password"
          name="password"
          placeholder="Introduce tu contrasena"
          register={register}
          required
        />

        <div className="flex items-center justify-between">
          <Checkbox label="Recordarme" name="remember" register={register} defaultChecked />
          <Link to="/forgot" className="text-sm text-violet-600 hover:underline">
            He olvidado mi contrasena
          </Link>
        </div>

        <Button type="submit" variant="primary" full disabled={isSubmitting}>
          {isSubmitting ? "Iniciando sesion..." : "Iniciar sesion"}
        </Button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-500 mb-3">O usa tu cuenta de Google</p>
        <div className="flex justify-center">
          <GoogleLogin onSuccess={handleGoogleSuccess} onError={handleGoogleError} />
        </div>
      </div>
    </AuthCard>
>>>>>>> b262b3c (Arreglo de back Cors, Logo, error log in invalido, eliminacion de codigo redundante)
  );
}
