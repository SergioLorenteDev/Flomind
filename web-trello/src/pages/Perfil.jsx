import { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../modules/auth/AuthContext.jsx";
import Button from "../components/ui/Button.jsx";

export default function Perfil() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Nombre "bonito" por defecto
  const displayName = useMemo(() => {
    if (user?.name && user.name.trim()) return user.name;
    const email = user?.email || "";
    const base = email.split("@")[0] || "usuario";
    return base.charAt(0).toUpperCase() + base.slice(1);
  }, [user]);

  const initial = (user?.email || "U").charAt(0).toUpperCase();

  // Foto de perfil guardada en localStorage por id de usuario
  const storageKey = user ? `profilePhoto:${user.id}` : null;
  const [profilePhoto, setProfilePhoto] = useState(null);

  // Cargar foto del localStorage al entrar
  useEffect(() => {
    if (!storageKey) {
      setProfilePhoto(null);
      return;
    }
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) setProfilePhoto(saved);
      else setProfilePhoto(null);
    } catch {
      /* ignore */
    }
  }, [storageKey]);

  // Subir foto de perfil (solo frontend)
  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file || !storageKey) return;

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      setProfilePhoto(result);
      try {
        localStorage.setItem(storageKey, result);
      } catch {
        /* ignore */
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
    setProfilePhoto(null);
    if (storageKey) localStorage.removeItem(storageKey);
  };

  return (
    <section
      className="
        min-h-screen px-4 py-8 transition-colors duration-300
        bg-[var(--color-brand-25)] text-[var(--color-neutral-950)]
        dark:bg-[var(--color-surface)] dark:text-[var(--color-neutral-50)]
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
        <div
          className="
            rounded-2xl border border-black/10
            dark:border-[rgba(255,255,255,0.08)]
            bg-[var(--color-surface)]
            dark:bg-[var(--color-surface-hover)]
            shadow-[0_0_6px_rgba(0,0,0,0.05)]
            dark:shadow-[0_0_8px_rgba(255,255,255,0.05)]
            p-6 transition-all duration-300
          "
        >
          {/* Cabecera */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              {/* Foto de perfil */}
              <div
                className="
                  h-16 w-16 rounded-full overflow-hidden
                  bg-[var(--color-brand-100)] dark:bg-[var(--color-brand-500)]
                  flex items-center justify-center shadow-sm
                "
              >
                {profilePhoto ? (
                  <img
                    src={profilePhoto}
                    alt={displayName}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span
                    className="
                      text-2xl font-semibold
                      text-[var(--color-brand-700)] dark:text-white
                    "
                  >
                    {initial}
                  </span>
                )}
              </div>

              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                  Perfil
                </h1>
                <p className="text-sm text-gray-600 dark:text-neutral-300">
                  Información de tu cuenta
                </p>
              </div>
            </div>

            {/* Controles foto */}
            <div className="flex flex-col gap-2 text-sm">
              <label className="inline-flex cursor-pointer items-center gap-2">
                <span
                  className="
                    rounded-full px-3 py-1 text-xs font-semibold shadow-md hover:shadow-lg
                    bg-[var(--color-brand-100)] text-[var(--color-brand-700)] hover:bg-[var(--color-brand-200)]
                    dark:bg-[var(--color-brand-600)] dark:text-white dark:hover:bg-[var(--color-brand-700)]
                    transition-all duration-200
                  "
                >
                  Cambiar foto
                </span>

                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="hidden"
                />
              </label>

              {profilePhoto && (
                <button
                  type="button"
                  onClick={handleRemovePhoto}
                  className="self-start text-xs text-red-500 hover:underline"
                >
                  Quitar foto
                </button>
              )}
            </div>
          </div>

          {/* Datos del usuario */}
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Nombre */}
            <div
              className="
                rounded-xl border border-black/10 
                dark:border-[rgba(255,255,255,0.08)]
                bg-[var(--color-brand-25)]
                dark:bg-[var(--color-surface-hover)]
                p-4 transition-colors duration-300 
                hover:shadow-[0_0_10px_rgba(127,86,217,0.15)]
                dark:hover:shadow-[0_0_14px_rgba(177,151,249,0.35)]
              "
            >
              <div className="text-xs uppercase tracking-wide font-semibold text-gray-700 dark:text-neutral-300">
                Nombre
              </div>
              <div className="mt-1 text-sm font-medium text-gray-900 dark:text-white break-words">
                {displayName}
              </div>
            </div>

            {/* Correo */}
            <div
              className="
                rounded-xl border border-black/10 
                dark:border-[rgba(255,255,255,0.08)]
                bg-[var(--color-brand-25)]
                dark:bg-[var(--color-surface-hover)]
                p-4 transition-colors duration-300 
                hover:shadow-[0_0_10px_rgba(127,86,217,0.15)]
                dark:hover:shadow-[0_0_14px_rgba(177,151,249,0.35)]
              "
            >
              <div className="text-xs uppercase tracking-wide font-semibold text-gray-700 dark:text-neutral-300">
                Correo
              </div>
              <div className="mt-1 text-sm font-medium text-gray-900 dark:text-white break-words">
                {user?.email || "—"}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
