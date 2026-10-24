"use client";

import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import { sortDirection } from "@/utils/sort";

const ICONS = { ascending: ArrowUp, descending: ArrowDown, none: ArrowUpDown };

const thClass =
  "px-4 py-3 text-left font-mono text-[11px] uppercase tracking-widest text-slate dark:text-[#8b8fa8] whitespace-nowrap";

// A <th> whose label is a real button, so sorting works from the keyboard
// and screen readers hear the current order through aria-sort.
const SortableHeader = ({ label, field, sortKey, onSort }) => {
  if (!field)
    return (
      <th scope="col" className={thClass}>
        {label || <span className="sr-only">Actions</span>}
      </th>
    );

  const state = sortDirection(sortKey, field);
  const Icon = ICONS[state];
  return (
    <th scope="col" aria-sort={state} className={thClass}>
      <button
        type="button"
        onClick={() => onSort(field)}
        className={`inline-flex items-center gap-1 uppercase tracking-widest hover:text-ink dark:hover:text-[#f0efe8] transition-colors ${
          state !== "none" ? "text-ink dark:text-[#f0efe8]" : ""
        }`}
      >
        {label}
        <Icon size={11} className={state === "none" ? "opacity-40" : ""} />
      </button>
    </th>
  );
};

export default SortableHeader;
