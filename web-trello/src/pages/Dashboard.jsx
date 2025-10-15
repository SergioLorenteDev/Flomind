// src/pages/Dashboard.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../modules/auth/AuthContext.jsx";
import Button from "../components/ui/Button.jsx";

const TEMPLATES = [
  { id: 1, title: "Kanban básico", desc: "Pendiente / En progreso / Hecho" },
  { id: 2, title: "Proyecto simple", desc: "Ideas, Tareas, Revisar, Terminado" },
  { id: 3, title: "Estudios", desc: "Temas, Prácticas, Exámenes" },
];

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const initial = (user?.email || "U").charAt(0).toUpperCase();

  function handleLogout() {
    signOut();
    navigate("/login", { replace: true });
  }

  return (
    <section className="min-h-screen bg-gradient-to-b from-neutral-50 to-white px-4 py-8">
      <div className="mx-auto w-full max-w-5xl">


        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

{/*avatar*/}
            <div className="flex items-center gap-3">
              <div className="relative">
                <button
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-violet-100 text-violet-700 font-semibold"
                  onClick={() => setMenuOpen(!menuOpen)}
                  aria-haspopup="menu"
                  aria-expanded={menuOpen}
                  title="Cuenta"
                >
                  {initial}
                </button>

                {menuOpen && (
                  <div
                    role="menu"
                    className="absolute right-0 z-10 mt-2 w-44 rounded-xl border bg-white p-1 shadow-lg"
                  >
                    <MenuItem onClick={() => { setMenuOpen(false); navigate("/perfil"); }}>
                      Ver perfil
                    </MenuItem>
                    <MenuItem onClick={() => { setMenuOpen(false); navigate("/ajustes"); }}>
                      Ajustes
                    </MenuItem>
                    <MenuItem danger onClick={handleLogout}>
                      Cerrar sesión
                    </MenuItem>
                  </div>
                )}
              </div>

              <h1 className="text-xl font-bold">Dashboard</h1>
            </div>

            {/* Acciones */}
            <div className="flex flex-wrap gap-2">
              <Button onClick={() => navigate("/tableros/nuevo")}>Crear tablero</Button>
              <Button variant="secondary" onClick={() => navigate("/tableros")}>
                Ver tableros
              </Button>
            </div>
          </div>
        </div>

        {/*  plantillas */}
        <section className="mt-8">
          <h2 className="mb-3 text-lg font-semibold">Plantillas</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {TEMPLATES.map(t => (
              <TemplateCard
                key={t.id}
                title={t.title}
                desc={t.desc}
                onUse={() => navigate(`/tableros/nuevo?plantilla=${t.id}`)}
              />
            ))}
          </div>
        </section>

      </div>
    </section>
  );
}

/* Subcomponentes */
function MenuItem({ children, onClick, danger }) {
  const dangerClasses = danger ? "text-red-600 hover:bg-red-50" : "";
  return (
    <button
      role="menuitem"
      onClick={onClick}
      className={`w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-neutral-100 ${dangerClasses}`}
    >
      {children}
    </button>
  );
}

function TemplateCard({ title, desc, onUse }) {
  return (
    <div className="rounded-2xl border bg-white p-5 shadow-sm">
      <div className="h-10 w-10 rounded-lg bg-violet-100" />
      <h3 className="mt-3 text-base font-semibold">{title}</h3>
      <p className="mt-1 text-sm text-neutral-600">{desc}</p>
      <Button variant="secondary" className="mt-4" onClick={onUse}>
        Usar plantilla
      </Button>
    </div>
  );
}
