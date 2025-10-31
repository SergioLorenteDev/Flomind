export default function AuthCard({ title, subtitle, children, footer }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-transparent">
      <div className="w-full max-w-md rounded-3xl p-8 shadow-none bg-transparent border-none transition-all duration-500">
        {title && <h1 className="text-4xl font-extrabold tracking-tight text-inherit">{title}</h1>}
        {subtitle && <p className="text-2xl mt-2 opacity-90 text-inherit">{subtitle}</p>}
        <div className="mt-8 space-y-4">{children}</div>
        {footer && (
          <div className="mt-8 text-center text-sm opacity-90 text-inherit">{footer}</div>
        )}
      </div>
    </div>
  );
}
