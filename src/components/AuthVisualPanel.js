"use client";
import { DEFAULT_LOG } from "@/constants/defaults";
import { motion } from "framer-motion";
import React, { useEffect, useState } from "react";

const AuthVisualPanel = ({
  eyebrow = "Secure access",
  title,
  log = DEFAULT_LOG,
}) => {
  const [visibleLines, setVisibleLines] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisibleLines((v) => (v >= log.length ? 0 : v + 1));
    }, 950);
    return () => clearInterval(interval);
  }, [log]);

  return (
    <div className="relative hidden lg:flex lg:w-[42%] flex-col justify-between overflow-hidden bg-ink text-paper p-10">
      {/* faint grid */}
      <div
        className="absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            "linear-gradient(90deg, #FAFAF7 1px, transparent 1px), linear-gradient(#FAFAF7 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />

      {/* vertical scan beam */}
      <motion.div
        className="absolute left-0 top-0 h-32 w-full bg-gradient-to-b from-signal/0 via-signal/25 to-signal/0"
        animate={{ y: ["-10%", "110%"] }}
        transition={{ duration: 4.2, repeat: Infinity, ease: "linear" }}
      />

      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-12">
          <span className="grid h-8 w-8 place-items-center bg-paper font-mono text-sm text-ink">
            N
          </span>
          <span className="font-display text-lg font-semibold tracking-tight">
            NEXORA
          </span>
        </div>

        <p className="eyebrow text-signal mb-3">{eyebrow}</p>
        <h2 className="font-display text-3xl font-semibold leading-tight max-w-sm">
          {title}
        </h2>
      </div>

      <div className="relative z-10 font-mono text-xs space-y-2 text-paper/60">
        {log.map((line, i) => (
          <motion.p
            key={line}
            initial={{ opacity: 0, x: -6 }}
            animate={{
              opacity: i < visibleLines ? 1 : 0,
              x: i < visibleLines ? 0 : -6,
            }}
            transition={{ duration: 0.35 }}
          >
            <span className="text-signal">{">"}</span> {line}
          </motion.p>
        ))}
        <motion.span
          className="inline-block h-3 w-1.5 bg-signal align-middle"
          animate={{ opacity: [1, 0] }}
          transition={{
            duration: 0.8,
            repeat: Infinity,
            repeatType: "reverse",
          }}
        />
      </div>
    </div>
  );
};

export default AuthVisualPanel;
