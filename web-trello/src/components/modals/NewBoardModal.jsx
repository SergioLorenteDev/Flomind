// src/components/modals/NewBoardModal.jsx
import React, { useMemo, useState } from "react";
import Button from "../ui/Button.jsx";
import { BoardsStore } from "../../features/boards/state/boards.store.js";
import { useNavigate } from "react-router-dom";

// Configuración de plantillas
const TEMPLATES = {
  "Sin plantilla": {
    description: "Empieza desde cero, sin listas iniciales.",
    lists: [],
  },
  "Plantilla básica": {
    description: "3 listas para arrancar rápido.",
    lists: [
      { name: "Pendiente", tasks: ["Tarea 1", "Tarea 2"] },
      { name: "En progreso", tasks: [] },
      { name: "Hecho", tasks: [] },
    ],
  },
  "Proyecto simple": {
    description: "Flujo compacto para proyectos pequeños.",
    lists: [
      { name: "Backlog", tasks: [] },
      { name: "En progreso", tasks: [] },
      { name: "Revisión", tasks: [] },
      { name: "Hecho", tasks: [] },
    ],
  },
  Estudios: {
    description: "Organiza clases, tareas y exámenes.",
    lists: [
      { name: "Asignaturas", tasks: [] },
      { name: "Tareas", tasks: [] },
      { name: "Exámenes", tasks: [] },
      { name: "Hecho", tasks: [] },
    ],
  },
};

export default function NewBoardModal({ onCreated }) {
  const [open, setOpen] = useState(false);
  const [boardName, setBoardName] = useState("");
  const [template, setTemplate] = useState("Plantilla básica");
  const [loading, setLoading] = useState(false); // ⬅️ nuevo

  const navigate = useNavigate(); // ⬅️ nuevo

  const selected = useMemo(() => TEMPLATES[template], [template]);
  const canCreate = boardName.trim().length > 0 && !loading; // ⬅️ actualizado

  async function handleCreate() {
    if (!canCreate) return;
    setLoading(true);
    try {
      // Mapear desde TEMPLATES a formato del store
      const lists = (selected?.lists || []).map((l) => ({
        name: l.name,
        cards: (l.tasks || []).map((t) => ({ title: t })),
      }));

      // Crear el tablero en el store local
      const created = BoardsStore.createBoard({
        name: boardName.trim(),
        lists, // si "Sin plantilla", será []
      });

      // Notificar al Dashboard para refrescar
      onCreated?.(created);

      // Cerrar y resetear
      setOpen(false);
      setBoardName("");
      setTemplate("Plantilla básica");

      // Redirigir a la página del tablero
      navigate(`/boards/${created.id}`);
    } catch (e) {
      alert("No se pudo crear el tablero");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      {/* Botón en el Dashboard */}
      <Button variant="primary" onClick={() => setOpen(true)}>
        + Nuevo tablero
      </Button>

      {/* Overlay + Modal */}
      {open ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          aria-modal="true"
          role="dialog"
          aria-labelledby="new-board-title"
          onKeyDown={(e) => e.key === "Escape" && setOpen(false)}
        >
          {/* Fondo blur */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-md transition-opacity"
            onClick={() => setOpen(false)}
          />

          {/* Contenedor del modal (sin borde, con sombra estilo tarjeta) */}
          <div
            className="relative z-10 w-full max-w-xl rounded-2xl bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-3 border-b px-5 py-4">
              <div>
                <h2 id="new-board-title" className="text-lg font-semibold">
                  Creación de tableros
                </h2>
                <p className="text-sm text-neutral-600">
                  Configura un tablero nuevo
                </p>
              </div>
              <button
                className="rounded-lg px-2 py-1 text-neutral-600 hover:bg-neutral-100"
                onClick={() => setOpen(false)}
                aria-label="Cerrar"
              >
                ✕
              </button>
            </div>

            {/* Body */}
            <div className="space-y-5 p-5">
              {/* Nombre */}
              <label className="flex flex-col gap-2 text-sm">
                <span className="font-medium text-neutral-900">
                  Nombre de tablero
                </span>
                <input
                  value={boardName}
                  onChange={(e) => setBoardName(e.target.value)}
                  placeholder="Ej. Campaña Q4 / Estudio DAW / Personal"
                  className="rounded-xl border px-3 py-2 outline-none focus:border-neutral-400"
                />
              </label>

              {/* Plantilla */}
              <label className="flex flex-col gap-2 text-sm">
                <span className="font-medium text-neutral-900">
                  Plantilla seleccionada
                </span>
                <select
                  value={template}
                  onChange={(e) => setTemplate(e.target.value)}
                  className="rounded-xl border px-3 py-2 outline-none focus:border-neutral-400"
                >
                  {Object.keys(TEMPLATES).map((key) => (
                    <option key={key} value={key}>
                      {key}
                    </option>
                  ))}
                </select>
                <span className="text-xs text-neutral-600">
                  {selected?.description}
                </span>
              </label>

              {/* Preview de listas a crear */}
              <div className="space-y-3">
                <p className="text-sm font-medium">Se crearán estas listas:</p>

                {selected?.lists?.length ? (
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {selected.lists.map((list, i) => (
                      <div key={i} className="rounded-xl p-3 bg-white shadow-sm">
                        <p className="mb-2 text-sm font-semibold">{list.name}</p>
                        {list.tasks?.length ? (
                          <ul className="space-y-1 text-xs text-neutral-600">
                            {list.tasks.map((t, idx) => (
                              <li key={idx} className="flex items-center gap-2">
                                <span className="inline-block h-1.5 w-1.5 rounded-full bg-neutral-400" />
                                {t}
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-xs text-neutral-500">
                            (Sin tareas iniciales)
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-neutral-500">
                    (No se crearán listas automáticamente)
                  </p>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between border-t px-5 py-4">
              <Button variant="secondary" onClick={() => setOpen(false)}>
                Cancelar
              </Button>
              <Button
                variant="primary"
                onClick={handleCreate}
                disabled={!canCreate}
              >
                {loading ? "Creando..." : "Crear tablero"}
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
