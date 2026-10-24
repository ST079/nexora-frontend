"use client";

import { useState, forwardRef, useId } from "react";
import { AnimatePresence, motion } from "framer-motion";

const AnimatedField = forwardRef(
  (
    {
      id,
      label,
      type = "text",
      required,
      placeholder,
      autoComplete,
      right,
      error,
      hint,
      onFocus,
      onBlur,
      className = "",
      ...props
    },
    ref
  ) => {
    const [focused, setFocused] = useState(false);
    const generatedId = useId();
    const inputId = id ?? generatedId;
    const messageId = `${inputId}-message`;
    const message = error || hint;

    return (
      <div className={className}>
        <label
          htmlFor={inputId}
          className={`mb-1.5 flex items-center gap-1.5 text-xs font-semibold transition-colors ${
            error ? "text-danger" : focused ? "text-signal-dim" : "text-slate-dim"
          }`}
        >
          {label}
          {required && <span className="text-danger" aria-hidden>*</span>}
        </label>

        {/* A short shake when an error appears, so it's noticed. */}
        <motion.div
          initial={false}
          animate={error ? { x: [0, -5, 5, -3, 3, 0] } : { x: 0 }}
          transition={{ duration: 0.35 }}
          className="relative"
        >
          {/* Handlers are taken out of `props` so react-hook-form's onBlur
              can't replace ours and leave the focus state stuck on. */}
          <input
            ref={ref}
            id={inputId}
            type={type}
            required={required}
            placeholder={placeholder}
            autoComplete={autoComplete}
            aria-invalid={error ? true : undefined}
            aria-describedby={message ? messageId : undefined}
            onFocus={(e) => {
              setFocused(true);
              onFocus?.(e);
            }}
            onBlur={(e) => {
              setFocused(false);
              onBlur?.(e);
            }}
            className={`field ${
              error ? "border-danger/60 focus:border-danger focus:ring-danger/15" : ""
            } ${right ? "pr-11" : ""}`}
            {...props}
          />

          {right && (
            <div className="absolute right-0 top-0 flex h-full items-center pr-3">
              {right}
            </div>
          )}
        </motion.div>

        <AnimatePresence initial={false}>
          {message && (
            <motion.p
              id={messageId}
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className={`mt-1.5 text-[11px] ${error ? "font-medium text-danger" : "text-slate"}`}
            >
              {message}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    );
  }
);

AnimatedField.displayName = "AnimatedField";

export default AnimatedField;
