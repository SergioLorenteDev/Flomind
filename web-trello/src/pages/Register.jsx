import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import AuthCard from "../components/ui/AuthCard.jsx";
import Input from "../components/ui/Input.jsx";
import Button from "../components/ui/Button.jsx";
import { useAuth } from "../modules/auth/AuthContext.jsx";

export default function Register() {
  const { register: createUser } = useAuth();
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { isSubmitting } } = useForm();

  async function onSubmit({ email, password }) {
    try {
      await createUser(email, password);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      alert(err.message);
    }
  }

 return (
  <main className="min-h-screen flex items-center justify-center bg-[var(--color-brand-50)] dark:bg-[var(--color-brand-25)] transition-colors duration-300">
    <AuthCard
      title="Crea una cuenta"
      subtitle="Únete a nosotros en 1 minuto"
      footer={
        <p>
          ¿Ya tienes una cuenta?{" "}
          <Link
            to="/login"
            className="text-[var(--color-brand-600)] hover:underline"
          >
            Inicia sesión
          </Link>
        </p>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Email"
          type="email"
          name="email"
          placeholder="Introduce tu email"
          register={register}
        />
        <Input
          label="Contraseña"
          type="password"
          name="password"
          placeholder="Crea una contraseña"
          register={register}
        />
        <Button type="submit" variant="primary" full disabled={isSubmitting}>
          {isSubmitting ? "Creando..." : "Crear cuenta"}
        </Button>
      </form>
    </AuthCard>
  </main>
);

}
