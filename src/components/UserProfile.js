"use client";

import { useEffect, useRef, useState } from "react";
import {
  User,
  LogIn,
  LogOut,
  Settings,
  ChevronDown,
  LayoutDashboard,
  ListOrdered,
} from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import Image from "next/image";
import ThemeToggler from "./ThemeToggler";
import { logout } from "@/redux/auth/authSlice";
import {
  ACCOUNT_SETTING_ROUTE,
  DASHBOARD_ROUTE,
  LOGIN_ROUTE,
  ORDERS_ROUTE,
  REGISTER_ROUTE,
} from "@/constants/routes";
import { isStaff } from "@/constants/navLinks";

const itemClass =
  "flex items-center gap-2.5 px-4 py-2.5 text-sm text-ink dark:text-[#f0efe8] hover:bg-hairline/50 dark:hover:bg-[#262932] transition-colors";

const UserProfile = () => {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);
  const router = useRouter();
  const dispatch = useDispatch();

  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    const onClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  const handleLogout = () => {
    dispatch(logout());
    setOpen(false);
    router.replace(LOGIN_ROUTE);
  };

  const close = () => setOpen(false);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger button */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 h-9 px-2 border border-hairline dark:border-[#262932] hover:border-ink dark:hover:border-[#f0efe8] text-ink dark:text-[#f0efe8] transition-colors"
        aria-label="Account menu"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        {user?.profileImageUrl ? (
          <Image
            src={user.profileImageUrl}
            alt=""
            className="h-5 w-5 rounded-full object-cover"
            width={40}
            height={40}
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
            role="menu"
            className="absolute right-0 top-full mt-2 w-56 z-50 card-frame shadow-lift overflow-hidden"
          >
            {/* User info */}
            {user && (
              <div className="px-4 py-3 border-b border-hairline dark:border-[#262932]">
                <p className="font-medium text-sm text-ink dark:text-[#f0efe8] truncate">
                  {user.name}
                </p>
                <p className="font-mono text-[11px] text-slate dark:text-[#8b8fa8] truncate mt-0.5">
                  {user.email}
                </p>
              </div>
            )}

            <div className="py-1">
              {user ? (
                <>
                  {isStaff(user) && (
                    <Link href={DASHBOARD_ROUTE} onClick={close} className={itemClass} role="menuitem">
                      <LayoutDashboard size={14} className="text-slate dark:text-[#8b8fa8]" />
                      Dashboard
                    </Link>
                  )}
                  <Link href={ORDERS_ROUTE} onClick={close} className={itemClass} role="menuitem">
                    <ListOrdered size={14} className="text-slate dark:text-[#8b8fa8]" />
                    My orders
                  </Link>
                  <Link href={ACCOUNT_SETTING_ROUTE} onClick={close} className={itemClass} role="menuitem">
                    <Settings size={14} className="text-slate dark:text-[#8b8fa8]" />
                    Account settings
                  </Link>

                  <div className="my-1 border-t border-hairline dark:border-[#262932]" />

                  <button
                    onClick={handleLogout}
                    role="menuitem"
                    className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-danger hover:bg-danger/5 dark:hover:bg-danger/10 transition-colors"
                  >
                    <LogOut size={14} />
                    Sign out
                  </button>
                </>
              ) : (
                <>
                  <Link href={LOGIN_ROUTE} onClick={close} className={itemClass} role="menuitem">
                    <LogIn size={14} className="text-slate dark:text-[#8b8fa8]" />
                    Sign in
                  </Link>
                  <Link href={REGISTER_ROUTE} onClick={close} className={itemClass} role="menuitem">
                    <User size={14} className="text-slate dark:text-[#8b8fa8]" />
                    Create account
                  </Link>
                </>
              )}

              <div className="my-1 border-t border-hairline dark:border-[#262932]" />

              <ThemeToggler />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UserProfile;
