"use client";
import React, { useState } from "react";
import NavLinks from "@/constants/navLinks";
import { Search, ShoppingCart, User, Menu, X, ChevronDown } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";
import ProductsMenu from "@/components/ProductsMenu";
import { categories } from "@/constants/categories";
import navLinks from "@/constants/navLinks";
import Logo from "./Logo";
import ThemeToggler from "./ThemeToggler";
import UserProfile from "./UserProfile";

const Header = () => {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileCatalogOpen, setMobileCatalogOpen] = useState(false);
  const [query, setQuery] = useState("");

  function submitSearch(e) {
    e.preventDefault();
    navigate(
      query.trim()
        ? `/products?name=${encodeURIComponent(query.trim())}`
        : "/products",
    );
    setMobileOpen(false);
  }

  return (
    <header className="sticky top-0 z-40 border-b border-hairline bg-paper/90 dark:bg-[#0e0f12]/90 dark:border-[#262932] backdrop-blur transition-colors duration-300">
      <div className="container-page flex h-16 items-center justify-between gap-4">
        <Logo />

        {/* ── Desktop nav ── */}
        <nav className="hidden lg:flex items-center gap-7">
          {NavLinks.map((navLink) => {
            const isActive =
              pathname === navLink.route ||
              (navLink.route !== "/" && pathname.startsWith(navLink.route));

            return (
              <div
                key={navLink.label}
                className={`eyebrow transition-colors hover:text-ink dark:hover:text-[#f0efe8] ${
                  isActive
                    ? "text-ink dark:text-[#f0efe8]"
                    : "text-slate dark:text-[#8b8fa8]"
                }`}
              >
                <Link href={navLink.route}>
                  <span>{navLink.label}</span>
                </Link>
              </div>
            );
          })}
          <ProductsMenu />
        </nav>

        {/* ── Search ── */}
        <form
          onSubmit={submitSearch}
          className="hidden md:flex flex-1 max-w-sm items-center border border-hairline dark:border-[#262932] px-3 py-2 gap-2 focus-within:border-ink dark:focus-within:border-[#f0efe8] transition-colors bg-transparent"
        >
          <Search size={15} className="text-slate dark:text-[#8b8fa8]" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search model, brand…"
            className="w-full bg-transparent text-sm outline-none placeholder:text-slate-light dark:placeholder:text-[#5b5e72] text-ink dark:text-[#f0efe8]"
          />
        </form>

        {/* ── Icon actions ── */}
        <div className="flex items-center gap-2">
          <button
            className="relative grid h-9 w-9 place-items-center border border-hairline dark:border-[#262932] hover:border-ink dark:hover:border-[#f0efe8] text-ink dark:text-[#f0efe8] transition-colors"
            aria-label="Open cart"
            title="Cart"
          >
            <ShoppingCart size={16} />
          </button>

          <UserProfile />

          <button
            onClick={() => setMobileOpen((o) => !o)}
            className="grid h-9 w-9 place-items-center border border-hairline dark:border-[#262932] text-ink dark:text-[#f0efe8] lg:hidden transition-colors"
            aria-label="Open menu"
          >
            {mobileOpen ? <X size={16} /> : <Menu size={16} />}
          </button>
        </div>
      </div>

      {/* ── Mobile drawer ── */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-hairline dark:border-[#262932] bg-paper dark:bg-[#0e0f12] px-5 py-4 space-y-4 transition-colors duration-300">
          <form
            onSubmit={submitSearch}
            className="flex items-center border border-hairline dark:border-[#262932] px-3 py-2 gap-2"
          >
            <Search size={15} className="text-slate dark:text-[#8b8fa8]" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search model, brand…"
              className="w-full bg-transparent text-sm outline-none text-ink dark:text-[#f0efe8] placeholder:text-slate-light dark:placeholder:text-[#5b5e72]"
            />
          </form>

          <div className="flex flex-col gap-1">
            {/* Products accordion */}
            <button
              onClick={() => setMobileCatalogOpen((o) => !o)}
              className="flex items-center justify-between py-2 eyebrow text-ink dark:text-[#f0efe8]"
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
                        href={`/products?category=${encodeURIComponent(c.label)}`}
                        onClick={() => {
                          setMobileOpen(false);
                          setMobileCatalogOpen(false);
                        }}
                        className="flex items-center gap-2 border border-hairline dark:border-[#262932] px-2.5 py-2 text-xs text-ink dark:text-[#f0efe8] hover:border-signal transition-colors"
                      >
                        <c.icon size={14} className="text-signal shrink-0" />
                        {c.label}
                      </Link>
                    ))}
                  </div>
                  <Link
                    href="/products"
                    onClick={() => setMobileOpen(false)}
                    className="block py-2 font-mono text-xs text-slate dark:text-[#8b8fa8] underline"
                  >
                    View All Products
                  </Link>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Nav links */}
            {navLinks.map((l) => (
              <Link
                key={l.label}
                href={l.route}
                onClick={() => setMobileOpen(false)}
                className="eyebrow text-ink dark:text-[#f0efe8] py-2 hover:text-signal dark:hover:text-signal transition-colors"
              >
                {l.label}
              </Link>
            ))}

            <Link
              href="/login"
              onClick={() => setMobileOpen(false)}
              className="eyebrow text-ink dark:text-[#f0efe8] py-2 hover:text-signal dark:hover:text-signal transition-colors"
            >
              Sign in
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
