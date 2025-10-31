import { useState, useRef, useEffect } from "react";
import { useDroppable } from "@dnd-kit/core";
import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
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
const [dark, setDark] = useState(() => {
  if (typeof document !== "undefined") {
    return document.documentElement.getAttribute("data-theme") === "dark";
  }
  return false;
});


useEffect(() => {
  const applyTheme = () => {

    let currentTheme = document.documentElement.getAttribute("data-theme");
    if (!currentTheme && localStorage.getItem("theme")) {
      currentTheme = localStorage.getItem("theme");
      document.documentElement.setAttribute("data-theme", currentTheme);
    }

    setDark(currentTheme === "dark");
  };
  const timeout = setTimeout(applyTheme, 50);
  const observer = new MutationObserver(() => applyTheme());
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme"],
  });

  return () => {
    clearTimeout(timeout);
    observer.disconnect();
  };
}, []);


  const listKey = String(list.idLista);
  const completedSet =
    completedCards instanceof Set ? completedCards : new Set(completedCards ?? []);
  const [isComposing, setIsComposing] = useState(false);
  const [title, setTitle] = useState("");
  const textareaRef = useRef(null);

  useEffect(() => {
    if (isComposing && textareaRef.current) textareaRef.current.focus();
  }, [isComposing]);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: listKey,
    data: { type: "list", listId: listKey },
  });
  const { setNodeRef: setDroppableRef } = useDroppable({ id: listKey });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.85 : undefined,
  };
  const tarjetas = Array.isArray(cards) ? cards : [];

  const handleSubmit = (e) => {
    e.preventDefault();
    const value = title.trim();
    if (!value) return;
    onAddCard(list.idLista, value);
    setTitle("");
    setIsComposing(false);
  };

  return (
  <div
    ref={setNodeRef}
    style={style}
    className={`list-column board-page flex w-72 flex-shrink-0 flex-col rounded-2xl border shadow-[0_12px_45px_-20px_rgba(0,0,0,0.75)] transition-colors
      ${dark ? "border-[#242430] bg-[#181820] text-white" : "border-[#ddd0ff] bg-[#f5f2ff] text-[#1a1235]"}`}
  >

      <header
        className="mb-3 flex cursor-grab items-start justify-between px-4 pt-3 active:cursor-grabbing"
        {...attributes}
        {...listeners}
      >
        <h4 className={`text-sm font-semibold tracking-wide ${dark ? "text-[#e4e3ff]" : "text-[#3a288e]"}`}>
          {list.nombre}
        </h4>
      </header>

      <SortableContext id={listKey} items={tarjetas.map((c) => String(c.id))} strategy={verticalListSortingStrategy}>
        <div ref={setDroppableRef} className="space-y-3 px-4 pb-1">
          {tarjetas.length === 0 ? (
            <div
              className={`flex h-16 items-center justify-center rounded-xl border text-sm font-medium shadow-inner transition-all
                ${
                  dark
                    ? "border-[#2d2d38] bg-[#181820] text-neutral-400 hover:border-[#7a6dff]/40 hover:shadow-[0_0_12px_-4px_rgba(122,109,255,0.4)]"
                    : "border-[#d9caff] bg-[#f8f5ff] text-[#3d2f8b] hover:border-[#b39bff] hover:shadow-[0_0_10px_-4px_rgba(165,138,255,0.35)]"
                }`}
            >
              No hay tarjetas todavía
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
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Introduce un título o pega un enlace"
              className={`w-full resize-none rounded-xl border px-3 py-2 text-sm placeholder:text-neutral-400 focus:outline-none focus:ring-2 transition
                ${
                  dark
                    ? "border-[#343447] bg-[#1f1f2b] text-white focus:border-[#7f6dff] focus:ring-[#7f6dff]/40"
                    : "border-[#d2c5ff] bg-white text-[#1a1235] focus:border-[#7b61ff] focus:ring-[#a58fff]/30"
                }`}
              disabled={isSavingCard}
            />
            <div className="flex items-center gap-2">
              <Button type="submit" disabled={!title.trim() || isSavingCard}>
                Añadir tarjeta
              </Button>
              <Button type="button" variant="secondary" onClick={() => setIsComposing(false)}>
                Cancelar
              </Button>
            </div>
          </form>
        ) : (
          <button
            onClick={() => setIsComposing(true)}
            className={`inline-flex items-center gap-2 text-sm font-medium transition hover:opacity-80
              ${dark ? "text-[#8f7bff]" : "text-[#6b4cff]"}`}
          >
            <Plus className="h-4 w-4" />
            <span>Añadir una tarjeta</span>
          </button>
        )}
      </div>
    </div>
  );
}
