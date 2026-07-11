import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ChevronDown,
  Smartphone,
  Cpu,
  Shirt,
  ShoppingBasket,
  Home,
  Sparkles,
  Dumbbell,
  BookOpen,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import { PRODUCTS_ROUTE } from "@/constants/routes";

export const CATEGORIES = [
  { label: "Smartphones", icon: Smartphone, blurb: "Flagships & mid-range" },
  {
    label: "Tech & Electronics",
    icon: Cpu,
    blurb: "Laptops, audio, accessories",
  },
  { label: "Clothing", icon: Shirt, blurb: "Everyday & seasonal wear" },
  { label: "Groceries", icon: ShoppingBasket, blurb: "Pantry & household" },
  { label: "Home & Living", icon: Home, blurb: "Furniture & decor" },
  { label: "Beauty", icon: Sparkles, blurb: "Skincare & grooming" },
  { label: "Sports", icon: Dumbbell, blurb: "Gear & equipment" },
  { label: "Books", icon: BookOpen, blurb: "Fiction & reference" },
];

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
        className={`eyebrow flex items-center gap-1 transition-colors hover:text-ink ${open ? "text-ink" : "text-slate"}`}
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
                <p className="eyebrow">Shop by category</p>
                <Link
                  href="/products"
                  className="font-mono text-xs text-slate hover:text-signal inline-flex items-center gap-1"
                >
                  All Products <ArrowRight size={11} />
                </Link>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {CATEGORIES.map((c, i) => (
                  <motion.div
                    key={c.label}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: i * 0.025 }}
                  >
                    <Link
                      href={`/products?category=${encodeURIComponent(c.label)}`}
                      onClick={() => setOpen(false)}
                      className="group flex items-start gap-3 border border-hairline p-3 hover:border-ink transition-colors"
                    >
                      <span className="grid h-9 w-9 shrink-0 place-items-center bg-paper border border-hairline group-hover:bg-ink group-hover:text-paper group-hover:border-ink transition-colors">
                        <c.icon size={16} />
                      </span>
                      <span>
                        <span className="block text-sm font-medium group-hover:text-signal transition-colors">
                          {c.label}
                        </span>
                        <span className="block font-mono text-[11px] text-slate">
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
