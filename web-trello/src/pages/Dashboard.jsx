import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import PageShell from "../components/layout/PageShell.jsx";
import Section from "../components/ui/Section.jsx";
import TemplateCard from "../components/dashboard/TemplateCard.jsx";
import BoardCard from "../components/dashboard/BoardCard.jsx";
import Button from "../components/ui/Button.jsx";
import NewBoardModal from "../components/modals/NewBoardModal.jsx";

const TEMPLATES = [
  { id: 1, title: "Kanban básico", desc: "Pendiente / En progreso / Hecho" },
  { id: 2, title: "Proyecto simple", desc: "Ideas, Tareas, Revisar, Terminado" },
  { id: 3, title: "Estudios", desc: "Temas, Prácticas, Exámenes" },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const urlQuery = new URLSearchParams(location.search).get("q") || "";
  const [search, setSearch] = React.useState(urlQuery);

  React.useEffect(() => {
    setSearch(urlQuery);
  }, [urlQuery]);

  const boards = [
    { id: "a", name: "Trabajo", updatedAt: "hace 2 días" },
    { id: "b", name: "Estudios", updatedAt: "hace 5 días" },
    { id: "c", name: "Personal", updatedAt: "ayer" },
  ];

  const filteredBoards = React.useMemo(() => {
    return boards.filter((b) =>
      b.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [boards, search]);

  const [localSearch, setLocalSearch] = React.useState("");

  const locallyFilteredBoards = React.useMemo(() => {
    return filteredBoards.filter((b) =>
      b.name.toLowerCase().includes(localSearch.toLowerCase())
    );
  }, [filteredBoards, localSearch]);

  return (
    <PageShell
      title="Mis tableros"
      actions={
        <NewBoardModal
          onCreated={() => {
            // Aquí puedes refrescar tu listado de tableros si se carga desde API
          }}
        />
      }
    >
      <Section
        title={
          <div>
            <h2 className="dashboard-section-title">
              Comienza con una plantilla
            </h2>
            <p className="dashboard-section-subtitle">
              Crea un tablero listo para usar en segundos.
            </p>
          </div>
        }
      >
        <div className="dashboard-section grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {TEMPLATES.map((t) => (
            <TemplateCard
              key={t.id}
              title={t.title}
              desc={t.desc}
              onUse={() =>
                navigate("/nuevo-tablero", { state: { templateId: t.id } })
              }
            />
          ))}
        </div>
      </Section>

      <Section
        title={
          <div>
            <h2 className="dashboard-section-title">Tus tableros</h2>
            <p className="dashboard-section-subtitle">
              Accede rápidamente a tus proyectos.
            </p>
          </div>
        }
        right={
          <input
            type="search"
            placeholder="Buscar tablero..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            className="rounded-xl border border-brand-100 bg-white text-neutral-800 placeholder-neutral-400
                       dark:bg-[var(--color-brand-50)] dark:text-[var(--color-neutral-950)] dark:placeholder-neutral-300
                       px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-200/70 transition-colors duration-300"
          />
        }
      >
        <div className="dashboard-section grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {locallyFilteredBoards.length > 0 ? (
            locallyFilteredBoards.map((b) => (
              <BoardCard
                key={b.id}
                name={b.name}
                updatedAt={b.updatedAt}
                onOpen={() => navigate(`/tablero/${b.id}`)}
              />
            ))
          ) : (
            <p className="text-sm text-neutral-500 col-span-full">
              No se encontraron tableros.
            </p>
          )}
        </div>
      </Section>
    </PageShell>
  );
}
