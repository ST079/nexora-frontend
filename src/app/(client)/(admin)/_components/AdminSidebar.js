"use client";

import Link from "next/link";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  LogOut,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { adminNavLinks } from "@/constants/navLinks";
import { usePathname, useRouter } from "next/navigation";
// import { logoutUser } from "@/redux/auth/authActions";



const AdminSidebar = () => {
  const pathname   = usePathname();
  const dispatch   = useDispatch();
  const router     = useRouter();
  const { user }   = useSelector((state) => state.auth);
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
    router.replace("/login");
  };

  const isActive = (href) =>
    href === "/admin" ? pathname === href : pathname.startsWith(href);

  return (
    <motion.aside
      animate={{ width: collapsed ? 100 : 250 }}
      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
      className="relative flex flex-col h-screen bg-paper dark:bg-[#0e0f12] border-r border-hairline dark:border-[#262932] shrink-0 overflow-hidden"
    >
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-10 h-16 border-b border-hairline dark:border-[#262932] shrink-0">
        <span className="grid h-7 w-7 shrink-0 place-items-center bg-ink dark:bg-[#f0efe8] font-mono text-xs font-bold text-signal dark:text-[#14151a]">
          N
        </span>
        <AnimatePresence>
          {!collapsed && (
            <motion.span
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -6 }}
              transition={{ duration: 0.18 }}
              className="font-display text-sm font-semibold text-ink dark:text-[#f0efe8] whitespace-nowrap"
            >
              NEXORA · Admin
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* adminNavLinks */}
      <nav className="flex-1 overflow-y-auto py-4 px-8 space-y-6">
        {adminNavLinks.map((group) => (
          <div key={group.label}>
            <AnimatePresence>
              {!collapsed && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="px-4 mb-1 font-mono text-[10px] uppercase tracking-widest text-slate dark:text-[#8b8fa8]"
                >
                  {group.label}
                </motion.p>
              )}
            </AnimatePresence>

            <ul>
              {group.items.map((item) => {
                const active = isActive(item.href);
                const Icon   = item.icon;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      title={collapsed ? item.label : undefined}
                      className={`relative flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-colors group ${
                        active
                          ? "text-ink dark:text-[#f0efe8] bg-hairline/60 dark:bg-[#262932]"
                          : "text-slate dark:text-[#8b8fa8] hover:text-ink dark:hover:text-[#f0efe8] hover:bg-hairline/40 dark:hover:bg-[#262932]/60"
                      }`}
                    >
                      {/* Active indicator */}
                      {active && (
                        <span className="absolute left-0 top-0 h-full w-0.5 bg-signal" />
                      )}
                      <Icon size={16} className="shrink-0" />
                      <AnimatePresence>
                        {!collapsed && (
                          <motion.span
                            initial={{ opacity: 0, x: -4 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -4 }}
                            transition={{ duration: 0.15 }}
                            className="whitespace-nowrap"
                          >
                            {item.label}
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* User + logout */}
      <div className="border-t border-hairline dark:border-[#262932] p-3 shrink-0">
        <div className={`flex items-center gap-3 mb-2 ${collapsed ? "justify-center" : ""}`}>
          <div className="grid h-8 w-8 shrink-0 place-items-center bg-ink dark:bg-[#262932] font-display text-xs text-paper dark:text-[#f0efe8] uppercase">
            {user?.name?.charAt(0) ?? "A"}
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, x: -4 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -4 }}
                transition={{ duration: 0.15 }}
                className="min-w-0"
              >
                <p className="text-xs font-medium text-ink dark:text-[#f0efe8] truncate">
                  {user?.name ?? "Admin"}
                </p>
                <p className="font-mono text-[10px] text-slate dark:text-[#8b8fa8] truncate">
                  {user?.email ?? ""}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <button
          onClick={handleLogout}
          title={collapsed ? "Sign out" : undefined}
          className={`flex items-center gap-2 w-full px-2 py-2 text-xs text-slate dark:text-[#8b8fa8] hover:text-danger dark:hover:text-danger transition-colors ${collapsed ? "justify-center" : ""}`}
        >
          <LogOut size={14} className="shrink-0" />
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                Sign out
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed((c) => !c)}
        className="absolute right-0 top-[72px] grid h-6 w-6 place-items-center bg-paper dark:bg-[#0e0f12] border border-hairline dark:border-[#262932] text-slate dark:text-[#8b8fa8] hover:text-ink dark:hover:text-[#f0efe8] transition-colors z-10"
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
      </button>
    </motion.aside>
  );
};

export default AdminSidebar;