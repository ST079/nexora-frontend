"use client";
import React, { useState } from "react";
import NavLinks from "@/constants/NavLinks";
import { NavLink } from "react-router-dom";
import { Search, ShoppingCart, User, Menu, X, ChevronDown } from "lucide-react";
import { HOME_ROUTE } from "@/constants/routes";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

const Header = () => {
  // const { user } = useAuth();
  // const { totals, setDrawerOpen, pulse } = useCart();
  const [mobileOpen, setMobileOpen] = useState(false);
  // const [mobileCatalogOpen, setMobileCatalogOpen] = useState(false);
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
    <header className="sticky top-0 z-40 border-b border-hairline bg-paper/90 backdrop-blur">
      <div className="container-page flex h-16 items-center justify-between gap-4">
        <Link href={HOME_ROUTE} className="flex items-center gap-2 shrink-0">
          <span className="grid h-8 w-8 place-items-center bg-ink font-mono text-sm text-signal">
            N
          </span>
          <span className="font-display text-lg font-semibold tracking-tight">
            NEXORA
          </span>
        </Link>

        <nav className="hidden lg:flex items-center gap-7">
          {NavLinks.map((navLink) => (
            <Link href={navLink.route} key={navLink.label}>
              <li className="list-none">{navLink.label}</li>
            </Link>
          ))}
        </nav>

        <form
          onSubmit={submitSearch}
          className="hidden md:flex flex-1 max-w-sm items-center border border-hairline px-3 py-2 gap-2 focus-within:border-ink transition-colors"
        >
          <Search size={15} className="text-slate" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search model, brand…"
            className="w-full bg-transparent text-sm outline-none placeholder:text-slate-light"
          />
        </form>

        <div className="flex items-center gap-2">
          <Link
            href={"/login"}
            className="hidden sm:grid h-9 w-9 place-items-center border border-hairline hover:border-ink transition-colors"
            title={"Sign in"}
          >
            <User size={16} />
          </Link>

          <button
            onClick={() => setDrawerOpen(true)}
            className="relative grid h-9 w-9 place-items-center border border-hairline hover:border-ink transition-colors"
            aria-label="Open cart"
          >
            <ShoppingCart size={16} />
            {/* {totals.count > 0 && (
              <motion.span
                key={pulse}
                initial={{ scale: 0.6 }}
                animate={{ scale: 1 }}
                className="absolute -top-2 -right-2 grid h-5 w-5 place-items-center rounded-full bg-signal font-mono text-[10px] text-paper"
              >
                {totals.count > 9 ? "9+" : totals.count}
              </motion.span>
            )} */}
          </button>

          <button
            onClick={() => setMobileOpen((o) => !o)}
            className="grid h-9 w-9 place-items-center border border-hairline lg:hidden"
            aria-label="Open menu"
          >
            {mobileOpen ? <X size={16} /> : <Menu size={16} />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="lg:hidden border-t border-hairline bg-paper px-5 py-4 space-y-4">
          <form
            onSubmit={submitSearch}
            className="flex items-center border border-hairline px-3 py-2 gap-2"
          >
            <Search size={15} className="text-slate" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search model, brand…"
              className="w-full bg-transparent text-sm outline-none"
            />
          </form>

          <div className="flex flex-col gap-1">
            <button
              onClick={() => setMobileCatalogOpen((o) => !o)}
              className="flex items-center justify-between py-2 eyebrow text-ink"
            >
              Catalog
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
                    {CATEGORIES.map((c) => (
                      <Link
                        key={c.label}
                        href={`/products?category=${encodeURIComponent(c.label)}`}
                        onClick={() => {
                          setMobileOpen(false);
                          setMobileCatalogOpen(false);
                        }}
                        className="flex items-center gap-2 border border-hairline px-2.5 py-2 text-xs"
                      >
                        <c.icon size={14} className="text-signal shrink-0" />
                        {c.label}
                      </Link>
                    ))}
                  </div>
                  <Link
                    href="/products"
                    onClick={() => setMobileOpen(false)}
                    className="block py-2 font-mono text-xs text-slate underline"
                  >
                    View full catalog
                  </Link>
                </motion.div>
              )}
            </AnimatePresence>

            {links.map((l) => (
              <Link
                key={l.label}
                href={l.to}
                onClick={() => setMobileOpen(false)}
                className="eyebrow text-ink py-2"
              >
                {l.label}
              </Link>
            ))}
            <Link
              href={"/login"}
              onClick={() => setMobileOpen(false)}
              className="eyebrow text-ink py-2"
            >
              {user ? "My account" : "Sign in"}
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
