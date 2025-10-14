// src/pages/Dashboard.jsx
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../modules/auth/AuthContext.jsx";
import Button from "../components/ui/Button.jsx";

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  // estado para tableros
  const [boards, setBoards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");

  // cargar tableros del usuario
  useEffect(() => {
    async function loadBoards() {
      try {
        setLoading(true);
        setError("");
        const res = await fetch("/api/boards", {
          credentials: "include",
          headers: { Accept: "application/json" },
        });
        if (!res.ok) {
          throw new Error("No se pudieron cargar los tableros");
        }
        const data = await res.json();
        setBoards(Array.isArray(data) ? data : []);
      } catch (e) {
        setError(e.message || "Error al cargar los tableros");
      } finally {
        setLoading(false);
      }
    }
    loadBoards();
  }, []);

  // filtro simple por nombre
  const filtered = boards.filter((b) =>
    (b.name || "").toLowerCase().includes(query.toLowerCase())
  );

  return (
    <section className="min-h-screen px-4 py-8">
      <div className="mx-auto w-full max-w-4xl">

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold">Dashboard</h1>
            <p className="text-sm text-neutral-600">
              Estás conectado como{" "}
              <span className="font-medium">{user?.email || "usuario"}</span>
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button onClick={() => navigate("/tableros/nuevo")}>Crear tablero</Button>
            <Button variant="secondary" onClick={() => navigate("/tableros")}>
              Ver tableros
            </Button>
            <Button variant="ghost" onClick={signOut}>
              Cerrar sesión
            </Button>
          </div>
        </div>


        <div className="mt-6">
          <label className="mb-1 block text-sm font-medium text-neutral-800">
            Buscar tableros
          </label>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Escribe un nombre…"
            className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-violet-600"
          />
        </div>


        <div className="mt-8">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Tus tableros</h2>
            <Link to="/tableros" className="text-sm text-violet-600 hover:underline">
              Ver todos
            </Link>
          </div>

          {loading && (
            <div className="rounded-lg border p-4 text-sm text-neutral-600">
              Cargando tableros…
            </div>
          )}

          {!loading && error && (
            <div className="rounded-lg border border-red-300 bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          )}

          {!loading && !error && filtered.length === 0 && (
            <div className="rounded-lg border p-4 text-sm text-neutral-600">
              No hay tableros
            </div>
          )}

          {!loading && !error && filtered.length > 0 && (
            <ul className="divide-y rounded-lg border">
              {filtered.map((b) => (
                <li key={b.id} className="flex items-center justify-between p-4">
                  <div>
                    <div className="font-medium">{b.name}</div>
                    <div className="text-xs text-neutral-500">
                      {(b.listsCount || 0)} listas · {(b.cardsCount || 0)} tarjetas
                    </div>
                  </div>
                  <Button variant="secondary" onClick={() => navigate(`/tableros/${b.id}`)}>
                    Abrir
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </div>


        <div className="mt-10">
          <h2 className="mb-3 text-lg font-semibold">Plantillas</h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            

            
          </div>
        </div>
        
      </div>
    </section>
  );
}
