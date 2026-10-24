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
      className={`flex items-center border border-hairline dark:border-[#262932] bg-paper dark:bg-[#16181f] px-3 py-2.5 gap-2 focus-within:border-ink dark:focus-within:border-[#f0efe8] transition-colors ${className}`}
    >
      <Search size={14} className="text-slate dark:text-[#8b8fa8] shrink-0" />
      <input
        type="search"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={placeholder}
        aria-label={label}
        className="w-full bg-transparent text-sm outline-none text-ink dark:text-[#f0efe8] placeholder:text-slate-light dark:placeholder:text-[#5b5e72] [&::-webkit-search-cancel-button]:hidden"
      />
      {text && (
        <button
          type="button"
          onClick={() => setText("")}
          className="text-slate dark:text-[#8b8fa8] hover:text-ink dark:hover:text-[#f0efe8]"
          aria-label="Clear search"
        >
          <X size={13} />
        </button>
      )}
    </div>
  );
};

export default SearchField;
