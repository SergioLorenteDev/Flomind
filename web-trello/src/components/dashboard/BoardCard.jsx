import Card from "../ui/Card.jsx";

export default function BoardCard({ name, updatedAt, onOpen }) {
  return (
    <button
      onClick={onOpen}
      className={[
        "text-left w-full group",                     
        "motion-safe:transition-transform motion-safe:duration-200",
        "hover:-translate-y-0.5 hover:scale-[1.015]",  
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-300 rounded-2xl",
      ].join(" ")}
    >
      <Card className="p-5">
        <div className="h-10 w-10 rounded-lg bg-brand-100 board-icon" />
        <h3 className="mt-3 text-base font-semibold">{name}</h3>
        <p className="mt-1 text-xs text-neutral-600">Actualizado {updatedAt}</p>
      </Card>
    </button>
  );
}
