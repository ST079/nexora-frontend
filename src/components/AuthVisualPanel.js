"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

const DEFAULT_LOG = [
  "nexora-auth boot sequence",
  "resolving endpoint… /api/v1/auth",
  "handshake established",
  "awaiting credentials",
];

const AuthVisualPanel = ({ eyebrow = "Secure access", title, log = DEFAULT_LOG }) => {
  const [visibleLines, setVisibleLines] = useState(0);

  useEffect(() => {
    setVisibleLines(0);
    const interval = setInterval(() => {
      setVisibleLines((v) => (v >= log.length ? 0 : v + 1));
    }, 950);
    return () => clearInterval(interval);
  }, [log]);

  return (
    <div className="relative hidden lg:flex lg:w-[42%] flex-col justify-between overflow-hidden bg-[#14151A] dark:bg-[#0a0b0e] text-[#FAFAF7] p-10 transition-colors duration-300">

      {/* Blueprint grid */}
      <div
        className="absolute inset-0 opacity-[0.07] pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(90deg,#FAFAF7 1px,transparent 1px),linear-gradient(#FAFAF7 1px,transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />

      {/* Scan beam */}
      <motion.div
        className="absolute left-0 top-0 h-32 w-full pointer-events-none"
        style={{
          background:
            "linear-gradient(to bottom, transparent, rgba(255,106,26,0.25), transparent)",
        }}
        animate={{ y: ["-10%", "110%"] }}
        transition={{ duration: 4.2, repeat: Infinity, ease: "linear" }}
      />

      {/* Logo */}
      <div className="relative z-10 flex items-center gap-2">
        <span className="grid h-8 w-8 place-items-center bg-[#FAFAF7] dark:bg-[#f0efe8] font-mono text-sm text-[#14151A] font-bold">
          N
        </span>
        <span className="font-display text-lg font-semibold tracking-tight text-[#FAFAF7]">
          NEXORA
        </span>
      </div>

      {/* Heading */}
      <div className="relative z-10">
        <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[#FF6A1A] mb-3">
          {eyebrow}
        </p>
        <h2 className="font-display text-3xl font-semibold leading-tight max-w-sm text-[#FAFAF7]">
          {title}
        </h2>
      </div>

      {/* Terminal log */}
      <div className="relative z-10 space-y-2">
        {log.map((line, i) => (
          <motion.p
            key={line}
            initial={{ opacity: 0, x: -6 }}
            animate={{
              opacity: i < visibleLines ? 1 : 0,
              x: i < visibleLines ? 0 : -6,
            }}
            transition={{ duration: 0.35 }}
            className="font-mono text-[11px] text-[#FAFAF7]/50"
          >
            <span className="text-[#FF6A1A] mr-1">{">"}</span>
            {line}
          </motion.p>
        ))}
        <motion.span
          className="inline-block h-3 w-1.5 bg-[#FF6A1A] align-middle"
          animate={{ opacity: [1, 0] }}
          transition={{ duration: 0.8, repeat: Infinity, repeatType: "reverse" }}
        />
      </div>
    </div>
  );
};

export default AuthVisualPanel;