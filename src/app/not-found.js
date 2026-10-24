"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ArrowLeft, Home, Search } from "lucide-react";
import { HOME_ROUTE, PRODUCTS_ROUTE } from "@/constants/routes";

const LOG_LINES = [
  "nexora.router · resolving path…",
  "checking catalog index… miss",
  "checking static routes… miss",
  "checking dynamic segments… miss",
  "result → 404 NOT_FOUND",
];

export default function NotFound() {
  const [visibleLines, setVisibleLines] = useState(0);
  const [glitch, setGlitch] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const interval = setInterval(() => {
      setVisibleLines((v) => {
        if (v >= LOG_LINES.length) {
          clearInterval(interval);
          return v;
        }
        return v + 1;
      });
    }, 420);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    let reset;
    const pulse = setInterval(() => {
      setGlitch(true);
      reset = setTimeout(() => setGlitch(false), 120);
    }, 3200);
    return () => {
      clearInterval(pulse);
      clearTimeout(reset);
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-paper dark:bg-[#0e0f12] transition-colors duration-300">
      {/* Left dark panel */}
      <div className="relative lg:w-[45%] bg-ink dark:bg-[#0a0b0e] text-paper flex flex-col justify-between overflow-hidden p-8 sm:p-10 min-h-72 lg:min-h-screen">
        <div
          className="absolute inset-0 opacity-[0.06] pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(90deg,#FAFAF7 1px,transparent 1px),linear-gradient(#FAFAF7 1px,transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />
        <motion.div
          className="absolute left-0 top-0 h-40 w-full pointer-events-none bg-linear-to-b from-transparent via-signal/20 to-transparent"
          animate={{ y: ["-15%", "115%"] }}
          transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
        />

        <Link href={HOME_ROUTE} className="relative z-10 flex items-center gap-2 w-fit">
          <span className="grid h-8 w-8 place-items-center bg-paper text-ink font-mono font-bold text-sm">
            N
          </span>
          <span className="font-display font-bold text-lg tracking-tight">NEXORA</span>
        </Link>

        <div className="relative z-10 py-8">
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-signal mb-3">
            Error code
          </p>
          <h1
            className={`font-display font-bold leading-none select-none text-[clamp(5rem,18vw,10rem)] ${
              glitch ? "text-signal [text-shadow:3px_0_#ff6a1a,-3px_0_rgba(48,70,229,0.7)]" : "text-paper"
            }`}
          >
            404
          </h1>
          <p className="text-sm mt-2 max-w-xs leading-relaxed text-paper/60">
            The route you requested isn&apos;t in the catalog. It may have been
            removed, renamed, or it never existed.
          </p>
        </div>

        <div className="relative z-10 space-y-2" aria-hidden="true">
          {LOG_LINES.map((line, i) => (
            <motion.p
              key={line}
              initial={{ opacity: 0, x: -6 }}
              animate={{
                opacity: i < visibleLines ? 1 : 0,
                x: i < visibleLines ? 0 : -6,
              }}
              transition={{ duration: 0.3 }}
              className={`font-mono text-[11px] ${
                i === LOG_LINES.length - 1 ? "text-signal" : "text-paper/50"
              }`}
            >
              <span className="text-signal mr-1">{">"}</span>
              {line}
            </motion.p>
          ))}
        </div>
      </div>

      {/* Right panel */}
      <div className="flex flex-1 items-center justify-center p-8 sm:p-10">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-sm"
        >
          <p className="eyebrow dark:text-[#8b8fa8] mb-2">Page not found</p>
          <h2 className="font-display text-3xl font-semibold mb-3 tracking-tight text-ink dark:text-[#f0efe8]">
            This page doesn&apos;t exist.
          </h2>
          <p className="text-sm leading-relaxed mb-8 text-slate dark:text-[#8b8fa8]">
            Double-check the URL, or use one of the options below to get back on
            track.
          </p>

          <dl className="mb-8 border border-hairline dark:border-[#262932] divide-y divide-hairline dark:divide-[#262932] font-mono text-[13px]">
            {[
              { label: "Requested path", value: pathname || "/" },
              { label: "HTTP status", value: "404 Not Found" },
              { label: "Suggestion", value: "Check the URL or go home" },
            ].map((row) => (
              <div key={row.label} className="flex items-baseline justify-between gap-4 px-4 py-2.5">
                <dt className="shrink-0 text-slate dark:text-[#8b8fa8]">{row.label}</dt>
                <dd className="truncate text-right max-w-44 text-ink dark:text-[#f0efe8]">
                  {row.value}
                </dd>
              </div>
            ))}
          </dl>

          <div className="flex flex-col gap-3">
            <Link href={HOME_ROUTE} className="btn-primary justify-center">
              <Home size={15} /> Go home
            </Link>
            <Link href={PRODUCTS_ROUTE} className="btn-secondary justify-center">
              <Search size={15} /> Browse catalog
            </Link>
            <button
              onClick={() => router.back()}
              className="btn-ghost justify-center text-slate dark:text-[#8b8fa8] hover:text-signal"
            >
              <ArrowLeft size={15} /> Go back
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
