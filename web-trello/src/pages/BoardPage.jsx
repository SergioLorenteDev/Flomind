import React, {
  useEffect,
  useState,
  useCallback,
  useRef,
} from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { createPortal } from "react-dom";
import {
  DndContext,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors,
  DragOverlay,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  horizontalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Pencil, Check, X, Loader2, Plus } from "lucide-react";
import Button from "../components/ui/Button.jsx";
import ListColumn from "../components/board/ListColumn.jsx";
import { apiFetch } from "../modules/apiClient";
import { useAuth } from "../modules/auth/AuthContext.jsx";
import logo from "../assets/Logo dashboard2.png";

const SCROLLBAR_STYLE = `
.board-scroll::-webkit-scrollbar { display: none; }
.board-scroll { -ms-overflow-style: none; scrollbar-width: none; }
`;

const normalizeCards = (items) =>
  items.map((card, index) => ({ ...card, cardOrder: index }));

const toKey = (value) =>
  value === null || value === undefined ? undefined : String(value);

export default function BoardPage() {
  const { boardId } = useParams();
  const navigate = useNavigate();

  const [board, setBoard] = useState(null);
  const [lists, setLists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [listName, setListName] = useState("");
  const [isAddingList, setIsAddingList] = useState(false);
  const [cardsByListId, setCardsByListId] = useState({});
  const [creatingCardFor, setCreatingCardFor] = useState(null);
  const [completedCards, setCompletedCards] = useState(() => new Set());
  const [activeCard, setActiveCard] = useState(null);
  const [activeList, setActiveList] = useState(null);
  const [selectedCard, setSelectedCard] = useState(null);
  const [isChecklistOpen, setIsChecklistOpen] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState("");
  const [isSavingTitle, setIsSavingTitle] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } })
  );

  const fetchBoardAndLists = useCallback(async () => {
    if (!boardId) {
      setError("ID de tablero no proporcionado.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const [boardData, listsData] = await Promise.all([
        apiFetch(`/tableros/${boardId}`),
        apiFetch(`/tableros/${boardId}/listas`),
      ]);
      setBoard(boardData);

      const sortedLists = (Array.isArray(listsData) ? listsData : []).sort(
        (a, b) => (a.orden ?? 0) - (b.orden ?? 0)
      );
      setLists(sortedLists);

      const cardsEntries = await Promise.all(
        sortedLists.map(async (list) => {
          const cards = await apiFetch(`/listas/${list.idLista}/tarjetas`);
          const sortedCards = normalizeCards(
            (Array.isArray(cards) ? cards : []).sort(
              (a, b) =>
                (a.cardOrder ?? a.order ?? 0) -
                (b.cardOrder ?? b.order ?? 0)
            )
          ).map((card) => ({ ...card, listId: list.idLista }));
          return [String(list.idLista), sortedCards];
        })
      );

      setCardsByListId(Object.fromEntries(cardsEntries));
    } catch (e) {
      console.error("Error fetching board, lists or cards:", e);
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [boardId]);

  useEffect(() => {
    fetchBoardAndLists();
  }, [fetchBoardAndLists]);

  const handleCreateCard = async (listId, title) => {
    if (!title.trim()) return;
    try {
      setCreatingCardFor(listId);
      const newCard = await apiFetch(`/listas/${listId}/tarjetas`, {
        method: "POST",
        body: JSON.stringify({
          title,
          description: "",
          cardOrder: cardsByListId[listId]?.length ?? 0,
        }),
      });

      setCardsByListId((prev) => {
        const next = { ...prev };
        const updated = normalizeCards(
          [...(next[listId] || []), { ...newCard, listId }]
        );
        next[listId] = updated;
        return next;
      });
    } catch (e) {
      console.error("Error al crear tarjeta:", e);
      setError(`No se pudo crear la tarjeta: ${e.message}`);
    } finally {
      setCreatingCardFor(null);
    }
  };

  const handleToggleCardComplete = (cardId) => {
    setCompletedCards((prev) => {
      const next = new Set(prev);
      if (next.has(cardId)) next.delete(cardId);
      else next.add(cardId);
      return next;
    });
  };


  const handleCardMenuAction = (action, card) => {
    setSelectedCard(card);
    setIsChecklistOpen(true);
  };

  const reorderLists = (activeId, overId) => {
    const activeKey = toKey(activeId);
    const overKey = toKey(overId);
    if (!activeKey || !overKey) return;

    setLists((prev) => {
      const oldIndex = prev.findIndex(
        (list) => toKey(list.idLista) === activeKey
      );
      const newIndex = prev.findIndex(
        (list) => toKey(list.idLista) === overKey
      );
      if (oldIndex === -1 || newIndex === -1 || oldIndex === newIndex) {
        return prev;
      }

      const reordered = arrayMove(prev, oldIndex, newIndex).map(
        (list, index) => ({
          ...list,
          orden: index,
        })
      );

      (async () => {
        try {
          await Promise.all(
            reordered.map((list, index) =>
              apiFetch(`/tableros/listas/${list.idLista}`, {
                method: "PUT",
                body: JSON.stringify({ nombre: list.nombre, orden: index }),
              })
            )
          );
        } catch (e) {
          console.error("Error al reordenar las listas:", e);
          setError(`Error al reordenar listas: ${e.message}`);
          fetchBoardAndLists();
        }
      })();

      return reordered;
    });
  };

  const findContainer = useCallback(
    (id) => {
      const key = toKey(id);
      if (!key) return undefined;
      if (cardsByListId[key]) return key;

      return Object.keys(cardsByListId).find((listId) =>
        (cardsByListId[listId] || []).some(
          (card) => toKey(card.id) === key
        )
      );
    },
    [cardsByListId]
  );

  const handleDragStart = ({ active }) => {
    const activeData = active.data.current;
    if (activeData?.type === "card") {
      const sourceContainer = activeData.listId
        ? toKey(activeData.listId)
        : findContainer(toKey(active.id));
      const card =
        sourceContainer != null
          ? (cardsByListId[sourceContainer] || []).find(
              (c) => toKey(c.id) === toKey(active.id)
            )
          : null;
      setActiveCard(card ?? null);
      setActiveList(null);
      return;
    }

    if (activeData?.type === "list") {
      const list =
        lists.find((l) => toKey(l.idLista) === toKey(active.id)) ?? null;
      setActiveList(list);
      setActiveCard(null);
      return;
    }

    setActiveCard(null);
    setActiveList(null);
  };

  const resetDragOverlay = () => {
    setActiveCard(null);
    setActiveList(null);
  };

  const handleDragEnd = async ({ active, over }) => {
    resetDragOverlay();
    if (!over) return;

    const activeData = active.data.current;
    const overData = over.data.current;

    // mover listas
    if (activeData?.type === "list" && (overData?.type === "list" || !overData)) {
      reorderLists(active.id, over.id);
      return;
    }

    // mover tarjetas
    if (activeData?.type !== "card") return;

    const activeId = toKey(active.id);
    const sourceContainer = activeData.listId
      ? toKey(activeData.listId)
      : findContainer(activeId);
    const overContainer =
      overData?.type === "list"
        ? toKey(over.id)
        : findContainer(toKey(overData?.listId ?? over.id));

    if (!sourceContainer || !overContainer) return;

    const sourceCards = cardsByListId[sourceContainer] || [];
    const sourceItems = [...sourceCards];
    const destinationItems =
      sourceContainer === overContainer
        ? sourceItems
        : [...(cardsByListId[overContainer] || [])];

    const activeIndex = sourceCards.findIndex(
      (card) => toKey(card.id) === activeId
    );
    if (activeIndex === -1) return;

    const overIndexOriginal =
      overData?.type === "card" && sourceContainer === overContainer
        ? sourceCards.findIndex(
            (card) => toKey(card.id) === toKey(over.id)
          )
        : -1;

    const [movedCard] = sourceItems.splice(activeIndex, 1);

    let destinationIndex;
    if (overData?.type === "card" && overContainer === String(overData.listId)) {
      destinationIndex = destinationItems.findIndex(
        (card) => toKey(card.id) === toKey(over.id)
      );
      if (destinationIndex === -1) {
        destinationIndex = destinationItems.length;
      }
    } else {
      destinationIndex = destinationItems.length;
    }

    if (
      sourceContainer === overContainer &&
      overData?.type === "card" &&
      overIndexOriginal !== -1 &&
      activeIndex < overIndexOriginal
    ) {
      destinationIndex += 1;
    }

    destinationIndex = Math.min(destinationIndex, destinationItems.length);

    destinationItems.splice(destinationIndex, 0, {
      ...movedCard,
      listId: Number(overContainer),
    });

    const nextState = { ...cardsByListId };
    nextState[sourceContainer] =
      sourceContainer === overContainer
        ? normalizeCards(destinationItems)
        : normalizeCards(sourceItems);

    if (sourceContainer !== overContainer) {
      nextState[overContainer] = normalizeCards(destinationItems);
    }

    setCardsByListId(nextState);

    try {
      await apiFetch(`/tarjetas/${movedCard.id}`, {
        method: "PUT",
        body: JSON.stringify({
          cardOrder: destinationIndex,
          idLista: Number(overContainer),
        }),
      });
    } catch (e) {
      console.error("Error al mover tarjeta:", e);
      setError(`Error al mover tarjeta: ${e.message}`);
      fetchBoardAndLists();
    }
  };

  const handleAddList = async (event) => {
    event.preventDefault();
    if (!listName.trim()) return;

    try {
      setIsAddingList(true);
      const newList = await apiFetch(`/tableros/${boardId}/listas`, {
        method: "POST",
        body: JSON.stringify({
          nombre: listName.trim(),
          orden: lists.length,
        }),
      });

      setLists((prev) =>
        [...prev, newList].sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0))
      );
      setCardsByListId((prev) => ({ ...prev, [String(newList.idLista)]: [] }));
      setListName("");
    } catch (e) {
      console.error("Fallo al crear la lista:", e);
      setError(`Error al crear la lista: ${e.message}`);
    } finally {
      setIsAddingList(false);
    }
  };

  const handleStartEditingTitle = () => {
    setTitleDraft(board?.name ?? "");
    setIsEditingTitle(true);
  };

  const handleCancelEditingTitle = () => {
    setIsEditingTitle(false);
    setTitleDraft("");
  };

  const handleSubmitTitle = async (event) => {
    event.preventDefault();
    const nextTitle = titleDraft.trim();
    if (!nextTitle || !boardId) {
      return;
    }

    try {
      setIsSavingTitle(true);
      const updatedBoard = await apiFetch(`/tableros/${boardId}`, {
        method: "PUT",
        body: JSON.stringify({ name: nextTitle }),
      });
      setBoard(updatedBoard);
      setIsEditingTitle(false);
    } catch (e) {
      console.error("Error al renombrar tablero:", e);
      setError(`No se pudo actualizar el tablero: ${e.message}`);
    } finally {
      setIsSavingTitle(false);
    }
  };

  if (loading) return <div className="p-6">Cargando tablero...</div>;

  if (error) {
    return (
      <div className="p-8 bg-neutral-50">
        <div className="mx-auto w-full max-w-lg rounded-xl border border-red-200 bg-red-50 p-6 text-red-700 shadow-lg">
          <h1 className="mb-2 text-2xl font-bold">Error de carga</h1>
          <p className="mb-4">No se pudo cargar el tablero con ID: {boardId}.</p>
          <p className="font-mono text-sm">{error}</p>
          <div className="mt-4 flex justify-end">
            <Button onClick={() => navigate("/dashboard?mine=1")} variant="secondary">
              Volver a tableros
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!board) return <div className="p-6">Tablero no encontrado.</div>;

  return (
    <>
      <style>{SCROLLBAR_STYLE}</style>
      <div className="min-h-screen bg-white text-slate-900">
        <BoardTopNav />

        <section className="border-b border-[#dfd5ff] bg-[#f1eaff]">
          <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-5 md:flex-row md:items-center md:justify-between">
            {isEditingTitle ? (
              <form
                onSubmit={handleSubmitTitle}
                className="flex items-center gap-2"
              >
                <input
                  value={titleDraft}
                  onChange={(event) => setTitleDraft(event.target.value)}
                  className="rounded-lg bg-white px-3 py-2 text-sm font-medium text-[#4632c5] shadow-sm placeholder:text-[#a192ff] focus:outline-none focus:ring-2 focus:ring-[#846bff]"
                  placeholder="Nombre del tablero"
                  autoFocus
                  disabled={isSavingTitle}
                />
                <button
                  type="submit"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500 text-white transition hover:bg-emerald-600 disabled:opacity-60"
                  disabled={isSavingTitle || !titleDraft.trim()}
                  aria-label="Guardar nombre del tablero"
                >
                  {isSavingTitle ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Check className="h-4 w-4" />
                  )}
                </button>
                <button
                  type="button"
                  onClick={handleCancelEditingTitle}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-transparent bg-white/60 text-[#4b3acd] transition hover:bg-white"
                  disabled={isSavingTitle}
                  aria-label="Cancelar edicion"
                >
                  <X className="h-4 w-4" />
                </button>
              </form>
            ) : (
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-semibold text-[#2d1b8a]">
                  {board.name}
                </h1>
                <button
                  type="button"
                  onClick={handleStartEditingTitle}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-transparent bg-white/60 text-[#2d1b8a] transition hover:bg-white"
                  aria-label="Editar nombre del tablero"
                >
                  <Pencil className="h-4 w-4" />
                </button>
              </div>
            )}

            
        <button
  onClick={() => navigate("/dashboard")}
  className="self-start md:self-auto"
>
              <Button
                variant="secondary"
                className="rounded-full bg-[var(--color-brand-600)] px-5 text-white shadow-md hover:bg-[var(--color-brand-700)]"
              >
    Volver a tableros
  </Button>
</button>
          </div>
        </section>

        <main className="mx-auto max-w-7xl px-6 py-6">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDragCancel={resetDragOverlay}
          >
            <SortableContext
              items={lists.map((list) => String(list.idLista))}
              strategy={horizontalListSortingStrategy}
            >
              <div
                className="board-scroll flex items-start space-x-5 overflow-x-auto px-1 pb-4 pt-5"
              >
                {lists.map((list) => (
                  <ListColumn
                    key={list.idLista}
                    list={list}
                    cards={cardsByListId[String(list.idLista)] || []}
                    onAddCard={handleCreateCard}
                    isSavingCard={creatingCardFor === list.idLista}
                    completedCards={completedCards}
                    onToggleCardComplete={handleToggleCardComplete}
                    onCardMenuAction={handleCardMenuAction}
                  />
                ))}

                <NewListColumn
                  listName={listName}
                  setListName={setListName}
                  isAddingList={isAddingList}
                  onSubmit={handleAddList}
                />
              </div>
            </SortableContext>
            {createPortal(
              <DragOverlay>
                {activeCard ? (
                  <CardDragPreview card={activeCard} />
                ) : activeList ? (
                  <ListDragPreview list={activeList} />
                ) : null}
              </DragOverlay>,
              document.body
            )}
          </DndContext>
        </main>

       
        {isChecklistOpen && selectedCard ? (
          <div className="fixed right-0 top-0 z-[999] h-full w-80 bg-white border-l border-neutral-200 shadow-xl p-4 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-neutral-800">
                Checklist – {selectedCard.title || selectedCard.nombre || `Tarjeta ${selectedCard.id}`}
              </h2>
              <button
                onClick={() => setIsChecklistOpen(false)}
                className="text-neutral-400 hover:text-neutral-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <InlineChecklist cardId={selectedCard.id} />
          </div>
        ) : null}
      </div>
    </>
  );
}

function BoardTopNav() {
  const navigate = useNavigate();
  return (
    <header className="sticky top-0 z-40 bg-[var(--color-brand-600)] text-white shadow-lg">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-2 text-lg font-semibold tracking-wide"
          >
            <img src={logo} alt="Flomind" className="h-10 w-auto" />
          </button>
        </div>

        <div className="hidden flex-1 justify-center md:flex">
          <input
            type="search"
            placeholder="Buscar tableros, listas o tareas..."
            onChange={(event) => {
              const q = event.target.value.trim();
              navigate(`/dashboard?q=${encodeURIComponent(q)}`);
            }}
            className="w-full max-w-md rounded-xl bg-white/15 px-3 py-2 text-sm text-white placeholder-white/70 outline-none focus:ring-2 focus:ring-white/60"
          />
        </div>

        <AvatarArea />
      </div>
    </header>
  );
}

function AvatarArea() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const initial = (user?.email || "U").charAt(0).toUpperCase();

  useEffect(() => {
    function onDocClick(e) {
      if (!ref.current) return;
      if (!ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, []);

  const go = (path) => {
    setOpen(false);
    navigate(path);
  };

  const logout = async () => {
    setOpen(false);
    try {
      await signOut();
    } catch {
      /* empty */
    }
    navigate("/login", { replace: true });
  };

  return (
    <div className="flex items-center gap-3" ref={ref}>
      <span className="hidden text-sm text-white/90 sm:inline">
        Mi cuenta
      </span>

      <div className="relative">
        <button
          className="flex h-10 w-9 items-center justify-center rounded-full border border-white/40 bg-white/25 font-semibold"
          onClick={() => setOpen((v) => !v)}
          aria-haspopup="menu"
          aria-expanded={open}
          title={user?.email || "Mi cuenta"}
        >
          {initial}
        </button>

        {open && (
          <div
            role="menu"
            className="absolute right-0 mt-2 w-44 rounded-xl border border-white/20 bg-white/95 p-1 text-neutral-900 shadow-lg"
          >
            <MenuItem onClick={() => go("/perfil")}>Mi cuenta</MenuItem>
            <MenuItem onClick={() => go("/ajustes")}>Ajustes</MenuItem>
            <MenuItem danger onClick={logout}>Cerrar sesion</MenuItem>
          </div>
        )}
      </div>
    </div>
  );
}

function MenuItem({ children, onClick, danger }) {
  return (
    <button
      role="menuitem"
      onClick={onClick}
      className={`w-full rounded-lg px-3 py-2 text-left text-sm transition hover:bg-neutral-100 ${
        danger ? "text-red-600 hover:bg-red-50" : ""
      }`}
    >
      {children}
    </button>
  );
}

function CardDragPreview({ card }) {
  if (!card) return null;
  return (
    <div className="w-72 max-w-xs rounded-2xl border border-[#4b3acd]/40 bg-[#22222c] px-4 py-3 text-white shadow-2xl shadow-[#1a132f]/70">
      <div className="text-sm font-semibold">{card.title}</div>
      {card.description ? (
        <p className="mt-1 text-xs text-neutral-300 line-clamp-2">
          {card.description}
        </p>
      ) : null}
    </div>
  );
}

function ListDragPreview({ list }) {
  if (!list) return null;
  return (
    <div className="w-72 rounded-2xl border border-[#4b3acd]/35 bg-[#181820] px-5 py-4 text-white shadow-2xl shadow-[#1a132f]/70">
      <div className="text-sm font-semibold">{list.nombre}</div>
    </div>
  );
}

function NewListColumn({ listName, setListName, isAddingList, onSubmit }) {
  const [isOpen, setIsOpen] = useState(false);

  const handleSubmit = async (event) => {
    await onSubmit(event);
    setListName("");
    setIsOpen(false);
  };

  const handleCancel = () => {
    setListName("");
    setIsOpen(false);
  };

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="flex w-72 flex-shrink-0 items-center justify-center rounded-2xl border border-dashed border-[#2d2d38] bg-[#181820] px-4 py-5 text-[#8f7bff] shadow-[0_12px_45px_-20px_rgba(0,0,0,0.75)] transition hover:border-[#4b3acd]/50 hover:text-[#b7a9ff]"
      >
        <div className="flex items-center gap-2 text-sm font-semibold">
          <Plus className="h-4 w-4" />
          <span>Agregar lista</span>
        </div>
      </button>
    );
  }

  return (
    <div className="flex w-72 flex-shrink-0 flex-col rounded-2xl border border-[#2d2d38] bg-[#181820] px-4 py-5 text-white shadow-[0_12px_45px_-20px_rgba(0,0,0,0.75)]">
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input
          type="text"
          value={listName}
          onChange={(event) => setListName(event.target.value)}
          placeholder="Introduce el titulo de la lista"
          className="w-full rounded-xl border border-[#343447] bg-[#1f1f2b] px-3 py-2 text-sm text-white placeholder:text-neutral-400 focus:border-[#7f6dff] focus:outline-none focus:ring-2 focus:ring-[#7f6dff]/40"
          required
          disabled={isAddingList}
        />
        <button
          type="submit"
          className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#6b4dff] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#5d41e7] disabled:opacity-60"
          disabled={!listName.trim() || isAddingList}
        >
          {isAddingList ? (
            "Anadiendo..."
          ) : (
            <>
              <Plus className="h-4 w-4" />
              Anadir lista
            </>
          )}
        </button>
        <button
          type="button"
          onClick={handleCancel}
          className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-transparent bg-[#2a2a35] px-4 py-2 text-sm font-semibold text-neutral-300 transition hover:border-[#4b3acd]/40 hover:bg-[#333342]"
          disabled={isAddingList}
        >
          Cancelar
        </button>
      </form>
    </div>
  );
}


function InlineChecklist({ cardId }) {
  const STORAGE_KEY = "trello-checklist-" + cardId;

  const [items, setItems] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  const [text, setText] = useState("");

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [STORAGE_KEY, items]);

  const addItem = () => {
    const t = text.trim();
    if (!t) return;
    setItems((prev) => [
      ...prev,
      { id: Date.now(), text: t, done: false },
    ]);
    setText("");
  };

  const toggleItem = (id) => {
    setItems((prev) =>
      prev.map((it) =>
        it.id === id ? { ...it, done: !it.done } : it
      )
    );
  };

  const removeItem = (id) => {
    setItems((prev) => prev.filter((it) => it.id !== id));
  };

  const doneCount = items.filter((i) => i.done).length;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium">
          Ítems {items.length ? `(${doneCount}/${items.length})` : ""}
        </p>
      </div>

      <div className="flex gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addItem()}
          placeholder="Añadir ítem..."
          className="flex-1 border rounded-md px-2 py-1 text-sm"
        />
        <button
          onClick={addItem}
          className="px-3 py-1 bg-[#4b2fc8] text-white text-sm rounded-md"
        >
          +
        </button>
      </div>

      <div className="space-y-2">
        {items.length === 0 ? (
          <p className="text-xs text-neutral-400">Sin ítems.</p>
        ) : (
          items.map((it) => (
            <div key={it.id} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={it.done}
                onChange={() => toggleItem(it.id)}
              />
              <span
                className={
                  "flex-1 text-sm " +
                  (it.done ? "line-through text-neutral-400" : "")
                }
              >
                {it.text}
              </span>
              <button
                onClick={() => removeItem(it.id)}
                className="text-xs text-red-400"
              >
                borrar
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
