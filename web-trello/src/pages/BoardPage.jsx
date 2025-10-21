import React, { useEffect, useState, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import Button from "../components/ui/Button.jsx";
// NOTE: Asegúrese de tener instalado este paquete: npm install lucide-react
import { Plus } from 'lucide-react'; 

// 🚨 La API DEBE apuntar al puerto 8080 de tu backend Java
const API_BASE_URL = 'http://localhost:8080';

// Componente de Presentación para cada Lista (Columna)
function KanbanList({ list }) {
    return (
        // Estructura fija de Trello: 288px (w-72) de ancho y sin scroll horizontal en el contenido
        <div 
            className="w-72 flex-shrink-0 bg-gray-100 rounded-xl shadow-md p-3 max-h-full flex flex-col overflow-hidden"
            // Atributos de drag and drop se añadirán en la próxima iteración
        >
            <h4 className="font-semibold text-lg text-neutral-800 border-b border-neutral-300 pb-2 mb-3 truncate">
                {list.nombre}
            </h4>
            
            {/* Contenedor de Tarjetas (Scroll vertical) */}
            <div className="flex-grow overflow-y-auto space-y-2 pr-1">
                {/* // Aquí se renderizarán las Tarjetas (list.tarjetas) 
                */}
                
                {/* Placeholder de contenido */}
                <div className="h-16 flex items-center justify-center bg-white rounded-lg text-sm text-neutral-400 border border-dashed hover:border-blue-400 transition cursor-default">
                    Tarjetas irán aquí...
                </div>
            </div>
            
            {/* Botón de Añadir Tarjeta (Deshabilitado por ahora) */}
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

            // 1. Fetch Board details
            const boardUrl = `${API_BASE_URL}/api/tableros/${boardId}`;
            const boardRes = await fetch(boardUrl, {
                headers: { Accept: "application/json" },
            });

            if (boardRes.status === 404) {
                throw new Error("Tablero no encontrado (Error 404).");
            }
            if (!boardRes.ok) {
                throw new Error(`Error al cargar el tablero: ${boardRes.statusText}`);
            }

            const boardData = await boardRes.json();
            setBoard(boardData);
            
            // 2. Fetch Lists for the Board (usa el endpoint anidado)
            const listsUrl = `${API_BASE_URL}/api/tableros/${boardId}/listas`;
            const listsRes = await fetch(listsUrl, {
                headers: { Accept: "application/json" },
            });
            
            if (!listsRes.ok) {
                // Si falla la carga de listas, registramos una advertencia pero continuamos
                console.warn(`No se pudieron cargar las listas: ${listsRes.statusText}`);
                setLists([]); 
            } else {
                 const listsData = await listsRes.json();
                 // Aseguramos que es un array e inmediatamente lo ordenamos por 'orden'
                 const sortedLists = (Array.isArray(listsData) ? listsData : Array.from(listsData || []))
                     .sort((a, b) => (a.orden || 0) - (b.orden || 0));
                 setLists(sortedLists);
            }

        } catch (e) {
            console.error("Error fetching board or lists:", e);
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
    const handleAddList = async (e) => {
        e.preventDefault();
        if (!listName.trim()) return;

        setIsAddingList(true);
        setError(null);

        try {
            const listData = {
                nombre: listName.trim(), 
                // Asignamos el orden en el frontend. Spring lo respeta.
                orden: lists.length + 1, 
                // Solo necesitamos el ID del board para que Spring lo resuelva
                board: { id: parseInt(boardId) } 
            };

            const API_URL_POST = `${API_BASE_URL}/api/tableros/${boardId}/listas`;
            
            const res = await fetch(API_URL_POST, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(listData),
            });

            if (!res.ok) {
                let errorMsg = `Error al crear la lista: ${res.statusText}`;
                try {
                    const errorBody = await res.json();
                    errorMsg = errorBody.message || errorMsg;
                } catch { /* ignore */ }
                throw new Error(errorMsg);
            }

            const nuevaLista = await res.json();
            
            // Actualizar el estado local para reflejar el cambio en la UI
            setLists(currentLists => 
                [...currentLists, nuevaLista].sort((a, b) => (a.orden || 0) - (b.orden || 0))
            );
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
                        <KanbanList key={list.id} list={list} />
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
