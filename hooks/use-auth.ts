"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/lib/auth/store";

export function useAuth() {
  const store = useAuthStore();
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    store.hydrate();
    setHydrated(true);
  }, []);

  return { ...store, hydrated };
}
