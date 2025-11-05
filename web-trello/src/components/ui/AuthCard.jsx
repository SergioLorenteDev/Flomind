export default function AuthCard({ title, subtitle, children, footer, className = "" }) {
  return (
    <div
      className={`
        auth-card w-full max-w-md rounded-3xl p-8 shadow-xl border transition-all duration-500
        bg-[var(--color-surface)] text-[var(--color-neutral-950)]
        dark:bg-[var(--color-surface-hover)] dark:text-[var(--color-neutral-950)]
        ${className}
      `}
    >
      <h1 className="text-3xl font-extrabold tracking-tight mb-2">{title}</h1>

      {subtitle && (
        <p className="text-base text-[var(--color-brand-600)] dark:text-[var(--color-brand-500)] mb-6">
          {subtitle}
        </p>
      )}

      <div className="space-y-4">{children}</div>

      {footer && (
        <div className="mt-8 text-center text-sm text-[var(--color-brand-600)] dark:text-[var(--color-brand-500)]">
          {footer}
        </div>
      )}
    </div>
  );
}
