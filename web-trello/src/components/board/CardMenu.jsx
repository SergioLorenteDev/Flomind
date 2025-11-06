import { useState, useRef, useCallback } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { CheckCircle2, Circle, MoreHorizontal } from "lucide-react";
import CardMenu from "./CardMenu.jsx";

<<<<<<< HEAD
const CARD_PREFIX = "card-";
=======
const MENU_OPTIONS = [
  { id: "edit-labels", label: "Editar etiquetas" },
  {
    id: "change-members",
    label: "Cambiar miembros",
    disabled: true,
    hint: "En desarrollo",
  },
  { id: "edit-dates", label: "Editar fechas" },
  { id: "move", label: "Mover" },
  { id: "copy-card", label: "Copiar tarjeta" },
  { id: "copy-link", label: "Copiar enlace" },
  { id: "archive", label: "Archivar" },
  { id: "delete-card", label: "Eliminar", danger: true },
];
>>>>>>> 9f65021 (Opciones Tarjetas)

export default function CardItem({
  card,
  listId,
  isComplete,
  onToggleComplete,
  onMenuAction,
}) {
  const cardId = String(card.id);
  const cardSortableId = `${CARD_PREFIX}${cardId}`;
  const listKey = String(listId);
  const labelColor = card?.label?.color ?? null;

  const [menuOpen, setMenuOpen] = useState(false);
  const [anchorRect, setAnchorRect] = useState(null);
  const itemRef = useRef(null);

<<<<<<< HEAD
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: cardSortableId,
    data: { type: "card", listId: listKey, cardId },
  });

  const setRefs = useCallback(
    (node) => {
      setNodeRef(node);
      itemRef.current = node;
    },
    [setNodeRef]
=======
    document.addEventListener("pointerdown", handleClickOutside, true);
    window.addEventListener("keydown", handleEsc);
    return () => {
      document.removeEventListener("pointerdown", handleClickOutside, true);
      window.removeEventListener("keydown", handleEsc);
    };
  }, [onClose]);

  if (!anchorRect) return null;

  const top = anchorRect.top + window.scrollY;
  const left = anchorRect.right + 12 + window.scrollX;
  const isDark = document.documentElement.classList.contains("dark");

  return createPortal(
    <div className={isDark ? "dark" : ""}>
      <div
        ref={menuRef}
        className="
          fixed z-50 w-52 rounded-3xl overflow-hidden border shadow-2xl
          bg-[var(--color-surface)] text-[var(--color-neutral-950)] border-[rgba(0,0,0,0.1)]
          dark:bg-[var(--color-surface-hover)] dark:text-[var(--color-neutral-950)] dark:border-[rgba(255,255,255,0.1)]
        "
        style={{ top, left }}
      >
        <ul className="py-2">
          {MENU_OPTIONS.map((option) => {
            const isDisabled = Boolean(option.disabled);
            return (
              <li key={option.id}>
                <button
                  type="button"
                  onClick={() => {
                    if (!isDisabled) onAction?.(option.id);
                  }}
                  disabled={isDisabled}
                  className={[
                    "w-full px-4 py-2 text-left transition",
                    isDisabled
                      ? "cursor-not-allowed bg-transparent text-neutral-500 dark:text-neutral-500"
                      : option.danger
                        ? "text-red-500 hover:bg-red-500/10 hover:text-red-600 dark:hover:bg-red-400/15 dark:hover:text-red-300"
                        : "hover:bg-[var(--color-brand-500)]/15 hover:text-[var(--color-brand-700)] dark:hover:bg-[var(--color-brand-500)]/25 dark:hover:text-[var(--color-brand-300)]",
                  ].join(" ")}
                >
                  <span className="block text-sm font-medium">
                    {option.label}
                  </span>
                  {option.hint ? (
                    <span className="text-xs text-neutral-400 dark:text-neutral-500">
                      {option.hint}
                    </span>
                  ) : null}
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>,
    document.body
>>>>>>> 9f65021 (Opciones Tarjetas)
  );

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 60 : undefined,
    opacity: isDragging ? 0 : 1,
  };

  const handleMenuToggle = (event) => {
    event.stopPropagation();
    event.preventDefault();
    if (!menuOpen && itemRef.current) {
      const rect = itemRef.current.getBoundingClientRect();
      setAnchorRect({
        top: rect.top,
        right: rect.right,
        bottom: rect.bottom,
        left: rect.left,
        width: rect.width,
        height: rect.height,
      });
    }
    setMenuOpen((value) => !value);
  };

  return (
    <div
  ref={setRefs}
  data-draggable="card"
  style={style}
  className={`group relative overflow-hidden rounded-2xl border border-transparent
    bg-[var(--color-surface)] text-[var(--color-neutral-950)]
    px-3 py-3 shadow-md transition-colors duration-300
    hover:border-[var(--color-brand-500)]/40 hover:shadow-lg
    ${isDragging ? "card--dragging" : ""}`}
  {...attributes}
  {...listeners}
>


  {labelColor && (
    <span
      aria-hidden="true"
      className="pointer-events-none absolute inset-x-0 top-0 h-1"
      style={{ backgroundColor: labelColor }}
    />
  )}

  <div className="flex items-center gap-3">
    <button
      type="button"
      onClick={(event) => {
        event.stopPropagation();
        onToggleComplete();
      }}
      aria-label={
        isComplete ? "Marcar como pendiente" : "Marcar como completada"
      }
      className="rounded-full text-[var(--color-brand-500)] transition hover:text-[var(--color-brand-600)]"
    >
      {isComplete ? (
        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
      ) : (
        <Circle className="h-4 w-4" />
      )}
    </button>

    <div className="flex-1 pr-6 text-sm font-medium">
      {card.title}
      {card.description && (
        <p className="mt-1 text-xs font-normal text-[var(--color-neutral-950)]/70 dark:text-[var(--color-neutral-950)]/85 line-clamp-2">
          {card.description}
        </p>
      )}
    </div>
  </div>
</div>
  );
}