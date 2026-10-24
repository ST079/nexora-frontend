"use client";

import { toggleTheme } from "@/redux/userPreferences/userPreferenceSlice";
import { AnimatePresence, motion } from "framer-motion";
import { MoonIcon, SunIcon } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";

// `variant="row"` is a full-width menu row; `variant="icon"` a round button
// whose sun and moon swap with a little spin.
const ThemeToggler = ({ variant = "row" }) => {
  const dispatch = useDispatch();
  const { theme } = useSelector((state) => state.userPreferences);
  const dark = theme === "dark";
  const label = dark ? "Light mode" : "Dark mode";

  const icon = (
    <AnimatePresence mode="wait" initial={false}>
      <motion.span
        key={dark ? "sun" : "moon"}
        initial={{ rotate: -90, scale: 0.4, opacity: 0 }}
        animate={{ rotate: 0, scale: 1, opacity: 1 }}
        exit={{ rotate: 90, scale: 0.4, opacity: 0 }}
        transition={{ duration: 0.25 }}
        className="grid place-items-center"
      >
        {dark ? <SunIcon size={16} /> : <MoonIcon size={16} />}
      </motion.span>
    </AnimatePresence>
  );

  if (variant === "icon") {
    return (
      <button
        onClick={() => dispatch(toggleTheme())}
        aria-pressed={dark}
        aria-label={label}
        title={label}
        className="icon-btn"
      >
        {icon}
      </button>
    );
  }

  return (
    <button
      onClick={() => dispatch(toggleTheme())}
      aria-pressed={dark}
      className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-ink transition-colors hover:bg-mist"
    >
      {icon}
      {label}
      <span
        aria-hidden
        className={`ml-auto flex h-5 w-9 items-center rounded-full p-0.5 transition-colors ${
          dark ? "justify-end bg-signal" : "justify-start bg-hairline"
        }`}
      >
        <motion.span layout className="h-4 w-4 rounded-full bg-panel shadow-soft" />
      </span>
    </button>
  );
};

export default ThemeToggler;
