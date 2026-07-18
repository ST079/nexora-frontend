"use client";

import { toggleTheme } from "@/redux/userPreferences/userPreferenceSlice";
import { MoonIcon, SunIcon } from "lucide-react";
import { useDispatch } from "react-redux";

const ThemeToggler = () => {
  const dispatch = useDispatch();
  return (
    <button
      className="cursor-pointer relative grid h-9 w-9 place-items-center border border-hairline dark:border-[#262932] hover:border-ink dark:hover:border-[#f0efe8] text-ink dark:text-[#f0efe8] transition-colors"
      title="Theme"
      onClick={() => dispatch(toggleTheme())}
    >
      <MoonIcon size={16} className="hidden dark:block" />
      <SunIcon size={16} className="dark:hidden" />
    </button>
  );
};

export default ThemeToggler;
