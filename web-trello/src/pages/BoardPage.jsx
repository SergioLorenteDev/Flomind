import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Button from "../components/ui/Button.jsx";
import { BoardsStore } from "../features/boards/state/boards.store.js";

export default function BoardPage() {
  const { boardId } = useParams();
  const [board, setBoard] = useState(null);
  const [listName, setListName] = useState("");
  const [newCardTitle, setNewCardTitle] = useState({}); // { [listId]: "texto" }

  // Cargar tablero
  useEffect(() => {
    setBoard(BoardsStore.getBoard(boardId));
  }, [boardId]);

  // Utilidad para refrescar desde store (después de cada cambio)
  function refresh() {
    setBoard(BoardsStore.getBoard(boardId));
  }

  // Añadir lista
  function handleAddList(e) {
    e.preventDefault();
    if (!listName.trim()) return;
    BoardsStore.addList(boardId, listName.trim());
    setListName("");
    refresh();
  }

  // Añadir tarjeta
  function handleAddCard(e, listId) {
    e.preventDefault();
    const title = (newCardTitle[listId] || "").trim();
    if (!title) return;
    BoardsStore.addCard(boardId, listId, title);
    setNewCardTitle((s) => ({ ...s, [listId]: "" }));
    refresh();
  }

  // Drag & Drop tarjetas
  function onDragStartCard(ev, cardId, fromListId) {
    ev.dataTransfer.setData("cardId", cardId);
    ev.dataTransfer.setData("fromListId", fromListId);
  }

  function onDragOverList(ev) {
    ev.preventDefault(); // necesario para permitir drop
  }

  // drop en toda la lista (al final)
  function onDropList(ev, toListId) {
    ev.preventDefault();
    const cardId = ev.dataTransfer.getData("cardId");
    if (!cardId) return;
    BoardsStore.moveCard({ boardId, cardId, toListId, beforeCardId: null });
    refresh();
  }

  // drop antes de una tarjeta concreta
  function onDropBeforeCard(ev, toListId, beforeCardId) {
    ev.preventDefault();
    const cardId = ev.dataTransfer.getData("cardId");
    if (!cardId) return;
    BoardsStore.moveCard({ boardId, cardId, toListId, beforeCardId });
    refresh();
  }

  if (!board) return <div className="p-6">Tablero no encontrado</div>;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">{board.name}</h1>
        <Link to="/"><Button variant="secondary">Volver</Button></Link>
      </div>

      {/* Listas en columnas */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {board.lists
          .slice()
          .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
          .map((list) => (
            <div
              key={list.id}
              className="rounded-2xl bg-white shadow-2xl p-4"
              onDragOver={onDragOverList}
              onDrop={(e) => onDropList(e, list.id)}
            >
              <h2 className="mb-3 font-semibold">{list.name}</h2>

              {/* Cards */}
              <div className="space-y-2">
                {list.cards
                  .slice()
                  .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
                  .map((card, idx) => (
                    <div
                      key={card.id}
                      className="rounded-lg bg-neutral-50 p-3 cursor-move"
                      draggable
                      onDragStart={(e) => onDragStartCard(e, card.id, list.id)}
                      onDragOver={(e) => e.preventDefault()}
                      // zona drop ANTES de cada tarjeta
                      onDrop={(e) => onDropBeforeCard(e, list.id, card.id)}
                    >
                      {card.title}
                    </div>
                  ))}
              </div>

              {/* Form añadir tarjeta */}
              <form className="mt-3 flex gap-2" onSubmit={(e) => handleAddCard(e, list.id)}>
                <input
                  className="flex-1 rounded-lg border px-3 py-2 text-sm outline-none focus:border-neutral-400"
                  placeholder="Nueva tarjeta…"
                  value={newCardTitle[list.id] || ""}
                  onChange={(e) =>
                    setNewCardTitle((s) => ({ ...s, [list.id]: e.target.value }))
                  }
                />
                <Button variant="primary" type="submit">Añadir</Button>
              </form>
            </div>
          ))}

        {/* Columna para crear lista */}
        <div className="rounded-2xl bg-white shadow-2xl p-4">
          <h3 className="mb-2 font-semibold">Nueva lista</h3>
          <form className="flex gap-2" onSubmit={handleAddList}>
            <input
              className="flex-1 rounded-lg border px-3 py-2 text-sm outline-none focus:border-neutral-400"
              placeholder="Nombre de la lista…"
              value={listName}
              onChange={(e) => setListName(e.target.value)}
            />
            <Button variant="primary" type="submit">Crear</Button>
          </form>
        </div>
      </div>
    </div>
  );
}
