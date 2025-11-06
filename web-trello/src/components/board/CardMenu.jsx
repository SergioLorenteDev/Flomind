import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";

const MENU_OPTIONS = [
  { id: "edit-labels", label: "Editar etiquetas" },
  { id: "change-members", label: "Cambiar miembros" },
  { id: "edit-dates", label: "Editar fechas" },
  { id: "move", label: "Mover" },
  { id: "copy-card", label: "Copiar tarjeta" },
  { id: "copy-link", label: "Copiar enlace" },
  { id: "archive", label: "Archivar" },
];

export default function CardMenu({ anchorRect, onAction, onClose }) {
  const menuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        onClose?.();
      }
    }
    function handleEsc(event) {
      if (event.key === "Escape") onClose?.();
    }

    window.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("keydown", handleEsc);
    return () => {
      window.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("keydown", handleEsc);
    };
  }, [onClose]);

  if (!anchorRect) return null;

  const top = anchorRect.top + window.scrollY;
  const left = anchorRect.right + 12 + window.scrollX;
  const isDark = document.documentElement.classList.contains("dark");

  return createPortal(
    <div className={isDark ? "dark" : ""}>
      <div
        ref={menuRef}
        className="
          fixed z-50 w-52 rounded-3xl overflow-hidden border shadow-2xl
          bg-[var(--color-surface)] text-[var(--color-neutral-950)] border-[rgba(0,0,0,0.1)]
          dark:bg-[var(--color-surface-hover)] dark:text-[var(--color-neutral-950)] dark:border-[rgba(255,255,255,0.1)]
        "
        style={{ top, left }}
      >
        <ul className="py-2">
          {MENU_OPTIONS.map((option) => (
            <li key={option.id}>
              <button
                onClick={() => onAction?.(option.id)}
                className="
                  w-full px-4 py-2 text-left transition
                  hover:bg-[var(--color-brand-500)]/15 hover:text-[var(--color-brand-700)]
                  dark:hover:bg-[var(--color-brand-500)]/25 dark:hover:text-[var(--color-brand-300)]
                "
              >
                {option.label}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>,
    document.body
  );
}
