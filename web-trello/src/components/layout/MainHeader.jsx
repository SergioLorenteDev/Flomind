import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function MainHeader() {
  console.log("✅ MainHeader montado correctamente");
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-40 bg-brand-600 text-white shadow-lg transition duration-300 dark:bg-[var(--color-neutral-950)] dark:text-white">
      <div className="mx-auto max-w-7xl px-6 py-3 flex items-center justify-between">
        {/* Logo + título */}
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/dashboard")}>
          <img src="/src/assets/logo@2xdashboard2.png" alt="Flomind" className="h-11 w-auto" />
          <span className="text-lg font-semibold tracking-wide hidden sm:inline">Flomind</span>
        </div>

        {/* Buscador */}
        <div className="hidden md:flex flex-1 justify-center">
          <input
            type="search"
            placeholder="Buscar tableros, listas o tareas..."
            className="w-full max-w-md rounded-xl bg-white/20 px-4 py-2 text-sm text-white placeholder:text-white/70 outline-none focus:bg-white/25 focus:ring-2 focus:ring-white/40 transition"
          />
        </div>

        {/* Menú de usuario */}
        <div className="relative">
          <button
            onClick={() => setMenuOpen((prev) => !prev)}
            className="flex items-center gap-2 bg-white text-sm font-semibold text-[var(--brand-600)] rounded-full px-3 py-1 shadow hover:bg-white/90 transition"
          >
            Mi cuenta
            <span className="text-xs ml-1">S</span>
          </button>

          {menuOpen && (
            <div className="absolute right-0 mt-2 w-40 bg-white rounded-xl shadow-xl z-50 overflow-hidden dark:bg-[var(--color-neutral-900)]">
              <button
                className="w-full px-4 py-2 text-left text-sm hover:bg-purple-50 dark:hover:bg-purple-900/30"
                onClick={() => navigate("/perfil")}
              >
                Perfil
              </button>
              <button
                className="w-full px-4 py-2 text-left text-sm hover:bg-purple-50 dark:hover:bg-purple-900/30"
                onClick={() => navigate("/ajustes")}
              >
                Ajustes
              </button>
              <button
                className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30"
                onClick={() => navigate("/login")}
              >
                Cerrar sesión
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
