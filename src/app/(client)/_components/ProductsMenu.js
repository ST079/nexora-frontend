"use client";

import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, ArrowRight } from "lucide-react";
import Link from "next/link";
import { PRODUCTS_ROUTE } from "@/constants/routes";
import { categories } from "@/constants/categories";

const ProductsMenu = () => {
  const [open, setOpen] = useState(false);

  return (
    <div
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <Link
        href={PRODUCTS_ROUTE}
        className={`eyebrow flex items-center gap-1 transition-colors hover:text-ink dark:hover:text-[#f0efe8] ${
          open
            ? "text-ink dark:text-[#f0efe8]"
            : "text-slate dark:text-[#8b8fa8]"
        }`}
      >
        Products
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown size={12} />
        </motion.span>
      </Link>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            className="absolute left-1/2 top-full z-30 w-[560px] -translate-x-1/2 pt-3"
          >
            <div className="card-frame shadow-lift p-5">

              <div className="flex items-center justify-between mb-4">
                <p className="eyebrow dark:text-[#8b8fa8]">Shop by category</p>
                <Link
                  href="/products"
                  className="font-mono text-xs text-slate dark:text-[#8b8fa8] hover:text-signal dark:hover:text-signal inline-flex items-center gap-1 transition-colors"
                >
                  All Products <ArrowRight size={11} />
                </Link>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {categories.map((c, i) => (
                  <motion.div
                    key={c.label}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: i * 0.025 }}
                  >
                    <Link
                      href={`/products?category=${encodeURIComponent(c.label)}`}
                      onClick={() => setOpen(false)}
                      className="group flex items-start gap-3 border border-hairline dark:border-[#262932] p-3 hover:border-ink dark:hover:border-[#f0efe8] transition-colors"
                    >
                      {/* Icon box */}
                      <span className="grid h-9 w-9 shrink-0 place-items-center bg-paper dark:bg-[#0e0f12] border border-hairline dark:border-[#262932] text-ink dark:text-[#f0efe8] group-hover:bg-ink group-hover:text-paper group-hover:border-ink dark:group-hover:bg-[#f0efe8] dark:group-hover:text-[#0e0f12] dark:group-hover:border-[#f0efe8] transition-colors">
                        <c.icon size={16} />
                      </span>

                      {/* Label + blurb */}
                      <span>
                        <span className="block text-sm font-medium text-ink dark:text-[#f0efe8] group-hover:text-signal dark:group-hover:text-signal transition-colors">
                          {c.label}
                        </span>
                        <span className="block font-mono text-[11px] text-slate dark:text-[#8b8fa8]">
                          {c.blurb}
                        </span>
                      </span>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProductsMenu;