import React, { useEffect, useMemo, useState } from "react";
import Button from "../ui/Button.jsx";
import { useNavigate } from "react-router-dom";

const API_BASE_URL = "http://localhost:8080";
const API_URL = `${API_BASE_URL}/trello/v1/tableros`;

const TEMPLATES = {
  "Sin plantilla": {
    description: "Empieza desde cero, sin listas iniciales.",
    lists: [],
  },
  "Plantilla basica": {
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

function NewBoardModal({
  onCreated,
  open,
  onOpenChange,
  initialTemplate = "Sin plantilla",
  showTriggerButton = true,
}) {
  const navigate = useNavigate();

  const isControlled = typeof open === "boolean";
  const [internalOpen, setInternalOpen] = useState(false);
  const isOpen = isControlled ? open : internalOpen;

  const [boardName, setBoardName] = useState("");
  const [template, setTemplate] = useState(initialTemplate);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const setOpenState = (value) => {
    if (!isControlled) setInternalOpen(value);
    onOpenChange?.(value);
  };

  useEffect(() => {
    if (isOpen) {
      setTemplate(initialTemplate);
      setBoardName("");
      setError(null);
      setLoading(false);
    }
  }, [initialTemplate, isOpen]);

  const resetForm = (nextTemplate = initialTemplate) => {
    setBoardName("");
    setTemplate(nextTemplate);
    setError(null);
    setLoading(false);
  };

  const openModal = () => {
    resetForm(initialTemplate);
    setOpenState(true);
  };

  const forceClose = () => {
    resetForm(initialTemplate);
    setOpenState(false);
  };

  const handleCancel = () => {
    if (!loading) forceClose();
  };

  const selected = useMemo(
    () => TEMPLATES[template] || TEMPLATES["Sin plantilla"],
    [template],
  );
  const canCreate = boardName.trim().length > 0 && !loading;

  async function handleCreate() {
    if (!canCreate) return;
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Sesión no válida. Inicia sesión nuevamente.");

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
          /* ignore parse error */
        }
        throw new Error(message);
      }

      const created = await res.json();

      // Crear listas según la plantilla seleccionada
      if (selected?.lists?.length) {
        const boardId = created.id;
        const boardNumericId = Number(boardId);
        const boardRefId = Number.isNaN(boardNumericId)
          ? boardId
          : boardNumericId;

        for (let index = 0; index < selected.lists.length; index += 1) {
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
              /* ignore parse error */
            }
            throw new Error(message);
          }
        }
      }

      onCreated?.(created);
      forceClose();
      navigate(`/tableros/${created.id}`);
    } catch (err) {
      console.error("No se pudo crear el tablero:", err);
      setError(err.message || "No se pudo crear el tablero");
    } finally {
      setLoading(false);
    }
  }

  // 🔦 Detección del modo oscuro
  const [isDark, setIsDark] = useState(
    document.documentElement.classList.contains("dark")
  );

  useEffect(() => {
    const observer = new MutationObserver(() => {
      const darkActive = document.documentElement.classList.contains("dark");
      setIsDark(darkActive);
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  // 🌙 Render
  return (
    <div>
      {showTriggerButton ? (
        <Button
          variant="primary"
          onClick={openModal}
          className="self-start sm:self-auto"
        >
          + Nuevo tablero
        </Button>
      ) : null}

      {isOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          aria-modal="true"
          role="dialog"
          aria-labelledby="new-board-title"
          onKeyDown={(event) => event.key === "Escape" && handleCancel()}
        >
          {/* FONDO OSCURO */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={handleCancel}
          />

          {/* CONTENEDOR DEL MODAL */}
          <div
            className={`relative z-10 w-full max-w-xl rounded-2xl shadow-2xl border transition-colors duration-300 ${
              isDark
                ? "bg-gray-900 border-gray-700 text-gray-100"
                : "bg-white border-gray-200 text-gray-900"
            }`}
            onClick={(event) => event.stopPropagation()}
          >
            {/* HEADER */}
            <div
              className={`flex items-start justify-between gap-3 border-b px-5 py-4 ${
                isDark ? "border-gray-700" : "border-gray-200"
              }`}
            >
              <div>
                <h2
  id="new-board-title"
  className={`text-lg font-semibold ${
    isDark ? "text-purple-400" : "text-purple-800"
  }`}
>
  Creación de tableros
</h2>

<p
  className={`text-sm ${
    isDark ? "text-purple-300" : "text-purple-700"
  }`}
>
  Configura un tablero nuevo
</p>


              </div>
              <button
                className={`rounded-lg px-2 py-1 transition-colors ${
                  isDark
                    ? "text-gray-400 hover:bg-gray-800"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
                onClick={handleCancel}
                aria-label="Cerrar"
                disabled={loading}
              >
                ✕
              </button>
            </div>

            {/* CUERPO */}
            <div className="space-y-5 p-5">
              {error && (
                <div
                  className={`rounded-lg border px-3 py-2 text-sm ${
                    isDark
                      ? "border-red-600 bg-red-900/40 text-red-300"
                      : "border-red-300 bg-red-50 text-red-700"
                  }`}
                >
                  {error}
                </div>
              )}

              {/* Campo nombre */}
              <label className="flex flex-col gap-2 text-sm">
                <span
  className={`font-medium ${
    isDark ? "text-purple-400" : "text-purple-800"
  }`}
>
  Nombre de tablero
</span>


                <input
                  value={boardName}
                  onChange={(event) => setBoardName(event.target.value)}
                  placeholder="Ej. Campaña Q4 / Estudio DAW / Personal"
                  className={`rounded-xl border px-3 py-2 outline-none transition-colors ${
                    isDark
                      ? "bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-gray-500"
                      : "bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-gray-400"
                  }`}
                  disabled={loading}
                />
              </label>

              {/* Plantilla */}
              <label className="flex flex-col gap-2 text-sm">
                <span
  className={`font-medium ${
    isDark ? "text-purple-400" : "text-purple-800"
  }`}
>
  Plantilla seleccionada
</span>


                <select
                  value={template}
                  onChange={(event) => setTemplate(event.target.value)}
                  className={`rounded-xl border px-3 py-2 outline-none transition-colors ${
                    isDark
                      ? "bg-gray-800 border-gray-700 text-white focus:border-gray-500"
                      : "bg-white border-gray-300 text-gray-900 focus:border-gray-400"
                  }`}
                  disabled={loading}
                >
                  {Object.keys(TEMPLATES).map((key) => (
                    <option key={key} value={key}>
                      {key}
                    </option>
                  ))}
                </select>
                <span
                  className={`text-xs ${
                    isDark ? "text-gray-500" : "text-gray-600"
                  }`}
                >
                  {selected?.description}
                </span>
              </label>

              {/* Listas */}
              <div className="space-y-3">
                <p
  className={`text-sm font-medium ${
    isDark ? "text-purple-400" : "text-purple-800"
  }`}
>
  Se crearán estas listas:
</p>



                {selected?.lists?.length ? (
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {selected.lists.map((list, index) => (
                      <div
                        key={`${list.name}-${index}`}
                        className={`rounded-xl p-3 shadow-sm transition-colors ${
                          isDark
                            ? "bg-gray-800 border border-gray-700"
                            : "bg-white border border-gray-200"
                        }`}
                      >
                        <p className="mb-2 text-sm font-semibold">
                          {list.name}
                        </p>
                        {list.tasks?.length ? (
                          <ul
                            className={`space-y-1 text-xs ${
                              isDark ? "text-gray-400" : "text-gray-600"
                            }`}
                          >
                            {list.tasks.map((task) => (
                              <li key={task} className="flex items-center gap-2">
                                <span
                                  className={`inline-block h-1.5 w-1.5 rounded-full ${
                                    isDark ? "bg-gray-500" : "bg-gray-400"
                                  }`}
                                />
                                {task}
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p
                            className={`text-xs ${
                              isDark ? "text-gray-500" : "text-gray-500"
                            }`}
                          >
                            (Sin tareas iniciales)
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p
                    className={`text-xs ${
                      isDark ? "text-gray-500" : "text-gray-500"
                    }`}
                  >
                    (No se crearán listas automáticamente)
                  </p>
                )}
              </div>
            </div>

            {/* FOOTER */}
            <div
              className={`flex items-center justify-between border-t px-5 py-4 ${
                isDark ? "border-gray-700" : "border-gray-200"
              }`}
            >
              <Button
                variant="secondary"
                onClick={handleCancel}
                disabled={loading}
                className={isDark ? "bg-gray-700 text-white hover:bg-gray-600" : ""}
              >
                Cancelar
              </Button>
              <Button
  variant="confirm"
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

export default NewBoardModal;
