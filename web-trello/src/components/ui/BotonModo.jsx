import React, { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

export default function BotonModo() {
  const [isDark, setIsDark] = useState(
    document.documentElement.classList.contains("dark")
  );

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    if (saved === "dark") setIsDark(true);
  }, []);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDark]);

  return (
    <button
      onClick={() => setIsDark((v) => !v)}
      className="
        fixed bottom-5 right-5
        z-[999999]  /* siempre visible */
        w-12 h-12
        flex items-center justify-center
        rounded-full shadow-lg
        bg-white text-gray-800
        dark:bg-gray-900 dark:text-yellow-300
        border border-gray-300 dark:border-gray-700
        hover:scale-110 active:scale-95
        transition-all duration-300
      "
      title={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
    >
      {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
    </button>
  );
}
