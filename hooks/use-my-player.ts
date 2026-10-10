"use client";

import { useQuery } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { fetchMyPlayer } from "@/lib/brackets/api";

/** The signed-in user's player profile, or null when they are not a player. */
export function useMyPlayer() {
  return useQuery({
    queryKey: ["players", "me"],
    queryFn: async () => {
      try {
        return await fetchMyPlayer();
      } catch (err) {
        if (isAxiosError(err) && err.response?.status === 404) return null;
        throw err;
      }
    },
    staleTime: 10 * 60 * 1000,
    retry: false,
  });
}
