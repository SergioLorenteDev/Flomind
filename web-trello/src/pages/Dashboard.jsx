import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import PageShell from "../components/layout/PageShell.jsx";
import Section from "../components/ui/Section.jsx";
import TemplateCard from "../components/dashboard/TemplateCard.jsx";
import BoardCard from "../components/dashboard/BoardCard.jsx";
import NewBoardModal from "../components/modals/NewBoardModal.jsx";
import Button from "../components/ui/Button.jsx";
import { useAuth } from "../modules/auth/AuthContext.jsx";
import { apiFetch } from "../modules/apiClient";

const TEMPLATES = [
  {
    id: 1,
    title: "Kanban basico",
    desc: "Pendiente / En progreso / Hecho",
    templateKey: "Plantilla basica",
  },
  {
    id: 2,
    title: "Proyecto simple",
    desc: "Ideas, Tareas, Revisar, Terminado",
    templateKey: "Proyecto simple",
  },
  {
    id: 3,
    title: "Estudios",
    desc: "Temas, Practicas, Examenes",
    templateKey: "Estudios",
  },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  console.log("USER:", user);

  const searchParams = new URLSearchParams(location.search);
  const urlQuery = searchParams.get("q") || "";
  const onlyMine = searchParams.get("mine") === "1";

  const [boards, setBoards] = React.useState([]);
  const [search, setSearch] = React.useState(urlQuery);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  const [newBoardTemplate, setNewBoardTemplate] = React.useState("Sin plantilla");
  const [isNewBoardOpen, setIsNewBoardOpen] = React.useState(false);
  const [boardPendingDeletion, setBoardPendingDeletion] = React.useState(null);
  const [isDeletingBoard, setIsDeletingBoard] = React.useState(false);


  React.useEffect(() => {
    setSearch(urlQuery);
  }, [urlQuery]);

 
  const fetchBoards = React.useCallback(async () => {
    try {
      setLoading(true);
      const data = await apiFetch("/tableros");
      console.log("TABLEROS QUE VIENEN DEL BACK:", data);
      if (Array.isArray(data) && data.length > 0) {
        console.log("TABLERO:", data[0]);
        console.log("CLAVES:", Object.keys(data[0]));
      }
      setBoards(Array.isArray(data) ? data : []);
      setError(null);
    } catch (err) {
      console.error(err);
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

 
  const currentUserId = user?.id ?? null;

  const resolveBoardId = React.useCallback(
    (board) => board?.id ?? board?.idTablero ?? board?.id_tablero ?? null,
    [],
  );

 
  const resolveBoardName = React.useCallback(
    (board) => board?.name || "Este tablero",
    [],
  );


  const boardsByOwner = React.useMemo(() => {
    if (!onlyMine) return boards;
    if (!currentUserId) return boards;

    return boards.filter((b) => b.createdBy === currentUserId);
  }, [boards, onlyMine, currentUserId]);


  const boardsToShow = boardsByOwner.filter((b) => {
    const q = search.toLowerCase();
    const name = (b.name || "").toLowerCase();
    const desc = (b.description || "").toLowerCase();

    if (!q) return true; 
    return name.includes(q) || desc.includes(q);
  });

  const openNewBoardModal = React.useCallback((templateKey = "Sin plantilla") => {
    setNewBoardTemplate(templateKey);
    setIsNewBoardOpen(true);
  }, []);

  const handleModalOpenChange = React.useCallback((nextOpen) => {
    setIsNewBoardOpen(nextOpen);
    if (!nextOpen) {
      setNewBoardTemplate("Sin plantilla");
    }
  }, []);

  const handleRequestDeleteBoard = React.useCallback((board) => {
    setBoardPendingDeletion(board);
  }, []);

  const handleCancelDeleteBoard = React.useCallback(() => {
    if (isDeletingBoard) return;
    setBoardPendingDeletion(null);
  }, [isDeletingBoard]);

  const handleConfirmDeleteBoard = React.useCallback(async () => {
    if (!boardPendingDeletion) return;
    const boardId = resolveBoardId(boardPendingDeletion);
    if (!boardId) {
      setBoardPendingDeletion(null);
      return;
    }

    try {
      setIsDeletingBoard(true);
      await apiFetch(`/tableros/${boardId}`, { method: "DELETE" });
      setBoards((prev) =>
        prev.filter((board) => resolveBoardId(board) !== boardId),
      );
      setBoardPendingDeletion(null);
    } catch (err) {
      console.error("No se pudo eliminar el tablero:", err);
      alert("No se pudo eliminar el tablero. Intentalo de nuevo.");
    } finally {
      setIsDeletingBoard(false);
    }
  }, [boardPendingDeletion, resolveBoardId]);

  return (
    <>
      <PageShell
        title={onlyMine ? "Mis tableros" : null}
        actions={
          <Button
            variant="primary"
            onClick={() => openNewBoardModal("Sin plantilla")}
            className="self-start sm:self-auto"
          >
            + Nuevo tablero
          </Button>
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
          <div className="dashboard-section grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {TEMPLATES.map((template) => (
              <TemplateCard
                key={template.id}
                title={template.title}
                desc={template.desc}
                onUse={() => openNewBoardModal(template.templateKey)}
              />
            ))}
          </div>
        </Section>

        <Section
          title={
            <div>
              <h2 className="dashboard-section-title">Tus tableros</h2>
              <p className="dashboard-section-subtitle">
                Accede rapidamente a tus proyectos.
              </p>
            </div>
          }
          right={
            <input
              type="search"
              placeholder="Buscar tablero..."
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
              }}
              className="rounded-xl border border-brand-100 bg-white px-3 py-2 text-sm text-neutral-800 placeholder-neutral-400 outline-none transition-colors duration-300 focus:ring-2 focus:ring-brand-200/70 dark:bg-[var(--color-brand-50)] dark:text-[var(--color-neutral-950)] dark:placeholder-neutral-300"
            />
          }
        >
          {loading ? (
            <p className="text-sm text-neutral-500">Cargando tableros...</p>
          ) : error ? (
            <p className="text-sm text-red-500">{error}</p>
          ) : (
            <div className="dashboard-section grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {boardsToShow.length > 0 ? (
                boardsToShow.map((board, index) => {
                  const boardId = resolveBoardId(board);
                  const key = boardId ?? `board-${index}`;
                  return (
                    <BoardCard
                      key={key}
                      name={resolveBoardName(board)}
                      updatedAt={board.createdOn || board.updatedAt || ""}
                      onOpen={
                        boardId
                          ? () => navigate(`/tableros/${boardId}`) 
                          : undefined
                      }
                      onDelete={
                        boardId ? () => handleRequestDeleteBoard(board) : undefined
                      }
                    />
                  );
                })
              ) : (
                <p className="col-span-full text-sm text-neutral-500">
                  No se encontraron tableros.
                </p>
              )}
            </div>
          )}
        </Section>
      </PageShell>

      <NewBoardModal
        onCreated={async () => {
          await fetchBoards();
        }}
        open={isNewBoardOpen}
        onOpenChange={handleModalOpenChange}
        initialTemplate={newBoardTemplate}
        showTriggerButton={false}
      />

      {boardPendingDeletion ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-neutral-900">
              Eliminar tablero
            </h3>
            <p className="mt-2 text-sm text-neutral-600">
              Estas seguro de que quieres eliminar{" "}
              <span className="font-semibold text-[var(--color-brand-600)]">
                {resolveBoardName(boardPendingDeletion)}
              </span>
              ? Esta accion no se puede deshacer.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={handleCancelDeleteBoard}
                className="rounded-full border border-neutral-200 px-4 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-100"
                disabled={isDeletingBoard}
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteBoard}
                className="rounded-full bg-[var(--color-brand-600)] px-4 py-2 text-sm font-semibold text-white shadow hover:bg-[var(--color-brand-700)] disabled:opacity-60"
                disabled={isDeletingBoard}
              >
                {isDeletingBoard ? "Eliminando..." : "Eliminar"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
