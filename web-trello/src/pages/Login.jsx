import { useForm } from "react-hook-form";
import { Link, useLocation, useNavigate } from "react-router-dom";
import AuthCard from "../components/ui/AuthCard.jsx";
import Input from "../components/ui/Input.jsx";
import Checkbox from "../components/ui/Checkbox.jsx";
import Button from "../components/ui/Button.jsx";
import { useAuth } from "../modules/auth/AuthContext.jsx";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const { state } = useLocation();
  const { register, handleSubmit, formState: { isSubmitting } } = useForm({
    defaultValues: { remember: true },
  });

  async function onSubmit({ email, password, remember }) {
    try {
      await login(email, password, remember);
      navigate(state?.from?.pathname || "/dashboard", { replace: true });
    } catch (err) {
      alert(err.message);
    }
  }

  return (
    <AuthCard
      title="Bienvenido"
      subtitle="Inicia sesión para continuar."
      footer={<p>¿No tienes una cuenta? Registrate! <Link to="/register" className="text-violet-600 hover:underline">Crea una cuenta</Link></p>}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input label="Email" type="email" name="email" placeholder="Introduce tu correo electrónico" register={register} required />
        <Input label="Contraseña" type="password" name="password" placeholder="Introduce tu contraseña" register={register} required />

        <div className="flex items-center justify-between">
          <Checkbox label="Recordarme" name="remember" register={register} defaultChecked />
          <Link to="/forgot" className="text-sm text-violet-600 hover:underline">He olvidado la contraseña</Link>
        </div>

        <Button type="submit" variant="primary" full disabled={isSubmitting}>
          {isSubmitting ? "Signing in..." : "Iniciar sesión"}
        </Button>
      </form>

      
    </AuthCard>
  );
}
