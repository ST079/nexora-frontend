import { useState } from "react";
import { motion } from "framer-motion";

const AnimatedField = ({
  label,
  type = "text",
  value,
  onChange,
  required,
  placeholder,
  autoComplete,
  right,
}) => {
  const [focused, setFocused] = useState(false);

  return (
    <div>
      <label className="font-mono text-xs text-slate mb-1 block">{label}</label>
      <div className="relative">
        <input
          required={required}
          type={type}
          value={value}
          autoComplete={autoComplete}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={placeholder}
          className={`w-full border border-hairline bg-paper px-4 py-3 text-sm outline-none transition-colors placeholder:text-slate-light ${
            right ? "pr-11" : ""
          }`}
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
          transition={{ duration: 0.25, ease: "easeOut" }}
        />
      </div>
    </div>
  );
};

export default AnimatedField;