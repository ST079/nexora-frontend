"use client";

import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { LogOut, Menu, MoonIcon, PanelLeftClose, PanelLeftOpen, SunIcon, X } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { usePathname, useRouter } from "next/navigation";
import { navFor } from "@/constants/navLinks";
import { logout } from "@/redux/auth/authSlice";
import { toggleTheme } from "@/redux/userPreferences/userPreferenceSlice";
import { HOME_ROUTE, LOGIN_ROUTE } from "@/constants/routes";
import { ROLE_ADMIN } from "@/constants/user";
import Logo, { LogoMark } from "@/components/Logo";
import { Avatar } from "@/components/UserProfile";
import { EASE_OUT, spring } from "@/utils/motion";

const fade = {
  initial: { opacity: 0, x: -6 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -6 },
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

const consoleName = (user) =>
  user?.roles?.includes(ROLE_ADMIN) ? "Admin console" : "Merchant hub";

// `pillId` keeps the rail's and the drawer's sliding highlight apart, since
// both can be mounted at once.
const SidebarBody = ({ collapsed = false, onNavigate, onToggleCollapse, pillId }) => {
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

  const rowClass = `relative flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-sm transition-colors ${
    collapsed ? "justify-center" : ""
  }`;

  return (
    <>
      <nav
        aria-label="Console"
        className={`custom-scrollbar flex-1 space-y-6 overflow-y-auto py-5 ${collapsed ? "px-3" : "px-4"}`}
      >
        {groups.map((group) => (
          <div key={group.label}>
            {collapsed ? (
              <div className="mx-3 mb-2 h-px bg-on-night/10" />
            ) : (
              <p className="mb-2 px-3 font-mono text-[10px] uppercase tracking-widest text-on-night/45">
                {group.label}
              </p>
            )}

            <ul className="space-y-1">
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
                      className={`group font-medium ${rowClass} ${
                        active
                          ? "text-on-signal"
                          : "text-on-night/65 hover:bg-on-night/6 hover:text-on-night"
                      }`}
                    >
                      {active && (
                        <motion.span
                          layoutId={pillId}
                          transition={spring}
                          className="absolute inset-0 rounded-2xl bg-signal shadow-glow"
                        />
                      )}
                      <Icon
                        size={17}
                        className="relative shrink-0 transition-transform duration-300 ease-spring group-hover:scale-110"
                      />
                      <Label show={!collapsed} className="relative">
                        {item.label}
                      </Label>
                      {active && !collapsed && (
                        <span className="relative ml-auto h-1.5 w-1.5 rounded-full bg-marigold" />
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className={`shrink-0 space-y-1 py-3 ${collapsed ? "px-3" : "px-4"}`}>
        <div
          className={`mb-2 flex items-center gap-3 rounded-2xl bg-on-night/6 p-2.5 ${
            collapsed ? "justify-center" : ""
          }`}
        >
          <Avatar user={user} size="h-9 w-9 text-xs shrink-0" />
          {!collapsed && (
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-on-night">{user?.name}</p>
              <p className="truncate font-mono text-[10px] text-on-night/50">{user?.email}</p>
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={() => dispatch(toggleTheme())}
          aria-pressed={theme === "dark"}
          title={collapsed ? "Toggle theme" : undefined}
          className={`${rowClass} group text-xs text-on-night/65 hover:bg-on-night/6 hover:text-on-night`}
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={theme}
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="shrink-0"
            >
              {theme === "dark" ? <SunIcon size={15} /> : <MoonIcon size={15} />}
            </motion.span>
          </AnimatePresence>
          <Label show={!collapsed}>{theme === "dark" ? "Light mode" : "Dark mode"}</Label>
        </button>

        {onToggleCollapse && (
          <button
            type="button"
            onClick={onToggleCollapse}
            title={collapsed ? "Expand sidebar" : undefined}
            aria-expanded={!collapsed}
            className={`${rowClass} text-xs text-on-night/65 hover:bg-on-night/6 hover:text-on-night`}
          >
            {collapsed ? (
              <PanelLeftOpen size={15} className="shrink-0" />
            ) : (
              <PanelLeftClose size={15} className="shrink-0" />
            )}
            <Label show={!collapsed}>Collapse</Label>
            {collapsed && <span className="sr-only">Expand sidebar</span>}
          </button>
        )}

        <button
          type="button"
          onClick={handleLogout}
          title={collapsed ? "Sign out" : undefined}
          className={`${rowClass} text-xs text-on-night/65 hover:bg-danger/15 hover:text-on-night`}
        >
          <LogOut size={15} className="shrink-0" />
          <Label show={!collapsed}>Sign out</Label>
        </button>
      </div>
    </>
  );
};

const Brand = ({ user, collapsed = false }) => (
  <Link
    href={HOME_ROUTE}
    className={`group flex min-w-0 items-center gap-2.5 ${collapsed ? "justify-center" : ""}`}
    aria-label="Nexora storefront"
  >
    <LogoMark />
    {!collapsed && (
      <span className="min-w-0">
        <span className="block font-display text-lg font-bold leading-none tracking-tight text-on-night">
          nexora
        </span>
        <span className="mt-1 block truncate font-mono text-[10px] uppercase tracking-widest text-marigold">
          {consoleName(user)}
        </span>
      </span>
    )}
  </Link>
);

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
      <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-hairline bg-paper/85 px-4 backdrop-blur-xl lg:hidden">
        <Logo />
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="icon-btn"
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
              className="fixed inset-0 z-50 bg-night/50 backdrop-blur-sm lg:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              role="dialog"
              aria-modal="true"
              aria-label={consoleName(user)}
              initial={{ x: "-105%" }}
              animate={{ x: 0 }}
              exit={{ x: "-105%" }}
              transition={{ type: "tween", duration: 0.32, ease: EASE_OUT }}
              className="fixed bottom-2 left-2 top-2 z-50 flex w-72 max-w-[85vw] flex-col overflow-hidden rounded-4xl bg-night text-on-night shadow-lift dark:border dark:border-hairline lg:hidden"
            >
              <div className="flex h-18 shrink-0 items-center justify-between px-5">
                <Brand user={user} />
                <button
                  type="button"
                  onClick={() => setMobileOpen(false)}
                  className="grid h-9 w-9 place-items-center rounded-full text-on-night/70 transition-colors hover:bg-on-night/10 hover:text-on-night"
                  aria-label="Close console menu"
                  autoFocus
                >
                  <X size={18} />
                </button>
              </div>
              <SidebarBody pillId="console-pill-drawer" onNavigate={() => setMobileOpen(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Desktop rail: a floating night card */}
      <motion.aside
        initial={false}
        animate={{ width: collapsed ? 96 : 272 }}
        transition={{ duration: 0.3, ease: EASE_OUT }}
        className="sticky top-0 hidden h-screen shrink-0 p-3 pr-0 lg:flex"
      >
        <div className="relative flex w-full flex-col overflow-hidden rounded-4xl bg-night text-on-night dark:border dark:border-hairline">
          <span
            aria-hidden
            className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-signal/30 blur-3xl"
          />
          <div className={`relative flex h-20 shrink-0 items-center ${collapsed ? "justify-center px-3" : "px-5"}`}>
            <Brand user={user} collapsed={collapsed} />
          </div>
          <SidebarBody
            collapsed={collapsed}
            pillId="console-pill-rail"
            onToggleCollapse={() => setCollapsed((c) => !c)}
          />
        </div>
      </motion.aside>
    </>
  );
};

export default AdminSidebar;
