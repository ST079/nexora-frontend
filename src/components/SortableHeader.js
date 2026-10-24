"use client";

import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import { sortDirection } from "@/utils/sort";

const ICONS = { ascending: ArrowUp, descending: ArrowDown, none: ArrowUpDown };

const thClass =
  "px-4 py-3 text-left font-mono text-[11px] uppercase tracking-widest text-slate whitespace-nowrap";

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
        className={`-mx-2 inline-flex items-center gap-1 rounded-full px-2 py-1 uppercase tracking-widest transition-colors hover:bg-mist hover:text-ink ${
          state !== "none" ? "bg-signal-tint text-signal-dim" : ""
        }`}
      >
        {label}
        <Icon size={11} className={state === "none" ? "opacity-40" : ""} />
      </button>
    </th>
  );
};

export default SortableHeader;
