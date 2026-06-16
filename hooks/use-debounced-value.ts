"use client";

import { useEffect, useState } from "react";

/**
 * Returns `value` after it has remained stable for `delayMs`. Useful to keep
 * a search input feeling responsive without firing a query on every keystroke.
 */
export function useDebouncedValue<T>(value: T, delayMs = 300): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(id);
  }, [value, delayMs]);

  return debounced;
}
