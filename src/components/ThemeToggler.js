"use client";

import { toggleTheme } from "@/redux/userPreferences/userPreferenceSlice";
import { MoonIcon, SunIcon } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";

const ThemeToggler = () => {
  const dispatch = useDispatch();
  const { theme } = useSelector((state) => state.userPreferences);
  return (
    <button
      onClick={() => dispatch(toggleTheme())}
      aria-pressed={theme === "dark"}
      className="flex items-center gap-3 w-full px-4 py-3 text-sm text-ink hover:bg-hairline/50 dark:hover:bg-[#262932] dark:text-[#f0efe8] transition"
    >
      {theme === "dark" ? <SunIcon size={14} /> : <MoonIcon size={14} />}

      {theme === "dark" ? "Light mode" : "Dark mode"}
    </button>
  );
};

export default ThemeToggler;
