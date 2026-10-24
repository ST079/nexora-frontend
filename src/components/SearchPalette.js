"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Clock, CornerDownLeft, Search, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { getProducts } from "@/api/product";
import { categories } from "@/constants/categories";
import { PRODUCTS_ROUTE } from "@/constants/routes";
import { formatNPR, productImage } from "@/utils/format";
import { backdrop, modalPanel } from "@/utils/motion";

export const OPEN_SEARCH_EVENT = "nexora:open-search";
export const openSearch = () => window.dispatchEvent(new Event(OPEN_SEARCH_EVENT));

const RECENT_KEY = "nexora:recent-searches";

const readRecent = () => {
  try {
    return JSON.parse(localStorage.getItem(RECENT_KEY) || "[]").slice(0, 5);
  } catch {
    return [];
  }
};

const saveRecent = (term) => {
  try {
    const next = [term, ...readRecent().filter((t) => t !== term)].slice(0, 5);
    localStorage.setItem(RECENT_KEY, JSON.stringify(next));
  } catch {
    // Private mode or blocked storage: recent searches are a nicety only.
  }
};

const isTyping = (el) =>
  el?.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(el?.tagName);

// Command-palette search: ⌘K, Ctrl+K or "/" opens it anywhere on the store.
// Shows live matches as you type; Enter opens the highlighted product or the
// full results page.
const SearchPalette = () => {
  const router = useRouter();
  const pathname = usePathname();
  const inputRef = useRef(null);
  const requestRef = useRef(0);
  // Remember which page the palette was opened on: following a result changes
  // the path, which closes it without an effect.
  const [openedOn, setOpenedOn] = useState(null);
  const open = openedOn === pathname;
  const [term, setTerm] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [active, setActive] = useState(-1);
  const [recent, setRecent] = useState([]);

  const close = useCallback(() => setOpenedOn(null), []);

  const show = useCallback(() => {
    setRecent(readRecent());
    setTerm("");
    setResults([]);
    setActive(-1);
    setOpenedOn(pathname);
  }, [pathname]);

  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        show();
      } else if (e.key === "/" && !isTyping(document.activeElement)) {
        e.preventDefault();
        show();
      }
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener(OPEN_SEARCH_EVENT, show);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener(OPEN_SEARCH_EVENT, show);
    };
  }, [show]);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const focusTimer = setTimeout(() => inputRef.current?.focus(), 30);
    return () => {
      document.body.style.overflow = previousOverflow;
      clearTimeout(focusTimer);
    };
  }, [open]);

  // Debounced live results; only the newest request may update the list.
  useEffect(() => {
    const q = term.trim();
    if (!open || q.length < 2) return;
    const id = ++requestRef.current;
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const data = await getProducts({ name: q, limit: 6 });
        if (id === requestRef.current) {
          setResults(Array.isArray(data) ? data : []);
          setActive(-1);
        }
      } catch {
        if (id === requestRef.current) setResults([]);
      } finally {
        if (id === requestRef.current) setLoading(false);
      }
    }, 220);
    return () => clearTimeout(timer);
  }, [term, open]);

  const searching = term.trim().length >= 2;
  const shown = searching ? results : [];

  const goToResults = (value = term) => {
    const q = value.trim();
    if (q) saveRecent(q);
    router.push(q ? `${PRODUCTS_ROUTE}?name=${encodeURIComponent(q)}` : PRODUCTS_ROUTE);
    close();
  };

  const onKeyDown = (e) => {
    if (e.key === "Escape") {
      e.preventDefault();
      close();
    } else if (e.key === "ArrowDown" && shown.length) {
      e.preventDefault();
      setActive((i) => (i + 1) % shown.length);
    } else if (e.key === "ArrowUp" && shown.length) {
      e.preventDefault();
      setActive((i) => (i <= 0 ? shown.length - 1 : i - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const picked = shown[active];
      if (picked) {
        saveRecent(term.trim());
        router.push(`${PRODUCTS_ROUTE}/${picked._id}`);
        close();
      } else {
        goToResults();
      }
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[60] flex items-start justify-center px-3 pt-[8vh] sm:pt-[12vh]">
          <motion.div
            {...backdrop}
            className="absolute inset-0 bg-night/50 backdrop-blur-sm"
            onClick={close}
          />

          <motion.div
            {...modalPanel}
            role="dialog"
            aria-modal="true"
            aria-label="Search products"
            className="relative w-full max-w-xl overflow-hidden rounded-[1.75rem] border border-hairline bg-panel shadow-lift"
          >
            <div className="flex items-center gap-3 border-b border-hairline px-5">
              <Search size={18} className="shrink-0 text-signal" />
              <input
                ref={inputRef}
                type="search"
                value={term}
                onChange={(e) => setTerm(e.target.value)}
                onKeyDown={onKeyDown}
                placeholder="Search phones, hoodies, rice cookers…"
                aria-label="Search products"
                aria-controls="search-results"
                aria-activedescendant={active >= 0 ? `search-result-${active}` : undefined}
                className="h-16 w-full bg-transparent text-base text-ink outline-none placeholder:text-slate-light"
              />
              {loading && (
                <span className="h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-signal/30 border-t-signal" />
              )}
              <button onClick={close} className="icon-btn h-8 w-8" aria-label="Close search">
                <X size={14} />
              </button>
            </div>

            <div className="max-h-[60vh] overflow-y-auto p-3 custom-scrollbar" id="search-results">
              {searching ? (
                shown.length > 0 ? (
                  <ul role="listbox" aria-label="Matching products" className="space-y-1">
                    {shown.map((p, i) => (
                      <motion.li
                        key={p._id}
                        id={`search-result-${i}`}
                        role="option"
                        aria-selected={i === active}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.03 }}
                      >
                        <Link
                          href={`${PRODUCTS_ROUTE}/${p._id}`}
                          onClick={() => saveRecent(term.trim())}
                          onMouseEnter={() => setActive(i)}
                          className={`flex items-center gap-3 rounded-2xl p-2 pr-3 transition-colors ${
                            i === active ? "bg-signal-tint" : "hover:bg-mist"
                          }`}
                        >
                          <span className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-mist">
                            <Image
                              src={productImage(p)}
                              alt=""
                              fill
                              sizes="48px"
                              className="object-cover"
                            />
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-sm font-semibold text-ink">
                              {p.name}
                            </span>
                            <span className="block truncate text-xs text-slate">
                              {[p.brand, p.category].filter(Boolean).join(" · ")}
                            </span>
                          </span>
                          <span className="font-mono text-sm text-ink">{formatNPR(p.price)}</span>
                        </Link>
                      </motion.li>
                    ))}
                    <li>
                      <button
                        onClick={() => goToResults()}
                        className="mt-1 flex w-full items-center justify-between rounded-2xl px-3 py-3 text-sm font-medium text-signal-dim transition-colors hover:bg-signal-tint"
                      >
                        See all results for “{term.trim()}”
                        <ArrowRight size={15} />
                      </button>
                    </li>
                  </ul>
                ) : (
                  !loading && (
                    <div className="px-4 py-10 text-center">
                      <p className="font-display text-lg font-semibold text-ink">
                        Nothing called “{term.trim()}” yet
                      </p>
                      <p className="mt-1 text-sm text-slate">
                        Try a brand or a simpler word, or browse a category below.
                      </p>
                    </div>
                  )
                )
              ) : (
                <div className="space-y-5 p-2">
                  {recent.length > 0 && (
                    <div>
                      <p className="eyebrow mb-2 px-1">Recent</p>
                      <div className="flex flex-wrap gap-2">
                        {recent.map((r) => (
                          <button key={r} onClick={() => goToResults(r)} className="chip">
                            <Clock size={12} className="text-slate" /> {r}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  <div>
                    <p className="eyebrow mb-2 px-1">Jump to a category</p>
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                      {categories.map((c, i) => (
                        <motion.div
                          key={c.label}
                          initial={{ opacity: 0, scale: 0.92 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.04 + i * 0.025 }}
                        >
                          <Link
                            href={`${PRODUCTS_ROUTE}?category=${encodeURIComponent(c.label)}`}
                            className="group flex flex-col items-start gap-2 rounded-2xl border border-hairline p-3 text-xs font-medium text-ink transition-all hover:-translate-y-0.5 hover:border-signal hover:bg-signal-tint"
                          >
                            <c.icon
                              size={18}
                              className="text-signal transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6"
                            />
                            {c.label}
                          </Link>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="hidden items-center gap-4 border-t border-hairline px-5 py-2.5 font-mono text-[10px] text-slate sm:flex">
              <span className="flex items-center gap-1">
                <kbd className="rounded border border-hairline px-1">↑</kbd>
                <kbd className="rounded border border-hairline px-1">↓</kbd> move
              </span>
              <span className="flex items-center gap-1">
                <kbd className="rounded border border-hairline px-1">
                  <CornerDownLeft size={9} className="inline" />
                </kbd>
                open
              </span>
              <span className="flex items-center gap-1">
                <kbd className="rounded border border-hairline px-1">esc</kbd> close
              </span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default SearchPalette;
