export default function Button({
  children,
  type = "button",
  variant = "primary",
  full,
  ...props
}) {
  const variants = {
    primary:
      "bg-[var(--btn-primary-bg)] hover:bg-[var(--btn-primary-bg-hover)] text-[var(--btn-primary-text)]",
    secondary:
      "bg-[var(--btn-secondary-bg)] hover:bg-[var(--btn-secondary-bg-hover)] text-[var(--btn-secondary-text)]",
    ghost:
      "bg-transparent hover:bg-[var(--btn-ghost-bg-hover)] text-[var(--btn-ghost-text)]",
       danger:
      "bg-transparent border border-[var(--btn-danger-border)] text-[var(--btn-danger-text)] " +
      "hover:bg-[var(--btn-danger-hover-bg)] hover:border-[var(--btn-danger-border)] transition-colors duration-200",
  };

  return (
    <button
      type={type}
      className={`rounded-xl px-4 py-3 font-medium transition-colors duration-200 ${variants[variant]} ${
        full ? "w-full" : ""
      }`}
      {...props}
    >
      {children}
    </button>
  );
}
