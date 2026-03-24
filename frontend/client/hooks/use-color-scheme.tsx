import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export const COLOR_SCHEME_STORAGE_KEY = "app-color-scheme";

export const COLOR_SCHEME_IDS = ["default", "slate", "forest", "violet", "warm"] as const;

export type ColorSchemeId = (typeof COLOR_SCHEME_IDS)[number];

export type ColorSchemeOption = {
  id: ColorSchemeId;
  label: string;
  description: string;
};

/** HSL triples for preview swatches (match global.css presets). */
export const COLOR_SCHEME_SWATCHES: Record<
  ColorSchemeId,
  { primary: string; secondary: string }
> = {
  default: { primary: "217 91% 60%", secondary: "142 71% 45%" },
  slate: { primary: "222 47% 11%", secondary: "215 20% 42%" },
  forest: { primary: "168 76% 30%", secondary: "142 61% 38%" },
  violet: { primary: "262 83% 56%", secondary: "292 47% 44%" },
  warm: { primary: "24 95% 44%", secondary: "16 78% 46%" },
};

export const COLOR_SCHEMES: ColorSchemeOption[] = [
  {
    id: "default",
    label: "Ocean",
    description: "Blue and green — the original app look.",
  },
  {
    id: "slate",
    label: "Slate",
    description: "Cool grays with a deep blue-gray accent.",
  },
  {
    id: "forest",
    label: "Forest",
    description: "Teal primary with calm green highlights.",
  },
  {
    id: "violet",
    label: "Violet",
    description: "Purple primary with a complementary accent.",
  },
  {
    id: "warm",
    label: "Warm",
    description: "Amber and terracotta tones on soft neutrals.",
  },
];

function isColorSchemeId(value: string | null): value is ColorSchemeId {
  return value !== null && COLOR_SCHEME_IDS.includes(value as ColorSchemeId);
}

export function getStoredColorScheme(): ColorSchemeId {
  if (typeof window === "undefined") return "default";
  try {
    const raw = window.localStorage.getItem(COLOR_SCHEME_STORAGE_KEY);
    if (isColorSchemeId(raw)) return raw;
  } catch {
    /* ignore */
  }
  return "default";
}

export function applyColorScheme(scheme: ColorSchemeId): void {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  if (scheme === "default") {
    root.removeAttribute("data-color-scheme");
  } else {
    root.dataset.colorScheme = scheme;
  }
}

type ColorSchemeContextValue = {
  scheme: ColorSchemeId;
  setScheme: (next: ColorSchemeId) => void;
};

const ColorSchemeContext = createContext<ColorSchemeContextValue | null>(null);

export function ColorSchemeProvider({ children }: { children: ReactNode }) {
  const [scheme, setSchemeState] = useState<ColorSchemeId>(() => getStoredColorScheme());

  useEffect(() => {
    applyColorScheme(scheme);
  }, [scheme]);

  const setScheme = useCallback((next: ColorSchemeId) => {
    try {
      window.localStorage.setItem(COLOR_SCHEME_STORAGE_KEY, next);
    } catch {
      /* ignore */
    }
    setSchemeState(next);
    applyColorScheme(next);
  }, []);

  const value = useMemo(() => ({ scheme, setScheme }), [scheme, setScheme]);

  return <ColorSchemeContext.Provider value={value}>{children}</ColorSchemeContext.Provider>;
}

export function useColorScheme(): ColorSchemeContextValue {
  const ctx = useContext(ColorSchemeContext);
  if (!ctx) {
    throw new Error("useColorScheme must be used within ColorSchemeProvider");
  }
  return ctx;
}
