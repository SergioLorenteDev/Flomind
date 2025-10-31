import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../modules/auth/AuthContext.jsx";
import Button from "../components/ui/Button.jsx";

export default function Perfil() {
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
        min-h-screen px-4 py-8 transition-colors duration-300
        bg-[var(--color-surface)] 
        text-[var(--text-base-color)]
      "
    >
      <div className="mx-auto w-full max-w-3xl">
        {/* Botón volver */}
        <div className="mb-4">
          <Button variant="secondary" onClick={() => navigate(-1)}>
            ← Volver
          </Button>
        </div>

        {/* Tarjeta del perfil */}
        <div className="profile-card p-6">

          <div className="flex items-center gap-4">
            {/* Inicial redonda */}
            <div
              className="
                flex h-14 w-14 items-center justify-center
                rounded-full
                text-white text-xl font-semibold shadow-sm
              "
              style={{
                background:
                  "linear-gradient(135deg, var(--color-brand-600) 0%, var(--color-brand-500) 100%)",
              }}
            >
              {initial}
            </div>

            <div className="flex flex-col">
              <h1
                className="text-xl font-bold leading-tight"
                style={{ color: "var(--text-heading-color)" }}
              >
                Perfil
              </h1>
              <p
                className="text-sm font-medium"
                style={{ color: "var(--text-dim-color)" }}
              >
                Información de tu cuenta
              </p>
            </div>
          </div>

          {/* Datos del usuario */}
<div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
  {[
    { label: "Nombre", value: displayName },
    { label: "Correo", value: user?.email || "—" },
    { label: "Inicial", value: initial },
  ].map(({ label, value }) => (
    <div
      key={label}
      className="
        profile-field rounded-xl border p-4
        transition-all duration-300
        shadow-[0_0_6px_rgba(0,0,0,0.04)]
        hover:shadow-[0_0_10px_rgba(127,86,217,0.15)]
      "
      style={{
        backgroundColor: "var(--card-bg-color)",
      }}
    >
      <div
        className="text-xs uppercase tracking-wide font-semibold"
        style={{ color: "var(--text-dim-color)" }}
      >
        {label}
      </div>
      <div
        className="mt-1 text-sm font-semibold"
        style={{ color: "var(--text-base-color)" }}
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
