import { useState, useRef, useCallback } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { CheckCircle2, Circle, MoreHorizontal } from "lucide-react";
import CardMenu from "./CardMenu.jsx";

const CARD_PREFIX = "card-";

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