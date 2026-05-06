"use client";

import { create } from "zustand";
import type { LoginResponse, UserProfile } from "@/types/auth";

interface AuthState {
  token: string | null;
  user: UserProfile | null;
  isAuthenticated: boolean;
  login: (data: LoginResponse) => void;
  logout: () => void;
  setUser: (user: UserProfile) => void;
  hydrate: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  user: null,
  isAuthenticated: false,
  login: (data: LoginResponse) => {
    localStorage.setItem("btf-token", data.token);
    localStorage.setItem("btf-user", JSON.stringify(data.user));
    set({ token: data.token, user: data.user, isAuthenticated: true });
  },
  logout: () => {
    localStorage.removeItem("btf-token");
    localStorage.removeItem("btf-user");
    set({ token: null, user: null, isAuthenticated: false });
  },
  setUser: (user: UserProfile) => {
    localStorage.setItem("btf-user", JSON.stringify(user));
    set({ user });
  },
  hydrate: () => {
    const token = localStorage.getItem("btf-token");
    const userStr = localStorage.getItem("btf-user");
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr) as UserProfile;
        set({ token, user, isAuthenticated: true });
      } catch {
        set({ token: null, user: null, isAuthenticated: false });
      }
    }
  },
}));
