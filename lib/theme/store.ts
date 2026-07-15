"use client";

import { create } from "zustand";

export type Theme = "dark-red" | "dark-mono" | "light";

interface ThemeState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

function applyToDocument(theme: Theme) {
  if (typeof document === "undefined") return;
  // "dark-red" has no override block in globals.css — it's the :root
  // default — so we remove the attribute rather than set it explicitly.
  if (theme === "dark-red") {
    document.documentElement.removeAttribute("data-theme");
  } else {
    document.documentElement.setAttribute("data-theme", theme);
  }
}

export const useThemeStore = create<ThemeState>((set) => ({
  theme: (typeof window !== "undefined"
    ? (localStorage.getItem("btf-theme") as Theme) || "dark-red"
    : "dark-red") as Theme,
  setTheme: (theme: Theme) => {
    localStorage.setItem("btf-theme", theme);
    applyToDocument(theme);
    set({ theme });
  },
}));
