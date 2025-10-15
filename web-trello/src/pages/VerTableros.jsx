// src/pages/VerTableros.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Button from "../components/ui/Button.jsx";

export default function VerTableros() {
  const navigate = useNavigate();
  const location = useLocation();

  const urlQuery = new URLSearchParams(location.search).get("q") || "";

  const [boards, setBoards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState(urlQuery);

  useEffect(() => {
    setQuery(urlQuery);
  }, [urlQuery]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        setError("");
        const res = await fetch("/api/boards", {
          credentials: "include",
          headers: { Accept: "application/json" },
        });
        if (!res.ok) throw new Error("No se pudieron cargar los tableros");
        const data = await res.json();
        if (!cancelled) setBoards(Array.isArray(data) ? data : []);
      } catch (e) {
        if (!cancelled) setError(e.message || "Error al cargar los tableros");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return boards;
    return boards.filter((b) => (b.name || "").toLowerCase().includes(q));
  }, [boards, query]);

  function applyQueryToUrl(next) {
    const params = new URLSearchParams(location.search);
    if (next.trim()) params.set("q", next.trim());
    else params.delete("q");
    navigate({ pathname: "/tableros", search: params.toString() ? `?${params}` : "" }, { replace: true });
  }

  return (
    <section className="min-h-screen bg-gradient-to-b from-neutral-50 to-white px-4 py-8">
      <div className="mx-auto w-full max-w-5xl">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-xl font-bold">Tus tableros</h1>
          <div className="flex gap-2">
            <Button onClick={() => navigate("/tableros/nuevo")}>Crear tablero</Button>
            <Button variant="secondary" onClick={() => navigate("/dashboard")}>Volver</Button>
          </div>
        </div>

        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <label className="mb-1 block text-sm font-medium text-neutral-800">
            Buscar tableros
          </label>
          <div className="flex gap-2">
            <input
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                applyQueryToUrl(e.target.value);
              }}
              placeholder="Escribe un nombre…"
              className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm outline-none focus:border-violet-600 focus:ring-4 focus:ring-violet-100"
            />
            {query && (
              <Button variant="secondary" onClick={() => { setQuery(""); applyQueryToUrl(""); }}>
                Limpiar
              </Button>
            )}
          </div>
        </div>

        <div className="mt-6">
          {loading && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <SkeletonCard /><SkeletonCard /><SkeletonCard />
            </div>
          )}

          {!loading && error && (
            <div className="rounded-xl border border-red-300 bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          )}

          {!loading && !error && filtered.length === 0 && (
            <div className="rounded-2xl border bg-white p-8 text-center shadow-sm">
              <h3 className="text-base font-semibold text-neutral-900">No hay tableros</h3>
              <p className="mt-1 text-sm text-neutral-600">
                Crea tu primer tablero para empezar a organizar tus tareas.
              </p>
              <Button className="mt-4" onClick={() => navigate("/tableros/nuevo")}>
                Crear tablero
              </Button>
            </div>
          )}

          {!loading && !error && filtered.length > 0 && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((b) => (
                <BoardCard
                  key={b.id}
                  name={b.name}
                  lists={b.listsCount || 0}
                  cards={b.cardsCount || 0}
                  onOpen={() => navigate(`/tableros/${b.id}`)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function BoardCard({ name, lists, cards, onOpen }) {
  return (
    <button
      onClick={onOpen}
      className="h-full rounded-2xl border bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="line-clamp-2 text-base font-semibold text-neutral-900">{name}</div>
      <div className="mt-2 text-xs text-neutral-500">
        {lists} listas · {cards} tarjetas
      </div>
      <div className="mt-4 text-sm text-violet-700 underline">Abrir</div>
    </button>
  );
}

function SkeletonCard() {
  return (
    <div className="h-32 animate-pulse rounded-2xl border bg-white p-5 shadow-sm">
      <div className="h-4 w-2/3 rounded bg-neutral-200" />
      <div className="mt-3 h-3 w-24 rounded bg-neutral-200" />
      <div className="mt-2 h-3 w-16 rounded bg-neutral-200" />
    </div>
  );
}
