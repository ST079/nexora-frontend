"use client";

import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  LogOut,
  Menu,
  MoonIcon,
  SunIcon,
  X,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { usePathname, useRouter } from "next/navigation";
import { navFor } from "@/constants/navLinks";
import { logout } from "@/redux/auth/authSlice";
import { toggleTheme } from "@/redux/userPreferences/userPreferenceSlice";
import { HOME_ROUTE, LOGIN_ROUTE } from "@/constants/routes";
import { ROLE_ADMIN } from "@/constants/user";
import Logo from "@/components/Logo";

const fade = {
  initial: { opacity: 0, x: -4 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -4 },
  transition: { duration: 0.15 },
};

// Text that hides while the desktop rail is collapsed.
const Label = ({ show, children, className = "" }) => (
  <AnimatePresence initial={false}>
    {show && (
      <motion.span {...fade} className={`whitespace-nowrap ${className}`}>
        {children}
      </motion.span>
    )}
  </AnimatePresence>
);

const SidebarBody = ({ collapsed = false, onNavigate }) => {
  const pathname = usePathname();
  const dispatch = useDispatch();
  const router = useRouter();
  const { user } = useSelector((state) => state.auth);
  const { theme } = useSelector((state) => state.userPreferences);
  const groups = navFor(user);

  const isActive = (href) =>
    href === HOME_ROUTE
      ? pathname === href
      : pathname === href || pathname.startsWith(`${href}/`);

  const handleLogout = () => {
    dispatch(logout());
    router.replace(LOGIN_ROUTE);
  };

  const rowClass = `flex items-center gap-3 w-full px-2 py-2.5 text-sm transition-colors ${
    collapsed ? "justify-center" : ""
  }`;

  return (
    <>
      <nav
        aria-label="Console"
        className={`flex-1 overflow-y-auto py-5 space-y-6 ${collapsed ? "px-3" : "px-4"}`}
      >
        {groups.map((group) => (
          <div key={group.label}>
            {collapsed ? (
              <div className="mx-2 mb-2 h-px bg-hairline dark:bg-[#262932]" />
            ) : (
              <p className="px-2 mb-1.5 font-mono text-[10px] uppercase tracking-widest text-slate dark:text-[#8b8fa8]">
                {group.label}
              </p>
            )}

            <ul className="space-y-0.5">
              {group.items.map((item) => {
                const active = isActive(item.href);
                const Icon = item.icon;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={onNavigate}
                      title={collapsed ? item.label : undefined}
                      aria-current={active ? "page" : undefined}
                      className={`relative font-medium ${rowClass} ${
                        active
                          ? "text-ink dark:text-[#f0efe8] bg-hairline/60 dark:bg-[#262932]"
                          : "text-slate dark:text-[#8b8fa8] hover:text-ink dark:hover:text-[#f0efe8] hover:bg-hairline/40 dark:hover:bg-[#262932]/60"
                      }`}
                    >
                      {active && (
                        <span className="absolute left-0 top-0 h-full w-0.5 bg-signal" />
                      )}
                      <Icon size={16} className="shrink-0" />
                      <Label show={!collapsed}>{item.label}</Label>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div
        className={`border-t border-hairline dark:border-[#262932] py-3 shrink-0 space-y-1 ${collapsed ? "px-3" : "px-4"}`}
      >
        <div
          className={`flex items-center gap-3 px-2 pb-2 ${collapsed ? "justify-center" : ""}`}
        >
          <div className="grid h-8 w-8 shrink-0 place-items-center bg-ink dark:bg-[#262932] font-display text-xs text-paper dark:text-[#f0efe8] uppercase">
            {user?.name?.charAt(0) ?? "?"}
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="text-xs font-medium text-ink dark:text-[#f0efe8] truncate">
                {user?.name}
              </p>
              <p className="font-mono text-[10px] text-slate dark:text-[#8b8fa8] truncate">
                {user?.email}
              </p>
            </div>
          )}
        </div>

        <button
          onClick={() => dispatch(toggleTheme())}
          aria-pressed={theme === "dark"}
          title={collapsed ? "Toggle theme" : undefined}
          className={`${rowClass} text-xs text-slate dark:text-[#8b8fa8] hover:text-ink dark:hover:text-[#f0efe8]`}
        >
          {theme === "dark" ? (
            <SunIcon size={14} className="shrink-0" />
          ) : (
            <MoonIcon size={14} className="shrink-0" />
          )}
          <Label show={!collapsed}>
            {theme === "dark" ? "Light mode" : "Dark mode"}
          </Label>
        </button>

        <button
          onClick={handleLogout}
          title={collapsed ? "Sign out" : undefined}
          className={`${rowClass} text-xs text-slate dark:text-[#8b8fa8] hover:text-danger dark:hover:text-danger`}
        >
          <LogOut size={14} className="shrink-0" />
          <Label show={!collapsed}>Sign out</Label>
        </button>
      </div>
    </>
  );
};

const consoleName = (user) =>
  user?.roles?.includes(ROLE_ADMIN) ? "Admin console" : "Merchant hub";

const AdminSidebar = () => {
  const pathname = usePathname();
  const { user } = useSelector((state) => state.auth);
  const [collapsed, setCollapsed] = useState(false);
  // The drawer remembers the path it was opened on, so any navigation
  // (link, back button) closes it without an extra effect.
  const [openedOn, setOpenedOn] = useState(null);
  const mobileOpen = openedOn === pathname;
  const setMobileOpen = (open) => setOpenedOn(open ? pathname : null);

  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (e) => e.key === "Escape" && setOpenedOn(null);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [mobileOpen]);

  return (
    <>
      {/* Mobile / tablet top bar */}
      <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-hairline dark:border-[#262932] bg-paper/95 dark:bg-[#0e0f12]/95 backdrop-blur px-4 lg:hidden">
        <Logo />
        <button
          onClick={() => setMobileOpen(true)}
          className="grid h-9 w-9 place-items-center text-ink dark:text-[#f0efe8]"
          aria-label="Open console menu"
          aria-expanded={mobileOpen}
        >
          <Menu size={18} />
        </button>
      </header>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-ink/40 dark:bg-black/60 lg:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              role="dialog"
              aria-modal="true"
              aria-label={consoleName(user)}
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "tween", duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              className="fixed left-0 top-0 z-50 flex h-full w-72 max-w-[85vw] flex-col bg-paper dark:bg-[#0e0f12] border-r border-hairline dark:border-[#262932] shadow-lift lg:hidden"
            >
              <div className="flex h-14 items-center justify-between border-b border-hairline dark:border-[#262932] px-4 shrink-0">
                <div>
                  <p className="font-display text-sm font-semibold text-ink dark:text-[#f0efe8]">
                    NEXORA
                  </p>
                  <p className="font-mono text-[10px] uppercase tracking-widest text-slate dark:text-[#8b8fa8]">
                    {consoleName(user)}
                  </p>
                </div>
                <button
                  onClick={() => setMobileOpen(false)}
                  className="grid h-9 w-9 place-items-center text-slate dark:text-[#8b8fa8] hover:text-ink dark:hover:text-[#f0efe8]"
                  aria-label="Close console menu"
                  autoFocus
                >
                  <X size={18} />
                </button>
              </div>
              <SidebarBody onNavigate={() => setMobileOpen(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Desktop rail */}
      <motion.aside
        animate={{ width: collapsed ? 76 : 248 }}
        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
        className="hidden lg:flex sticky top-0 h-screen flex-col shrink-0 overflow-hidden bg-paper dark:bg-[#0e0f12] border-r border-hairline dark:border-[#262932]"
      >
        <div
          className={`flex h-16 items-center border-b border-hairline dark:border-[#262932] shrink-0 ${
            collapsed ? "justify-center px-3" : "justify-between px-4"
          }`}
        >
          {!collapsed && (
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="grid h-7 w-7 shrink-0 place-items-center bg-ink dark:bg-[#f0efe8] font-mono text-xs font-bold text-signal dark:text-ink">
                N
              </span>
              <div className="min-w-0">
                <p className="font-display text-sm font-semibold leading-none text-ink dark:text-[#f0efe8]">
                  NEXORA
                </p>
                <p className="mt-1 font-mono text-[10px] uppercase tracking-widest text-slate dark:text-[#8b8fa8] truncate">
                  {consoleName(user)}
                </p>
              </div>
            </div>
          )}
          <button
            onClick={() => setCollapsed((c) => !c)}
            className="grid h-7 w-7 shrink-0 place-items-center border border-hairline dark:border-[#262932] text-slate dark:text-[#8b8fa8] hover:text-ink dark:hover:text-[#f0efe8] transition-colors"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-expanded={!collapsed}
          >
            {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
          </button>
        </div>
        <SidebarBody collapsed={collapsed} />
      </motion.aside>
    </>
  );
};

export default AdminSidebar;
