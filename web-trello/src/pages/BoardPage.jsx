import React, { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { createPortal } from "react-dom";
import {
  DndContext, PointerSensor, closestCorners, pointerWithin, rectIntersection,
  useSensor, useSensors, DragOverlay
} from "@dnd-kit/core";
import { SortableContext, arrayMove, horizontalListSortingStrategy } from "@dnd-kit/sortable";
import { Pencil, Check, X, Loader2, Plus } from "lucide-react";
import Button from "../components/ui/Button.jsx";
import ListColumn from "../components/board/ListColumn.jsx";
import {
  apiFetch, updateCard, fetchBoardLabels,
  createBoardLabel, updateBoardLabel
} from "../modules/apiClient";
import { useAuth } from "../modules/auth/AuthContext.jsx";
import logo from "../assets/Logo dashboard2.png";
import {
  BOARD_BACKGROUND_OPTIONS, boardBackgroundToStyle, resolveBoardBackground
} from "../constants/boardBackgrounds.js";
import BotonModo from "../components/ui/BotonModo.jsx";


const SCROLLBAR_STYLE = `
.board-scroll::-webkit-scrollbar { display: none; }
.board-scroll { -ms-overflow-style: none; scrollbar-width: none; }
`;

const LIST_SORTABLE_PREFIX = "list-";
const LIST_DROPPABLE_PREFIX = "list-droppable-";
const CARD_PREFIX = "card-";

const DEFAULT_LABEL_COLOR = "#7f56d9";

const toListSortableId = (value) => `${LIST_SORTABLE_PREFIX}${value}`;
const toCardSortableId = (value) => `${CARD_PREFIX}${value}`;

const extractListId = (value) => {
  if (!value) return undefined;
  const key = String(value);
  if (key.startsWith(LIST_SORTABLE_PREFIX)) {
    return key.slice(LIST_SORTABLE_PREFIX.length);
  }
  if (key.startsWith(LIST_DROPPABLE_PREFIX)) {
    return key.slice(LIST_DROPPABLE_PREFIX.length);
  }
  if (/^\d+$/.test(key)) {
    return key;
  }
  return undefined;
};

const extractCardId = (value) => {
  if (!value) return undefined;
  const key = String(value);
  if (key.startsWith(CARD_PREFIX)) {
    return key.slice(CARD_PREFIX.length);
  }
  if (/^\d+$/.test(key)) {
    return key;
  }
  return undefined;
};

const normalizeCards = (items, listId) =>
  items.map((card, index) => ({
    ...card,
    cardOrder: index,
    listId: String(listId ?? card.listId ?? ""),
  }));

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
  const [isBackgroundPickerOpen, setIsBackgroundPickerOpen] = useState(false);
  const [isSavingBackground, setIsSavingBackground] = useState(false);
  const [backgroundError, setBackgroundError] = useState(null);
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [labels, setLabels] = useState(() => []);
  const [labelEditorState, setLabelEditorState] = useState({
    open: false,
    cardId: null,
    listKey: null,
    selectedLabelId: null,
  });
  const lastOverId = useRef(null);
  const scrollContainerRef = useRef(null);
  const panStateRef = useRef({
    isActive: false,
    pointerId: null,
    startX: 0,
    startScrollLeft: 0,
  });

  const backgroundOption = resolveBoardBackground(board?.background);
  const hasImageBackground = backgroundOption.type === "image";
  const pageBackgroundStyle = boardBackgroundToStyle(
    board?.background ?? backgroundOption.value
  );
  const boardSurfaceClass = hasImageBackground
    ? "bg-transparent"
    : "bg-white/90";
  const boardTextClass = hasImageBackground ? "text-white" : "text-slate-900";
  const boardHeaderClass = hasImageBackground
    ? "border-transparent bg-black/35 backdrop-blur-sm"
    : "border-white/50 bg-white/40 backdrop-blur-sm";
  const titleTextClass = hasImageBackground ? "text-white" : "text-neutral-900";

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } })
  );

  const resolveCardListKey = useCallback(
    (card) => {
      if (!card) return null;
      if (card.listId != null) return String(card.listId);
      if (card.idLista != null) return String(card.idLista);
      const match = Object.entries(cardsByListId).find(([, cards]) =>
        (cards || []).some((item) => item.id === card.id)
      );
      return match ? match[0] : null;
    },
    [cardsByListId]
  );

  useEffect(() => {
    const shouldIgnoreEvent = (event) =>
      Boolean(
        event.target.closest(
          "[data-draggable], button, a, input, textarea, select, [role='button']"
        )
      );

    const handlePointerDown = (event) => {
      if (event.button !== 0 && event.pointerType !== "touch") return;
      if (shouldIgnoreEvent(event)) return;
      const container = scrollContainerRef.current;
      if (!container) return;

      const state = panStateRef.current;
      state.isActive = true;
      state.pointerId = event.pointerId;
      state.startX = event.clientX;
      state.startScrollLeft = container.scrollLeft;

      document.body.style.cursor = "grabbing";
      container.dataset.panning = "true";
      container.style.cursor = "grabbing";
      event.preventDefault();
    };

    const handlePointerMove = (event) => {
      const container = scrollContainerRef.current;
      const state = panStateRef.current;
      if (
        !state.isActive ||
        (state.pointerId !== null && state.pointerId !== event.pointerId)
      ) {
        return;
      }
      if (!container) return;

      const deltaX = event.clientX - state.startX;
      container.scrollLeft = state.startScrollLeft - deltaX;
      event.preventDefault();
    };

    const endPan = (event) => {
      const state = panStateRef.current;
      if (!state.isActive) return;
      if (state.pointerId !== null && state.pointerId !== event.pointerId) {
        return;
      }
      state.isActive = false;
      state.pointerId = null;
      state.startX = 0;
      state.startScrollLeft = 0;

      const container = scrollContainerRef.current;
      if (container) {
        delete container.dataset.panning;
        container.style.cursor = "";
      }
      document.body.style.cursor = "";
    };

    document.addEventListener("pointerdown", handlePointerDown, { passive: false });
    document.addEventListener("pointermove", handlePointerMove, { passive: false });
    document.addEventListener("pointerup", endPan);
    document.addEventListener("pointercancel", endPan);
    document.addEventListener("pointerleave", endPan);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("pointermove", handlePointerMove);
      document.removeEventListener("pointerup", endPan);
      document.removeEventListener("pointercancel", endPan);
      document.removeEventListener("pointerleave", endPan);
    };
  }, []);

  const collisionDetection = useCallback((args) => {
    const activeType = args.active?.data?.current?.type;
    if (activeType === "list") {
      const listContainers = args.droppableContainers.filter(
        (container) => container.data?.current?.type === "list"
      );
      return closestCorners({
        ...args,
        droppableContainers:
          listContainers.length > 0 ? listContainers : args.droppableContainers,
      });
    }

    let collisions = pointerWithin(args);

    if (!collisions.length) {
      collisions = rectIntersection(args);
    }

    if (!collisions.length) {
      collisions = closestCorners(args);
    }

    if (collisions.length) {
      lastOverId.current = collisions[0].id;
      return collisions;
    }

    if (lastOverId.current != null) {
      return [{ id: lastOverId.current }];
    }

    return [];
  }, []);

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

      const labelsData = await fetchBoardLabels(boardId);

      setLabels(
        (Array.isArray(labelsData) ? labelsData : []).map((label) => ({
          id: label.id,
          color: label.color ?? DEFAULT_LABEL_COLOR,
          text: label.text ?? "",
        }))
      );

      const cardsEntries = await Promise.all(
        sortedLists.map(async (list) => {
          const cards = await apiFetch(`/listas/${list.idLista}/tarjetas`);
          const rawCards = (Array.isArray(cards) ? cards : []).sort(
            (a, b) =>
              (a.cardOrder ?? a.order ?? 0) - (b.cardOrder ?? b.order ?? 0)
          );
          const normalizedCards = normalizeCards(
            rawCards.map((card) => ({ ...card, listId: list.idLista })),
            list.idLista
          );
          return [String(list.idLista), normalizedCards];
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
          [...(next[listId] || []), { ...newCard, listId }],
          listId
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

  const closeLabelEditor = useCallback(() => {
    setLabelEditorState({
      open: false,
      cardId: null,
      listKey: null,
      selectedLabelId: null,
    });
  }, []);

  const mutateCardLabel = useCallback((cardId, listKey, nextLabel) => {
    if (!cardId) return;
    const clonedLabel = nextLabel ? { ...nextLabel } : null;
    setCardsByListId((prev) => {
      let resolvedKey = listKey;
      if (!resolvedKey || !prev[resolvedKey]) {
        resolvedKey = Object.keys(prev).find((key) =>
          (prev[key] || []).some((card) => card.id === cardId)
        );
      }
      if (!resolvedKey) return prev;
      const updatedCards = (prev[resolvedKey] || []).map((card) =>
        card.id === cardId ? { ...card, label: clonedLabel } : card
      );
      return { ...prev, [resolvedKey]: updatedCards };
    });

    setSelectedCard((prev) =>
      prev && prev.id === cardId ? { ...prev, label: clonedLabel } : prev
    );
    setActiveCard((prev) =>
      prev && prev.id === cardId ? { ...prev, label: clonedLabel } : prev
    );
  }, []);

  const handleSelectLabelForCard = useCallback(
    async (labelId, labelOverride = null) => {
      if (!labelEditorState.cardId) return;
      const labelData =
        labelOverride ?? labels.find((label) => label.id === labelId) ?? null;
      const previous = selectedCard?.label ?? null;

      if (labelData && labelData.id) {
        setLabels((prev) => {
          if (prev.some((item) => item.id === labelData.id)) {
            return prev;
          }
          return [...prev, labelData];
        });
      }

      mutateCardLabel(labelEditorState.cardId, labelEditorState.listKey, labelData);
      setLabelEditorState((prev) => ({
        ...prev,
        selectedLabelId: labelId ?? null,
      }));

      try {
        await updateCard(labelEditorState.cardId, {
          labelId,
        });
      } catch (err) {
        mutateCardLabel(labelEditorState.cardId, labelEditorState.listKey, previous);
        setLabelEditorState((prev) => ({ ...prev, selectedLabelId: previous?.id ?? null }));
        throw err;
      }
    },
    [labelEditorState, labels, mutateCardLabel, selectedCard]
  );

  const handleClearLabel = useCallback(async () => {
    if (!labelEditorState.cardId) {
      closeLabelEditor();
      return;
    }
    const previous = selectedCard?.label ?? null;
    mutateCardLabel(labelEditorState.cardId, labelEditorState.listKey, null);
    setLabelEditorState((prev) => ({ ...prev, selectedLabelId: null }));
    try {
      await updateCard(labelEditorState.cardId, { labelId: null });
      closeLabelEditor();
    } catch (err) {
      mutateCardLabel(labelEditorState.cardId, labelEditorState.listKey, previous);
      setLabelEditorState((prev) => ({ ...prev, selectedLabelId: previous?.id ?? null }));
      throw err;
    }
  }, [labelEditorState, mutateCardLabel, closeLabelEditor, selectedCard]);

  const registerCardLabel = useCallback((card) => {
    if (!card?.label) return null;
    const label = {
      id: card.label.id,
      color: card.label.color ?? DEFAULT_LABEL_COLOR,
      text: card.label.text ?? "",
    };

    setLabels((prev) => {
      if (!label.id || prev.some((item) => item.id === label.id)) {
        return prev;
      }
      return [...prev, label];
    });

    return label.id ?? null;
  }, []);

  const handleCreateLabel = useCallback(async () => {
    if (!boardId) {
      throw new Error("Tablero no disponible.");
    }
    const newLabel = await createBoardLabel(boardId, {
      text: "",
      color: DEFAULT_LABEL_COLOR,
    });
    setLabels((prev) =>
      prev.some((label) => label.id === newLabel.id)
        ? prev
        : [...prev, newLabel]
    );
    return newLabel;
  }, [boardId]);

  const handleUpdateLabel = useCallback(
    async (labelId, updates) => {
      if (!boardId) {
        throw new Error("Tablero no disponible.");
      }
      const payload = {};
      if (typeof updates.text === "string") {
        payload.text = updates.text;
      }
      if (typeof updates.color === "string") {
        payload.color = updates.color;
      }
      if (Object.keys(payload).length === 0) {
        return;
      }

      const updated = await updateBoardLabel(boardId, labelId, payload);

      setLabels((prev) =>
        prev.map((label) => (label.id === updated.id ? updated : label))
      );

      setCardsByListId((prev) => {
        const entries = Object.entries(prev).map(([key, cards]) => [
          key,
          (cards || []).map((card) =>
            card.label?.id === updated.id ? { ...card, label: updated } : card
          ),
        ]);
        return Object.fromEntries(entries);
      });

      setSelectedCard((prev) =>
        prev && prev.label?.id === updated.id ? { ...prev, label: updated } : prev
      );
      setActiveCard((prev) =>
        prev && prev.label?.id === updated.id ? { ...prev, label: updated } : prev
      );
    },
    [boardId]
  );

  const openLabelEditor = useCallback(
    (card) => {
      const listKey = resolveCardListKey(card);
      const selectedLabelId = registerCardLabel(card);

      setLabelEditorState({
        open: true,
        cardId: card?.id ?? null,
        listKey,
        selectedLabelId: selectedLabelId ?? null,
      });

      setSelectedCard(card);
      setIsChecklistOpen(false);
    },
    [resolveCardListKey, registerCardLabel]
  );

  const handleCardMenuAction = (action, card) => {
    if (action === "edit-labels") {
      openLabelEditor(card);
      return;
    }
    setSelectedCard(card);
    setIsChecklistOpen(true);
  };

  const reorderLists = (activeListId, overListId) => {
    const sourceId =
      activeListId !== null && activeListId !== undefined
        ? String(activeListId)
        : null;
    const targetId =
      overListId !== null && overListId !== undefined
        ? String(overListId)
        : null;

    if (!sourceId || !targetId || sourceId === targetId) {
      return;
    }

    setLists((prev) => {
      const oldIndex = prev.findIndex(
        (list) => String(list.idLista) === sourceId
      );
      const newIndex = prev.findIndex(
        (list) => String(list.idLista) === targetId
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
      if (id === null || id === undefined) return undefined;
      const key = String(id);
      const listIdFromKey = extractListId(key);
      if (listIdFromKey) {
        return listIdFromKey;
      }

      const cardId = extractCardId(key);
      if (!cardId) return undefined;

      return Object.keys(cardsByListId).find((listId) =>
        (cardsByListId[listId] || []).some(
          (card) => String(card.id) === cardId
        )
      );
    },
    [cardsByListId]
  );

  const handleDragStart = ({ active }) => {
    const activeData = active.data.current;
    if (activeData?.type === "card") {
      const sourceContainer = activeData.listId
        ? String(activeData.listId)
        : findContainer(active.id);
      const card =
        sourceContainer != null
          ? (cardsByListId[sourceContainer] || []).find(
              (c) => toCardSortableId(c.id) === String(active.id)
            )
          : null;
      setActiveCard(card ?? null);
      setActiveList(null);
      return;
    }

    if (activeData?.type === "list") {
      const listId =
        String(activeData.listId ?? extractListId(active.id) ?? "");
      const list =
        lists.find((l) => String(l.idLista) === listId) ?? null;
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
    lastOverId.current = null;
  };

  const handleDragEnd = async ({ active, over }) => {
    resetDragOverlay();
    if (!over) return;

    const activeData = active.data.current;
    const overData = over.data.current;

    // mover listas
    if (activeData?.type === "list") {
      const sourceId =
        activeData.listId ?? extractListId(active.id) ?? undefined;
      const targetId =
        overData?.listId ?? extractListId(over?.id) ?? undefined;
      if (!sourceId || !targetId) return;
      reorderLists(sourceId, targetId);
      return;
    }

    // mover tarjetas
    if (activeData?.type !== "card") return;

    const activeId = String(active.id);
    const sourceContainer = activeData.listId
      ? String(activeData.listId)
      : findContainer(activeId);

    let overContainer;
    if (overData?.type === "card") {
      overContainer = String(overData.listId);
    } else if (
      overData?.type === "list" ||
      overData?.type === "list-droppable"
    ) {
      overContainer = overData.listId
        ? String(overData.listId)
        : extractListId(over.id);
    } else {
      overContainer = findContainer(over.id);
    }

    if (!sourceContainer || !overContainer) return;

    if (sourceContainer === overContainer && activeId === String(over.id)) {
      return;
    }

    const sourceCards = cardsByListId[sourceContainer] || [];
    const sourceItems = [...sourceCards];
    const destinationItems =
      sourceContainer === overContainer
        ? sourceItems
        : [...(cardsByListId[overContainer] || [])];

    const activeIndex = sourceCards.findIndex(
      (card) => toCardSortableId(card.id) === activeId
    );
    if (activeIndex === -1) return;

    const overKey = String(over.id);
    const overIndexOriginal =
      overData?.type === "card" && sourceContainer === overContainer
        ? sourceCards.findIndex(
            (card) => toCardSortableId(card.id) === overKey
          )
        : -1;

    const [movedCard] = sourceItems.splice(activeIndex, 1);

    let destinationIndex;
    if (overData?.type === "card") {
      const idx = destinationItems.findIndex(
        (card) => toCardSortableId(card.id) === overKey
      );
      destinationIndex = idx === -1 ? destinationItems.length : idx;
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
      listId: overContainer,
    });

    const nextState = { ...cardsByListId };
    nextState[sourceContainer] =
      sourceContainer === overContainer
        ? normalizeCards(destinationItems, sourceContainer)
        : normalizeCards(sourceItems, sourceContainer);

    if (sourceContainer !== overContainer) {
      nextState[overContainer] = normalizeCards(
        destinationItems,
        overContainer
      );
    }

    setCardsByListId(nextState);

    try {
      await updateCard(movedCard.id, {
        cardOrder: destinationIndex,
        idLista: Number(overContainer),
        labelId: movedCard.label?.id ?? null,
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

  const handleSelectBackground = async (nextBackground) => {
    if (!boardId || !nextBackground || isSavingBackground) {
      return;
    }

    const resolved = resolveBoardBackground(nextBackground).value;
    if (board?.background === resolved) {
      setIsBackgroundPickerOpen(false);
      return;
    }

    const previousBackground = board?.background ?? null;
    setBackgroundError(null);
    setBoard((prev) => (prev ? { ...prev, background: resolved } : prev));

    try {
      setIsSavingBackground(true);
      const updatedBoard = await apiFetch(`/tableros/${boardId}`, {
        method: "PUT",
        body: JSON.stringify({ background: resolved }),
      });
      setBoard(updatedBoard);
      setIsBackgroundPickerOpen(false);
    } catch (e) {
      console.error("Error al actualizar el fondo del tablero:", e);
      setBackgroundError(
        "No se pudo guardar el nuevo fondo. Intentalo de nuevo."
      );
      setBoard((prev) =>
        prev ? { ...prev, background: previousBackground } : prev
      );
    } finally {
      setIsSavingBackground(false);
    }
  };

  if (loading) return <div className="p-6">Cargando tablero...</div>;

  if (error) {
    return (
      <div className="p-8 bg-neutral-50">
        <div className="mx-auto w-full max-w-lg rounded-xl border border-red-200 bg-red-50 p-6 text-red-700 shadow-lg">
          <h1 className="mb-2 text-2xl font-bold">Error de carga</h1>
          <p className="mb-4">
            No se pudo cargar el tablero con ID: {boardId}.
          </p>
          <p className="font-mono text-sm">{error}</p>
          <div className="mt-4 flex justify-end">
            <Button onClick={() => navigate("/dashboard")} variant="secondary">
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
      <div className="min-h-screen" style={pageBackgroundStyle}>
        <div
          className={["min-h-screen", boardTextClass, boardSurfaceClass].join(
            " "
          )}
        >
          <BoardTopNav />

          <section className={["border-b", boardHeaderClass].join(" ")}>
            <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-5 md:flex-row md:items-center md:justify-between">
              {isEditingTitle ? (
                <form
                  onSubmit={handleSubmitTitle}
                  className="flex items-center gap-2"
                >
                  <input
  type="text"
  value={titleDraft}
  onChange={(e) => setTitleDraft(e.target.value)}
  className="board-title-input text-2xl font-bold"
  autoFocus
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
                  <h1
                    className={["text-2xl font-semibold", titleTextClass].join(
                      " "
                    )}
                  >
                    {board.name}
                  </h1>
                  <button
                    type="button"
                    onClick={handleStartEditingTitle}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--color-brand-300)] bg-white/90 text-[var(--color-brand-700)] shadow-sm transition hover:bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-200)]/60 focus:ring-offset-1"
                    aria-label="Editar nombre del tablero"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                </div>
              )}

              <div className="flex items-center gap-3 self-start md:self-auto">
                <Button
                  variant="secondary"
                  onClick={() => setIsBackgroundPickerOpen((value) => !value)}
                  disabled={isSavingBackground}
                  className="rounded-full px-5 py-2 text-sm text-[#2d1b8a]"
                >
                  {isSavingBackground ? (
                    <span className="inline-flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Guardando...
                    </span>
                  ) : (
                    "Cambiar fondo"
                  )}
                </Button>

                <div className="flex items-center gap-3">
                  <Button
                    variant="primary"
                    onClick={() => navigate("/dashboard")}
                    className="rounded-full px-5 py-2 text-sm shadow-md"
                  >
                    Volver a tableros
                  </Button>

                  <button
                    type="button"
                    onClick={() => setIsInviteOpen(true)}
                    className="
                      inline-flex items-center gap-2 rounded-full bg-[#e0d4ff] px-5 py-2 text-sm font-semibold text-[#2d1b8a] border border-[#c4b5fd] shadow-sm hover:bg-[#d2c4ff] hover:shadow-md transition">
                    Invitar
                  </button>
                </div>
              </div>
            </div>
            {isBackgroundPickerOpen ? (
              <div className="mx-auto mb-4 max-w-7xl px-6">
                <BackgroundPicker
                  currentValue={board?.background ?? backgroundOption.value}
                  onSelect={handleSelectBackground}
                  onClose={() => {
                    setIsBackgroundPickerOpen(false);
                    setBackgroundError(null);
                  }}
                  isSaving={isSavingBackground}
                  errorMessage={backgroundError}
                />
              </div>
            ) : null}
          </section>

          <main className="mx-auto max-w-7xl px-6 py-6">
            <DndContext
              sensors={sensors}
              collisionDetection={collisionDetection}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
              onDragCancel={resetDragOverlay}
            >
              <SortableContext
                items={lists.map((list) => toListSortableId(list.idLista))}
                strategy={horizontalListSortingStrategy}
              >
                <div
                  ref={scrollContainerRef}
                  className="board-scroll flex items-start space-x-5 overflow-x-auto px-1 pb-4 pt-5 cursor-grab"
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
  <div
    className={
      document.documentElement.classList.contains("dark")
        ? "dark card-drag-overlay"
        : "card-drag-overlay"
    }
  >
    {activeCard ? (
      <CardDragPreview card={activeCard} />
    ) : activeList ? (
      <ListDragPreview list={activeList} />
    ) : null}
  </div>
</DragOverlay>,
  document.body
)}

            </DndContext>
          </main>

          {isChecklistOpen && selectedCard ? (
            <div className="fixed right-0 top-0 z-[999] h-full w-80 bg-white border-l border-neutral-200 shadow-xl p-4 overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-neutral-800">
                  Checklist –{" "}
                  {selectedCard.title ||
                    selectedCard.nombre ||
                    `Tarjeta ${selectedCard.id}`}
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

          <InviteModal
            open={isInviteOpen}
            onClose={() => setIsInviteOpen(false)}
            boardId={boardId}
          />

          <LabelEditorModal
            open={labelEditorState.open}
            labels={labels}
            selectedLabelId={labelEditorState.selectedLabelId}
            onSelectLabel={handleSelectLabelForCard}
            onCreateLabel={handleCreateLabel}
            onUpdateLabel={handleUpdateLabel}
            onClearLabel={handleClearLabel}
            onClose={closeLabelEditor}
          />
          
        </div>

      </div>
    </>
  );
}

function BackgroundPicker({
  currentValue,
  onSelect,
  onClose,
  isSaving,
  errorMessage,
}) {
  const normalizedCurrent = resolveBoardBackground(currentValue).value;

  return (
    <div className="rounded-2xl border border-white/70 bg-white/80 p-4 shadow-lg backdrop-blur-sm">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm font-semibold text-neutral-800">
          Selecciona un nuevo fondo
        </p>
        <button
          type="button"
          onClick={onClose}
          disabled={isSaving}
          className="text-xs font-semibold text-neutral-500 transition hover:text-neutral-800 disabled:opacity-60"
        >
          Cerrar
        </button>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {BOARD_BACKGROUND_OPTIONS.map((option) => {
          const isActive = option.value === normalizedCurrent;
          return (
            <button
              type="button"
              key={option.id}
              onClick={() => onSelect(option.value)}
              disabled={isSaving}
              aria-pressed={isActive}
              className={[
                "rounded-2xl border-2 p-2 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5d41e7]",
                isActive
                  ? "border-[var(--color-brand-500)] shadow-md"
                  : "border-transparent hover:border-white hover:shadow",
              ].join(" ")}
            >
              <div
                className="h-20 w-full rounded-xl"
                style={boardBackgroundToStyle(option.value)}
              />
              <div className="mt-2 flex items-center justify-between text-xs font-semibold text-neutral-700">
                <span>{option.label}</span>
                {isActive ? (
                  <Check className="h-3 w-3 text-[var(--color-brand-600)]" />
                ) : null}
              </div>
            </button>
          );
        })}
      </div>
      {errorMessage ? (
        <p className="mt-3 text-xs text-red-500 font-medium">{errorMessage}</p>
      ) : null}
      {isSaving ? (
        <p className="mt-3 text-xs font-medium text-[var(--color-brand-600)]">
          Guardando cambios...
        </p>
      ) : null}
    </div>
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

  const storageKey = user ? `profilePhoto:${user.id}` : null;
  const [profilePhoto, setProfilePhoto] = useState(null);

  useEffect(() => {
    if (!storageKey) {
      setProfilePhoto(null);
      return;
    }
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) setProfilePhoto(saved);
      else setProfilePhoto(null);
    } catch {
      setProfilePhoto(null);
    }
  }, [storageKey]);

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
      <span className="hidden text-sm text-white/90 sm:inline">Mi cuenta</span>

      <div className="relative">
        <button
          className="flex h-10 w-9 items-center justify-center rounded-full border border-white/40 bg-white/25 font-semibold overflow-hidden"
          onClick={() => setOpen((v) => !v)}
          aria-haspopup="menu"
          aria-expanded={open}
          title={user?.email || "Mi cuenta"}
        >
          {profilePhoto ? (
            <img
              src={profilePhoto}
              alt={user?.email || "Foto de perfil"}
              className="h-full w-full object-cover rounded-full"
            />
          ) : (
            initial
          )}
        </button>

        {open && (
  <div
    role="menu"
    className="
      absolute right-0 mt-2 w-44 rounded-xl border
      border-neutral-300 dark:border-neutral-700
      bg-white dark:bg-neutral-900
      text-neutral-900 dark:text-neutral-100
      shadow-xl backdrop-blur-md
      p-1 transition-colors duration-300
    "
  >
    <MenuItem onClick={() => go('/perfil')}>Mi cuenta</MenuItem>
    <MenuItem onClick={() => go('/ajustes')}>Ajustes</MenuItem>
    <MenuItem danger onClick={logout}>Cerrar sesión</MenuItem>
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
      className={`w-full rounded-lg px-3 py-2 text-left text-sm transition-colors
        ${danger
          ? "text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
          : "hover:bg-neutral-100 dark:hover:bg-neutral-800"
        }`}
    >
      {children}
    </button>
  );
}


function LabelEditorModal({
  open,
  labels,
  selectedLabelId,
  onSelectLabel,
  onCreateLabel,
  onUpdateLabel,
  onClearLabel,
  onClose,
}) {
  const [editingId, setEditingId] = useState(null);
  const [draftName, setDraftName] = useState("");
  const [draftColor, setDraftColor] = useState(DEFAULT_LABEL_COLOR);
  const [isBusy, setIsBusy] = useState(false);
  const [modalError, setModalError] = useState("");

  useEffect(() => {
    if (!open) {
      setEditingId(null);
      setDraftName("");
      setDraftColor(DEFAULT_LABEL_COLOR);
      setModalError("");
      setIsBusy(false);
    }
  }, [open]);

  if (!open) return null;

  const runAction = async (operation) => {
    setModalError("");
    setIsBusy(true);
    try {
      return await operation();
    } catch (err) {
      setModalError(
        err instanceof Error ? err.message : "No se pudo completar la acción."
      );
      throw err;
    } finally {
      setIsBusy(false);
    }
  };

  const beginEditing = (label) => {
    setEditingId(label.id);
    setDraftName(label.text ?? "");
    setDraftColor(label.color ?? DEFAULT_LABEL_COLOR);
  };

  const handleCommitEdit = () => {
    if (!editingId) return;
    runAction(() =>
      onUpdateLabel(editingId, {
        text: draftName,
        color: draftColor,
      })
    )
      .then(() => {
        setEditingId(null);
        setDraftName("");
        setDraftColor(DEFAULT_LABEL_COLOR);
      })
      .catch(() => {});
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setDraftName("");
    setDraftColor(DEFAULT_LABEL_COLOR);
    setModalError("");
  };

  const handleCreateLabel = () => {
    runAction(onCreateLabel)
      .then((newLabel) => {
        if (!newLabel) return;
        beginEditing(newLabel);
        return runAction(() => onSelectLabel(newLabel.id, newLabel));
      })
      .catch(() => {});
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[999] flex items-center justify-center bg-black/40 backdrop-blur-sm px-4"
      onClick={() => {
        if (!isBusy) onClose();
      }}
    >
      <div
        className="
          w-full max-w-md rounded-2xl border border-[var(--color-surface-hover)] bg-[var(--color-surface)]
          p-6 shadow-2xl transition-colors duration-300
          text-[var(--color-neutral-950)] dark:bg-[var(--color-surface-hover)] dark:text-[var(--color-neutral-50)]
        "
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-[var(--color-brand-700)] dark:text-[var(--color-brand-200)]">
              Etiquetas
            </h2>
            <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-300">
              Elige una etiqueta para esta tarjeta o crea una nueva.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isBusy}
            className="rounded-full p-1 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 disabled:opacity-60 dark:hover:bg-white/10"
            aria-label="Cerrar editor de etiquetas"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-5 space-y-3">
          {labels.length === 0 ? (
            <p className="rounded-2xl bg-white/60 p-3 text-sm text-neutral-600 dark:bg-white/10 dark:text-neutral-300">
              No hay etiquetas. Crea una nueva para asignarla a esta tarjeta.
            </p>
          ) : null}

          {labels.map((label) => {
            const isSelected = selectedLabelId === label.id;
            const isEditing = editingId === label.id;
            const displayName = label.text && label.text.trim().length > 0 ? label.text.trim() : "Sin nombre";

            return (
              <div
                key={label.id}
                className={[
                  "rounded-2xl border border-white/10 bg-white/40 p-3 transition dark:border-white/10 dark:bg-white/5",
                  isSelected ? "ring-2 ring-[var(--color-brand-500)]/60" : "",
                ].join(" ")}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="card-label"
                    className="h-4 w-4 accent-[var(--color-brand-600)]"
                    checked={isSelected}
                    disabled={isBusy}
                    onChange={() => {
                      if (isBusy) return;
                      runAction(() => onSelectLabel(label.id, label)).catch(() => {});
                    }}
                    aria-label={`Seleccionar etiqueta ${displayName}`}
                  />
                  <button
                    type="button"
                    disabled={isBusy}
                    onClick={() => {
                      if (isBusy) return;
                      runAction(() => onSelectLabel(label.id, label)).catch(() => {});
                    }}
                    className="relative flex h-11 flex-1 items-center rounded-xl border-2 border-transparent text-left transition hover:border-white/70 hover:shadow disabled:opacity-60"
                    style={{ backgroundColor: label.color }}
                  >
                    <span className="ml-3 text-sm font-semibold tracking-wide text-white drop-shadow-sm">
                      {displayName}
                    </span>
                    {isSelected ? (
                      <Check className="absolute right-3 h-4 w-4 text-white drop-shadow-sm" />
                    ) : null}
                  </button>
                  <button
                    type="button"
                    disabled={isBusy}
                    onClick={() => beginEditing(label)}
                    className="rounded-full p-1 text-neutral-500 hover:bg-white/60 hover:text-neutral-800 disabled:opacity-60 dark:hover:bg-white/10 dark:text-neutral-200"
                    aria-label={`Editar etiqueta ${displayName}`}
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                </div>

                {isEditing ? (
                  <div className="mt-3 space-y-3 rounded-xl bg-white/60 p-3 shadow-sm dark:bg-white/10">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold uppercase text-neutral-500 dark:text-neutral-300">
                        Nombre
                      </label>
                      <input
                        type="text"
                        value={draftName}
                        onChange={(event) => setDraftName(event.target.value)}
                        className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-800 focus:border-[var(--color-brand-500)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-300)]/50 dark:border-white/10 dark:bg-white/5 dark:text-neutral-100"
                      />
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      <label className="text-xs font-semibold uppercase text-neutral-500 dark:text-neutral-300">
                        Color
                      </label>
                      <input
                        type="color"
                        value={draftColor}
                        onChange={(event) => setDraftColor(event.target.value)}
                        className="h-9 w-16 cursor-pointer overflow-hidden rounded-lg border border-neutral-200 bg-white/90 dark:border-white/20"
                      />
                      <div className="ml-auto flex items-center gap-2">
                        <button
                          type="button"
                          onClick={handleCancelEdit}
                          className="rounded-full px-3 py-1 text-xs font-medium text-neutral-500 hover:text-neutral-800 dark:text-neutral-300 dark:hover:text-white"
                        >
                          Cancelar
                        </button>
                        <button
                          type="button"
                          onClick={handleCommitEdit}
                          className="rounded-full bg-[var(--btn-primary-bg)] px-4 py-1.5 text-xs font-semibold text-white shadow hover:bg-[var(--btn-primary-bg-hover)]"
                        >
                          Guardar
                        </button>
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>

        {modalError ? (
          <p className="mt-4 rounded-xl bg-red-50 px-3 py-2 text-xs font-medium text-red-600 dark:bg-red-900/30 dark:text-red-200">
            {modalError}
          </p>
        ) : null}

        <div className="mt-6 space-y-3">
          <button
            type="button"
            disabled={isBusy}
            onClick={() => void handleCreateLabel()}
            className="w-full rounded-full border border-neutral-200 px-4 py-2 text-sm font-semibold text-neutral-600 transition hover:bg-neutral-100 disabled:opacity-60 dark:border-white/10 dark:text-neutral-200 dark:hover:bg-white/10"
          >
            Crear nueva etiqueta
          </button>
          <button
            type="button"
            onClick={() => {
              void runAction(onClearLabel).catch(() => {});
            }}
            disabled={!selectedLabelId || isBusy}
            className="w-full rounded-full border border-neutral-200 px-4 py-2 text-sm font-medium text-neutral-500 transition hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/10 dark:text-neutral-200 dark:hover:bg-white/10"
          >
            Quitar etiqueta de esta tarjeta
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

function CardDragPreview({ card }) {
  if (!card) return null;

  const isDark =
    typeof document !== "undefined" &&
    document.documentElement.classList.contains("dark");

  const styles = {
    backgroundColor: isDark
      ? "var(--color-surface-hover)"
      : "var(--color-surface)",
    color: isDark
      ? "var(--color-neutral-50)"
      : "var(--color-neutral-950)",
    border: isDark
      ? "1px solid rgba(255,255,255,0.1)"
      : "1px solid rgba(0,0,0,0.1)",
    boxShadow: isDark
      ? "0 10px 30px rgba(177, 151, 249, 0.25)"
      : "0 10px 30px rgba(0, 0, 0, 0.15)",
    transition: "background-color 0.25s ease, color 0.25s ease",
  };

  return (
    <div
      className="card-drag-preview w-72 max-w-xs rounded-2xl px-4 py-3 shadow-2xl"
      style={styles}
    >
      <div className="text-sm font-semibold">{card.title}</div>
      {card.description ? (
        <p className="mt-1 text-xs opacity-80 line-clamp-2">
          {card.description}
        </p>
      ) : null}
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
      className="
        flex w-72 flex-shrink-0 items-center justify-center
        rounded-2xl border border-dashed
        px-4 py-5 text-sm font-semibold transition-all duration-300
        shadow-[0_12px_45px_-20px_rgba(0,0,0,0.4)]
        bg-[var(--color-surface)] text-[var(--color-brand-600)] border-[var(--color-brand-200)]
        hover:bg-[var(--color-brand-50)] hover:border-[var(--color-brand-300)] hover:text-[var(--color-brand-700)]
        dark:bg-[var(--color-surface-hover)] dark:text-[var(--color-brand-300)] dark:border-[var(--color-brand-700)]
        dark:hover:bg-[var(--color-brand-800)] dark:hover:border-[var(--color-brand-500)] dark:hover:text-[var(--color-brand-100)]
      "
    >
      <div className="flex items-center gap-2">
        <Plus className="h-4 w-4" />
        <span>Agregar lista</span>
      </div>
    </button>
  );
}

  return (
  <div
    className="
      flex w-72 flex-shrink-0 flex-col rounded-2xl border px-4 py-5
      shadow-[0_12px_45px_-20px_rgba(0,0,0,0.4)] transition-all duration-300

      /* ----- Modo claro ----- */
      bg-[var(--color-surface)] border-[var(--color-brand-200)] text-[var(--color-neutral-900)]
      
      /* ----- Modo oscuro ----- */
      dark:bg-[var(--color-surface-hover)] dark:border-[var(--color-brand-700)] dark:text-[var(--color-neutral-100)]
    "
  >
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <input
        type="text"
        value={listName}
        onChange={(event) => setListName(event.target.value)}
        placeholder="Introduce el título de la lista"
        className="
          w-full rounded-xl border px-3 py-2 text-sm font-medium transition-all duration-200
          bg-[var(--color-surface)] text-[var(--color-neutral-900)] border-[var(--color-neutral-300)]
          placeholder-[var(--color-neutral-500)]
          focus:ring-2 focus:ring-[var(--color-brand-400)] focus:outline-none
          
          dark:bg-[var(--color-surface-hover)] dark:text-[var(--color-neutral-100)]
          dark:border-[var(--color-neutral-700)] dark:placeholder-[var(--color-neutral-400)]
          dark:focus:ring-[var(--color-brand-500)]
        "
        required
        disabled={isAddingList}
      />

      <button
        type="submit"
        className="
          inline-flex w-full items-center justify-center gap-2 rounded-full border
          px-4 py-2 text-sm font-semibold transition-all duration-300
          
          text-[var(--color-brand-700)] bg-[var(--color-brand-100)] border-[var(--color-brand-200)]
          hover:bg-[var(--color-brand-200)] hover:shadow-md

          dark:text-[var(--color-neutral-50)] dark:bg-[var(--color-brand-700)] dark:border-[var(--color-brand-600)]
          dark:hover:bg-[var(--color-brand-600)] dark:hover:shadow-lg
        "
        disabled={!listName.trim() || isAddingList}
      >
        {isAddingList ? (
          "Añadiendo..."
        ) : (
          <>
            <Plus className="h-4 w-4" />
            Añadir lista
          </>
        )}
      </button>

      <button
        type="button"
        onClick={handleCancel}
        className="
          inline-flex w-full items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-medium
          text-[var(--color-neutral-600)] hover:text-[var(--color-neutral-800)]
          dark:text-[var(--color-neutral-400)] dark:hover:text-[var(--color-neutral-200)]
          transition-all duration-200
        "
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
    setItems((prev) => [...prev, { id: Date.now(), text: t, done: false }]);
    setText("");
  };

  const toggleItem = (id) => {
    setItems((prev) =>
      prev.map((it) => (it.id === id ? { ...it, done: !it.done } : it))
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

function InviteModal({ open, onClose, boardId }) {
  const [copied, setCopied] = useState(false);

  if (!open) return null;

  const boardUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/tableros/${boardId}`
      : `/tableros/${boardId}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(boardUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      alert("No se pudo copiar el enlace, cópialo manualmente.");
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
  <div
    className="
      fixed inset-0 z-[998] flex items-center justify-center
      bg-black/40 backdrop-blur-md px-4
    "
    onClick={handleBackdropClick}
  >
    <div
      className="
        w-full max-w-md rounded-2xl border shadow-xl transition-colors duration-300
        bg-[var(--color-surface)] text-[var(--color-neutral-950)]
        dark:bg-[var(--color-surface-hover)] dark:text-[var(--color-neutral-100)]
        border-[var(--color-neutral-200)] dark:border-[var(--color-neutral-700)]
        p-6 backdrop-blur-md
      "
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2
            className="
              text-lg font-bold tracking-tight
              text-[var(--color-brand-700)] dark:text-[var(--color-brand-300)]
              transition-colors duration-300
            "
          >
            Invitar a este tablero
          </h2>

          <p
            className="
              mt-1 text-sm font-medium
              text-[var(--color-brand-500)] dark:text-[var(--color-brand-400)]
              transition-colors duration-300
            "
          >
            Comparte este enlace con la persona que quieras invitar.
          </p>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="
            rounded-full p-1 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-800
            dark:text-neutral-300 dark:hover:bg-[var(--color-surface)] dark:hover:text-white
            transition-colors duration-300
          "
          aria-label="Cerrar"
        >
          ✕
        </button>
        
      </div>
        <div className="mt-4">
          <label className="text-xs font-semibold uppercase text-neutral-500">
            Enlace al tablero
          </label>
          <div className="mt-1 flex gap-2">
            <input
              type="text"
              value={boardUrl}
              readOnly
              className="flex-1 rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-xs text-neutral-800"
            />
            <button
              type="button"
              onClick={handleCopy}
              className="rounded-lg bg-[#4b2fc8] px-3 py-2 text-xs font-semibold text-white hover:bg-[#3a23a3]"
            >
              {copied ? "Copiado" : "Copiar"}
            </button>
          </div>
        </div>
      </div>
    </div>
    
  );
}
