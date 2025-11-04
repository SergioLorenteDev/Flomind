import { useState, useRef, useEffect } from "react";
import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import Button from "../ui/Button.jsx";
import { Plus } from "lucide-react";
import CardItem from "./CardItem.jsx";

export default function ListColumn({
  list,
  cards,
  onAddCard,
  isSavingCard,
  completedCards,
  onToggleCardComplete,
  onCardMenuAction,
}) {
  const listKey = String(list.idLista);

  const completedSet =
    completedCards instanceof Set
      ? completedCards
      : new Set(completedCards ?? []);

  const [isComposing, setIsComposing] = useState(false);
  const [title, setTitle] = useState("");
  const textareaRef = useRef(null);

  useEffect(() => {
    if (isComposing && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isComposing]);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: listKey,
    data: { type: "list", listId: listKey },
  });

  const { setNodeRef: setDroppableRef } = useDroppable({
    id: listKey,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.85 : undefined,
  };

  const tarjetas = Array.isArray(cards) ? cards : [];

  const handleSubmit = (event) => {
    event.preventDefault();
    const value = title.trim();
    if (!value) return;
    onAddCard(list.idLista, value);
    setTitle("");
    setIsComposing(false);
  };

  const handleCancel = () => {
    setTitle("");
    setIsComposing(false);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex w-72 flex-shrink-0 flex-col rounded-2xl border border-[#242430] bg-[#181820] text-white shadow-[0_12px_45px_-20px_rgba(0,0,0,0.75)]"
    >
      <header
        className="mb-3 flex cursor-grab items-start justify-between px-4 pt-3 text-[#e4e3ff] active:cursor-grabbing"
        {...attributes}
        {...listeners}
      >
        <h4 className="text-sm font-semibold tracking-wide">{list.nombre}</h4>
      </header>

      <SortableContext
        id={listKey}
        items={tarjetas.map((card) => String(card.id))}
        strategy={verticalListSortingStrategy}
      >
        <div ref={setDroppableRef} className="space-y-3 px-4 pb-1">
          {tarjetas.length === 0 ? (
            <div className="flex h-16 items-center justify-center rounded-xl border border-dashed border-[#343447] bg-[#1f1f2b] text-sm font-medium text-neutral-300">
              No hay tarjetas todavia
            </div>
          ) : (
            tarjetas.map((card) => (
              <CardItem
                key={card.id}
                card={card}
                listId={list.idLista}
                isComplete={completedSet.has(card.id)}
                onToggleComplete={() => onToggleCardComplete?.(card.id)}
                onMenuAction={(action) => onCardMenuAction?.(action, card)}
              />
            ))
          )}
        </div>
      </SortableContext>

      <div className="px-4 pb-4 pt-1">
        {isComposing ? (
          <form onSubmit={handleSubmit} className="space-y-2">
            <textarea
              ref={textareaRef}
              rows={3}
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Introduce un titulo o pega un enlace"
              className="w-full resize-none rounded-xl border border-[#343447] bg-[#1f1f2b] px-3 py-2 text-sm text-white placeholder:text-neutral-400 focus:border-[#7f6dff] focus:outline-none focus:ring-2 focus:ring-[#7f6dff]/40"
              disabled={isSavingCard}
            />
            <div className="flex items-center gap-2">
              <Button type="submit" disabled={!title.trim() || isSavingCard}>
                Anadir tarjeta
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={handleCancel}
                disabled={isSavingCard}
              >
                Cancelar
              </Button>
            </div>
          </form>
        ) : (
          <button
            type="button"
            onClick={() => setIsComposing(true)}
            className="inline-flex items-center gap-2 text-sm font-medium text-[#8f7bff] transition hover:text-[#b7a9ff]"
          >
            <Plus className="h-4 w-4" />
            <span>Anade una tarjeta</span>
          </button>
        )}
      </div>
    </div>
  );
}
