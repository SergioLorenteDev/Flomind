import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Button from '../components/ui/Button.jsx';

// La API DEBE apuntar al puerto 8080 de tu backend Java
const API_BASE_URL = 'http://localhost:8080';

export default function TableroDetalle() {
    // useParams() obtiene el ID de la URL (ej: '11' de /tableros/11)
    const { id } = useParams(); 
    const navigate = useNavigate();

    const [board, setBoard] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!id) {
            setError('ID de tablero no proporcionado.');
            setLoading(false);
            return;
        }

        const fetchBoard = async () => {
            try {
                setLoading(true);
                setError(null);
                
                // ⭐ CORRECCIÓN DE PUERTO AQUÍ: La petición va al 8080
                const API_URL = `${API_BASE_URL}/trello/v1/tableros/${id}`;
                
                const res = await fetch(API_URL, {
                    headers: { Accept: "application/json" },
                });

                if (res.status === 404) {
                    throw new Error("Tablero no encontrado (Error 404).");
                }
                if (!res.ok) {
                    throw new Error(`Error al cargar el tablero: ${res.statusText}`);
                }

                const data = await res.json();
                setBoard(data);
            } catch (e) {
                console.error("Error fetching board:", e);
                setError(e.message);
            } finally {
                setLoading(false);
            }
        };

        fetchBoard();
    }, [id]); // Dependencia: re-ejecutar si el ID de la URL cambia

    if (loading) {
        return (
            <div className="min-h-screen p-8 flex justify-center items-center bg-neutral-50">
                <p className="text-xl text-neutral-600">Cargando tablero...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen p-8 bg-neutral-50">
                <div className="mx-auto w-full max-w-lg bg-red-100 border border-red-400 text-red-700 p-4 rounded-xl shadow-lg">
                    <h1 className="text-2xl font-bold mb-2">Error de Carga</h1>
                    <p className="mb-4">No se pudo cargar el tablero con ID: {id}.</p>
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

    // Si el tablero no se encuentra después de cargar (o los datos son nulos por alguna razón)
    if (!board) {
         return (
            <div className="min-h-screen p-8 bg-neutral-50">
                <div className="mx-auto w-full max-w-lg bg-orange-100 border border-orange-400 text-orange-700 p-4 rounded-xl shadow-lg">
                    <h1 className="text-2xl font-bold mb-2">Tablero No Encontrado</h1>
                    <p>El servidor no devolvió datos para el ID: {id}.</p>
                    <div className="mt-4 flex justify-end">
                        <Button onClick={() => navigate('/tableros')} variant="secondary">
                            Volver a Tableros
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    // Vista de detalle si se carga correctamente
    return (
        <section className="min-h-screen p-8 bg-blue-50">
            <div className="mx-auto w-full max-w-5xl bg-white p-8 rounded-xl shadow-2xl">
                <div className="flex justify-between items-center border-b pb-4 mb-6">
                    <h1 className="text-4xl font-extrabold text-blue-800">{board.name}</h1>
                    <Button onClick={() => navigate('/tableros')} variant="secondary">
                        Regresar
                    </Button>
                </div>

                <p className="text-lg text-neutral-700 mb-6">
                    {board.description || "Sin descripción proporcionada."}
                </p>

                <div className="grid grid-cols-2 gap-4 text-sm text-neutral-600">
                    <p><strong>ID:</strong> {board.id}</p>
                    <p><strong>Creado por Usuario ID:</strong> {board.createdBy}</p>
                    <p><strong>Fecha de Creación:</strong> {new Date(board.createdOn).toLocaleDateString()}</p>
                </div>
                
                <div className="mt-8 pt-4 border-t">
                    <h2 className="text-2xl font-semibold mb-4 text-blue-700">Listas (Pendiente de Implementación)</h2>
                    <p className="text-neutral-500">Aquí irían las listas y tarjetas de tu tablero.</p>
                </div>
            </div>
        </section>
    );
}