"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export type TraceTheme = "moss" | "forensic";

type ThemeContextType = {
  theme: TraceTheme;
  setTheme: (theme: TraceTheme) => void;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextType | null>(null);

const STORAGE_KEY = "trace-theme";

export function TraceThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [theme, setThemeState] = useState<TraceTheme>("moss");

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as TraceTheme | null;

    if (stored === "moss" || stored === "forensic") {
      setThemeState(stored);
    }
  }, []);

  useEffect(() => {
    const body = document.body;

    body.classList.remove("theme-moss", "theme-forensic");

    body.classList.add(
      theme === "moss"
        ? "theme-moss"
        : "theme-forensic"
    );

    localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  const value = useMemo(
    () => ({
      theme,
      setTheme: setThemeState,
      toggleTheme: () =>
        setThemeState((prev) =>
          prev === "moss"
            ? "forensic"
            : "moss"
        ),
    }),
    [theme]
  );

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTraceTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error(
      "useTraceTheme must be used inside TraceThemeProvider"
    );
  }

  return context;
}