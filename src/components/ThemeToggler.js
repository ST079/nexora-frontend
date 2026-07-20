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
      className=" flex items-center gap-3 w-full px-4 py-3 text-sm hover:bg-gray-100 dark:hover:bg-[#1c1e24] dark:text-paper transition"
    >
      {theme === "dark" ? <SunIcon size={14} /> : <MoonIcon size={14} />}

      {theme === "dark" ? "Light Mode" : "Dark Mode"}
    </button>
  );
};

export default ThemeToggler;
