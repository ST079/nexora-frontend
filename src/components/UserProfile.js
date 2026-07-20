"use client";

import { useEffect, useRef, useState } from "react";
import { User, LogIn, LogOut, Settings, ChevronDown, Sun, Moon } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import Image from "next/image";
import ThemeToggler from "./ThemeToggler";
import { logout } from "@/redux/auth/authSlice";

const UserProfile = () => {
  const [open, setOpen]     = useState(false);
  const dropdownRef         = useRef(null);
  const router              = useRouter();
  const dispatch            = useDispatch();

  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);


  const handleLogout = () => {
    dispatch(logout());
    setOpen(false);
    router.replace("/login");
  };

  return (
    <div className="relative hidden sm:block" ref={dropdownRef}>
      {/* Trigger button */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 h-9 px-2 border border-hairline dark:border-[#262932] hover:border-ink dark:hover:border-[#f0efe8] text-ink dark:text-[#f0efe8] transition-colors"
        aria-label="Account menu"
      >
        {user?.profileImageUrl ? (
          <Image
            src={user.profileImageUrl}
            alt={user.name}
            className="h-5 w-5 rounded-full object-cover"
          />
        ) : (
          <User size={15} />
        )}
        {user?.name && (
          <span className="font-mono text-xs hidden md:block max-w-[80px] truncate">
            {user.name.split(" ")[0]}
          </span>
        )}
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown size={12} />
        </motion.span>
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.97 }}
            transition={{ duration: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className="absolute right-0 top-full mt-2 w-52 z-50 card-frame shadow-lift overflow-hidden"
          >
            {/* User info */}
            {user && (
              <>
                <div className="px-4 py-3 border-b border-hairline dark:border-[#262932]">
                  <p className="font-medium text-sm text-ink dark:text-[#f0efe8] truncate">
                    {user.name}
                  </p>
                  <p className="font-mono text-[11px] text-blue-800 dark:text-[#8b8fa8] truncate mt-0.5">
                    {user.email}
                  </p>
                </div>
              </>
            )}

            <div className="py-1">
              {user ? (
                <>
                  {/* Account settings */}
                  <Link
                    href="/account"
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-ink dark:text-[#f0efe8] hover:bg-hairline/50 dark:hover:bg-[#262932] transition-colors"
                  >
                    <Settings size={14} className="text-slate dark:text-[#8b8fa8]" />
                    Account settings
                  </Link>

                  {/* Divider */}
                  <div className="my-1 border-t border-hairline dark:border-[#262932]" />

                  {/* Sign out */}
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-danger hover:bg-danger/5 dark:hover:bg-danger/10 transition-colors"
                  >
                    <LogOut size={14} />
                    Sign out
                  </button>
                </>
              ) : (
                <>
                  {/* Sign in */}
                  <Link
                    href="/login"
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-ink dark:text-[#f0efe8] hover:bg-hairline/50 dark:hover:bg-[#262932] transition-colors"
                  >
                    <LogIn size={14} className="text-slate dark:text-[#8b8fa8]" />
                    Sign in
                  </Link>

                  {/* Register */}
                  <Link
                    href="/register"
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-ink dark:text-[#f0efe8] hover:bg-hairline/50 dark:hover:bg-[#262932] transition-colors"
                  >
                    <User size={14} className="text-slate dark:text-[#8b8fa8]" />
                    Create account
                  </Link>
                </>
              )}

              {/* Divider */}
              <div className="my-1 border-t border-hairline dark:border-[#262932]" />

              {/* Dark / light toggle */}
           <ThemeToggler/>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UserProfile;