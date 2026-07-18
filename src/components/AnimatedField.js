"use client";

import { useState, forwardRef } from "react";
import { motion } from "framer-motion";

const AnimatedField = forwardRef(
  (
    {
      label,
      type = "text",
      required,
      placeholder,
      autoComplete,
      right,
      ...props
    },
    ref
  ) => {
    const [focused, setFocused] = useState(false);

    return (
      <div>
        <label className="font-mono text-xs text-slate dark:text-[#8b8fa8] mb-1 block">
          {label}
        </label>

        <div className="relative">
          <input
            ref={ref}
            type={type}
            required={required}
            placeholder={placeholder}
            autoComplete={autoComplete}
            onFocus={() => setFocused(true)}
            onBlur={(e) => {
              setFocused(false);
              props.onBlur?.(e);
            }}
            className={`w-full border border-hairline dark:border-[#262932] bg-paper dark:bg-[#16181f] text-ink dark:text-[#f0efe8] px-4 py-3 text-sm outline-none transition-colors placeholder:text-slate-light dark:placeholder:text-[#5b5e72] ${
              right ? "pr-11" : ""
            }`}
            {...props}
          />

          {right && (
            <div className="absolute right-0 top-0 h-full flex items-center pr-3">
              {right}
            </div>
          )}

          <motion.span
            className="absolute -bottom-[1px] left-0 h-[2px] bg-signal"
            initial={false}
            animate={{ width: focused ? "100%" : "0%" }}
            transition={{ duration: 0.25 }}
          />
        </div>
      </div>
    );
  }
);

AnimatedField.displayName = "AnimatedField";

export default AnimatedField;