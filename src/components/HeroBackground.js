"use client";

import { motion } from "framer-motion";
import { Package, Box, ShoppingBag, Gift, Truck, Tag, ShoppingCart } from "lucide-react";

const FLOATERS = [
  { Icon: Package, top: "10%", left: "8%", size: 40, delay: 0, duration: 6.5 },
  { Icon: ShoppingCart, top: "68%", left: "5%", size: 34, delay: 0.5, duration: 7 },
  { Icon: Tag, top: "20%", left: "28%", size: 26, delay: 0.9, duration: 5.5 },
  { Icon: Box, top: "80%", left: "22%", size: 30, delay: 0.3, duration: 8 },
  { Icon: ShoppingBag, top: "15%", left: "50%", size: 38, delay: 1.1, duration: 6 },
  { Icon: Truck, top: "72%", left: "45%", size: 32, delay: 0.7, duration: 7.5 },
  { Icon: Gift, top: "8%", left: "70%", size: 30, delay: 0.4, duration: 6.8 },
  { Icon: Package, top: "60%", left: "80%", size: 44, delay: 1.3, duration: 7.2 },
  { Icon: Box, top: "85%", left: "68%", size: 24, delay: 0.6, duration: 5.8 },
  { Icon: ShoppingBag, top: "35%", left: "90%", size: 36, delay: 0.2, duration: 6.3 },
  { Icon: Tag, top: "45%", left: "12%", size: 22, delay: 1.5, duration: 7.8 },
  { Icon: Gift, top: "30%", left: "62%", size: 26, delay: 1.0, duration: 6.6 },
];

const HeroBackground = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Gradient mesh */}
      <div
        className="absolute inset-0 opacity-60 dark:opacity-30"
        style={{
          background:
            "radial-gradient(ellipse 70% 60% at 15% 15%, rgba(255,138,61,0.14), transparent), radial-gradient(ellipse 60% 50% at 85% 30%, rgba(92,120,255,0.12), transparent), radial-gradient(ellipse 50% 50% at 50% 90%, rgba(255,138,61,0.08), transparent)",
        }}
      />

      {/* Faint dot grid */}
      <div
        className="absolute inset-0 opacity-[0.35] dark:opacity-[0.15]"
        style={{
          backgroundImage:
            "radial-gradient(circle, currentColor 1px, transparent 1px)",
          backgroundSize: "28px 28px",
          color: "var(--hairline, #d8d5cc)",
        }}
      />

      {/* Floating icons — spread across full width */}
      {FLOATERS.map((f, i) => (
        <motion.div
          key={i}
          className="absolute text-ink/[0.07] dark:text-[#f0efe8]/[0.08]"
          style={{ top: f.top, left: f.left }}
          animate={{
            y: [0, -16, 0],
            rotate: [0, 5, 0],
          }}
          transition={{
            duration: f.duration,
            delay: f.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <f.Icon size={f.size} strokeWidth={1.1} />
        </motion.div>
      ))}

      {/* Two large soft outline shapes for depth, opposite corners */}
      <motion.div
        className="absolute right-[-6%] top-[8%] text-ink/[0.035] dark:text-[#f0efe8]/[0.04]"
        animate={{ rotate: [0, 4, 0] }}
        transition={{ duration: 11, repeat: Infinity, ease: "easeInOut" }}
      >
        <Package size={340} strokeWidth={0.5} />
      </motion.div>

      <motion.div
        className="absolute left-[-8%] bottom-[-10%] text-ink/[0.03] dark:text-[#f0efe8]/[0.035]"
        animate={{ rotate: [0, -4, 0] }}
        transition={{ duration: 13, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
      >
        <ShoppingBag size={300} strokeWidth={0.5} />
      </motion.div>
    </div>
  );
};

export default HeroBackground;