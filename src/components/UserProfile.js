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
import { initials } from "@/utils/format";

const itemClass =
  "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-ink transition-colors hover:bg-mist";
const iconClass = "text-slate transition-colors group-hover:text-signal";

export const Avatar = ({ user, size = "h-8 w-8 text-xs" }) =>
  user?.profileImageUrl ? (
    <Image
      src={user.profileImageUrl}
      alt=""
      className={`${size} rounded-full object-cover`}
      width={64}
      height={64}
    />
  ) : (
    <span
      className={`${size} grid place-items-center rounded-full bg-signal font-display font-bold text-on-signal`}
    >
      {user ? initials(user.name) || <User size={14} /> : <User size={14} />}
    </span>
  );

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
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex h-10 items-center gap-1.5 rounded-full border border-hairline bg-panel pl-1 pr-2.5 text-ink transition-all hover:border-ink/30 hover:shadow-soft"
        aria-label="Account menu"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <Avatar user={user} />
        {user?.name ? (
          <span className="hidden max-w-[84px] truncate text-sm font-medium xl:block">
            {user.name.split(" ")[0]}
          </span>
        ) : (
          <span className="text-sm font-medium">Sign in</span>
        )}
        <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown size={13} className="text-slate" />
        </motion.span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.97 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            style={{ transformOrigin: "top right" }}
            role="menu"
            className="card-frame absolute right-0 top-full z-50 mt-3 w-64 p-2 shadow-lift"
          >
            {user ? (
              <div className="mb-1 flex items-center gap-3 rounded-2xl bg-signal-tint p-3">
                <Avatar user={user} size="h-10 w-10 text-sm" />
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-ink">{user.name}</p>
                  <p className="truncate font-mono text-[11px] text-slate">{user.email}</p>
                </div>
              </div>
            ) : (
              <div className="mb-1 rounded-2xl bg-signal-tint p-3">
                <p className="font-display text-base font-bold text-ink">Hello there 👋</p>
                <p className="text-xs text-slate">Sign in to track your orders.</p>
              </div>
            )}

            {user ? (
              <>
                {isStaff(user) && (
                  <Link href={DASHBOARD_ROUTE} onClick={close} className={itemClass} role="menuitem">
                    <LayoutDashboard size={16} className={iconClass} />
                    Dashboard
                  </Link>
                )}
                <Link href={ORDERS_ROUTE} onClick={close} className={itemClass} role="menuitem">
                  <ListOrdered size={16} className={iconClass} />
                  My orders
                </Link>
                <Link href={ACCOUNT_SETTING_ROUTE} onClick={close} className={itemClass} role="menuitem">
                  <Settings size={16} className={iconClass} />
                  Account settings
                </Link>
              </>
            ) : (
              <>
                <Link href={LOGIN_ROUTE} onClick={close} className={itemClass} role="menuitem">
                  <LogIn size={16} className={iconClass} />
                  Sign in
                </Link>
                <Link href={REGISTER_ROUTE} onClick={close} className={itemClass} role="menuitem">
                  <User size={16} className={iconClass} />
                  Create account
                </Link>
              </>
            )}

            <div className="my-1.5 border-t border-hairline" />
            <ThemeToggler />

            {user && (
              <button
                onClick={handleLogout}
                role="menuitem"
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-danger transition-colors hover:bg-danger/10"
              >
                <LogOut size={16} />
                Sign out
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UserProfile;
