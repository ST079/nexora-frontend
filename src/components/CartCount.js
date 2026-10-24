"use client";

import { AnimatePresence, motion } from "framer-motion";
import { spring } from "@/utils/motion";

// The rolling count on cart buttons: the new number drops in from above.
const CartCount = ({ count, className = "" }) => (
  <AnimatePresence initial={false}>
    {count > 0 && (
      <motion.span
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0 }}
        transition={spring}
        className={`absolute grid h-5 min-w-5 place-items-center overflow-hidden rounded-full bg-marigold px-1 font-mono text-[10px] font-semibold text-on-marigold ring-2 ring-paper ${className}`}
      >
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={count}
            initial={{ y: -12, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 12, opacity: 0 }}
            transition={spring}
          >
            {count > 9 ? "9+" : count}
          </motion.span>
        </AnimatePresence>
      </motion.span>
    )}
  </AnimatePresence>
);

export default CartCount;
