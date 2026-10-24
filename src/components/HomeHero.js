"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "framer-motion";
import { ArrowRight, Search, Wallet } from "lucide-react";
import { PRODUCTS_ROUTE } from "@/constants/routes";
import { categories } from "@/constants/categories";
import { formatNPR, productImage } from "@/utils/format";
import { EASE_OUT, fadeUp, softSpring } from "@/utils/motion";
import { openSearch } from "./SearchPalette";
import { CATEGORY_TONES } from "./ProductsMenu";

const WORDS = ["day", "home", "gift", "season"];
const PAYMENTS = ["Khalti", "Card", "Cash on delivery"];

const categoryHref = (label) => `${PRODUCTS_ROUTE}?category=${encodeURIComponent(label)}`;

// The headline word swaps every few seconds. Every word sits in the same grid
// cell, so the line is always as wide as the longest one and nothing jumps.
const CyclingWord = () => {
  const [index, setIndex] = useState(0);
  const reduce = useReducedMotion();

  useEffect(() => {
    if (reduce) return;
    const timer = setInterval(() => setIndex((i) => (i + 1) % WORDS.length), 2600);
    return () => clearInterval(timer);
  }, [reduce]);

  return (
    <span className="marker inline-grid pr-1 text-left">
      {WORDS.map((w) => (
        <span key={w} aria-hidden className="invisible col-start-1 row-start-1">
          {w}.
        </span>
      ))}
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={WORDS[index]}
          initial={{ y: "60%", opacity: 0, rotate: 4 }}
          animate={{ y: 0, opacity: 1, rotate: 0 }}
          exit={{ y: "-60%", opacity: 0, rotate: -4 }}
          transition={{ duration: 0.5, ease: EASE_OUT }}
          className="col-start-1 row-start-1"
        >
          {WORDS[index]}.
        </motion.span>
      </AnimatePresence>
    </span>
  );
};

// A button that leans toward the pointer a little, then springs back.
const MagneticLink = ({ href, children, className }) => {
  const x = useSpring(0, softSpring);
  const y = useSpring(0, softSpring);
  const reduce = useReducedMotion();

  const onMove = (e) => {
    if (reduce) return;
    const r = e.currentTarget.getBoundingClientRect();
    x.set((e.clientX - r.left - r.width / 2) * 0.25);
    y.set((e.clientY - r.top - r.height / 2) * 0.35);
  };
  const reset = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.span style={{ x, y }} className="inline-flex" onPointerMove={onMove} onPointerLeave={reset}>
      <Link href={href} className={className}>
        {children}
      </Link>
    </motion.span>
  );
};

// Circular "shop now" badge: text on a circle path that turns slowly.
const SpinBadge = () => (
  <Link
    href={PRODUCTS_ROUTE}
    aria-label="Shop all products"
    className="group absolute -bottom-4 -left-2 z-20 grid h-28 w-28 place-items-center sm:-left-6 sm:h-32 sm:w-32"
  >
    <svg viewBox="0 0 100 100" className="absolute inset-0 animate-spin-slow text-ink" aria-hidden>
      <defs>
        <path id="hero-badge-circle" d="M50,50 m-38,0 a38,38 0 1,1 76,0 a38,38 0 1,1 -76,0" />
      </defs>
      <circle cx="50" cy="50" r="49" className="fill-paper" />
      <text className="fill-current font-mono text-[10.5px] font-semibold uppercase tracking-[0.2em]">
        <textPath href="#hero-badge-circle">Shop now · New in · Shop now · New in ·</textPath>
      </text>
    </svg>
    <span className="relative grid h-11 w-11 place-items-center rounded-full bg-marigold text-on-marigold transition-transform duration-500 ease-spring group-hover:-rotate-45 group-hover:scale-110 sm:h-12 sm:w-12">
      <ArrowRight size={18} strokeWidth={2.5} />
    </span>
  </Link>
);

// Fan positions for the three cards: [rotate, x offset, y offset, depth].
const FAN = [
  { rotate: -9, x: "-30%", y: "8%", depth: 18, float: "0s" },
  { rotate: 7, x: "30%", y: "4%", depth: 26, float: "-2s" },
  { rotate: -1, x: "0%", y: "-4%", depth: 40, float: "-4s" },
];

