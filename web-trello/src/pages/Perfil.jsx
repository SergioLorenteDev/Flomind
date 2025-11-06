import { useState, useEffect,  } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../modules/auth/AuthContext.jsx";
import Button from "../components/ui/Button.jsx";
import { apiFetch } from "../modules/apiClient";


function computeBaseDisplayName(user) {
  if (user?.username && user.username.trim()) return user.username;
  if (user?.name && user.name.trim()) return user.name;

  const email = user?.email || "";
  const base = email.split("@")[0] || "usuario";
  return base.charAt(0).toUpperCase() + base.slice(1);
}

export default function Perfil() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const initial = (user?.email || "U").charAt(0).toUpperCase();

  
  const photoStorageKey = user ? `profilePhoto:${user.id}` : null;
  const usernameStorageKey = user ? `customUsername:${user.id}` : null;

  const [profilePhoto, setProfilePhoto] = useState(null);

  
  const [displayName, setDisplayName] = useState(() => {
    if (!user) return "Usuario";
    if (usernameStorageKey) {
      try {
        const saved = localStorage.getItem(usernameStorageKey);
        if (saved && saved.trim()) return saved;
      } catch {
        /* ignore */
      }
    }
    return computeBaseDisplayName(user);
  });

  
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [usernameDraft, setUsernameDraft] = useState("");
  const [isSavingUsername, setIsSavingUsername] = useState(false);
  const [usernameError, setUsernameError] = useState(null);

  
  useEffect(() => {
    if (!user) {
      setDisplayName("Usuario");
      return;
    }
    if (usernameStorageKey) {
      try {
        const saved = localStorage.getItem(usernameStorageKey);
        if (saved && saved.trim()) {
          setDisplayName(saved);
          return;
        }
      } catch {
        /* ignore */
      }
    }
    setDisplayName(computeBaseDisplayName(user));
  }, [user, usernameStorageKey]);

  
  useEffect(() => {
    if (!photoStorageKey) {
      setProfilePhoto(null);
      return;
    }
    try {
      const saved = localStorage.getItem(photoStorageKey);
      if (saved) setProfilePhoto(saved);
      else setProfilePhoto(null);
    } catch {
      /* ignore */
    }
  }, [photoStorageKey]);

  
  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file || !photoStorageKey) return;

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      setProfilePhoto(result);
      try {
        localStorage.setItem(photoStorageKey, result);
      } catch {
        /* ignore */
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
    setProfilePhoto(null);
    if (photoStorageKey) localStorage.removeItem(photoStorageKey);
  };

  
  const handleStartEditingUsername = () => {
    setUsernameError(null);
    const current =
      (usernameStorageKey && localStorage.getItem(usernameStorageKey)) ||
      user?.username ||
      user?.name ||
      displayName ||
      "";
    setUsernameDraft(current);
    setIsEditingUsername(true);
  };

  const handleCancelEditingUsername = () => {
    setIsEditingUsername(false);
    setUsernameDraft("");
    setUsernameError(null);
  };

  const handleSubmitUsername = async (e) => {
    e.preventDefault();
    const next = usernameDraft.trim();
    if (!next) {
      setUsernameError("El nombre de usuario no puede estar vacío.");
      return;
    }

    try {
      setIsSavingUsername(true);
      setUsernameError(null);

      
      await apiFetch("/usuarios/username", {
        method: "PATCH",
        body: JSON.stringify({ username: next }),
      });

      
      if (usernameStorageKey) {
        try {
          localStorage.setItem(usernameStorageKey, next);
        } catch {
          /* ignore */
        }
      }

   
      setDisplayName(next);

      setIsEditingUsername(false);
      setUsernameDraft("");
    } catch (err) {
      console.error("Error al actualizar el nombre de usuario:", err);
      setUsernameError(
        err?.message || "No se pudo actualizar el nombre de usuario."
      );
    } finally {
      setIsSavingUsername(false);
    }
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
       
        <div className="mb-4">
          <Button variant="secondary" onClick={() => navigate(-1)}>
            ← Volver
          </Button>
        </div>

        
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
          
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
             
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
     
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
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
              <div className="flex items-center justify-between">
                <div className="text-xs uppercase tracking-wide font-semibold text-gray-700 dark:text-neutral-300">
                  Nombre de usuario
                </div>
                {!isEditingUsername && (
                  <button
                    type="button"
                    onClick={handleStartEditingUsername}
                    className="text-xs font-semibold text-[var(--color-brand-600)] hover:underline"
                  >
                    Editar
                  </button>
                )}
              </div>

              {isEditingUsername ? (
                <form
                  onSubmit={handleSubmitUsername}
                  className="mt-2 flex flex-col gap-2"
                >
                  <input
                    type="text"
                    value={usernameDraft}
                    onChange={(e) => setUsernameDraft(e.target.value)}
                    className="
                      w-full rounded-lg border border-neutral-300 
                      bg-white px-3 py-2 text-sm text-neutral-900
                      placeholder:text-neutral-400
                      focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-400)]
                      dark:bg-[var(--color-surface)] dark:border-neutral-600
                      dark:text-neutral-50 dark:placeholder:text-neutral-400
                    "
                    placeholder="Escribe tu nombre de usuario"
                    disabled={isSavingUsername}
                  />
                  {usernameError && (
                    <p className="text-xs text-red-500">{usernameError}</p>
                  )}
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      disabled={isSavingUsername || !usernameDraft.trim()}
                      className="
                        rounded-full bg-[var(--color-brand-600)] px-3 py-1 
                        text-xs font-semibold text-white shadow 
                        hover:bg-[var(--color-brand-700)] disabled:opacity-60
                      "
                    >
                      {isSavingUsername ? "Guardando..." : "Guardar"}
                    </button>
                    <button
                      type="button"
                      onClick={handleCancelEditingUsername}
                      disabled={isSavingUsername}
                      className="
                        rounded-full border border-neutral-300 px-3 py-1 
                        text-xs font-medium text-neutral-700 hover:bg-neutral-100
                        dark:border-neutral-600 dark:text-neutral-200 dark:hover:bg-neutral-800
                      "
                    >
                      Cancelar
                    </button>
                  </div>
                </form>
              ) : (
                <div className="mt-1 text-sm font-medium text-gray-900 dark:text-white break-words">
                  {displayName}
                </div>
              )}
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
