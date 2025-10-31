import { useState, useEffect } from "react";

export default function Button({ children, type = "button", full, disabled, ...props }) {
  const [theme, setTheme] = useState(document.documentElement.getAttribute("data-theme") || "light");

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setTheme(document.documentElement.getAttribute("data-theme"));
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    return () => observer.disconnect();
  }, []);

  const baseStyles = `py-2 px-4 rounded-lg font-semibold transition-all duration-300 ${full ? "w-full" : ""}`;
  const variantStyles =
    theme === "dark"
      ? "bg-[#9b5cff] text-white hover:bg-[#b07cff] shadow-[0_0_15px_rgba(155,92,255,0.4)]"
      : "bg-[#ece8ff] text-[#5a3ea6] hover:bg-[#e0d6ff] shadow-[0_0_8px_rgba(90,62,166,0.2)]";

  return (
    <button type={type} className={`${baseStyles} ${variantStyles}`} disabled={disabled} {...props}>
      {children}
    </button>
  );
}
