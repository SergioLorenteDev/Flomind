import { useForm } from "react-hook-form";
import { Link, useLocation, useNavigate } from "react-router-dom";
import AuthCard from "../components/ui/AuthCard.jsx";
import Input from "../components/ui/Input.jsx";
import Checkbox from "../components/ui/Checkbox.jsx";
import Button from "../components/ui/Button.jsx";
import { useAuth } from "../modules/auth/AuthContext.jsx";
import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";

export default function Login() {
  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const { state } = useLocation();
  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm({
    defaultValues: { remember: true },
  });

  // Login normal
  async function onSubmit({ email, password, remember }) {
    try {
      await login(email, password, remember);
      navigate(state?.from?.pathname || "/dashboard", { replace: true });
    } catch (err) {
      alert(err.message);
    }
  }

  // Login Google
  const handleGoogleSuccess = (credentialResponse) => {
    const decoded = jwtDecode(credentialResponse.credential);
    console.log("Usuario Google:", decoded);
    loginWithGoogle(decoded);
    navigate("/dashboard", { replace: true });
  };

  const handleGoogleError = () => {
    alert("Error al iniciar sesión");
  };

  return (
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

      {/* Botón login con Google */}
      <div className="mt-6 text-center">
        <p className="text-sm text-gray-500 mb-3">O usa tu cuenta de Google</p>
        <div className="flex justify-center">
          <GoogleLogin onSuccess={handleGoogleSuccess} onError={handleGoogleError} />
        </div>
      </div>
    </AuthCard>
  );
}
