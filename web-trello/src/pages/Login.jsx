import { useEffect, useState } from "react";
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

  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm({ defaultValues: { remember: true } });

  const [theme, setTheme] = useState(
    document.documentElement.getAttribute("data-theme") || "light"
  );

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setTheme(document.documentElement.getAttribute("data-theme"));
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    return () => observer.disconnect();
  }, []);

  // --- Config animación logo ---
  const LOGO_SRC = "/Logo_transparente_morado.png";
  const duration = 2;
  const startScale = 3.0;
  const endScale = 0.55;
  const endTop = -260;

  async function onSubmit({ email, password, remember }) {
    try {
      await login(email, password, remember);
      navigate(state?.from?.pathname || "/dashboard", { replace: true });
    } catch (err) {
      alert(err.message);
    }
  }

  const handleGoogleSuccess = (credentialResponse) => {
    const decoded = jwtDecode(credentialResponse.credential);
    loginWithGoogle(decoded);
    navigate("/dashboard", { replace: true });
  };

  const handleGoogleError = () => alert("Error al iniciar sesión");

  const backgroundStyle =
    theme === "dark"
      ? {
          background:
            "radial-gradient(circle at 50% 50%, #0f0a18 0%, #181025 100%)",
          color: "#fff",
        }
      : {
          background:
            "linear-gradient(145deg, #f7f4ff 0%, #ece4ff 60%, #ffffff 100%)",
          color: "#000",
        };

  return (
    <div className="auth-page relative min-h-screen flex items-start justify-center overflow-hidden pt-40 transition-all duration-500" style={backgroundStyle}>
      {/* Logo animado */}
      <motion.img
        src={LOGO_SRC}
        alt="Logo"
        className="absolute left-1/2 -translate-x-1/2 select-none drop-shadow-2xl z-50 pointer-events-none"
        style={{ top: `calc(50vh - 28px)` }}
        initial={{ scale: startScale, y: "-50vh", opacity: 1 }}
        animate={{ scale: endScale, y: `calc(${endTop}px - 50vh)`, opacity: 1 }}
        transition={{ duration, ease: [0.22, 1, 0.36, 1] }}
      />

      {theme === "dark" && (
        <div
          className="absolute left-1/2 -translate-x-1/2 top-[10vh] w-[600px] h-[600px] rounded-full blur-[180px] opacity-40 pointer-events-none"
          style={{
            background:
              "radial-gradient(circle at center, rgba(167, 139, 250, 0.5), transparent 70%)",
            zIndex: 1,
          }}
        ></div>
      )}

      {/* Tarjeta de Login */}
      <motion.div
        className="w-full max-w-md px-4 relative z-10"
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
              <Link
                to="/register"
                className="text-violet-600 hover:underline font-medium"
              >
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
              <Checkbox
                label="Recordarme"
                name="remember"
                register={register}
                defaultChecked
              />
              <Link
                to="/forgot"
                className="text-sm text-violet-600 hover:underline"
              >
                He olvidado mi contraseña
              </Link>
            </div>

            <Button type="submit" variant="primary" full disabled={isSubmitting}>
              {isSubmitting ? "Iniciando sesión..." : "Iniciar sesión"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500 mb-3">
              O usa tu cuenta de Google
            </p>
            <div className="flex justify-center">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
              />
            </div>
          </div>
        </AuthCard>
      </motion.div>
    </div>
  );
}
