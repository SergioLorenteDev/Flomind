import Button from "../components/ui/Button.jsx";
import { useNavigate } from "react-router-dom";

export default function NuevoTablero() {
  const navigate = useNavigate();

  return (
    <section className="min-h-screen bg-gradient-to-b from-neutral-50 to-white px-4 py-8">
      <div className="mx-auto w-full max-w-3xl">
        <div className="mb-4">
          <Button variant="secondary" onClick={() => navigate(-1)}>← Volver</Button>
        </div>

        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <h1 className="text-xl font-bold">Creación de tableros</h1>
          <p className="mt-2 text-sm text-neutral-600">
            (Aqui iria la creacion de tableros)
          </p>
        </div>
      </div>
    </section>
  );
}
