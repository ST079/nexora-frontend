"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { EASE_OUT, bouncy } from "@/utils/motion";

const STEPS = ["Bag", "Address", "Payment"];

// Where the shopper is in the buy flow. `current` is the index of the active
// step; earlier steps show a tick.
const CheckoutSteps = ({ current = 0, className = "" }) => (
  <ol aria-label="Checkout progress" className={`flex items-center gap-2 ${className}`}>
    {STEPS.map((label, i) => {
      const done = i < current;
      const active = i === current;
      return (
        <li key={label} className="flex items-center gap-2" aria-current={active ? "step" : undefined}>
          <span
            className={`flex items-center gap-2 rounded-full py-1 pl-1 pr-3 text-xs font-semibold transition-colors ${
              active ? "bg-ink text-paper" : done ? "bg-signal-tint text-signal-dim" : "bg-mist text-slate"
            }`}
          >
            <motion.span
              initial={active ? { scale: 0.4 } : false}
              animate={{ scale: 1 }}
              transition={bouncy}
              className={`grid h-6 w-6 place-items-center rounded-full font-mono text-[11px] ${
                active ? "bg-marigold text-on-marigold" : done ? "bg-signal text-on-signal" : "bg-panel text-slate"
              }`}
            >
              {done ? <Check size={12} strokeWidth={3} aria-hidden /> : i + 1}
            </motion.span>
            {label}
            {done && <span className="sr-only">(done)</span>}
          </span>
          {i < STEPS.length - 1 && (
            <span aria-hidden className="relative h-0.5 w-6 overflow-hidden rounded-full bg-hairline sm:w-10">
              {done && (
                <motion.span
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 0.6, ease: EASE_OUT }}
                  className="absolute inset-0 origin-left bg-signal"
                />
              )}
            </span>
          )}
        </li>
      );
    })}
  </ol>
);

export default CheckoutSteps;
