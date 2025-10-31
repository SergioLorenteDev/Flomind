import Card from "../ui/Card.jsx";
import Button from "../ui/Button.jsx";

export default function TemplateCard({ title, desc, onUse }) {
  return (
    <div
      className={[
        "group", 
        "motion-safe:transition-transform motion-safe:duration-200",
        "hover:-translate-y-0.5 hover:scale-[1.012]",
      ].join(" ")}
    >
      <Card className="p-5">
        <div className="h-10 w-10 rounded-lg bg-brand-100 template-icon" />
        <h3
  className="mt-3 text-base font-semibold"
  style={{
    color: "color-mix(in srgb, var(--color-brand-700) 85%, black 15%)",
  }}
>
  {title}
</h3>
<p
  className="mt-1 text-sm"
  style={{
    color: "color-mix(in srgb, var(--color-neutral-800) 80%, black 20%)",
  }}
>
  {desc}
</p>

        <Button variant="secondary" className="mt-4 template-button" onClick={onUse}>
  Usar plantilla
</Button>

      </Card>
    </div>
  );
}
