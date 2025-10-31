import React, { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { createPortal } from "react-dom";
import { DndContext, PointerSensor, closestCorners, useSensor, useSensors, DragOverlay } from "@dnd-kit/core";
import { SortableContext, arrayMove, horizontalListSortingStrategy } from "@dnd-kit/sortable";
import { Pencil, Check, X, Loader2, Plus } from "lucide-react";
import Button from "../components/ui/Button.jsx";
import ListColumn from "../components/board/ListColumn.jsx";
import { apiFetch } from "../modules/apiClient";
import { useAuth } from "../modules/auth/AuthContext.jsx";
import logo from "../assets/Logo dashboard2.png";

const SCROLLBAR_STYLE = `.board-scroll::-webkit-scrollbar{display:none}.board-scroll{-ms-overflow-style:none;scrollbar-width:none}`;

export default function BoardPage() {
  const { boardId } = useParams(), navigate = useNavigate();
  const [board, setBoard] = useState(null), [lists, setLists] = useState([]), [cardsByListId, setCardsByListId] = useState({});
  const [loading, setLoading] = useState(true), [error, setError] = useState(null);
  const [listName, setListName] = useState(""), [creatingCardFor, setCreatingCardFor] = useState(null);
  const [isEditingTitle, setIsEditingTitle] = useState(false), [titleDraft, setTitleDraft] = useState(""), [isSavingTitle, setIsSavingTitle] = useState(false);
  const [completedCards, setCompletedCards] = useState(() => new Set()), [activeCard, setActiveCard] = useState(null), [activeList, setActiveList] = useState(null);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  const fetchBoardAndLists = useCallback(async () => {
    try {
      const [boardData, listsData] = await Promise.all([
        apiFetch(`/tableros/${boardId}`),
        apiFetch(`/tableros/${boardId}/listas`)
      ]);
      setBoard(boardData);
      const sortedLists = (listsData || []).sort((a,b)=>(a.orden??0)-(b.orden??0));
      setLists(sortedLists);
      const entries = await Promise.all(sortedLists.map(async l => {
        const cards = await apiFetch(`/listas/${l.idLista}/tarjetas`);
        return [String(l.idLista), (cards||[]).sort((a,b)=>(a.order??0)-(b.order??0)).map(c=>({...c,listId:l.idLista}))];
      }));
      setCardsByListId(Object.fromEntries(entries));
    } catch (e) { setError(e.message); } finally { setLoading(false); }
  }, [boardId]);
  useEffect(() => { fetchBoardAndLists(); }, [fetchBoardAndLists]);

  const theme = document.documentElement.getAttribute("data-theme");
  const dark = theme === "dark";

  const handleCreateCard = async (listId, title) => {
    if (!title.trim()) return;
    try {
      setCreatingCardFor(listId);
      const newCard = await apiFetch(`/listas/${listId}/tarjetas`, { method: "POST", body: JSON.stringify({ title, description: "", cardOrder: cardsByListId[listId]?.length ?? 0 }) });
      setCardsByListId(prev => ({ ...prev, [listId]: [...(prev[listId] || []), newCard] }));
    } catch (e) { setError(e.message); } finally { setCreatingCardFor(null); }
  };

  const handleSubmitTitle = async e => {
    e.preventDefault(); if (!titleDraft.trim()) return;
    try {
      setIsSavingTitle(true);
      const updated = await apiFetch(`/tableros/${boardId}`, { method: "PUT", body: JSON.stringify({ name: titleDraft.trim() }) });
      setBoard(updated); setIsEditingTitle(false);
    } catch (e) { setError(e.message); } finally { setIsSavingTitle(false); }
  };

  if (loading) return <div className="p-6">Cargando tablero...</div>;
  if (error) return <div className="p-6 text-red-600">Error: {error}</div>;

  return (
    <>
      <style>{SCROLLBAR_STYLE}</style>
      <div data-theme={theme} className={`min-h-screen transition-colors ${dark ? "bg-[#0f0c1f] text-white" : "bg-[#f8f6ff] text-[#1a1235]"}`}>
        <BoardTopNav />
<section
  className="border-b bg-[var(--bg-secondary)] border-[var(--border-color)] transition-colors"
>
          <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-6 md:flex-row md:items-center md:justify-between">
            {isEditingTitle ? (
              <form onSubmit={handleSubmitTitle} className="flex items-center gap-2">
                <input value={titleDraft} onChange={e=>setTitleDraft(e.target.value)}
                  className={`rounded-lg border px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 ${dark?"bg-[#1e1935] border-[#4b3acd]/40 text-white focus:ring-[#8f78ff]":"bg-white border-[#cfc0ff] text-[#1a1235] focus:ring-[#846bff]"}`}
                  placeholder="Nombre del tablero" autoFocus disabled={isSavingTitle}/>
                <button type="submit" className="h-9 w-9 flex items-center justify-center rounded-lg bg-emerald-500 text-white hover:bg-emerald-600 disabled:opacity-60">
                  {isSavingTitle?<Loader2 className="h-4 w-4 animate-spin"/>:<Check className="h-4 w-4"/>}
                </button>
                <button type="button" onClick={()=>setIsEditingTitle(false)} className={`h-9 w-9 flex items-center justify-center rounded-lg transition ${dark?"bg-[#2a2450] text-white/80 hover:bg-[#3a2e65]":"bg-[#eae3ff] text-[#4b2fc8] hover:bg-[#d7c8ff]"}`}>
                  <X className="h-4 w-4"/>
                </button>
              </form>
            ) : (
              <div className="flex items-center gap-3">
                <h1 className={`text-2xl font-semibold ${dark?"text-white":"text-[#2d1b8a]"}`}>{board.name}</h1>
                <button onClick={()=>setIsEditingTitle(true)} className={`h-9 w-9 flex items-center justify-center rounded-lg transition ${dark?"bg-[#2a2450] text-white/70 hover:bg-[#3a2e65]":"bg-[#eae3ff] text-[#4b2fc8] hover:bg-[#d7c8ff]"}`}><Pencil className="h-4 w-4"/></button>
              </div>
            )}
            <Button onClick={()=>navigate("/dashboard")} className={`rounded-full px-4 py-2 text-sm shadow-md transition ${dark?"bg-[#6b4dff] text-white hover:bg-[#5c3be5]":"bg-[#7b61ff] text-white hover:bg-[#6949f8]"}`}>Volver a tableros</Button>
          </div>
        </section>

        <main className="mx-auto max-w-7xl px-6 py-6">
          <DndContext sensors={sensors} collisionDetection={closestCorners}>
            <SortableContext items={lists.map(l=>String(l.idLista))} strategy={horizontalListSortingStrategy}>
              <div className="board-scroll flex items-start space-x-5 overflow-x-auto px-1 pb-4 pt-5">
                {lists.map(l => (
                  <ListColumn key={l.idLista} list={l} cards={cardsByListId[String(l.idLista)]||[]} onAddCard={handleCreateCard} isSavingCard={creatingCardFor===l.idLista}/>
                ))}
              </div>
            </SortableContext>
            {createPortal(
              <DragOverlay>{activeCard?<CardDragPreview card={activeCard}/> : activeList?<ListDragPreview list={activeList}/> : null}</DragOverlay>,
              document.body
            )}
          </DndContext>
        </main>
      </div>
    </>
  );
}

function BoardTopNav() {
  const navigate = useNavigate(), { user, signOut } = useAuth();
  const [open, setOpen] = useState(false), ref = useRef(null);
  useEffect(()=>{const c=e=>{if(ref.current&&!ref.current.contains(e.target))setOpen(false)};document.addEventListener("click",c);return()=>document.removeEventListener("click",c)},[]);
  const logout=async()=>{setOpen(false);await signOut();navigate("/login",{replace:true})};
  return (
    <header className="sticky top-0 z-40 bg-[#4b2fc8] text-white shadow-lg">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <button onClick={()=>navigate("/dashboard")} className="flex items-center gap-2 text-lg font-semibold"><img src={logo} alt="Flomind" className="h-9"/></button>
        <input type="search" placeholder="Buscar tableros, listas o tareas..." className="hidden md:block w-72 rounded-xl bg-white/20 px-3 py-2 text-sm text-white placeholder-white/70 focus:ring-2 focus:ring-white/50 outline-none"/>
        <div ref={ref} className="relative">
          <button onClick={()=>setOpen(v=>!v)} className="h-9 w-9 rounded-full bg-white/20 font-semibold">{(user?.email||"U")[0].toUpperCase()}</button>
          {open&&<div className="absolute right-0 mt-2 w-40 rounded-xl bg-white/95 p-1 text-neutral-800 shadow-lg">
            <button onClick={()=>navigate("/perfil")} className="block w-full rounded-md px-3 py-2 text-left text-sm hover:bg-neutral-100">Mi cuenta</button>
            <button onClick={()=>navigate("/ajustes")} className="block w-full rounded-md px-3 py-2 text-left text-sm hover:bg-neutral-100">Ajustes</button>
            <button onClick={logout} className="block w-full rounded-md px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50">Cerrar sesión</button>
          </div>}
        </div>
      </div>
    </header>
  );
}

function CardDragPreview({ card }) { return card ? <div className="w-72 rounded-xl border border-[#4b3acd]/30 bg-[#1e1935] p-4 text-white shadow-lg">{card.title}</div> : null; }
function ListDragPreview({ list }) { return list ? <div className="w-72 rounded-xl border border-[#4b3acd]/30 bg-[#1e1935] p-4 text-white shadow-lg">{list.nombre}</div> : null; }
