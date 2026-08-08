"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { PRODUCTS_ROUTE } from "@/constants/routes";
import HeroBackground from "./HeroBackground";

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.45, delay, ease: [0.22, 1, 0.36, 1] },
});

const HomeHero = () => {
  return (
    <section className="relative overflow-hidden">
      {/* Full-bleed background, not constrained by container-page */}
      <HeroBackground />

      {/* Text content stays within the normal content width */}
      <div className="container-page relative pt-16 pb-20 lg:pt-24 lg:pb-28">
        <div className="max-w-2xl">
          <motion.div
            {...fadeUp()}
            className="inline-flex items-center gap-2 border border-hairline dark:border-[#262932] px-3 py-1.5 mb-6 bg-paper/80 dark:bg-[#0e0f12]/80 backdrop-blur-sm"
          >
            <Sparkles size={12} className="text-signal" />
            <span className="font-mono text-[11px] uppercase tracking-widest text-slate dark:text-[#8b8fa8]">
              New arrivals every week
            </span>
          </motion.div>

          <motion.h1
            {...fadeUp(0.05)}
            className="font-display text-4xl sm:text-5xl lg:text-6xl font-semibold leading-[1.05] text-ink dark:text-[#f0efe8] mb-6"
          >
            Everyday gear, <br />
            built to last.
          </motion.h1>

          <motion.p
            {...fadeUp(0.1)}
            className="text-base text-slate dark:text-[#8b8fa8] leading-relaxed mb-8 max-w-md"
          >
            Curated essentials at fair prices — shipped fast across Nepal,
            with easy returns and real customer support.
          </motion.p>

          <motion.div {...fadeUp(0.15)} className="flex flex-wrap gap-3">
            <Link href={PRODUCTS_ROUTE} className="btn-primary">
              Shop now <ArrowRight size={15} />
            </Link>
            <Link href="#categories" className="btn-secondary">
              Browse categories
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HomeHero;