// src/pages/Dashboard.jsx
import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import PageShell from "../components/layout/PageShell.jsx";
import Section from "../components/ui/Section.jsx";
import BoardCard from "../components/dashboard/BoardCard.jsx";
import Button from "../components/ui/Button.jsx";
import { apiFetch } from "../modules/apiClient";

export default function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();

  const searchParams = new URLSearchParams(location.search);
  const urlQuery = searchParams.get("q") || "";

  const [workspaces, setWorkspaces] = React.useState([]);
  const [search, setSearch] = React.useState(urlQuery);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);

  const [isNewWsOpen, setIsNewWsOpen] = React.useState(false);
  const [newWsName, setNewWsName] = React.useState("");
  const [newWsDesc, setNewWsDesc] = React.useState("");
  const [creating, setCreating] = React.useState(false);

  const [wsPendingDeletion, setWsPendingDeletion] = React.useState(null);
  const [isDeletingWs, setIsDeletingWs] = React.useState(false);

  React.useEffect(() => {
    setSearch(urlQuery);
  }, [urlQuery]);

  const fetchWorkspaces = React.useCallback(async () => {
    try {
      setLoading(true);
      const data = await apiFetch("/espacios-trabajo");
      // Orden estable: primero por fecha (asc), si no hay fecha por nombre
      const sorted = Array.isArray(data)
        ? [...data].sort((a, b) => {
            const aDate = a.createdOn ? new Date(a.createdOn).getTime() : 0;
            const bDate = b.createdOn ? new Date(b.createdOn).getTime() : 0;
            if (aDate !== bDate) return aDate - bDate;
            const an = (a.name || "").toLowerCase();
            const bn = (b.name || "").toLowerCase();
            return an.localeCompare(bn, "es");
          })
        : [];
      setWorkspaces(sorted);
      setError(null);
    } catch (err) {
      console.error(err);
      setError("No se pudieron cargar los espacios de trabajo");
      setWorkspaces([]);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchWorkspaces();
  }, [fetchWorkspaces]);

  React.useEffect(() => {
    fetchWorkspaces();
  }, [location.search, fetchWorkspaces]);

  const resolveWsId = React.useCallback(
    (ws) => ws?.id ?? ws?.idEspacio ?? ws?.id_espacio ?? null,
    []
  );

  const resolveWsName = React.useCallback(
    (ws) => ws?.name || "Espacio de trabajo",
    []
  );

  const resolveWsDescription = React.useCallback(
    (ws) => ws?.description || "",
    []
  );

  const filtered = workspaces.filter((ws) => {
    const q = search.toLowerCase();
    const name = (ws.name || "").toLowerCase();
    const desc = (ws.description || "").toLowerCase();
    if (!q) return true;
    return name.includes(q) || desc.includes(q);
  });

  // ----- Crear espacio -----
  const openNewWsModal = React.useCallback(() => {
    setNewWsName("");
    setNewWsDesc("");
    setIsNewWsOpen(true);
  }, []);

  const handleCloseNewWs = React.useCallback(() => {
    if (creating) return;
    setIsNewWsOpen(false);
    setNewWsName("");
    setNewWsDesc("");
  }, [creating]);

  const canCreateWs = newWsName.trim().length > 0 && !creating;

  const handleCreateWs = React.useCallback(async () => {
    if (!canCreateWs) return;
    setCreating(true);
    try {
      const payload = {
        name: newWsName.trim(),
        description: newWsDesc.trim(),
      };
      await apiFetch("/espacios-trabajo", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      setIsNewWsOpen(false);
      setNewWsName("");
      setNewWsDesc("");
      await fetchWorkspaces();
    } catch (err) {
      console.error("No se pudo crear el espacio:", err);
      alert(err.message || "No se pudo crear el espacio");
    } finally {
      setCreating(false);
    }
  }, [canCreateWs, newWsName, newWsDesc, fetchWorkspaces]);

  // ----- Borrar espacio -----
  const requestDeleteWs = React.useCallback((ws) => {
    setWsPendingDeletion(ws);
  }, []);

  const cancelDeleteWs = React.useCallback(() => {
    if (isDeletingWs) return;
    setWsPendingDeletion(null);
  }, [isDeletingWs]);

  const confirmDeleteWs = React.useCallback(async () => {
    if (!wsPendingDeletion) return;
    const wsId = resolveWsId(wsPendingDeletion);
    if (!wsId) return setWsPendingDeletion(null);

    try {
      setIsDeletingWs(true);
      await apiFetch(`/espacios-trabajo/${wsId}`, { method: "DELETE" });
      setWorkspaces((prev) =>
        prev.filter((w) => resolveWsId(w) !== wsId)
      );
      setWsPendingDeletion(null);
    } catch (err) {
      console.error("No se pudo eliminar el espacio:", err);
      alert("No se pudo eliminar el espacio. Inténtalo de nuevo.");
    } finally {
      setIsDeletingWs(false);
    }
  }, [wsPendingDeletion, resolveWsId]);

  return (
    <>
      <PageShell
        title="Mis espacios de trabajo"
        actions={
          <Button
            variant="primary"
            onClick={openNewWsModal}
            className="self-start sm:self-auto"
          >
            + Nuevo espacio
          </Button>
        }
      >
        <Section
          title={
            <div>
              <h2 className="dashboard-section-title">Tus espacios</h2>
              <p className="dashboard-section-subtitle">
                Crea zonas para agrupar tableros de proyectos.
              </p>
            </div>
          }
          right={
            <input
              type="search"
              placeholder="Buscar espacio..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="rounded-xl border border-brand-100 bg-white px-3 py-2 text-sm text-neutral-800 placeholder-neutral-400 outline-none transition-colors duration-300 focus:ring-2 focus:ring-brand-200/70 dark:bg-[var(--color-brand-50)] dark:text-[var(--color-neutral-950)] dark:placeholder-neutral-300"
            />
          }
        >
          {loading ? (
            <p className="text-sm text-neutral-500">Cargando espacios...</p>
          ) : error ? (
            <p className="text-sm text-red-500">{error}</p>
          ) : (
            <div className="dashboard-section grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.length > 0 ? (
                filtered.map((ws, index) => {
                  const wsId = resolveWsId(ws);
                  const key = wsId ?? `ws-${index}`;
                  return (
                    <BoardCard
                      key={key}
                      name={resolveWsName(ws)}
                      description={resolveWsDescription(ws)}   // <- se pinta en la tarjeta
                      updatedAt={ws.createdOn || ws.updatedAt || ""}
                      background={null} // los espacios no tienen fondo
                      onOpen={
                        wsId ? () => navigate(`/espacios-trabajo/${wsId}`) : undefined
                      }
                      onDelete={
                        wsId ? () => requestDeleteWs(ws) : undefined
                      }
                    />
                  );
                })
              ) : (
                <p className="col-span-full text-sm text-neutral-500">
                  No se encontraron espacios.
                </p>
              )}
            </div>
          )}
        </Section>
      </PageShell>

      {/* Modal: Nuevo espacio */}
      {isNewWsOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="new-ws-title"
          onKeyDown={(e) => e.key === "Escape" && handleCloseNewWs()}
        >
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-md transition-opacity"
            onClick={handleCloseNewWs}
          />
          <div
            className="
              relative z-10 w-full max-w-xl rounded-2xl
              bg-[var(--color-surface)] dark:bg-[var(--color-surface-hover)]
              text-[var(--color-neutral-950)] dark:text-[var(--color-neutral-950)]
              border border-[rgba(0,0,0,0.08)] dark:border-[rgba(255,255,255,0.12)]
              shadow-xl transition-colors duration-300
            "
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3 border-b px-5 py-4">
              <div>
                <h2
                  id="new-ws-title"
                  className="text-xl font-bold tracking-tight text-[var(--color-brand-700)] dark:text-[var(--color-brand-300)]"
                >
                  Crear espacio de trabajo
                </h2>
                <p className="text-sm font-medium mt-1 text-[var(--color-brand-500)] dark:text-[var(--color-brand-400)]">
                  Agrupa tableros por equipo o proyecto
                </p>
              </div>
              <button
                className="rounded-lg px-2 py-1 text-neutral-600 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-[var(--color-surface-hover)]"
                onClick={handleCloseNewWs}
                aria-label="Cerrar"
                disabled={creating}
              >
                ✕
              </button>
            </div>

            <div className="space-y-5 p-5">
              <label className="flex flex-col gap-2 text-sm">
                <span className="font-medium text-neutral-900 dark:text-neutral-200">
                  Nombre del espacio
                </span>
                <input
                  value={newWsName}
                  onChange={(e) => setNewWsName(e.target.value)}
                  placeholder="Ej. Equipo Frontend, Producto A, Personal"
                  className="
                    rounded-xl border border-[rgba(0,0,0,0.1)] dark:border-[rgba(255,255,255,0.15)]
                    bg-[var(--color-surface)] dark:bg-[var(--color-surface-hover)]
                    px-3 py-2 outline-none focus:border-[var(--color-brand-500)]
                    transition-colors
                  "
                  disabled={creating}
                />
              </label>

              <label className="flex flex-col gap-2 text-sm">
                <span className="font-medium text-neutral-900 dark:text-neutral-200">
                  Descripción (opcional)
                </span>
                <textarea
                  value={newWsDesc}
                  onChange={(e) => setNewWsDesc(e.target.value)}
                  placeholder="Cuenta para qué usaréis este espacio…"
                  rows={3}
                  className="
                    rounded-xl border border-[rgba(0,0,0,0.1)] dark:border-[rgba(255,255,255,0.15)]
                    bg-[var(--color-surface)] dark:bg-[var(--color-surface-hover)]
                    px-3 py-2 outline-none focus:border-[var(--color-brand-500)]
                    transition-colors
                  "
                  disabled={creating}
                />
              </label>
            </div>

            <div className="flex items-center justify-between border-t border-[rgba(0,0,0,0.08)] dark:border-[rgba(255,255,255,0.12)] px-5 py-4">
              <Button variant="secondary" onClick={handleCloseNewWs} disabled={creating}>
                Cancelar
              </Button>
              <Button variant="primary" onClick={handleCreateWs} disabled={!canCreateWs}>
                {creating ? "Creando..." : "Crear espacio"}
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      {/* Modal: Confirmación borrar espacio */}
      {wsPendingDeletion ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-md px-4">
          <div className="w-full max-w-md rounded-2xl border shadow-xl transition-colors duration-300 bg-[var(--color-surface)] text-[var(--color-neutral-950)] dark:bg-[var(--color-surface-hover)] dark:text-[var(--color-neutral-50)] border-[var(--color-neutral-200)] dark:border-[var(--color-neutral-700)] p-6">
            <h3 className="text-lg font-bold tracking-tight text-[var(--color-brand-700)] dark:text-[var(--color-brand-300)]">
              Eliminar espacio
            </h3>
            <p className="mt-2 text-sm font-medium leading-relaxed text-[var(--color-neutral-700)] dark:text-[var(--color-neutral-300)]">
              ¿Estás seguro de que quieres eliminar{" "}
              <span className="font-semibold text-[var(--color-brand-600)] dark:text-[var(--color-brand-400)]">
                {resolveWsName(wsPendingDeletion)}
              </span>
              ? Esta acción no se puede deshacer. (Se eliminarán también sus tableros)
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={cancelDeleteWs}
                className="rounded-full px-4 py-2 text-sm font-medium border border-[var(--color-neutral-300)] bg-[var(--color-surface)] text-[var(--color-neutral-800)] hover:bg-[var(--color-surface-hover)] dark:border-[var(--color-neutral-600)] dark:bg-[var(--color-surface-hover)] dark:text-[var(--color-neutral-200)] dark:hover:bg-[var(--color-surface)] transition-colors duration-300"
                disabled={isDeletingWs}
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirmDeleteWs}
                className="rounded-full px-4 py-2 text-sm font-semibold shadow bg-[var(--color-brand-600)] text-white hover:bg-[var(--color-brand-700)] dark:bg-[var(--color-brand-500)] dark:hover:bg-[var(--color-brand-400)] disabled:opacity-60 transition-colors duration-300"
                disabled={isDeletingWs}
              >
                {isDeletingWs ? "Eliminando..." : "Eliminar"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
