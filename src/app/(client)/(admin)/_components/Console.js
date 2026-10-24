"use client";

import { motion } from "framer-motion";
import { AlertTriangle, RefreshCw } from "lucide-react";
import CountUp from "@/components/CountUp";
import { bouncy, fadeUp, spring } from "@/utils/motion";

// Shared building blocks for the admin and merchant pages, so products,
// orders and users read as one console.

export const ConsoleHeader = ({ eyebrow, title, description, children }) => (
  <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
    <motion.div {...fadeUp()} className="min-w-0">
      <p className="eyebrow mb-2">{eyebrow}</p>
      <h1 className="font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">
        {title}
      </h1>
      {description && (
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate">{description}</p>
      )}
    </motion.div>
    {children && (
      <motion.div {...fadeUp(0.05)} className="flex flex-wrap items-center gap-2">
        {children}
      </motion.div>
    )}
  </div>
);

// Written out in full so Tailwind can see every class.
const STRIP_COLS = {
  4: "grid-cols-2 lg:grid-cols-4",
  5: "grid-cols-2 sm:grid-cols-6 lg:grid-cols-5",
};

// Five tiles never fill a 2- or 3-wide grid, so the first (the total) goes
// full width on phones and the rows run 1·2·2, then 2·3 on tablets.
const STRIP_SPANS = {
  5: [
    "col-span-2 sm:col-span-3 lg:col-span-1",
    "sm:col-span-3 lg:col-span-1",
    "sm:col-span-2 lg:col-span-1",
    "sm:col-span-2 lg:col-span-1",
    "sm:col-span-2 lg:col-span-1",
  ],
};

// A row of KPI tiles. A tile with `onClick` is a toggle filter: it reports
// its state through aria-pressed and lights up while active. Values that
// haven't arrived show a shimmer while `loading`, and a dash after that.
export const StatStrip = ({ tiles, loading = false, cols }) => (
  <motion.div
    {...fadeUp(0.07)}
    className={`mb-6 grid gap-3 ${cols ?? STRIP_COLS[tiles.length] ?? STRIP_COLS[4]}`}
  >
    {tiles.map((t, i) => (
      <StatTile
        key={t.label}
        index={i}
        loading={loading}
        {...t}
        className={`${cols ? "" : (STRIP_SPANS[tiles.length]?.[i] ?? "")} ${t.className ?? ""}`}
      />
    ))}
  </motion.div>
);

export const StatTile = ({
  label,
  value,
  icon: Icon,
  tone = "bg-mist text-ink",
  format,
  onClick,
  active = false,
  loading = false,
  className = "",
  index = 0,
}) => {
  const Tag = onClick ? motion.button : motion.div;
  const ready = typeof value === "number";
  return (
    <Tag
      type={onClick ? "button" : undefined}
      onClick={onClick}
      aria-pressed={onClick ? active : undefined}
      whileHover={onClick ? { y: -3 } : undefined}
      whileTap={onClick ? { scale: 0.97 } : undefined}
      transition={spring}
      className={`group relative flex items-center gap-3 overflow-hidden rounded-3xl border p-4 text-left transition-colors ${className} ${
        active
          ? "border-signal bg-signal-tint dark:bg-signal/15"
          : `border-hairline bg-panel ${onClick ? "hover:border-ink/25" : ""}`
      }`}
    >
      {Icon && (
        <motion.span
          initial={{ scale: 0.5, rotate: -12 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ ...bouncy, delay: 0.1 + index * 0.05 }}
          className={`grid h-10 w-10 shrink-0 place-items-center rounded-2xl ${tone}`}
        >
          <Icon size={18} aria-hidden />
        </motion.span>
      )}
      <span className="min-w-0">
        <span className="block text-2xl font-semibold leading-tight text-ink">
          {ready ? (
            <CountUp value={value} format={format} duration={0.9} />
          ) : loading ? (
            <span className="skeleton inline-block h-6 w-12 align-middle" />
          ) : (
            "—"
          )}
        </span>
        <span className="mt-0.5 block truncate text-xs font-medium text-slate">{label}</span>
      </span>
      {onClick && (
        <span
          aria-hidden
          className={`absolute right-3 top-3 h-2 w-2 rounded-full transition-all ${
            active ? "scale-100 bg-signal" : "scale-0 bg-slate-light group-hover:scale-100"
          }`}
        />
      )}
    </Tag>
  );
};

