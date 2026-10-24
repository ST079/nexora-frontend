"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { categories } from "@/constants/categories";
import { PRODUCTS_ROUTE } from "@/constants/routes";
import { EASE_OUT, revealUp } from "@/utils/motion";
import { CATEGORY_TONES } from "./ProductsMenu";

const categoryHref = (label) => `${PRODUCTS_ROUTE}?category=${encodeURIComponent(label)}`;

// Bento layout: the first tile is the big feature, the last one runs wide.
// 4 + 6 + 2 cells fill three rows of four on desktop and five rows of two on phones.
const tileStyle = (i, count) => {
  if (i === 0) return { span: "col-span-2 lg:row-span-2", tone: "bg-signal text-on-signal", big: true };
  if (i === count - 1) return { span: "col-span-2", tone: "bg-night text-on-night", wide: true };
  return { span: "", tone: CATEGORY_TONES[(i - 1) % CATEGORY_TONES.length] };
};

const CategoryTile = ({ category, index, count }) => {
  const { span, tone, big, wide } = tileStyle(index, count);
  const Icon = category.icon;
  const solid = big || wide;

  return (
    <motion.div
      initial={{ opacity: 0, y: 28, scale: 0.96 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.6, delay: index * 0.05, ease: EASE_OUT }}
      className={span}
    >
      <Link
        href={categoryHref(category.label)}
        className={`group relative flex h-full flex-col justify-between overflow-hidden rounded-3xl p-5 transition-all duration-500 ease-out-expo hover:-translate-y-1 hover:shadow-lift sm:p-6 ${tone} ${
          big ? "min-h-56" : "min-h-40 sm:min-h-44"
        }`}
      >
        {/* Oversized icon peeking from the corner */}
        <Icon
          aria-hidden
          strokeWidth={1.2}
          className={`pointer-events-none absolute transition-transform duration-700 ease-spring group-hover:-rotate-12 group-hover:scale-110 ${
            big
              ? "-bottom-8 -right-6 h-56 w-56 opacity-20 lg:h-72 lg:w-72"
              : "-bottom-5 -right-4 h-28 w-28 opacity-15"
          }`}
        />

        <span className="flex items-start justify-between">
          <span
            className={`grid h-11 w-11 place-items-center rounded-2xl transition-transform duration-500 ease-spring group-hover:scale-110 ${
              solid ? "bg-on-night/15" : "bg-panel/80"
            }`}
          >
            <Icon size={20} aria-hidden />
          </span>
          <span
            className={`grid h-9 w-9 place-items-center rounded-full transition-all duration-500 ease-spring group-hover:rotate-45 ${
              solid ? "bg-on-night/15 group-hover:bg-marigold group-hover:text-on-marigold" : "bg-panel/80 group-hover:bg-ink group-hover:text-paper"
            }`}
          >
            <ArrowUpRight size={16} aria-hidden />
          </span>
        </span>

        <span className="relative">
          {big && (
            <span className="mb-2 inline-flex rounded-full bg-marigold px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-wider text-on-marigold">
              Featured
            </span>
          )}
          <span
            className={`block font-display font-bold leading-tight tracking-tight ${
              big ? "text-3xl sm:text-4xl lg:text-5xl" : "text-lg sm:text-xl"
            } ${solid ? "" : "text-ink"}`}
          >
            {category.label}
          </span>
          <span className={`mt-1 block text-xs sm:text-sm ${solid ? "opacity-80" : "text-slate-dim"}`}>
            {category.blurb}
          </span>
        </span>
      </Link>
    </motion.div>
  );
};

const CategoryGrid = () => {
  return (
    <section id="categories" className="container-page scroll-mt-28 py-16 lg:py-24">
      <motion.div {...revealUp()} className="mb-8 flex flex-wrap items-end justify-between gap-4 lg:mb-10">
        <div>
          <p className="eyebrow mb-3">Shop by category</p>
          <h2 className="font-display text-4xl font-bold tracking-tight text-ink sm:text-5xl">
            Where to <span className="marker">start?</span>
          </h2>
        </div>
        <Link href={PRODUCTS_ROUTE} className="btn-ghost group text-ink">
          Everything in store
          <ArrowUpRight size={15} className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </Link>
      </motion.div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:auto-rows-fr lg:grid-cols-4">
        {categories.map((c, i) => (
          <CategoryTile key={c.label} category={c} index={i} count={categories.length} />
        ))}
      </div>
    </section>
  );
};

export default CategoryGrid;
