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
    title: "Kanban básico",
    desc: "Pendiente / En progreso / Hecho",
    templateKey: "Plantilla básica",
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
    desc: "Temas, Prácticas, Exámenes",
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

 
  const currentUserId = React.useMemo(() => {
    if (user?.id == null) return null;
    const parsed = Number(user.id);
    return Number.isNaN(parsed) ? null : parsed;
  }, [user?.id]);

  const resolveBoardId = React.useCallback(
    (board) => board?.id ?? board?.idTablero ?? board?.id_tablero ?? null,
    []
  );

  const resolveBoardName = React.useCallback(
    (board) => board?.name || "Este tablero",
    []
  );


  const boardsByOwner = React.useMemo(() => {
    if (!currentUserId) return boards;

    return boards.filter((b) => {
  
      const ownerRaw = b?.idUsuarioCreador ?? b?.ownerId ?? b?.createdBy;
      if (ownerRaw == null) return false; 

      const ownerId = Number(ownerRaw);
      if (Number.isNaN(ownerId)) return false;

      return ownerId === currentUserId;
    });
  }, [boards, currentUserId]);

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
        prev.filter((board) => resolveBoardId(board) !== boardId)
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
        title="Mis tableros"
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
                Accede rápidamente a tus proyectos.
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
                      background={board.background}
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
  <div
    className="
      fixed inset-0 z-50 flex items-center justify-center
      bg-black/40 backdrop-blur-md px-4
    "
  >
    <div
      className="
        w-full max-w-md rounded-2xl border shadow-xl transition-colors duration-300
        bg-[var(--color-surface)] text-[var(--color-neutral-950)]
        dark:bg-[var(--color-surface-hover)] dark:text-[var(--color-neutral-50)]
        border-[var(--color-neutral-200)] dark:border-[var(--color-neutral-700)]
        p-6 backdrop-blur-md
      "
    >
      <h3
        className="
          text-lg font-bold tracking-tight
          text-[var(--color-brand-700)] dark:text-[var(--color-brand-300)]
          transition-colors duration-300
        "
      >
        Eliminar tablero
      </h3>

      <p
        className="
          mt-2 text-sm font-medium leading-relaxed
          text-[var(--color-neutral-700)] dark:text-[var(--color-neutral-300)]
          transition-colors duration-300
        "
      >
        ¿Estás seguro de que quieres eliminar{" "}
        <span className="font-semibold text-[var(--color-brand-600)] dark:text-[var(--color-brand-400)]">
          {resolveBoardName(boardPendingDeletion)}
        </span>
        ? Esta acción no se puede deshacer.
      </p>

      <div className="mt-6 flex justify-end gap-3">
        <button
          type="button"
          onClick={handleCancelDeleteBoard}
          className="
            rounded-full px-4 py-2 text-sm font-medium
            border border-[var(--color-neutral-300)] bg-[var(--color-surface)]
            text-[var(--color-neutral-800)] hover:bg-[var(--color-surface-hover)]
            dark:border-[var(--color-neutral-600)] dark:bg-[var(--color-surface-hover)]
            dark:text-[var(--color-neutral-200)] dark:hover:bg-[var(--color-surface)]
            transition-colors duration-300
          "
          disabled={isDeletingBoard}
        >
          Cancelar
        </button>

        <button
          type="button"
          onClick={handleConfirmDeleteBoard}
          className="
            rounded-full px-4 py-2 text-sm font-semibold shadow
            bg-[var(--color-brand-600)] text-white hover:bg-[var(--color-brand-700)]
            dark:bg-[var(--color-brand-500)] dark:hover:bg-[var(--color-brand-400)]
            disabled:opacity-60 transition-colors duration-300
          "
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