const FanCard = ({ product, slot, px, py, lead }) => {
  const f = FAN[slot];
  const x = useTransform(px, (v) => v * f.depth);
  const y = useTransform(py, (v) => v * f.depth);
  const id = product._id || product.id;

  return (
    <motion.div
      initial={{ opacity: 0, y: 60, rotate: 0, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, rotate: f.rotate, scale: 1 }}
      transition={{ ...softSpring, delay: 0.25 + slot * 0.12 }}
      style={{ left: `calc(50% + ${f.x})`, top: f.y }}
      className={`absolute w-[46%] max-w-[240px] -translate-x-1/2 ${slot === 2 ? "z-10" : ""}`}
    >
      <motion.div style={{ x, y }}>
        <Link
          href={`${PRODUCTS_ROUTE}/${id}`}
          className="group block animate-float rounded-3xl border border-hairline bg-panel p-2 shadow-lift transition-transform duration-500 ease-spring hover:scale-[1.04]"
          style={{ animationDelay: f.float }}
        >
          <span className="relative block aspect-4/5 overflow-hidden rounded-[1.1rem] bg-mist">
            <Image
              src={productImage(product)}
              alt={product.name}
              fill
              sizes="240px"
              preload={lead}
              className="object-cover transition-transform duration-700 ease-out-expo group-hover:scale-105"
            />
          </span>
          {/* The front card covers the right card's left edge, so its caption flips. */}
          <span
            className={`flex items-center justify-between gap-2 px-1.5 pb-1 pt-2.5 ${slot === 1 ? "flex-row-reverse" : ""}`}
          >
            <span className="truncate text-xs font-semibold text-ink">{product.name}</span>
            <span className="shrink-0 rounded-full bg-ink px-2 py-0.5 font-mono text-[10px] font-semibold text-paper">
              {formatNPR(product.price)}
            </span>
          </span>
        </Link>
      </motion.div>
    </motion.div>
  );
};

// When the catalogue is empty (or the API is down) the hero still has a
// picture: three category tiles in the same fan.
const FanCategory = ({ category, slot, px, py }) => {
  const f = FAN[slot];
  const x = useTransform(px, (v) => v * f.depth);
  const y = useTransform(py, (v) => v * f.depth);
  const Icon = category.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 60, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, rotate: f.rotate, scale: 1 }}
      transition={{ ...softSpring, delay: 0.25 + slot * 0.12 }}
      style={{ left: `calc(50% + ${f.x})`, top: f.y }}
      className={`absolute w-[46%] max-w-[230px] -translate-x-1/2 ${slot === 2 ? "z-10" : ""}`}
    >
      <motion.div style={{ x, y }}>
        <Link
          href={categoryHref(category.label)}
          className={`flex aspect-4/5 animate-float flex-col justify-between rounded-3xl p-5 shadow-lift ${CATEGORY_TONES[slot]} ${
            slot === 1 ? "items-end text-right" : ""
          }`}
          style={{ animationDelay: f.float }}
        >
          <Icon size={44} strokeWidth={1.5} />
          <span>
            <span className="block font-display text-xl font-bold text-ink">{category.label}</span>
            <span className="text-xs text-slate-dim">{category.blurb}</span>
          </span>
        </Link>
      </motion.div>
    </motion.div>
  );
};

