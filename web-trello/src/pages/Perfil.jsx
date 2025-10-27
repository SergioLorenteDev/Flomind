import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../modules/auth/AuthContext.jsx";
import Button from "../components/ui/Button.jsx";

export default function Profile() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const displayName = useMemo(() => {
    if (user?.name && user.name.trim()) return user.name;
    const email = user?.email || "";
    const base = email.split("@")[0] || "usuario";
    return base.charAt(0).toUpperCase() + base.slice(1);
  }, [user]);
  const initial = (user?.email || "U").charAt(0).toUpperCase();

  return (
    <section
      className="
        min-h-screen
        bg-[var(--color-surface)]
        text-[var(--color-neutral-950)]
        dark:bg-[var(--color-brand-25)]
        dark:text-[var(--color-neutral-950)]
        px-4 py-8
        transition-colors duration-300
      "
    >
      <div className="mx-auto w-full max-w-3xl">
        {/* Botón volver */}
        <div className="mb-4">
          <Button variant="secondary" onClick={() => navigate(-1)}>
            ← Volver
          </Button>
        </div>

        {/* Tarjeta perfil */}
        <div
          className="
            rounded-2xl border border-black/10
            dark:border-[rgba(255,255,255,0.08)]
            bg-[var(--color-surface)]
            dark:bg-[var(--color-surface)]
            p-6 shadow-sm
            transition-all duration-300
          "
        >
          <div className="flex items-center gap-4">
            <div
              className="
                flex h-14 w-14 items-center justify-center
                rounded-full
                bg-[var(--color-brand-100)]
                dark:bg-[var(--color-brand-500)]
                text-[var(--color-brand-700)]
                dark:text-white
                text-xl font-semibold shadow-sm
              "
            >
              {initial}
            </div>
            <div>
              <h1
              className="text-xl font-bold dark:text-white"
              style={{ color: "rgb(17, 24, 39)" }}
              >
               Perfil
              </h1>
              <p
              className="text-sm dark:text-neutral-300"
              style={{ color: "rgb(55, 65, 81)" }}
              >
              Información de tu cuenta
              </p>
            </div>
          </div>

          {/* Datos usuario */}
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
  {[
    { label: "Nombre", value: displayName },
    { label: "Correo", value: user?.email || "—" },
    { label: "Inicial", value: initial },
  ].map(({ label, value }) => (
    <div
      key={label}
      className="
        rounded-xl border border-black/10 
        dark:border-[rgba(255,255,255,0.08)] 
        bg-white 
        dark:bg-[var(--color-surface-hover)] 
        p-4 transition-colors duration-300 
        hover:shadow-[0_0_10px_rgba(127,86,217,0.15)] 
        dark:hover:shadow-[0_0_14px_rgba(177,151,249,0.35)]
      "
    >
      <div
        className="text-xs uppercase tracking-wide font-semibold text-gray-800 dark:text-neutral-300"
        style={{ color: "rgb(55, 65, 81)" }}
      >
        {label}
      </div>
      <div
        className="mt-1 text-sm font-medium dark:text-neutral-100"
        style={{ color: "rgb(17, 24, 39)" }}
      >
        {value}
      </div>
    </div>
  ))}
</div>

        </div>
      </div>
    </section>
  );
}
