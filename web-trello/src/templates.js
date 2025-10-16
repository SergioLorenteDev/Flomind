export const TEMPLATES = {
  "1": {
    id: "1",
    title: "Kanban básico",
    desc: "Pendiente / En progreso / Hecho",
    name: "Kanban básico",
    lists: [
      { name: "Pendiente", cards: ["Tarea de ejemplo 1", "Tarea de ejemplo 2"] },
      { name: "En progreso", cards: [] },
      { name: "Hecho", cards: [] },
    ],
  },
  "2": {
    id: "2",
    title: "Proyecto simple",
    desc: "Ideas, Tareas, Revisar, Terminado",
    name: "Proyecto simple",
    lists: [
      { name: "Ideas", cards: ["Idea 1", "Idea 2"] },
      { name: "Tareas", cards: [] },
      { name: "Revisar", cards: [] },
      { name: "Terminado", cards: [] },
    ],
  },
  "3": {
    id: "3",
    title: "Estudios",
    desc: "Temas, Prácticas, Exámenes",
    name: "Estudios",
    lists: [
      { name: "Temas", cards: ["Tema 1", "Tema 2"] },
      { name: "Prácticas", cards: [] },
      { name: "Exámenes", cards: [] },
    ],
  },
};
export default TEMPLATES;