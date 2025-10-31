import { Trash2 } from "lucide-react";
import Card from "../ui/Card.jsx";

export default function BoardCard({ name, updatedAt, onOpen, onDelete }) {
  const isInteractive = typeof onOpen === "function";

  const handleKeyDown = (event) => {
    if (!isInteractive) return;

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onOpen?.();
    }
  };

  return (
    <div
      role={isInteractive ? "button" : undefined}
      tabIndex={isInteractive ? 0 : undefined}
      onClick={isInteractive ? onOpen : undefined}
      onKeyDown={handleKeyDown}
      className={[
        "group relative w-full text-left focus:outline-none focus-visible:outline-none",
        "motion-safe:transition-transform motion-safe:duration-200",
        "hover:-translate-y-0.5 hover:scale-[1.015]",
        "focus-visible:ring-2 focus-visible:ring-brand-300 rounded-2xl",
      ].join(" ")}
    >
      {onDelete ? (
        <button
          type="button"
          aria-label="Eliminar tablero"
          onClick={(event) => {
            event.stopPropagation();
            onDelete();
          }}
          className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-[var(--color-brand-600)] shadow-sm opacity-0 scale-95 transition-all duration-150 ease-out group-hover:opacity-100 group-hover:scale-100 group-focus-within:opacity-100 hover:bg-white hover:text-[var(--color-brand-700)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-500)]"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      ) : null}
      <Card className={`p-5${isInteractive ? " cursor-pointer" : ""}`}>
        <div className="h-10 w-10 rounded-lg bg-brand-100 board-icon" />
        <h3 className="mt-3 text-base font-semibold">{name}</h3>
        <p className="mt-1 text-xs text-neutral-600">
          Actualizado {updatedAt}
        </p>
      </Card>
    </div>
  );
}
