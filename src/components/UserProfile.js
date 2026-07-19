"use client";

import { User, LogOut, Settings } from "lucide-react";
import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "@/redux/auth/authSlice";
import ThemeToggler from "./ThemeToggler";

const UserProfile = () => {
  const dispatch = useDispatch();

  const { user } = useSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    <div className="relative group">
      {/* Profile Icon */}
      <button
        className=" hidden sm:grid h-9 w-9 place-items-center border border-hairline dark:border-[#262932] hover:border-ink dark:hover:border-[#f0efe8] text-ink dark:text-[#f0efe8] transition-colors "
        title="Profile"
      >
        <User size={16} />
      </button>

      {/* Dropdown */}
      <div className=" absolute right-0 mt-3 w-64 overflow-hidden border border-hairline dark:border-[#262932] bg-white dark:bg-[#111216] text-ink dark:text-[#f0efe8] shadow-xl z-50 invisible opacity-0 translate-y-2 group-hover:visible group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-200 ">
        {user ? (
          <>
            {/* User Details */}
            <div className=" px-4 py-3 border-b border-hairline dark:border-[#262932] ">
              <p className="font-medium truncate">{user.name}</p>

              <p className="text-sm text-blue-700 opacity-60 truncate dark:text-amber-100">
                {user.email}
              </p>
            </div>

            {/* Settings */}
            <Link
              href="/account/settings"
              className=" flex items-center gap-3 px-4 py-3 hover:bg-gray-100 dark:hover:bg-[#1c1e24] transition "
            >
              <Settings size={16} />
              Account Settings
            </Link>

            {/* Theme */}
            <ThemeToggler />

            {/* Logout */}
            <button
              onClick={handleLogout}
              className=" flex items-center gap-3 w-full px-4 py-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition "
            >
              <LogOut size={16} />
              Logout
            </button>
          </>
        ) : (
          <>
            <Link
              href="/login"
              className=" flex items-center gap-3 px-4 py-3 hover:bg-gray-100 dark:hover:bg-[#1c1e24] transition "
            >
              <User size={16} />
              Sign In
            </Link>

            <ThemeToggler />
          </>
        )}
      </div>
    </div>
  );
};

export default UserProfile;
