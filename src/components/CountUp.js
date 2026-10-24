"use client";

import { useEffect, useRef } from "react";
import {
  animate,
  motion,
  useInView,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from "framer-motion";
import { EASE_OUT } from "@/utils/motion";

const plain = (n) => Math.round(n).toLocaleString("en-IN");

// Counts up to `value` the first time it scrolls into view, and glides to
// any new value after that. Screen readers get the final number straight away.
const CountUp = ({ value = 0, format = plain, duration = 1.2, className = "" }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const reduce = useReducedMotion();
  const current = useMotionValue(0);
  const text = useTransform(current, (n) => format(n));

  useEffect(() => {
    if (!inView) return;
    if (reduce) {
      current.set(value);
      return;
    }
    const controls = animate(current, value, { duration, ease: EASE_OUT });
    return () => controls.stop();
  }, [inView, reduce, value, duration, current]);

  return (
    <span ref={ref} className={className}>
      <span className="sr-only">{format(value)}</span>
      <motion.span aria-hidden>{text}</motion.span>
    </span>
  );
};

export default CountUp;
