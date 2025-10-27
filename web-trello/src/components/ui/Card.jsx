export default function Card({ className = "", children }) {
  return (
    <div
      className={[
        "relative rounded-2xl bg-[var(--color-brand-100)] dark:bg-[var(--color-surface)] border border-black/10 dark:border-[rgba(255,255,255,0.08)]",
        "shadow-[0_1px_0_rgba(16,24,40,0.04),0_2px_8px_rgba(16,24,40,0.06)]",
        // Marquito en modo claro
        "before:pointer-events-none before:absolute before:inset-0 before:rounded-2xl",
        "before:shadow-[inset_0_1px_0_rgba(255,255,255,0.6),inset_0_-1px_0_rgba(15,23,42,0.06)]",
        // En modo oscuro
        "dark:before:shadow-[inset_0_1px_0_rgba(255,255,255,0.05),inset_0_-1px_0_rgba(0,0,0,0.4)]",
        "motion-safe:transition-transform motion-safe:duration-200 motion-safe:ease-out",
        "group-hover:border-brand-200 group-hover:shadow-[0_10px_25px_-12px_rgba(83,51,170,0.28),0_8px_20px_-10px_rgba(16,24,40,0.20)]",
        className,
      ].join(" ")}
    >
      {children}
    </div>
  );
}
