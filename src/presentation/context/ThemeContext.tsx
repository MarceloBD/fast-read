import { createContext, useContext, useEffect, type ReactNode } from "react";
import { ThemeType } from "../../domain/enums/ThemeType";
import { useReader } from "./ReaderContext";

interface ThemeContextValue {
  currentTheme: ThemeType;
  setTheme: (theme: ThemeType) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

const THEME_TO_ATTRIBUTE: Record<ThemeType, string> = {
  [ThemeType.DARK]: "dark",
  [ThemeType.LIGHT]: "light",
  [ThemeType.SEPIA]: "sepia",
  [ThemeType.HIGH_CONTRAST]: "high-contrast",
};

export function ThemeProvider({ children }: { children: ReactNode }) {
  const { state, updateSettings } = useReader();
  const { settings } = state;

  useEffect(() => {
    const attribute = THEME_TO_ATTRIBUTE[settings.theme];
    document.documentElement.setAttribute("data-theme", attribute);
  }, [settings.theme]);

  const setTheme = (theme: ThemeType) => {
    updateSettings(settings.withTheme(theme));
  };

  return (
    <ThemeContext.Provider value={{ currentTheme: settings.theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
