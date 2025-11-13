import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import PageShell from "../components/layout/PageShell.jsx";
import Section from "../components/ui/Section.jsx";
import Button from "../components/ui/Button.jsx";
import Card from "../components/ui/Card.jsx";
import { apiFetch } from "../modules/apiClient";

export default function WorkspacesPage() {
  const navigate = useNavigate();
  const [workspaces, setWorkspaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  // modal/form simple
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const canCreate = name.trim().length > 0;

  async function load() {
    try {
      setLoading(true);
      const data = await apiFetch("/espacios-trabajo");
      setWorkspaces(Array.isArray(data) ? data : []);
      setErr(null);
    } catch (e) {
      setErr(e.message || "No se pudieron cargar los espacios");
      setWorkspaces([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function createWorkspace() {
    if (!canCreate) return;
    try {
      const created = await apiFetch("/espacios-trabajo", {
        method: "POST",
        body: JSON.stringify({ name: name.trim(), description: description.trim() }),
      });
      // navegar al detalle del nuevo workspace
      navigate(`/espacios-trabajo/${created.id}`);
    } catch (e) {
      alert(e.message || "No se pudo crear el espacio");
    }
  }

  return (
    <PageShell
      title="Espacios de trabajo"
      actions={
        <Button variant="primary" onClick={() => setOpen(true)}>
          + Nuevo espacio
        </Button>
      }
    >
      <Section title="Tus espacios">
        {loading ? (
          <p className="text-sm text-neutral-500">Cargando…</p>
        ) : err ? (
          <p className="text-sm text-red-500">{err}</p>
        ) : workspaces.length === 0 ? (
          <p className="text-sm text-neutral-500">Aún no tienes espacios.</p>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {workspaces.map((ws) => (
              <div
                key={ws.id}
                role="button"
                tabIndex={0}
                onClick={() => navigate(`/espacios-trabajo/${ws.id}`)}
                onKeyDown={(e) => (e.key === "Enter" ? navigate(`/espacios-trabajo/${ws.id}`) : null)}
                className="group relative w-full text-left focus:outline-none"
              >
                <Card className="p-0 overflow-hidden cursor-pointer">
                  <div className="h-20 w-full bg-gradient-to-r from-violet-400/40 to-fuchsia-400/40" />
                  <div className="p-5">
                    <h3 className="text-base font-semibold">{ws.name}</h3>
                    <p className="mt-1 text-xs text-neutral-600">
                      {ws.description?.trim() ? ws.description : "Sin descripción"}
                    </p>
                  </div>
                </Card>
              </div>
            ))}
          </div>
        )}
      </Section>

      {/* Modal muy simple */}
      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />
          <div
            className="relative z-10 w-full max-w-md rounded-2xl bg-[var(--color-surface)] p-5 border"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-bold mb-3">Nuevo espacio</h2>
            <label className="block mb-3 text-sm">
              Nombre
              <input
                className="mt-1 w-full rounded-xl border px-3 py-2"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej. Producto, Marketing, Estudio…"
              />
            </label>
            <label className="block mb-4 text-sm">
              Descripción (opcional)
              <textarea
                className="mt-1 w-full rounded-xl border px-3 py-2"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Breve descripción del espacio…"
              />
            </label>
            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setOpen(false)}>
                Cancelar
              </Button>
              <Button variant="primary" disabled={!canCreate} onClick={createWorkspace}>
                Crear
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </PageShell>
  );
}
