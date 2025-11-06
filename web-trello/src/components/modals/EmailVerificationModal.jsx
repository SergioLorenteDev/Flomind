import { Link } from "react-router-dom";

export default function EmailVerificationModal({ email, onClose }) {
  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/45 backdrop-blur-sm px-4">
      <div className="w-full max-w-md rounded-3xl border border-white/20 bg-white/95 p-6 shadow-2xl transition-colors duration-300 dark:border-white/10 dark:bg-[#1f1a2b]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-[var(--color-brand-700)] dark:text-[var(--color-brand-200)]">
              Confirma tu correo
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-neutral-600 dark:text-neutral-300">
              Te hemos enviado un correo a{" "}
              <span className="font-semibold text-[var(--color-brand-600)] dark:text-[var(--color-brand-300)]">
                {email}
              </span>
              . Sigue el enlace que encontrarás allí para activar tu cuenta antes de iniciar sesión.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 dark:hover:bg-white/10"
            aria-label="Cerrar"
          >
            ✕
          </button>
        </div>

        <div className="mt-6 space-y-3">
          <Link
            to="/login"
            className="flex w-full items-center justify-center rounded-full bg-[var(--btn-primary-bg)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[var(--btn-primary-bg-hover)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-300)]/60 focus:ring-offset-1"
          >
            Ir al inicio de sesión
          </Link>
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-full border border-neutral-200 px-4 py-2 text-sm font-medium text-neutral-500 transition hover:bg-neutral-100 dark:border-white/10 dark:text-neutral-200 dark:hover:bg-white/10"
          >
            Cerrar
          </button>
        </div>

        <p className="mt-4 text-xs text-neutral-500 dark:text-neutral-400">
          ¿No llega el correo? Revisa la carpeta de spam o inténtalo de nuevo más tarde.
        </p>
      </div>
    </div>
  );
}
