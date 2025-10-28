import React, { useEffect, useState, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import Button from "../components/ui/Button.jsx";
import { Plus } from 'lucide-react'; 
import { apiFetch } from "../modules/apiClient";


// Componente de Presentación para cada Lista (Columna)
function KanbanList({ list, cards }) {
  const tarjetas = Array.isArray(cards) ? cards : [];

  return (
    <div className="w-72 flex-shrink-0 bg-gray-100 rounded-xl shadow-md p-3 max-h-full flex flex-col overflow-hidden">
      <h4 className="font-semibold text-lg text-neutral-800 border-b border-neutral-300 pb-2 mb-3 truncate">
        {list.nombre}
      </h4>

      <div className="flex-grow overflow-y-auto space-y-2 pr-1">
        {tarjetas.length === 0 ? (
          <div className="h-16 flex items-center justify-center bg-white rounded-lg text-sm text-neutral-400 border border-dashed">
            No hay tarjetas todavía
          </div>
        ) : (
          tarjetas.map((card) => (
            <div key={card.id} className="bg-white rounded-lg p-3 shadow-sm border border-neutral-200">
              <div className="text-sm font-medium text-neutral-800">{card.title}</div>
              {card.description && (
                <p className="mt-1 text-xs text-neutral-500 line-clamp-2">{card.description}</p>
              )}
            </div>
          ))
        )}
      </div>

      <div className="mt-3">
        <Button
          variant="link"
          className="w-full justify-start text-sm text-neutral-500 hover:text-blue-600"
          disabled
        >
          <Plus className="w-4 h-4 mr-1" /> Añadir otra tarjeta
        </Button>
      </div>
    </div>
  );
}

export default function BoardPage() {
    const { boardId } = useParams();
    const navigate = useNavigate();

    const [board, setBoard] = useState(null);
    // Estado que almacena las listas, ordenadas por la propiedad 'orden'
    const [lists, setLists] = useState([]); 
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [listName, setListName] = useState("");
    const [isAddingList, setIsAddingList] = useState(false);
    const [cardsByListId, setCardsByListId] = useState({});
    const [isSaving, setIsSaving] = useState(false);



    // Función combinada para obtener el tablero y sus listas
    const fetchBoardAndLists = useCallback(async () => {
        if (!boardId) {
            setError('ID de tablero no proporcionado.');
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError(null);

            /*
            const [boardData, listsData, cardsData] = await Promise.all([
                apiFetch(`/tableros/${boardId}`),
                apiFetch(`/tableros/${boardId}/listas`),
                //apiFetch(`/tarjetas`) // Comentado hasta que se implemente en backend
            ]);
            */
            const boardData = await apiFetch(`/tableros/${boardId}`);
            setBoard(boardData);

            let listsData = [];
            try {
                listsData = await apiFetch(`/tableros/${boardId}/listas`);
            } catch (listError) {
                console.warn("No se pudieron cargar las listas:", listError);
            }

            const sortedLists = (Array.isArray(listsData) ? listsData : [])
                .sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0));
            setLists(sortedLists);

            const byList = {};
            /*
            (Array.isArray(cardsData) ? cardsData : []).forEach(card => {
                const listKey = card.owningListId;
                if (!byList[listKey]) byList[listKey] = [];
                byList[listKey].push(card);
            });
            Object.values(byList).forEach(listCards =>
                listCards.sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
            );
            setCardsByListId(byList);
            */ // Comentado hasta que se implemente en backend
            setCardsByListId(byList);
        } catch (e) {
        console.error("Error fetching board, lists or cards:", e);
        setError(e.message);
        } finally {
        setLoading(false);
        }

    }, [boardId]);

    // Ejecutar la carga al montar y si cambia el ID
    useEffect(() => {
        fetchBoardAndLists();
    }, [fetchBoardAndLists]);


    // Función para crear una nueva lista
    const handleAddList = async (event) => {
        event.preventDefault();
        if (!listName.trim()) return;

        try {
            setIsAddingList(true);
            const newList = await apiFetch(
            `/tableros/${boardId}/listas`,
            {
                method: "POST",
                body: JSON.stringify({
                nombre: listName.trim(),
                orden: lists.length
                })
            }
            );

            setLists(prev =>
            [...prev, newList].sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0))
            );
            setCardsByListId(prev => ({ ...prev, [newList.idLista]: [] }));
            setListName("");
        } catch (e) {
            console.error("Fallo al crear la lista:", e);
            setError(`Error al crear la lista: ${e.message}`);
        } finally {
            setIsAddingList(false);
        }
    };



    // Manejo de estados de carga y error (sin cambios)
    if (loading) return <div className="p-6">Cargando tablero...</div>;
    
    if (error) {
        return (
            <div className="p-8 bg-neutral-50">
                <div className="mx-auto w-full max-w-lg bg-red-100 border border-red-400 text-red-700 p-4 rounded-xl shadow-lg">
                    <h1 className="text-2xl font-bold mb-2">Error de Carga</h1>
                    <p className="mb-4">No se pudo cargar el tablero con ID: {boardId}.</p>
                    <p className="font-mono text-sm">{error}</p>
                    <div className="mt-4 flex justify-end">
                        <Button onClick={() => navigate('/tableros')} variant="secondary">
                            Volver a Tableros
                        </Button>
                    </div>
                </div>
            </div>
        );
    }
    
    if (!board) return <div className="p-6">Tablero no encontrado (Verifique el ID en la URL).</div>;

    // Vista principal del tablero (Kanban)
    return (
        <div className="flex flex-col h-screen overflow-hidden bg-blue-700">
            {/* Header del Tablero */}
            <header className="flex items-center justify-between p-4 bg-blue-800 text-white shadow-xl flex-shrink-0">
                <div className="flex items-center space-x-4">
                    <h1 className="text-2xl font-bold">{board.name}</h1>
                    <span className="text-sm opacity-80">ID: {board.id}</span>
                </div>
                <Link to="/tableros">
                    <Button variant="secondary" className="bg-white text-blue-800 hover:bg-blue-100">
                        Volver a Tableros
                    </Button>
                </Link>
            </header>

            {/* Mensaje de Error (si existe un error que no impidió la carga) */}
            {error && (
                <div className="p-3 bg-red-400 text-white text-sm">
                    {error}
                </div>
            )}

            {/* Área principal de listas (Scroll Horizontal) */}
            <main className="flex-grow overflow-x-auto overflow-y-hidden p-4">
                <div className="flex space-x-4 h-full items-start">
                    
                    {/* Renderizar Listas */}
                    {lists.map((list) => (
                        <KanbanList 
                            key={list.idLista} 
                            list={list} 
                            cards={cardsByListId[list.idLista] || []}
                        />
                    ))}

                    {/* Formulario para añadir nueva Lista */}
                    <div className="w-72 flex-shrink-0">
                        <form 
                            onSubmit={handleAddList} 
                            className="bg-neutral-200 rounded-xl p-3 shadow-lg"
                        >
                            <input
                                type="text"
                                value={listName}
                                onChange={(e) => setListName(e.target.value)}
                                placeholder="Introduce el título de la lista"
                                className="w-full p-2 mb-2 rounded border border-gray-300 focus:border-blue-500 outline-none"
                                required
                                disabled={isAddingList}
                            />
                            <Button 
                                type="submit" 
                                className="bg-blue-600 hover:bg-blue-700 text-white w-full"
                                disabled={!listName.trim() || isAddingList}
                            >
                                {isAddingList ? 'Añadiendo...' : <><Plus className="w-4 h-4 mr-1" /> Añadir Lista</>}
                            </Button>
                        </form>
                    </div>

                </div>
            </main>
        </div>
    );
}
