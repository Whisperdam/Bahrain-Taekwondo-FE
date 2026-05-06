"use client";

import { create } from "zustand";
import { STRINGS, type Lang, type TranslationKey } from "./translations";

interface LangState {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: TranslationKey) => string;
}

export const useLangStore = create<LangState>((set, get) => ({
  lang: (typeof window !== "undefined"
    ? (localStorage.getItem("btf-lang") as Lang) || "en"
    : "en") as Lang,
  setLang: (lang: Lang) => {
    localStorage.setItem("btf-lang", lang);
    set({ lang });
  },
  t: (key: TranslationKey) => {
    return STRINGS[get().lang][key];
  },
}));
