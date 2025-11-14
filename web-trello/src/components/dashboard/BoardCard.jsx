import { Trash2 } from "lucide-react";
import Card from "../ui/Card.jsx";
import { boardBackgroundToStyle } from "../../constants/boardBackgrounds.js";


export default function BoardCard({
  name,
  description,        
  updatedAt,
  background,
  onOpen,
  onDelete,
  hasExpiredTasks = false,
}) {
  const isInteractive = typeof onOpen === "function";
  const coverStyle = boardBackgroundToStyle(background);
  const alertStyle = hasExpiredTasks
  ? "ring-2 ring-red-400 animate-pulse"
  : "";

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
        "group relative w-full h-full text-left focus:outline-none focus-visible:outline-none",
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
          className="
            absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center
            rounded-full bg-white/90 text-[var(--color-brand-600)] shadow-sm
            opacity-0 scale-95 transition-all duration-150 ease-out
            group-hover:opacity-100 group-hover:scale-100 group-focus-within:opacity-100
            hover:bg-white hover:text-[var(--color-brand-700)]
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-500)]
          "
        >
          <Trash2 className="h-4 w-4" />
        </button>
      ) : null}

      <Card className={["overflow-hidden p-0 h-full flex flex-col"].join(" ")}>
        {/* Cover con el fondo */}
        <div className="h-24 w-full" style={coverStyle} aria-hidden="true" />

        {/* Contenido */}
        <div className="p-5 flex flex-col flex-1">
          <h3 className="text-base font-semibold">{name}</h3>

          {/* Descripción: reservamos SIEMPRE espacio de 2 líneas */}
          {description ? (
            <p
              className="mt-1 text-xs text-neutral-700 dark:text-neutral-300 overflow-hidden"
              style={{
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                minHeight: "32px", // ≈ 2 líneas de text-xs
              }}
              title={description}
            >
              {description}
            </p>
          ) : (
            // Placeholder invisible para que todas midan igual
            <p
              className="mt-1 text-xs opacity-0 select-none"
              style={{ minHeight: "32px" }}
              aria-hidden="true"
            >
              &nbsp;
            </p>
          )}

          <p className="mt-auto text-[11px] text-neutral-500">
            {updatedAt ? `Actualizado ${updatedAt}` : "\u00A0"}
          </p>
        </div>
      </Card>
    </div>
  );
}
