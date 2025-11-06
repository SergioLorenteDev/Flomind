import React, { useState, useRef, useCallback, useEffect } from "react";
import ReactDOM from "react-dom";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { MoreHorizontal, CheckCircle, Circle } from "lucide-react";

export default function CardItem({
  card,
  listId,
  isComplete,
  onToggleComplete,
  onMenuAction,
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: `card-${card.id}`,
    data: { type: "card", cardId: card.id, listId },
  });

  const itemRef = useRef(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [itemHeight, setItemHeight] = useState(0);

useEffect(() => {
  if (itemRef.current) {
    setItemHeight(itemRef.current.offsetHeight / 2);
  }
}, []);

  const toggleMenu = useCallback(
    (e) => {
      e.stopPropagation();
      e.preventDefault();
      setMenuOpen((v) => !v);
    },
    [setMenuOpen]
  );

  const handleAction = (action) => {
    setMenuOpen(false);
    if (onMenuAction) onMenuAction(action, card);
  };

 const adjustedTransform = transform
  ? {
      ...transform,
      y: transform.y + (itemRef.current?.offsetHeight ?? 0) / 2,
    }
  : null;

const style = {
  transform: adjustedTransform
    ? `translate3d(${adjustedTransform.x}px, ${adjustedTransform.y}px, 0)`
    : undefined,
  transition,
  zIndex: isDragging ? 9999 : "auto",
  opacity: isDragging ? 0.9 : 1,
  pointerEvents: isDragging ? "none" : "auto",
  position: isDragging ? "relative" : "static",
  willChange: "transform, opacity",
};

  const renderMenu = () => {
    if (!menuOpen || !itemRef.current) return null;

    const rect = itemRef.current.getBoundingClientRect();
    const top = rect.bottom + window.scrollY + 6;
    const left = rect.right + window.scrollX - 150;

    return ReactDOM.createPortal(
      <div
        className="fixed z-[9999] w-36 rounded-lg border border-neutral-200 bg-white py-1 shadow-xl"
        style={{ top, left }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={() => handleAction("edit-labels")}
          className="w-full px-3 py-2 text-left text-sm text-neutral-700 hover:bg-neutral-100"
        >
          Editar etiquetas
        </button>
        <button
          onClick={() => handleAction("open-checklist")}
          className="w-full px-3 py-2 text-left text-sm text-neutral-700 hover:bg-neutral-100"
        >
          Abrir checklist
        </button>
      </div>,
      document.body
    );
  };

  return (
    <>
      <div
        ref={(el) => {
          setNodeRef(el);
          itemRef.current = el;
        }}
        style={style}
        {...attributes}
        {...listeners}
        className={`
          group relative overflow-hidden rounded-xl px-4 py-3 mb-3 cursor-pointer
          shadow-sm transition-all duration-200
          bg-[var(--color-surface-hover)]/80 backdrop-blur-sm
          text-[var(--color-neutral-950)]
          hover:bg-[var(--color-surface-hover)]/100 hover:shadow-md
          ${isDragging ? "opacity-40" : ""}
        `}
        data-draggable="card"
      >
        <div className="flex items-start justify-between gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (onToggleComplete) onToggleComplete(card.id);
            }}
            className="text-[var(--color-brand-600)] hover:text-[var(--color-brand-700)] transition"
            aria-label="Marcar como completada"
          >
            {isComplete ? (
              <CheckCircle className="h-5 w-5" />
            ) : (
              <Circle className="h-5 w-5" />
            )}
          </button>

          <div className="flex-1 overflow-hidden">
            <h3
              className={`text-sm font-medium leading-tight truncate ${
                isComplete ? "line-through text-neutral-400" : ""
              }`}
            >
              {card.title || card.nombre || "Tarjeta sin título"}
            </h3>

            {card.label ? (
              <div
                className="mt-1 inline-block rounded-full px-2 py-[2px] text-[10px] font-semibold text-white shadow-sm"
                style={{ backgroundColor: card.label.color }}
              >
                {card.label.text || "Etiqueta"}
              </div>
            ) : null}
          </div>

          <div className="relative">
            <button
              onClick={toggleMenu}
              className="rounded-full p-1 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-800"
              aria-label="Abrir menú de tarjeta"
            >
              <MoreHorizontal className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {renderMenu()}
    </>
  );
}
