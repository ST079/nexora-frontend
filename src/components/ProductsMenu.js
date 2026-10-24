"use client";

import React, { useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, ArrowRight } from "lucide-react";
import Link from "next/link";
import { PRODUCTS_ROUTE } from "@/constants/routes";
import { categories } from "@/constants/categories";
import { spring } from "@/utils/motion";

// Rotating tile colours keep the mega menu lively without a rainbow:
// violet, marigold and teal tints, each with its readable text colour.
export const CATEGORY_TONES = [
  "bg-signal-tint text-signal-dim",
  "bg-marigold-tint text-marigold-dim",
  "bg-blueprint-tint text-blueprint-dim",
];

const ProductsMenu = ({ active = false }) => {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  // Keyboard users: open while focus is inside, close when it leaves or on Escape.
  const onBlur = (e) => {
    if (!containerRef.current?.contains(e.relatedTarget)) setOpen(false);
  };

  return (
    <div
      ref={containerRef}
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={onBlur}
      onKeyDown={(e) => e.key === "Escape" && setOpen(false)}
    >
      <Link
        href={PRODUCTS_ROUTE}
        aria-haspopup="true"
        aria-expanded={open}
        aria-current={active ? "page" : undefined}
        className={`relative flex items-center gap-1 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
          active || open ? "text-ink" : "text-slate hover:text-ink"
        }`}
      >
        {active && (
          <motion.span
            layoutId="nav-active"
            transition={spring}
            className="absolute inset-0 -z-10 rounded-full bg-panel shadow-soft"
          />
        )}
        Shop
        <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown size={13} />
        </motion.span>
      </Link>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.98 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="absolute left-1/2 top-full z-30 w-[620px] -translate-x-1/2 pt-4"
          >
            <div className="card-frame grid grid-cols-[1fr_180px] gap-3 p-3 shadow-lift">
              <div className="grid grid-cols-2 gap-1.5">
                {categories.map((c, i) => (
                  <motion.div
                    key={c.label}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25, delay: i * 0.02 }}
                  >
                    <Link
                      href={`${PRODUCTS_ROUTE}?category=${encodeURIComponent(c.label)}`}
                      onClick={() => setOpen(false)}
                      className="group flex items-center gap-3 rounded-2xl p-2.5 transition-colors hover:bg-mist"
                    >
                      <span
                        className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl transition-transform duration-300 ease-spring group-hover:-rotate-6 group-hover:scale-110 ${
                          CATEGORY_TONES[i % CATEGORY_TONES.length]
                        }`}
                      >
                        <c.icon size={18} />
                      </span>
                      <span className="min-w-0">
                        <span className="block text-sm font-semibold text-ink">{c.label}</span>
                        <span className="block truncate text-xs text-slate">{c.blurb}</span>
                      </span>
                    </Link>
                  </motion.div>
                ))}
              </div>

              <Link
                href={PRODUCTS_ROUTE}
                onClick={() => setOpen(false)}
                className="group relative flex flex-col justify-between overflow-hidden rounded-2xl bg-signal p-4 text-on-signal"
              >
                <span
                  aria-hidden
                  className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-marigold/90 transition-transform duration-700 ease-spring group-hover:scale-125"
                />
                <span className="relative font-mono text-[10px] uppercase tracking-[0.18em] opacity-80">
                  Everything
                </span>
                <span className="relative">
                  <span className="block font-display text-2xl font-bold leading-tight">
                    Browse the whole store
                  </span>
                  <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold">
                    Shop all
                    <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
                  </span>
                </span>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProductsMenu;
