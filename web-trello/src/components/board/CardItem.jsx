import { useState, useRef, useCallback } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { CheckCircle2, Circle, MoreHorizontal } from "lucide-react";
import CardMenu from "./CardMenu.jsx";

export default function CardItem({
  card,
  listId,
  isComplete,
  onToggleComplete,
  onMenuAction,
}) {
  const cardId = String(card.id);
  const listKey = String(listId);

  const [menuOpen, setMenuOpen] = useState(false);
  const [anchorRect, setAnchorRect] = useState(null);
  const itemRef = useRef(null);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({
      id: cardId,
      data: { type: "card", listId: listKey },
    });

  const setRefs = useCallback(
    (node) => {
      setNodeRef(node);
      itemRef.current = node;
    },
    [setNodeRef]
  );

  const theme = document.documentElement.getAttribute("data-theme");
  const dark = theme === "dark";

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 60 : undefined,
    opacity: isDragging ? 0.8 : 1,
  };

  const handleMenuToggle = (e) => {
    e.stopPropagation();
    e.preventDefault();
    if (!menuOpen && itemRef.current) {
      const rect = itemRef.current.getBoundingClientRect();
      setAnchorRect(rect);
    }
    setMenuOpen((v) => !v);
  };

  return (
    <div
      ref={setRefs}
      style={style}
      className={`group relative rounded-2xl border px-3 py-3 text-sm font-medium shadow-md transition-all
        ${dark
          ? "border-[#2a2a35] bg-[#1f1f2b] text-white hover:border-[#6f5fff] hover:shadow-lg"
          : "border-[#e2d6ff] bg-white text-[#1a1235] hover:border-[#8f7bff] hover:shadow-md"}
        ${isDragging ? "scale-[1.02] ring-2 ring-[#7f6dff]/50" : ""}`}
      {...attributes}
      {...listeners}
    >
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleComplete();
          }}
          aria-label={isComplete ? "Marcar como pendiente" : "Marcar como completada"}
          className={`rounded-full transition ${
            dark ? "text-[#a99aff] hover:text-[#cfc3ff]" : "text-[#7b61ff] hover:text-[#5c43e0]"
          }`}
        >
          {isComplete ? (
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          ) : (
            <Circle className="h-4 w-4" />
          )}
        </button>

        <div className="flex-1 pr-6">
          <p
            className={`break-words ${isComplete ? "line-through opacity-60" : ""}`}
          >
            {card.title}
          </p>
          {card.description && (
            <p
              className={`mt-1 text-xs ${
                dark ? "text-neutral-400" : "text-neutral-600"
              } line-clamp-2`}
            >
              {card.description}
            </p>
          )}
        </div>

        <button
          type="button"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={handleMenuToggle}
          className={`rounded-full border border-transparent p-1.5 opacity-0 transition group-hover:translate-x-1 group-hover:opacity-100
            ${dark
              ? "bg-[#2d2d38] text-neutral-300 hover:border-[#4b3acd]/40 hover:bg-[#383846]"
              : "bg-[#f2ecff] text-[#4632c5] hover:border-[#8a78ff]/40 hover:bg-[#ebe3ff]"}`}
          aria-label="Abrir menú de tarjeta"
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
