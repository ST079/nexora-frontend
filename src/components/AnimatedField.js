"use client";

import { useState, forwardRef, useId } from "react";
import { motion } from "framer-motion";

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
          className="font-mono text-xs text-slate dark:text-[#8b8fa8] mb-1 block"
        >
          {label}
          {required && <span className="text-danger"> *</span>}
        </label>

        <div className="relative">
          {/* Handlers are taken out of `props` so react-hook-form's onBlur
              can't replace ours and leave the focus underline stuck on. */}
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
            className={`w-full border bg-paper dark:bg-[#16181f] text-ink dark:text-[#f0efe8] px-4 py-3 text-sm outline-none transition-colors placeholder:text-slate-light dark:placeholder:text-[#5b5e72] ${
              error
                ? "border-danger/60"
                : "border-hairline dark:border-[#262932]"
            } ${right ? "pr-11" : ""}`}
            {...props}
          />

          {right && (
            <div className="absolute right-0 top-0 h-full flex items-center pr-3">
              {right}
            </div>
          )}

          <motion.span
            className={`absolute -bottom-px left-0 h-0.5 ${error ? "bg-danger" : "bg-signal"}`}
            initial={false}
            animate={{ width: focused ? "100%" : "0%" }}
            transition={{ duration: 0.25 }}
          />
        </div>

        {message && (
          <p
            id={messageId}
            className={`mt-1 font-mono text-[11px] ${
              error ? "text-danger" : "text-slate dark:text-[#8b8fa8]"
            }`}
          >
            {message}
          </p>
        )}
      </div>
    );
  }
);

AnimatedField.displayName = "AnimatedField";

export default AnimatedField;
