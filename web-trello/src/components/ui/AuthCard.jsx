export default function AuthCard({ title, subtitle, children, footer }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8">
        <h1 className="text-4xl font-extrabold tracking-tight">{title}</h1>
        {subtitle && <p className="text-2xl mt-2 text-gray-600">{subtitle}</p>}
        <div className="mt-8 space-y-4">{children}</div>
        {footer && <div className="mt-8 text-center text-sm text-gray-600">{footer}</div>}
      </div>
    </div>
  );
}
