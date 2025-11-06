import React from "react";
import { Sun, Moon } from "lucide-react";

export default function BotonModo({ theme, toggleTheme }) {
  const isDark = theme === "dark";

  return (
    <button
      onClick={toggleTheme}
      className="
        fixed bottom-5 right-5
        z-[999999]
        w-12 h-12
        flex items-center justify-center
        rounded-full shadow-lg
        bg-white text-gray-800
        dark:bg-gray-900 dark:text-yellow-300
        border border-gray-300 dark:border-gray-700
        hover:scale-110 active:scale-95
        transition-all duration-300
      "
      title={isDark ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
    >
      {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
    </button>
  );
}
