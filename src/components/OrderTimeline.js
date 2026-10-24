"use client";

import { motion } from "framer-motion";
import { CheckCircle2, ClipboardCheck, Clock, Truck } from "lucide-react";
import { EASE_OUT, bouncy } from "@/utils/motion";

const TIMELINE = ["PENDING", "CONFIRMED", "SHIPPED", "DELIVERED"];
const LABELS = ["Placed", "Confirmed", "On the way", "Delivered"];
// A dollar sign read as "paid", but confirmation doesn't mean payment (COD).
const ICONS = [Clock, ClipboardCheck, Truck, CheckCircle2];

const OrderTimeline = ({ status }) => {
  const current = TIMELINE.indexOf(status?.toUpperCase());
  if (current === -1) return null;
  // The rail runs between the first and last dot, so it fills in thirds.
  const progress = current / (TIMELINE.length - 1);

  return (
    <div className="rounded-4xl border border-hairline bg-panel p-5 sm:p-7">
      <p className="eyebrow mb-6">Order progress</p>
      <div className="relative">
        <span
          aria-hidden
          className="absolute left-[12.5%] right-[12.5%] top-5 h-1 -translate-y-1/2 rounded-full bg-mist"
        />
        <motion.span
          aria-hidden
          initial={{ scaleX: 0 }}
          animate={{ scaleX: progress }}
          transition={{ duration: 1, ease: EASE_OUT, delay: 0.2 }}
          className="absolute left-[12.5%] right-[12.5%] top-5 h-1 origin-left -translate-y-1/2 rounded-full bg-signal"
        />
        <ol className="relative grid grid-cols-4">
          {TIMELINE.map((step, i) => {
            const done = i <= current;
            const active = i === current;
            // Still moving: the current step pulses until it's delivered.
            const live = active && i < TIMELINE.length - 1;
            const Icon = ICONS[i];
            return (
              <li
                key={step}
                aria-current={active ? "step" : undefined}
                className="flex flex-col items-center text-center"
              >
                <motion.span
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ ...bouncy, delay: 0.15 + i * 0.18 }}
                  className={`relative grid h-10 w-10 place-items-center rounded-full ring-4 ring-panel transition-colors ${
                    active
                      ? "bg-signal text-on-signal"
                      : done
                        ? "bg-signal-tint text-signal-dim"
                        : "bg-mist text-slate-light"
                  }`}
                >
                  {live && (
                    <span aria-hidden className="absolute inset-0 animate-pulse-ring rounded-full" />
                  )}
                  <Icon size={17} aria-hidden />
                </motion.span>
                <p
                  className={`mt-3 text-xs font-semibold sm:text-sm ${
                    done ? "text-ink" : "text-slate-light"
                  }`}
                >
                  {LABELS[i]}
                </p>
                {live && <p className="mt-0.5 text-[11px] font-medium text-signal-dim">Now</p>}
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
};

export default OrderTimeline;
