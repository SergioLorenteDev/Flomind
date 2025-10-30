import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import PageShell from "../components/layout/PageShell.jsx";
import Section from "../components/ui/Section.jsx";
import TemplateCard from "../components/dashboard/TemplateCard.jsx";
import BoardCard from "../components/dashboard/BoardCard.jsx";
import NewBoardModal from "../components/modals/NewBoardModal.jsx";
import { useAuth } from "../modules/auth/AuthContext.jsx";
import { apiFetch } from "../modules/apiClient";

const TEMPLATES = [
  { id: 1, title: "Kanban básico", desc: "Pendiente / En progreso / Hecho" },
  { id: 2, title: "Proyecto simple", desc: "Ideas, Tareas, Revisar, Terminado" },
  { id: 3, title: "Estudios", desc: "Temas, Prácticas, Exámenes" },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();


  const searchParams = new URLSearchParams(location.search);
  const urlQuery = searchParams.get("q") || "";
  const onlyMine = searchParams.get("mine") === "1";

  const [boards, setBoards] = React.useState([]);
  const [search, setSearch] = React.useState(urlQuery);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);


  React.useEffect(() => {
    setSearch(urlQuery);
  }, [urlQuery]);

  // función para pedir tableros
  const fetchBoards = React.useCallback(async () => {
    try {
      setLoading(true);
      const data = await apiFetch("/tableros");
      setBoards(Array.isArray(data) ? data : []);
      setError(null);
    } catch (e) {
      console.error(e);
      setError("No se pudieron cargar los tableros");
      setBoards([]);
    } finally {
      setLoading(false);
    }
  }, []);


  React.useEffect(() => {
    fetchBoards();
  }, [fetchBoards]);


  React.useEffect(() => {

    fetchBoards();
  }, [location.search, fetchBoards]);


  const currentUserId =
    user?.id ??
    user?.idUsuario ??
    user?.id_user ??
    user?.idUsuarioCreador ??
    null;


  const boardsByOwner = React.useMemo(() => {
    if (!onlyMine) return boards;
    if (!currentUserId) return boards;
    return boards.filter(
      (b) =>
        b.idUsuarioCreador === currentUserId ||
        b.ownerId === currentUserId ||
        b.userId === currentUserId
    );
  }, [boards, onlyMine, currentUserId]);

  const boardsToShow = boardsByOwner.filter((b) => {
    const q = search.toLowerCase();
    const name =
      (
        b.name ||
        b.nombre ||
        b.titulo ||
        b.tituloTablero ||
        b.nombreTablero ||
        b.title ||
        ""
      )
        .toString()
        .toLowerCase();
    const desc = (b.description || b.descripcion || "").toString().toLowerCase();

    if (!q) return true; 
    return name.includes(q) || desc.includes(q);
  });

  return (
    <PageShell
      title={onlyMine ? "Mis tableros" : "Tableros"}
      actions={
        <NewBoardModal
          onCreated={async () => {
            await fetchBoards();
          }}
        />
      }
    >
      {/* PLANTILLAS */}
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

      {/* TUS TABLEROS */}
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
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
            }}
            className="rounded-xl border border-brand-100 bg-white text-neutral-800 placeholder-neutral-400
                       dark:bg-[var(--color-brand-50)] dark:text-[var(--color-neutral-950)] dark:placeholder-neutral-300
                       px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-200/70 transition-colors duration-300"
          />
        }
      >
        {loading ? (
          <p className="text-sm text-neutral-500">Cargando tableros...</p>
        ) : error ? (
          <p className="text-sm text-red-500">{error}</p>
        ) : (
          <div className="dashboard-section grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {boardsToShow.length > 0 ? (
              boardsToShow.map((b) => (
                <BoardCard
                  key={b.id || b.idTablero || b.id_tablero}
                  name={
                    b.name ||
                    b.nombre ||
                    b.titulo ||
                    b.tituloTablero ||
                    b.nombreTablero
                  }
                  updatedAt={b.updatedAt || b.fechaActualizacion || ""}
                  onOpen={() =>
                    navigate(`/tablero/${b.id || b.idTablero || b.id_tablero}`)
                  }
                />
              ))
            ) : (
              <p className="text-sm text-neutral-500 col-span-full">
                No se encontraron tableros.
              </p>
            )}
          </div>
        )}
      </Section>
    </PageShell>
  );
}
