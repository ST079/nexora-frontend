"use client";
import React, { useState } from "react";
import {
  Search,
  ShoppingCart,
  Menu,
  X,
  ChevronDown,
  LayoutDashboard,
  ListOrdered,
  Settings,
  LogOut,
} from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname, useRouter } from "next/navigation";
import ProductsMenu from "@/components/ProductsMenu";
import { categories } from "@/constants/categories";
import Logo from "./Logo";
import UserProfile from "./UserProfile";
import ThemeToggler from "./ThemeToggler";
import { isStaff, navLinks } from "@/constants/navLinks";
import { useDispatch, useSelector } from "react-redux";
import { openCart } from "@/redux/cart/cartSlice";
import { logout } from "@/redux/auth/authSlice";
import {
  ACCOUNT_SETTING_ROUTE,
  DASHBOARD_ROUTE,
  LOGIN_ROUTE,
  ORDERS_ROUTE,
  PRODUCTS_ROUTE,
  REGISTER_ROUTE,
} from "@/constants/routes";

const mobileLink =
  "flex items-center gap-2.5 eyebrow text-ink dark:text-[#f0efe8] py-2.5 hover:text-signal dark:hover:text-signal transition-colors";

const Header = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileCatalogOpen, setMobileCatalogOpen] = useState(false);
  const [query, setQuery] = useState("");
  const dispatch = useDispatch();
  const { totalItems } = useSelector((state) => state.cart);
  const { user } = useSelector((state) => state.auth);

  const closeMobile = () => {
    setMobileOpen(false);
    setMobileCatalogOpen(false);
  };

  function submitSearch(e) {
    e.preventDefault();
    const term = query.trim();
    router.push(
      term ? `${PRODUCTS_ROUTE}?name=${encodeURIComponent(term)}` : PRODUCTS_ROUTE,
    );
    closeMobile();
  }

  const handleLogout = () => {
    dispatch(logout());
    closeMobile();
    router.replace(LOGIN_ROUTE);
  };

  return (
    <header className="sticky top-0 z-40 border-b border-hairline bg-paper/90 dark:bg-[#0e0f12]/90 dark:border-[#262932] backdrop-blur transition-colors duration-300">
      <div className="container-page flex h-16 items-center justify-between gap-4">
        <Logo />

        {/* ── Desktop nav ── */}
        <nav className="hidden lg:flex items-center gap-7" aria-label="Main">
          {navLinks.map((navLink) => {
            const isActive =
              pathname === navLink.route ||
              (navLink.route !== "/" && pathname.startsWith(navLink.route));

            return (
              <Link
                key={navLink.label}
                href={navLink.route}
                aria-current={isActive ? "page" : undefined}
                className={`eyebrow transition-colors hover:text-ink dark:hover:text-[#f0efe8] ${
                  isActive
                    ? "text-ink dark:text-[#f0efe8]"
                    : "text-slate dark:text-[#8b8fa8]"
                }`}
              >
                {navLink.label}
              </Link>
            );
          })}
          <ProductsMenu />
        </nav>

        {/* ── Search ── */}
        <form
          onSubmit={submitSearch}
          role="search"
          className="hidden md:flex flex-1 max-w-sm items-center border border-hairline dark:border-[#262932] px-3 py-2 gap-2 focus-within:border-ink dark:focus-within:border-[#f0efe8] transition-colors bg-transparent"
        >
          <Search size={15} className="text-slate dark:text-[#8b8fa8]" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search model, brand…"
            aria-label="Search products"
            className="w-full bg-transparent text-sm outline-none placeholder:text-slate-light dark:placeholder:text-[#5b5e72] text-ink dark:text-[#f0efe8]"
          />
        </form>

        {/* ── Icon actions ── */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              dispatch(openCart());
            }}
            className="relative grid h-9 w-9 place-items-center border border-hairline dark:border-[#262932] hover:border-ink dark:hover:border-[#f0efe8] text-ink dark:text-[#f0efe8] transition-colors"
            aria-label={`Open cart, ${totalItems} item${totalItems === 1 ? "" : "s"}`}
            title="Cart"
          >
            <ShoppingCart size={16} />
            {totalItems > 0 && (
              <motion.span
                key={totalItems}
                initial={{ scale: 0.6 }}
                animate={{ scale: 1 }}
                className="absolute -top-2 -right-2 grid h-5 min-w-5 px-1 place-items-center rounded-full bg-signal font-mono text-[10px] text-paper"
              >
                {totalItems > 9 ? "9+" : totalItems}
              </motion.span>
            )}
          </button>

          <div className="hidden lg:block">
            <UserProfile />
          </div>

          <button
            onClick={() => setMobileOpen((o) => !o)}
            className="grid h-9 w-9 place-items-center border border-hairline dark:border-[#262932] text-ink dark:text-[#f0efe8] lg:hidden transition-colors"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X size={16} /> : <Menu size={16} />}
          </button>
        </div>
      </div>

      {/* ── Mobile drawer ── */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="lg:hidden overflow-hidden border-t border-hairline dark:border-[#262932] bg-paper dark:bg-[#0e0f12]"
          >
            <div className="px-5 py-4 space-y-4 max-h-[calc(100dvh-4rem)] overflow-y-auto">
              <form
                onSubmit={submitSearch}
                role="search"
                className="flex md:hidden items-center border border-hairline dark:border-[#262932] px-3 py-2 gap-2"
              >
                <Search size={15} className="text-slate dark:text-[#8b8fa8]" />
                <input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search model, brand…"
                  aria-label="Search products"
                  className="w-full bg-transparent text-sm outline-none text-ink dark:text-[#f0efe8] placeholder:text-slate-light dark:placeholder:text-[#5b5e72]"
                />
              </form>

              {user && (
                <div className="border border-hairline dark:border-[#262932] px-3 py-2.5">
                  <p className="text-sm font-medium text-ink dark:text-[#f0efe8] truncate">
                    {user.name}
                  </p>
                  <p className="font-mono text-[11px] text-slate dark:text-[#8b8fa8] truncate">
                    {user.email}
                  </p>
                </div>
              )}

              <div className="flex flex-col">
                {/* Products accordion */}
                <button
                  onClick={() => setMobileCatalogOpen((o) => !o)}
                  aria-expanded={mobileCatalogOpen}
                  className="flex items-center justify-between py-2.5 eyebrow text-ink dark:text-[#f0efe8]"
                >
                  Products
                  <motion.span
                    animate={{ rotate: mobileCatalogOpen ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronDown size={14} />
                  </motion.span>
                </button>

                <AnimatePresence>
                  {mobileCatalogOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="grid grid-cols-2 gap-2 py-2">
                        {categories.map((c) => (
                          <Link
                            key={c.label}
                            href={`${PRODUCTS_ROUTE}?category=${encodeURIComponent(c.label)}`}
                            onClick={closeMobile}
                            className="flex items-center gap-2 border border-hairline dark:border-[#262932] px-2.5 py-2 text-xs text-ink dark:text-[#f0efe8] hover:border-signal transition-colors"
                          >
                            <c.icon size={14} className="text-signal shrink-0" />
                            {c.label}
                          </Link>
                        ))}
                      </div>
                      <Link
                        href={PRODUCTS_ROUTE}
                        onClick={closeMobile}
                        className="block py-2 font-mono text-xs text-slate dark:text-[#8b8fa8] underline"
                      >
                        View all products
                      </Link>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Nav links */}
                {navLinks.map((l) => (
                  <Link
                    key={l.label}
                    href={l.route}
                    onClick={closeMobile}
                    className={mobileLink}
                  >
                    {l.label}
                  </Link>
                ))}
              </div>

              <div className="flex flex-col border-t border-hairline dark:border-[#262932] pt-3">
                {user ? (
                  <>
                    {isStaff(user) && (
                      <Link href={DASHBOARD_ROUTE} onClick={closeMobile} className={mobileLink}>
                        <LayoutDashboard size={14} /> Dashboard
                      </Link>
                    )}
                    <Link href={ORDERS_ROUTE} onClick={closeMobile} className={mobileLink}>
                      <ListOrdered size={14} /> My orders
                    </Link>
                    <Link href={ACCOUNT_SETTING_ROUTE} onClick={closeMobile} className={mobileLink}>
                      <Settings size={14} /> Account settings
                    </Link>
                    <button
                      onClick={handleLogout}
                      className={`${mobileLink} text-danger dark:text-danger`}
                    >
                      <LogOut size={14} /> Sign out
                    </button>
                  </>
                ) : (
                  <div className="grid grid-cols-2 gap-2 pb-1">
                    <Link href={LOGIN_ROUTE} onClick={closeMobile} className="btn-secondary py-2.5">
                      Sign in
                    </Link>
                    <Link href={REGISTER_ROUTE} onClick={closeMobile} className="btn-primary py-2.5">
                      Create account
                    </Link>
                  </div>
                )}
              </div>

              <div className="-mx-4 border-t border-hairline dark:border-[#262932]">
                <ThemeToggler />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;
