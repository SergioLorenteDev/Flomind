const BRAND_LOGO_LAYER = "/Logo_transparente_morado.png";
const BRAND_GRADIENT =
  "linear-gradient(135deg, rgba(90,54,199,0.95) 0%, rgba(58,128,255,0.92) 100%)";

export const BOARD_BACKGROUND_OPTIONS = [
  {
    id: "default",
    label: "Color predeterminado",
    type: "color",
    value: "#2d1b8a",
  },
  {
    id: "city",
    label: "Ciudad",
    type: "image",
    value: "/backgrounds/ciudad.webp",
  },
  {
    id: "ferris",
    label: "Noria",
    type: "image",
    value: "/backgrounds/noria.webp",
  },
  {
    id: "mountain",
    label: "Montana",
    type: "image",
    value: "/backgrounds/montana.webp",
  },
  {
    id: "snow",
    label: "Nieve",
    type: "image",
    value: "/backgrounds/nieve.webp",
  },
];

export function resolveBoardBackground(boardBackground) {
  if (!boardBackground) {
    return BOARD_BACKGROUND_OPTIONS[0];
  }

  const matched =
    BOARD_BACKGROUND_OPTIONS.find((option) => option.value === boardBackground) ||
    BOARD_BACKGROUND_OPTIONS.find((option) => option.id === boardBackground);

  return matched ?? BOARD_BACKGROUND_OPTIONS[0];
}

export function boardBackgroundToStyle(
  background,
  fallback = BRAND_GRADIENT
) {
  const defaultColor = BOARD_BACKGROUND_OPTIONS[0]?.value;

  if (
    !background ||
    background === "default" ||
    (typeof background === "string" &&
      defaultColor &&
      background.trim().toLowerCase() === defaultColor.toLowerCase())
  ) {
    return {
      backgroundImage: `url(${BRAND_LOGO_LAYER}), ${fallback}`,
      backgroundSize: "110px, cover",
      backgroundRepeat: "no-repeat, no-repeat",
      backgroundPosition: "center, center",
      backgroundColor: "#4b2cc9",
    };
  }

  const trimmed = background.trim();
  if (
    trimmed.startsWith("#") ||
    trimmed.startsWith("rgb") ||
    trimmed.startsWith("hsl")
  ) {
    return { background: trimmed };
  }

  return {
    backgroundImage: `url(${trimmed})`,
    backgroundSize: "cover",
    backgroundPosition: "center",
  };
}
