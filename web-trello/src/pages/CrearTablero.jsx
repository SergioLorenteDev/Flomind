import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Button from "../components/ui/Button.jsx";
import TEMPLATES from "../templates.js";

export default function CrearTablero() {
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const plantillaInicial = params.get("plantilla") || "";
  const vieneDePlantilla = useMemo(() => Boolean(plantillaInicial), [plantillaInicial]);

  const [name, setName] = useState("");
  const [plantilla, setPlantilla] = useState("");

  useEffect(() => {
    if (vieneDePlantilla && TEMPLATES[plantillaInicial]) {
      setPlantilla(plantillaInicial);
      setName(TEMPLATES[plantillaInicial].name || "");
    } else {
      setPlantilla("");
      setName("");
    }
  }, [vieneDePlantilla, plantillaInicial]);

  const tpl = plantilla && TEMPLATES[plantilla] ? TEMPLATES[plantilla] : null;

  async function handleCreate() {
    if (!name.trim()) {
      alert("Pon un nombre al tablero");
      return;
    }
    try {
      const resBoard = await fetch("/api/boards", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        credentials: "include",
        body: JSON.stringify({ name: name.trim() }),
      });
      if (!resBoard.ok) throw new Error("No se pudo crear el tablero");
      const board = await resBoard.json();
      if (board?.id) navigate(`/tableros/${board.id}`, { replace: true });
      else navigate("/tableros", { replace: true });
    } catch (e) {
      alert(e.message || "Error al crear el tablero");
    }
  }

  return (
    <section className="min-h-screen bg-gradient-to-b from-neutral-50 to-white px-4 py-8">
      <div className="mx-auto w-full max-w-3xl">
        <div className="mb-4">
          <Button variant="secondary" onClick={() => navigate(-1)}>← Volver</Button>
        </div>

        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <h1 className="text-xl font-bold">Creación de tableros</h1>

          <div className="mt-5">
            <label className="mb-1 block text-sm font-medium">Nombre del tablero</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nombre del tablero"
              className="w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-violet-600 focus:ring-4 focus:ring-violet-100"
            />
          </div>

          {vieneDePlantilla && (
            <>
              <div className="mt-5">
                <label className="mb-1 block text-sm font-medium">Plantilla seleccionada</label>
                <select
                  value={plantilla}
                  onChange={(e) => setPlantilla(e.target.value)}
                  className="w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-violet-600 focus:ring-4 focus:ring-violet-100"
                >
                  {Object.entries(TEMPLATES).map(([id, t]) => (
                    <option key={id} value={id}>{t.name}</option>
                  ))}
                </select>
              </div>

              {tpl && (
                <div className="mt-6">
                  <h2 className="text-base font-semibold">Vista previa</h2>
                  <ul className="mt-2 space-y-2">
                    {tpl.lists.map((l, i) => (
                      <li key={i} className="rounded border p-3">
                        <div className="font-medium">{l.name}</div>
                        {!!l.cards?.length && (
                          <ul className="ml-4 list-disc text-sm text-neutral-600">
                            {l.cards.map((c, j) => <li key={j}>{c}</li>)}
                          </ul>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          )}

          <div className="mt-6 flex gap-2">
            <Button onClick={handleCreate} disabled={!name.trim()}>Crear tablero</Button>
            <Button variant="secondary" onClick={() => navigate("/tableros")}>Cancelar</Button>
          </div>
        </div>
      </div>
    </section>
  );
}