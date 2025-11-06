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
      className={`group relative overflow-hidden rounded-2xl border border-transparent bg-[#22222c] px-3 py-3 shadow-md transition hover:border-[#4b3acd]/40 hover:shadow-lg ${
        isDragging ? "border-[#7f6dff]/60 shadow-[#6b4dff]/50" : ""
      }`}
      {...attributes}
      {...listeners}
    >
      {labelColor ? (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-1"
          style={{ backgroundColor: labelColor }}
        />
      ) : null}
      <div className="flex items-center gap-3 text-white">
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onToggleComplete();
          }}
          aria-label={
            isComplete ? "Marcar como pendiente" : "Marcar como completada"
          }
          className="rounded-full text-[#9b8cff] transition hover:text-[#cdbfff]"
        >
          {isComplete ? (
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          ) : (
            <Circle className="h-4 w-4" />
          )}
        </button>

        <div className="flex-1 pr-6 text-sm font-medium text-white">
          {card.title}
          {card.description && (
            <p className="mt-1 text-xs font-normal text-neutral-300 line-clamp-2">
              {card.description}
            </p>
          )}
        </div>

        <button
          type="button"
          onPointerDown={(event) => event.stopPropagation()}
          onClick={handleMenuToggle}
          className="rounded-full border border-transparent bg-[#2d2d38] p-1.5 text-neutral-300 opacity-0 transition group-hover:translate-x-1 group-hover:opacity-100 hover:border-[#4b3acd]/40 hover:bg-[#383846]"
          aria-label="Abrir menu de tarjeta"
        >
          <MoreHorizontal className="h-3.5 w-3.5" />
        </button>
      </div>

      {menuOpen && anchorRect && (
        <CardMenu
          anchorRect={anchorRect}
          onClose={() => setMenuOpen(false)}
          onAction={(action) => {
            onMenuAction?.(action, card);
            setMenuOpen(false);
          }}
        />
      )}
    </div>
  );
}
