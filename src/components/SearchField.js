"use client";

import { useEffect, useState } from "react";
import { Search, X } from "lucide-react";

// Debounced search box bound to an external value (usually a URL param).
// Typing reports upward after `delay` ms; an outside change such as
// "clear filters" flows back into the box.
const SearchField = ({
  value = "",
  onChange,
  placeholder = "Search…",
  label = "Search",
  delay = 350,
  className = "",
}) => {
  const [text, setText] = useState(value);
  const [seen, setSeen] = useState(value);
  const [emitted, setEmitted] = useState(value);

  if (value !== seen) {
    setSeen(value);
    if (value !== emitted) setText(value);
  }

  useEffect(() => {
    const next = text.trim();
    if (next === value) return;
    const timer = setTimeout(() => {
      setEmitted(next);
      onChange(next);
    }, delay);
    return () => clearTimeout(timer);
  }, [text, value, onChange, delay]);

  return (
    <div
      role="search"
      className={`flex items-center gap-2 rounded-full border border-hairline bg-panel px-4 py-2.5 transition-all focus-within:border-signal focus-within:ring-4 focus-within:ring-signal/15 hover:border-ink/25 ${className}`}
    >
      <Search size={14} className="text-slate shrink-0" />
      <input
        type="search"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={placeholder}
        aria-label={label}
        className="w-full bg-transparent text-sm outline-none text-ink placeholder:text-slate-light dark:placeholder:text-slate-light [&::-webkit-search-cancel-button]:hidden"
      />
      {text && (
        <button
          type="button"
          onClick={() => setText("")}
          className="grid h-5 w-5 place-items-center rounded-full bg-mist text-slate transition-colors hover:text-ink"
          aria-label="Clear search"
        >
          <X size={11} />
        </button>
      )}
    </div>
  );
};

export default SearchField;
