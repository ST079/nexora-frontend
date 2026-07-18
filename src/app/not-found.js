/* eslint-disable react/no-unescaped-entities */
"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { ArrowLeft, Home, Search } from "lucide-react";

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
  const [path, setPath] = useState("/—");

  useEffect(() => {
    setPath(window.location.pathname);
  }, []);

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
    const pulse = setInterval(() => {
      setGlitch(true);
      setTimeout(() => setGlitch(false), 120);
    }, 3200);
    return () => clearInterval(pulse);
  }, []);

  return (
    <div
      className="min-h-screen flex flex-col lg:flex-row bg-[#FAFAF7]"
      style={{ fontFamily: '"IBM Plex Sans", sans-serif' }}
    >
      {/* ── Left dark panel ── */}
      <div className="relative lg:w-[45%] bg-[#14151A] text-[#FAFAF7] flex flex-col justify-between overflow-hidden p-10 min-h-[280px] lg:min-h-screen">
        {/* Blueprint grid */}
        <div
          className="absolute inset-0 opacity-[0.06] pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(90deg,#FAFAF7 1px,transparent 1px),linear-gradient(#FAFAF7 1px,transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />

        {/* Vertical scan beam */}
        <motion.div
          className="absolute left-0 top-0 h-40 w-full pointer-events-none"
          style={{
            background:
              "linear-gradient(to bottom,transparent,rgba(255,106,26,0.18),transparent)",
          }}
          animate={{ y: ["-15%", "115%"] }}
          transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
        />

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-2">
          <span
            className="grid h-8 w-8 place-items-center bg-[#FAFAF7] text-[#14151A] font-bold text-sm"
            style={{ fontFamily: '"IBM Plex Mono", monospace' }}
          >
            N
          </span>
          <span
            className="font-bold text-lg tracking-tight"
            style={{ fontFamily: '"Space Grotesk", sans-serif' }}
          >
            NEXORA
          </span>
        </div>

        {/* Big 404 */}
        <div className="relative z-10 py-8">
          <p
            className="text-[#FF6A1A] mb-3"
            style={{
              fontFamily: '"IBM Plex Mono", monospace',
              fontSize: 11,
              letterSpacing: "0.22em",
              textTransform: "uppercase",
            }}
          >
            Error code
          </p>
          <h1
            className="font-bold leading-none select-none"
            style={{
              fontFamily: '"Space Grotesk", sans-serif',
              fontSize: "clamp(5rem, 18vw, 10rem)",
              color: glitch ? "#FF6A1A" : "#FAFAF7",
              textShadow: glitch
                ? "3px 0 #FF6A1A, -3px 0 rgba(48,70,229,0.7)"
                : "none",
              transition: "none",
            }}
          >
            404
          </h1>
          <p
            className="text-sm mt-2 max-w-xs leading-relaxed"
            style={{ color: "rgba(250,250,247,0.6)" }}
          >
            The route you requested isn't in the catalog. It may have been
            removed, renamed, or it never existed.
          </p>
        </div>

        {/* Terminal log */}
        <div className="relative z-10 space-y-2">
          {LOG_LINES.map((line, i) => (
            <motion.p
              key={line}
              initial={{ opacity: 0, x: -6 }}
              animate={{
                opacity: i < visibleLines ? 1 : 0,
                x: i < visibleLines ? 0 : -6,
              }}
              transition={{ duration: 0.3 }}
              style={{
                fontFamily: '"IBM Plex Mono", monospace',
                fontSize: 11,
                color:
                  i === LOG_LINES.length - 1
                    ? "#FF6A1A"
                    : "rgba(250,250,247,0.5)",
              }}
            >
              <span style={{ color: "#FF6A1A", marginRight: 4 }}>{">"}</span>
              {line}
            </motion.p>
          ))}
          {visibleLines >= LOG_LINES.length && (
            <motion.span
              className="inline-block align-middle ml-3"
              style={{
                height: 12,
                width: 6,
                background: "#FF6A1A",
                display: "inline-block",
              }}
              animate={{ opacity: [1, 0] }}
              transition={{
                duration: 0.8,
                repeat: Infinity,
                repeatType: "reverse",
              }}
            />
          )}
        </div>
      </div>

      {/* ── Right panel ── */}
      <div className="flex flex-1 items-center justify-center p-10">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-sm"
        >
          <p
            style={{
              fontFamily: '"IBM Plex Mono", monospace',
              fontSize: 11,
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: "#6B7280",
              marginBottom: 8,
            }}
          >
            Page not found
          </p>
          <h2
            className="text-3xl font-semibold mb-3 tracking-tight"
            style={{ fontFamily: '"Space Grotesk", sans-serif' }}
          >
            This listing doesn't exist.
          </h2>
          <p
            className="text-sm leading-relaxed mb-8"
            style={{ color: "#6B7280" }}
          >
            Double-check the URL, or use one of the options below to get back on
            track.
          </p>

          {/* Spec rows */}
          <div className="mb-8" style={{ border: "1px solid #E3E1D8" }}>
            {[
              { label: "Requested path", value: path },
              { label: "HTTP status", value: "404 Not Found" },
              { label: "Suggestion", value: "Check the URL or go home" },
            ].map((row, i) => (
              <div
                key={row.label}
                className="flex items-baseline justify-between gap-4 px-4 py-2.5"
                style={{
                  fontFamily: '"IBM Plex Mono", monospace',
                  fontSize: 13,
                  borderTop: i > 0 ? "1px solid #E3E1D8" : "none",
                }}
              >
                <span style={{ color: "#6B7280", flexShrink: 0 }}>
                  {row.label}
                </span>
                <span
                  style={{
                    color: "#14151A",
                    textAlign: "right",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    maxWidth: 180,
                  }}
                >
                  {row.value}
                </span>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-3">
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-medium tracking-wide transition-colors"
              style={{ background: "#14151A", color: "#FAFAF7" }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "#FF6A1A")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "#14151A")
              }
            >
              <Home size={15} /> Go home
            </Link>
            <Link
              href="/products"
              className="inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-medium tracking-wide transition-colors"
              style={{ border: "1px solid #14151A", color: "#14151A" }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "#FF6A1A";
                e.currentTarget.style.color = "#FF6A1A";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "#14151A";
                e.currentTarget.style.color = "#14151A";
              }}
            >
              <Search size={15} /> Browse catalog
            </Link>
            <button
              onClick={() => window.history.back()}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-medium transition-colors"
              style={{ color: "#6B7280" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#FF6A1A")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#6B7280")}
            >
              <ArrowLeft size={15} /> Go back
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
