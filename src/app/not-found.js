"use client";

import Link from "next/link";
import Form from "next/form";
import { motion } from "framer-motion";
import { usePathname, useRouter } from "next/navigation";
import { ArrowLeft, Home, Search, ShoppingBag, Sparkles, Tag, Package } from "lucide-react";
import { LogoMark } from "@/components/Logo";
import { HOME_ROUTE, PRODUCTS_ROUTE } from "@/constants/routes";
import { bouncy, fadeUp } from "@/utils/motion";

// Decorative tiles that drift around the 404. Positions are percentages of
// the stage so they stay put at every width.
const DRIFTERS = [
  { icon: Tag, tone: "bg-marigold text-on-marigold", pos: "left-[6%] top-[14%]", rotate: -12, delay: 0.3 },
  { icon: Package, tone: "bg-blueprint text-paper", pos: "right-[8%] top-[10%]", rotate: 10, delay: 0.45 },
  { icon: Sparkles, tone: "bg-ok text-paper", pos: "left-[12%] bottom-[8%]", rotate: 8, delay: 0.6 },
  { icon: ShoppingBag, tone: "bg-signal-tint text-signal-dim", pos: "right-[14%] bottom-[12%]", rotate: -8, delay: 0.75 },
];

const Digit = ({ children, delay, rotate }) => (
  <motion.span
    initial={{ opacity: 0, y: 40, rotate: 0 }}
    animate={{ opacity: 1, y: 0, rotate }}
    transition={{ ...bouncy, delay }}
    whileHover={{ rotate: 0, scale: 1.05 }}
    className="inline-block cursor-default"
  >
    {children}
  </motion.span>
);

export default function NotFound() {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <div className="flex min-h-dvh flex-col overflow-x-clip bg-paper">
      <header className="container-page flex items-center justify-between py-5">
        <Link href={HOME_ROUTE} className="group flex items-center gap-2.5" aria-label="Nexora home">
          <LogoMark />
          <span className="font-display text-xl font-bold tracking-tight text-ink">nexora</span>
        </Link>
        <Link href={PRODUCTS_ROUTE} className="btn-ghost">
          Browse products
        </Link>
      </header>

      <main className="container-page flex flex-1 flex-col items-center justify-center pb-16 pt-4 text-center">
        {/* Stage */}
        <div className="relative w-full max-w-2xl py-6 sm:py-10">
          {DRIFTERS.map(({ icon: Icon, tone, pos, rotate, delay }) => (
            <motion.span
              key={pos}
              aria-hidden
              initial={{ opacity: 0, scale: 0.4 }}
              animate={{ opacity: 1, scale: 1, rotate }}
              transition={{ ...bouncy, delay }}
              className={`absolute hidden sm:block ${pos}`}
            >
              <span
                className={`grid h-12 w-12 animate-float place-items-center rounded-2xl shadow-soft ${tone}`}
                style={{ animationDelay: `-${delay * 4}s` }}
              >
                <Icon size={20} />
              </span>
            </motion.span>
          ))}

          <h1 className="sr-only">Page not found (404)</h1>
          <p
            aria-hidden
            className="flex select-none items-center justify-center gap-2 font-display text-[clamp(6rem,22vw,12rem)] font-extrabold leading-none tracking-tighter text-ink sm:gap-4"
          >
            <Digit delay={0.05} rotate={-6}>
              4
            </Digit>
            {/* The "0" is an empty shopping bag. */}
            <motion.span
              initial={{ opacity: 0, scale: 0.3, rotate: -30 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ ...bouncy, delay: 0.18 }}
              whileHover={{ rotate: [0, -8, 8, -4, 0], transition: { duration: 0.5 } }}
              className="relative inline-grid"
            >
              <span className="grid h-[0.82em] w-[0.72em] animate-float place-items-center rounded-[0.18em] bg-signal text-on-signal shadow-glow">
                <ShoppingBag className="h-[0.4em] w-[0.4em]" strokeWidth={2.2} />
              </span>
              <span className="sticker absolute right-[-0.18em] top-[-0.1em] text-[0.11em] tracking-normal">
                empty!
              </span>
            </motion.span>
            <Digit delay={0.3} rotate={5}>
              4
            </Digit>
          </p>
        </div>

        <motion.div {...fadeUp(0.35)} className="w-full max-w-md">
          <p className="eyebrow mb-3">Page not found</p>
          <h2 className="font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">
            This aisle is <span className="whitespace-nowrap"><span className="marker">empty</span>.</span>
          </h2>
          <p className="mx-auto mt-3 max-w-sm text-[15px] leading-relaxed text-slate">
            The page may have moved, or the link has a typo. Search the catalog instead.
          </p>

          <p className="mx-auto mt-5 inline-flex max-w-full items-center gap-2 rounded-full border border-hairline bg-panel px-3 py-1.5 font-mono text-xs text-slate">
            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-danger" aria-hidden />
            <span className="truncate">{pathname || "/"}</span>
          </p>

          {/* GET /products?name=… — the same query key the catalog search uses. */}
          <Form action={PRODUCTS_ROUTE} className="group relative mt-6" role="search">
            <label htmlFor="notfound-search" className="sr-only">
              Search products
            </label>
            <Search
              size={18}
              aria-hidden
              className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-slate transition-colors group-focus-within:text-signal"
            />
            <input
              id="notfound-search"
              name="name"
              type="search"
              placeholder="Search for headphones, shoes, lamps…"
              autoComplete="off"
              className="h-14 w-full rounded-full border border-hairline bg-panel pl-12 pr-30 text-sm text-ink shadow-soft outline-none transition-all placeholder:text-slate-light focus:border-signal focus:ring-4 focus:ring-signal/15"
            />
            <button
              type="submit"
              className="absolute right-1.5 top-1.5 h-11 rounded-full bg-ink px-5 text-sm font-semibold text-paper transition-transform hover:scale-[1.03] active:scale-95"
            >
              Search
            </button>
          </Form>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
            <Link href={HOME_ROUTE} className="btn-primary">
              <Home size={15} /> Go home
            </Link>
            <button type="button" onClick={() => router.back()} className="btn-secondary group">
              <ArrowLeft size={15} className="transition-transform group-hover:-translate-x-0.5" /> Go back
            </button>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
