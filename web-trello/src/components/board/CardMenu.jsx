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

  return createPortal(
    <div
      ref={menuRef}
      className="fixed z-50 w-52 rounded-3xl bg-[#11111a] text-sm text-neutral-100 shadow-2xl border border-neutral-700/70 overflow-hidden"
      style={{ top, left }}
    >
      <ul className="py-2">
        {MENU_OPTIONS.map((option) => (
          <li key={option.id}>
            <button
              onClick={() => onAction?.(option.id)}
              className="w-full px-4 py-2 text-left hover:bg-violet-500/20 hover:text-white transition"
            >
              {option.label}
            </button>
          </li>
        ))}
      </ul>
    </div>,
    document.body
  );
}
