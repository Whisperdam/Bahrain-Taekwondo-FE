"use client";

import { useEffect, useState } from "react";

/** The current time, refreshed on an interval, so "updated 12s ago" keeps counting. */
export function useNow(intervalMs: number) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
  return now;
}
