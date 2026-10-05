"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

export type PlatformMode = "dev" | "english";

interface PlatformModeContextType {
  mode: PlatformMode;
  setMode: (mode: PlatformMode) => void;
  toggleMode: () => void;
  isEnglish: boolean;
}

const PlatformModeContext = createContext<PlatformModeContextType>({
  mode: "dev",
  setMode: () => {},
  toggleMode: () => {},
  isEnglish: false,
});

export const PLATFORM_MODE_STORAGE_KEY = "devpracticelab_platform_mode";

export function PlatformModeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setModeState] = useState<PlatformMode>("dev");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const savedMode = localStorage.getItem(PLATFORM_MODE_STORAGE_KEY) as PlatformMode | null;
      if (savedMode === "english" || savedMode === "dev") {
        setModeState(savedMode);
        if (savedMode === "english") {
          document.documentElement.classList.add("theme-english");
        } else {
          document.documentElement.classList.remove("theme-english");
        }
      }
    } catch {
      // Ignore storage errors in restricted contexts
    }
  }, []);

  const setMode = (newMode: PlatformMode) => {
    setModeState(newMode);
    try {
      localStorage.setItem(PLATFORM_MODE_STORAGE_KEY, newMode);
    } catch {
      // Ignore
    }
    if (newMode === "english") {
      document.documentElement.classList.add("theme-english");
    } else {
      document.documentElement.classList.remove("theme-english");
    }
  };

  const toggleMode = () => {
    setMode(mode === "dev" ? "english" : "dev");
  };

  return (
    <PlatformModeContext.Provider
      value={{
        mode,
        setMode,
        toggleMode,
        isEnglish: mounted ? mode === "english" : false,
      }}
    >
      {children}
    </PlatformModeContext.Provider>
  );
}

export function usePlatformMode() {
  return useContext(PlatformModeContext);
}
