"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  RefreshCw,
  Home,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

const LOG_LINES = [
  "nexora.runtime · intercepting error…",
  "capturing stack trace…",
  "notifying error boundary…",
  "render aborted → RUNTIME_ERROR",
];

const ErrorPage = ({ error, reset }) => {
  const [visibleLines, setVisibleLines] = useState(0);
  const [showStack, setShowStack] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [glitch, setGlitch] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisibleLines((v) => {
        if (v >= LOG_LINES.length) {
          clearInterval(interval);
          return v;
        }
        return v + 1;
      });
    }, 480);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const pulse = setInterval(() => {
      setGlitch(true);
      setTimeout(() => setGlitch(false), 110);
    }, 2800);
    return () => clearInterval(pulse);
  }, []);

  async function handleReset() {
    setResetting(true);
    await new Promise((r) => setTimeout(r, 600));
    reset();
    setResetting(false);
  }

  const errorName = error?.name || "Error";
  const errorMessage = error?.message || "An unexpected error occurred.";
  const digest = error?.digest;

  const specRows = [
    { label: "Type", value: errorName },
    { label: "Message", value: errorMessage },
    ...(digest ? [{ label: "Digest", value: digest }] : []),
  ];

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

        {/* Scan beam — danger red for error state */}
        <motion.div
          className="absolute left-0 top-0 h-40 w-full pointer-events-none"
          style={{
            background:
              "linear-gradient(to bottom,transparent,rgba(216,57,43,0.22),transparent)",
          }}
          animate={{ y: ["-15%", "115%"] }}
          transition={{ duration: 4.5, repeat: Infinity, ease: "linear" }}
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

        {/* ERROR heading */}
        <div className="relative z-10 py-8">
          <p
            className="mb-3"
            style={{
              fontFamily: '"IBM Plex Mono", monospace',
              fontSize: 11,
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: "#D8392B",
            }}
          >
            Runtime error
          </p>
          <h1
            className="font-bold leading-none select-none"
            style={{
              fontFamily: '"Space Grotesk", sans-serif',
              fontSize: "clamp(3.5rem, 12vw, 7rem)",
              color: glitch ? "#D8392B" : "#FAFAF7",
              textShadow: glitch
                ? "3px 0 #D8392B, -3px 0 rgba(48,70,229,0.6)"
                : "none",
              transition: "none",
            }}
          >
            ERROR
          </h1>
          <p
            className="text-sm mt-3 max-w-xs leading-relaxed"
            style={{ color: "rgba(250,250,247,0.6)" }}
          >
            Something in the application threw an unhandled exception. The
            boundary caught it so the rest of the app is still intact.
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
                    ? "#D8392B"
                    : "rgba(250,250,247,0.5)",
              }}
            >
              <span
                style={{
                  color: i === LOG_LINES.length - 1 ? "#D8392B" : "#FF6A1A",
                  marginRight: 4,
                }}
              >
                {">"}
              </span>
              {line}
            </motion.p>
          ))}
          {visibleLines >= LOG_LINES.length && (
            <motion.span
              style={{
                height: 12,
                width: 6,
                background: "#D8392B",
                display: "inline-block",
                verticalAlign: "middle",
                marginLeft: 12,
              }}
              animate={{ opacity: [1, 0] }}
              transition={{
                duration: 0.7,
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
          {/* Icon */}
          <div
            className="inline-flex h-12 w-12 items-center justify-center mb-6"
            style={{
              border: "1px solid rgba(216,57,43,0.4)",
              background: "rgba(216,57,43,0.08)",
            }}
          >
            <AlertTriangle size={20} style={{ color: "#D8392B" }} />
          </div>

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
            Something went wrong
          </p>
          <h2
            className="text-3xl font-semibold mb-3 tracking-tight"
            style={{ fontFamily: '"Space Grotesk", sans-serif' }}
          >
            Unhandled exception.
          </h2>
          <p
            className="text-sm leading-relaxed mb-8"
            style={{ color: "#6B7280" }}
          >
            The error has been caught by the boundary. You can try recovering
            the page or head somewhere safe.
          </p>

          {/* Error spec sheet */}
          <div className="mb-4" style={{ border: "1px solid #E3E1D8" }}>
            {specRows.map((row, i) => (
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
                  title={row.value}
                  style={{
                    color: "#14151A",
                    textAlign: "right",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    maxWidth: 200,
                  }}
                >
                  {row.value}
                </span>
              </div>
            ))}
          </div>

          {/* Stack trace toggle */}
          {error?.stack && (
            <div className="mb-8">
              <button
                onClick={() => setShowStack((s) => !s)}
                className="inline-flex items-center gap-1.5 transition-colors mb-2"
                style={{
                  fontFamily: '"IBM Plex Mono", monospace',
                  fontSize: 11,
                  color: "#6B7280",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: 0,
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#14151A")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "#6B7280")}
              >
                {showStack ? (
                  <ChevronUp size={12} />
                ) : (
                  <ChevronDown size={12} />
                )}
                {showStack ? "Hide" : "Show"} stack trace
              </button>
              {showStack && (
                <motion.pre
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  style={{
                    overflow: "auto",
                    border: "1px solid #E3E1D8",
                    background: "#14151A",
                    padding: 16,
                    fontFamily: '"IBM Plex Mono", monospace',
                    fontSize: 10,
                    color: "rgba(250,250,247,0.7)",
                    lineHeight: 1.6,
                    maxHeight: 160,
                    margin: 0,
                  }}
                >
                  {error.stack}
                </motion.pre>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col gap-3">
            <button
              onClick={handleReset}
              disabled={resetting}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-medium tracking-wide transition-colors"
              style={{
                background: "#14151A",
                color: "#FAFAF7",
                opacity: resetting ? 0.6 : 1,
                cursor: resetting ? "not-allowed" : "pointer",
                border: "none",
              }}
              onMouseEnter={(e) => {
                if (!resetting) e.currentTarget.style.background = "#FF6A1A";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "#14151A";
              }}
            >
              <motion.span
                animate={resetting ? { rotate: 360 } : { rotate: 0 }}
                transition={
                  resetting
                    ? { duration: 0.7, repeat: Infinity, ease: "linear" }
                    : {}
                }
                className="inline-flex"
              >
                <RefreshCw size={15} />
              </motion.span>
              {resetting ? "Retrying…" : "Try again"}
            </button>

            <Link
              href="/"
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
              <Home size={15} /> Go home
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ErrorPage;