const HomeHero = ({ products = [] }) => {
  const sectionRef = useRef(null);
  const reduce = useReducedMotion();
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const px = useSpring(rawX, { stiffness: 120, damping: 20 });
  const py = useSpring(rawY, { stiffness: 120, damping: 20 });

  const showcase = products.filter((p) => p.imageUrls?.length).slice(0, 3);
  const hasShowcase = showcase.length === 3;
  const fallback = [categories[0], categories[2], categories[1]];

  // Pointer position over the hero, normalised to -0.5…0.5.
  const onPointerMove = (e) => {
    if (reduce || e.pointerType !== "mouse") return;
    const r = sectionRef.current.getBoundingClientRect();
    rawX.set((e.clientX - r.left) / r.width - 0.5);
    rawY.set((e.clientY - r.top) / r.height - 0.5);
  };

  return (
    <section
      ref={sectionRef}
      onPointerMove={onPointerMove}
      onPointerLeave={() => {
        rawX.set(0);
        rawY.set(0);
      }}
      className="relative overflow-hidden"
    >
      {/* Drifting colour blobs and a faint dot grid */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <span className="absolute -left-32 top-0 h-112 w-112 animate-drift rounded-full bg-signal/20 blur-[110px] dark:bg-signal/25" />
        <span
          className="absolute -right-24 top-24 h-96 w-96 animate-drift rounded-full bg-marigold/30 blur-[110px] dark:bg-marigold/15"
          style={{ animationDelay: "-9s" }}
        />
        <span
          className="absolute inset-0 opacity-50 [mask-image:radial-gradient(ellipse_70%_60%_at_50%_40%,black,transparent)]"
          style={{
            backgroundImage: "radial-gradient(var(--color-hairline) 1.2px, transparent 1.2px)",
            backgroundSize: "22px 22px",
          }}
        />
      </div>

      <div className="container-page relative grid items-center gap-12 pb-20 pt-10 lg:grid-cols-[1.1fr_1fr] lg:gap-6 lg:pb-28 lg:pt-16">
        <div className="max-w-2xl">
          <motion.p
            {...fadeUp()}
            className="glass mb-6 inline-flex items-center gap-2 rounded-full py-1.5 pl-2 pr-4 text-xs font-medium text-slate-dim"
          >
            <span className="relative flex h-5 w-5 items-center justify-center rounded-full bg-ok/15">
              <span className="h-2 w-2 animate-pulse rounded-full bg-ok" />
            </span>
            Live stock on every product
          </motion.p>

          <motion.h1
            {...fadeUp(0.06)}
            className="font-display text-[3.25rem] font-bold leading-[0.95] tracking-[-0.035em] text-ink sm:text-7xl lg:text-[5.5rem]"
          >
            Good stuff
            <br />
            for every <CyclingWord />
          </motion.h1>

          <motion.p {...fadeUp(0.12)} className="mt-6 max-w-md text-base leading-relaxed text-slate sm:text-lg">
            Phones, fashion, groceries and more from merchants you can trust.
            Clear prices, real stock counts, and checkout in a few taps.
          </motion.p>

          <motion.div {...fadeUp(0.18)} className="mt-8 flex flex-wrap items-center gap-3">
            <MagneticLink href={PRODUCTS_ROUTE} className="btn-primary group px-7 py-3.5 text-base">
              Start shopping
              <ArrowRight size={17} className="transition-transform group-hover:translate-x-1" />
            </MagneticLink>
            <button
              type="button"
              onClick={openSearch}
              className="btn-secondary group px-5 py-3.5 text-base"
            >
              <Search size={17} className="transition-transform group-hover:rotate-12" />
              Search
              <kbd className="hidden rounded-md border border-hairline bg-mist px-1.5 font-mono text-[11px] text-slate sm:inline">
                ⌘K
              </kbd>
            </button>
          </motion.div>

          <motion.div {...fadeUp(0.24)} className="mt-8">
            <p className="eyebrow mb-3">Popular right now</p>
            <div className="flex flex-wrap gap-2">
              {categories.slice(0, 4).map((c, i) => (
                <Link
                  key={c.label}
                  href={categoryHref(c.label)}
                  className="chip group py-2 hover:-translate-y-0.5 hover:shadow-soft"
                >
                  <span
                    className={`grid h-5 w-5 place-items-center rounded-full ${CATEGORY_TONES[i % CATEGORY_TONES.length]}`}
                  >
                    <c.icon size={11} />
                  </span>
                  {c.label}
                </Link>
              ))}
            </div>
          </motion.div>

          <motion.div {...fadeUp(0.3)} className="mt-8 flex flex-wrap items-center gap-x-3 gap-y-2 text-xs text-slate">
            <Wallet size={15} className="text-slate-light" aria-hidden />
            <span>Pay with</span>
            {PAYMENTS.map((p) => (
              <span key={p} className="rounded-full border border-hairline bg-panel/70 px-2.5 py-1 font-medium text-ink">
                {p}
              </span>
            ))}
          </motion.div>
        </div>

        {/* The fan */}
        <div className="relative mx-auto aspect-[1.15] w-full max-w-[540px] lg:aspect-square">
          <motion.span
            aria-hidden
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.9, ease: EASE_OUT }}
            className="absolute inset-[8%] rounded-full border border-dashed border-ink/15"
          />
          <motion.span
            aria-hidden
            initial={{ scale: 0.4, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1, ease: EASE_OUT, delay: 0.1 }}
            className="absolute inset-[20%] rounded-full bg-signal-tint"
          />

          <div className="absolute inset-0 top-[6%]">
            {hasShowcase
              ? showcase.map((p, i) => (
                  <FanCard key={p._id || p.id} product={p} slot={i} px={px} py={py} lead={i === 2} />
                ))
              : fallback.map((c, i) => (
                  <FanCategory key={c.label} category={c} slot={i} px={px} py={py} />
                ))}
          </div>

          <SpinBadge />

          <motion.span
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ ...softSpring, delay: 0.7 }}
            className="glass absolute right-0 top-[4%] z-20 hidden items-center gap-2 rounded-full py-1.5 pl-1.5 pr-3.5 text-xs font-semibold text-ink shadow-soft sm:inline-flex"
          >
            <span className="grid h-7 w-7 place-items-center rounded-full bg-marigold text-on-marigold">
              <Wallet size={14} />
            </span>
            Cash on delivery
          </motion.span>
        </div>
      </div>
    </section>
  );
};

export default HomeHero;
