import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../components/ui/Button.jsx";

export default function Ajustes({ theme, setTheme }) {
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(() => {
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme) return savedTheme === "dark";
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
});

  const [language, setLanguage] = useState("es");
  const [notifications, setNotifications] = useState(true);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("app:settings");
      if (raw) {
        const s = JSON.parse(raw);
        if (typeof s.darkMode === "boolean") setDarkMode(s.darkMode);
        if (typeof s.language === "string") setLanguage(s.language);
        if (typeof s.notifications === "boolean") setNotifications(s.notifications);
      }
    } catch { /* empty */ }
  }, []);

  useEffect(() => {
    const html = document.documentElement;
    if (darkMode) html.classList.add("dark");
    else html.classList.remove("dark");

    const settings = { darkMode, language, notifications };
    localStorage.setItem("app:settings", JSON.stringify(settings));
  }, [darkMode, language, notifications]);
  useEffect(() => {
  // Sincroniza el switch con el tema global de App.jsx
  const isDark = theme === "dark";
  if (isDark !== darkMode) {
    setDarkMode(isDark);
  }
}, [theme]);


  return (
    <section
      className="min-h-screen bg-gradient-to-b from-neutral-50 to-white px-4 py-8"
      style={{ background: "var(--bg)", color: "var(--text)" }}
    >
      <div className="mx-auto w-full max-w-3xl">
        <div className="mb-4">
          <Button variant="secondary" onClick={() => navigate(-1)}>
            ← Volver
          </Button>
        </div>

        <h1 className="text-2xl font-bold mb-4">Ajustes</h1>

        <div
          className="rounded-2xl border bg-white shadow-sm p-5"
          style={{ background: "var(--card)" }}
        >
          {/* Modo oscuro */}
        <div className="flex items-center justify-between py-3 border-b border-neutral-200/60">
         <div>
          <div className="font-medium">Modo oscuro</div>
          <div className="text-sm text-neutral-500">
            Activa el modo oscuro.
          </div>
        </div>

        <label className="inline-flex items-center cursor-pointer" aria-label="Activar modo oscuro">
          <input
            type="checkbox"
            checked={darkMode}
            onChange={(e) => {
  const enabled = e.target.checked;
  setDarkMode(enabled);
  setTheme(enabled ? "dark" : "light"); // 🔄 sincroniza con el global
  document.documentElement.classList.toggle("dark", enabled);
  localStorage.setItem("theme", enabled ? "dark" : "light");
}}

            className="w-5 h-5 accent-[var(--color-brand-600)] cursor-pointer"
    />
  </label>
</div>

          {/* Idioma */}
          <div className="flex items-center justify-between py-3 border-b border-neutral-200/60">
            <div>
              <div className="font-medium">Idioma (más tarde)</div>
              <div className="text-sm text-neutral-500">
                Elige el idioma preferido.
              </div>
            </div>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="rounded-lg border px-3 py-2 text-sm outline-none"
              style={{ background: "var(--card)", color: "var(--text)" }}
              aria-label="Seleccionar idioma"
            >
              <option value="es">Español</option>
              <option value="en">English</option>
            </select>
          </div>

          {/* Notificaciones */}
          <div className="flex items-center justify-between py-3 border-b border-neutral-200/60">
            <div>
              <div className="font-medium">Notificaciones (más tarde)</div>
              <div className="text-sm text-neutral-500">
                Permitir avisos de actividad.
              </div>
            </div>
            <label className="inline-flex items-center cursor-pointer" aria-label="Activar notificaciones">
              <input
                type="checkbox"
                checked={notifications}
                onChange={(e) => setNotifications(e.target.checked)}
              />
            </label>
          </div>

          {/* botones de abajo */}
          <div className="pt-4 flex flex-wrap gap-2">
            <Button
              variant="secondary"
              onClick={() => alert("Aquí abrirías un flujo de cambio de contraseña.")}>
              Cambiar contraseña
            </Button>
            <Button variant="danger" disabled title="Requiere backend">
              Eliminar cuenta
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
