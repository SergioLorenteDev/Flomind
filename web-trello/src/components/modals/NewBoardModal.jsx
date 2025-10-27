// src/components/modals/NewBoardModal.jsx
import React, { useMemo, useState } from "react";
import Button from "../ui/Button.jsx";
import { useNavigate } from "react-router-dom";

const API_BASE_URL = "http://localhost:8080";
const API_URL = `${API_BASE_URL}/trello/v1/tableros`;

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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  const selected = useMemo(() => TEMPLATES[template], [template]);
  const canCreate = boardName.trim().length > 0 && !loading;

  async function handleCreate() {
    if (!canCreate) return;
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Sesion no valida. Inicia sesion nuevamente.");
      }

      const payload = {
        name: boardName.trim(),
        description: "",
        createdBy: 1,
      };

      const res = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        let message = `Error del servidor: ${res.status}`;
        try {
          const errorBody = await res.json();
          message = errorBody.message || message;
        } catch {
          // ignore parse error
        }
        throw new Error(message);
      }

      const created = await res.json();

      if (selected?.lists?.length) {
        const boardId = created.id;
        const boardNumericId = Number(boardId);
        const boardRefId = Number.isNaN(boardNumericId) ? boardId : boardNumericId;

        for (let index = 0; index < selected.lists.length; index++) {
          const listDefinition = selected.lists[index];
          const listPayload = {
            nombre: listDefinition.name,
            orden: index + 1,
            board: { id: boardRefId },
          };

          const listRes = await fetch(`${API_URL}/${boardId}/listas`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(listPayload),
          });

          if (!listRes.ok) {
            let message = `Error creando la lista "${listDefinition.name}"`;
            try {
              const errorBody = await listRes.json();
              message = errorBody.message || message;
            } catch {
              // ignore parse error
            }
            throw new Error(message);
          }
        }
      }

      onCreated?.(created);

      setOpen(false);
      setBoardName("");
      setTemplate("Plantilla básica");

      navigate(`/tableros/${created.id}`);
    } catch (err) {
      console.error("No se pudo crear el tablero:", err);
      setError(err.message || "No se pudo crear el tablero");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <Button variant="primary" onClick={() => setOpen(true)}>
        + Nuevo tablero
      </Button>

      {open ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          aria-modal="true"
          role="dialog"
          aria-labelledby="new-board-title"
          onKeyDown={(e) => e.key === "Escape" && setOpen(false)}
        >
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-md transition-opacity"
            onClick={() => setOpen(false)}
          />

          <div
            className="relative z-10 w-full max-w-xl rounded-2xl bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
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
                X
              </button>
            </div>

            <div className="space-y-5 p-5">
              {error ? (
                <div className="rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
                  {error}
                </div>
              ) : null}

              <label className="flex flex-col gap-2 text-sm">
                <span className="font-medium text-neutral-900">
                  Nombre de tablero
                </span>
                <input
                  value={boardName}
                  onChange={(e) => setBoardName(e.target.value)}
                  placeholder="Ej. Campaña Q4 / Estudio DAW / Personal"
                  className="rounded-xl border px-3 py-2 outline-none focus:border-neutral-400"
                  disabled={loading}
                />
              </label>

              <label className="flex flex-col gap-2 text-sm">
                <span className="font-medium text-neutral-900">
                  Plantilla seleccionada
                </span>
                <select
                  value={template}
                  onChange={(e) => setTemplate(e.target.value)}
                  className="rounded-xl border px-3 py-2 outline-none focus:border-neutral-400"
                  disabled={loading}
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

              <div className="space-y-3">
                <p className="text-sm font-medium">Se crearán estas listas:</p>

                {selected?.lists?.length ? (
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {selected.lists.map((list, index) => (
                      <div key={index} className="rounded-xl bg-white p-3 shadow-sm">
                        <p className="mb-2 text-sm font-semibold">{list.name}</p>
                        {list.tasks?.length ? (
                          <ul className="space-y-1 text-xs text-neutral-600">
                            {list.tasks.map((task, taskIndex) => (
                              <li key={taskIndex} className="flex items-center gap-2">
                                <span className="inline-block h-1.5 w-1.5 rounded-full bg-neutral-400" />
                                {task}
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

            <div className="flex items-center justify-between border-t px-5 py-4">
              <Button variant="secondary" onClick={() => setOpen(false)} disabled={loading}>
                Cancelar
              </Button>
              <Button variant="primary" onClick={handleCreate} disabled={!canCreate}>
                {loading ? "Creando..." : "Crear tablero"}
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