// Segmented filter buttons with a sliding ink pill.
export const FilterChips = ({ options, value, onChange, label, layoutId }) => (
  <div
    role="group"
    aria-label={label}
    className="no-scrollbar flex max-w-full gap-1 overflow-x-auto rounded-full border border-hairline bg-panel p-1"
  >
    {options.map((o) => {
      const active = value === o.value;
      return (
        <button
          key={o.value || "all"}
          type="button"
          onClick={() => onChange(o.value)}
          aria-pressed={active}
          className={`relative shrink-0 whitespace-nowrap rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors ${
            active ? "text-paper" : "text-slate hover:bg-mist hover:text-ink"
          }`}
        >
          {active && (
            <motion.span
              layoutId={layoutId}
              transition={spring}
              className="absolute inset-0 rounded-full bg-ink"
            />
          )}
          <span className="relative inline-flex items-center gap-1.5">
            {o.dot && <span aria-hidden className={`h-1.5 w-1.5 rounded-full ${o.dot}`} />}
            {o.label}
          </span>
        </button>
      );
    })}
  </div>
);

// The rounded panel every console table sits in. `stale` dims the rows that
// are still on screen while the next page or filter loads.
export const TableCard = ({ stale = false, delay = 0.12, children }) => (
  <motion.div
    {...fadeUp(delay)}
    aria-busy={stale}
    className="overflow-hidden rounded-4xl border border-hairline bg-panel shadow-soft"
  >
    <div
      className={`custom-scrollbar overflow-x-auto p-2 transition-opacity duration-300 ${
        stale ? "pointer-events-none opacity-55" : ""
      }`}
    >
      {children}
    </div>
  </motion.div>
);

// Cells fill on row hover with rounded ends, so a row reads as one pill.
export const tdClass =
  "px-4 py-3 transition-colors first:rounded-l-2xl last:rounded-r-2xl group-hover:bg-mist";

export const rowMotion = (i) => ({
  initial: { opacity: 0, y: 6 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.3, delay: Math.min(i, 12) * 0.025 },
});

export const ConsoleTable = ({ children }) => (
  <table className="w-full border-separate border-spacing-y-0.5 text-sm">{children}</table>
);

export const TableSkeleton = ({ rows = 6, label = "Loading" }) => (
  <div role="status" className="space-y-1 p-2">
    <span className="sr-only">{label}…</span>
    {Array.from({ length: rows }, (_, i) => (
      <div key={i} className="flex items-center gap-4 rounded-2xl px-2 py-2.5">
        <span className="skeleton h-10 w-10 shrink-0 rounded-xl" />
        <span className="skeleton h-3.5 flex-2" />
        <span className="skeleton hidden h-3.5 flex-1 sm:block" />
        <span className="skeleton hidden h-3.5 flex-1 md:block" />
        <span className="skeleton h-6 w-20 rounded-full" />
      </div>
    ))}
  </div>
);

export const TableError = ({ title, message, onRetry }) => (
  <div role="alert" className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
    <motion.span
      initial={{ scale: 0.4, rotate: -20 }}
      animate={{ scale: 1, rotate: -6 }}
      transition={bouncy}
      className="grid h-14 w-14 place-items-center rounded-2xl bg-danger/10 text-danger"
    >
      <AlertTriangle size={24} aria-hidden />
    </motion.span>
    <p className="font-display text-lg font-bold text-ink">{title}</p>
    <p className="max-w-sm text-sm text-slate">{message}</p>
    <button type="button" onClick={onRetry} className="btn-secondary mt-2">
      <RefreshCw size={14} /> Try again
    </button>
  </div>
);

export const TableEmpty = ({ icon: Icon, title, description, children }) => (
  <div className="relative flex flex-col items-center justify-center gap-3 overflow-hidden px-6 py-16 text-center">
    <span
      aria-hidden
      className="pointer-events-none absolute left-1/2 top-8 h-36 w-36 -translate-x-1/2 rounded-full bg-signal/10 blur-3xl"
    />
    <span className="relative grid h-16 w-16 animate-float place-items-center rounded-[1.4rem] bg-signal-tint text-signal">
      <Icon size={28} strokeWidth={1.7} aria-hidden />
    </span>
    <p className="relative font-display text-xl font-bold text-ink">{title}</p>
    <p className="relative max-w-sm text-sm text-slate">{description}</p>
    {children && <div className="relative mt-2 flex flex-wrap justify-center gap-2">{children}</div>}
  </div>
);

// Small round action buttons used in the last column of every table.
const ACTION_TONES = {
  ink: "hover:border-ink/30 hover:bg-mist hover:text-ink",
  signal: "hover:border-signal/40 hover:bg-signal-tint hover:text-signal-dim",
  danger: "hover:border-danger/40 hover:bg-danger/10 hover:text-danger",
  ok: "hover:border-ok/40 hover:bg-ok/12 hover:text-ok",
};

export const RowAction = ({ tone = "ink", className = "", ...props }) => (
  <button
    type="button"
    {...props}
    className={`grid h-9 w-9 place-items-center rounded-full border border-hairline bg-panel text-slate transition-all duration-200 active:scale-90 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:border-hairline disabled:hover:bg-panel disabled:hover:text-slate ${ACTION_TONES[tone]} ${className}`}
  />
);
