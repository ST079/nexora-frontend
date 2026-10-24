"use client";

import { useEffect } from "react";

// Calls `onEscape` when Escape is pressed, while `enabled` is true.
export const useEscape = (onEscape, enabled = true) => {
  useEffect(() => {
    if (!enabled) return;
    const onKey = (e) => e.key === "Escape" && onEscape();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onEscape, enabled]);
};
