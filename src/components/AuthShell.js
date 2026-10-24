"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, ArrowLeft, ArrowRight, Check, Eye, EyeOff, Loader2 } from "lucide-react";
import AuthVisualPanel from "./AuthVisualPanel";
import { LogoMark } from "./Logo";
import { HOME_ROUTE } from "@/constants/routes";
import { EASE_OUT, fadeUp } from "@/utils/motion";

// The frame every auth page shares: the illustrated panel on large screens,
// and a single calm column for the form.
const AuthShell = ({ panel, eyebrow, title, intro, width = "max-w-sm", children }) => (
  <div className="flex min-h-dvh bg-paper transition-colors duration-300">
    <AuthVisualPanel {...panel} />

    <div className="flex flex-1 flex-col px-5 py-5 sm:px-10">
      <div className="flex items-center justify-between lg:justify-end">
        <Link href={HOME_ROUTE} className="group flex items-center gap-2 lg:hidden" aria-label="Nexora home">
          <LogoMark className="h-8 w-8" />
          <span className="font-display text-lg font-bold tracking-tight text-ink">nexora</span>
        </Link>
        <Link href={HOME_ROUTE} className="btn-ghost -mr-3 text-slate">
          <ArrowLeft size={14} /> Back to store
        </Link>
      </div>

      <div className="flex flex-1 items-center justify-center py-10">
        <motion.div {...fadeUp()} className={`w-full ${width}`}>
          {eyebrow && <p className="eyebrow mb-3">{eyebrow}</p>}
          <h1 className="font-display text-4xl font-bold tracking-tight text-ink">{title}</h1>
          {intro && <p className="mt-2 text-sm leading-relaxed text-slate">{intro}</p>}
          <div className="mt-8">{children}</div>
        </motion.div>
      </div>
    </div>
  </div>
);

// A server-side error above the form; it opens and closes smoothly.
export const AuthError = ({ message }) => (
  <AnimatePresence initial={false}>
    {message && (
      <motion.div
        role="alert"
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: "auto" }}
        exit={{ opacity: 0, height: 0 }}
        className="overflow-hidden"
      >
        <div className="mb-5 flex items-start gap-3 rounded-2xl bg-danger/10 p-3.5 text-sm text-danger">
          <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-danger text-paper">
            <AlertTriangle size={14} aria-hidden />
          </span>
          <span className="pt-1">{message}</span>
        </div>
      </motion.div>
    )}
  </AnimatePresence>
);

const LABEL_SWAP = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
  transition: { duration: 0.18 },
};

// One submit button for every auth form: the label slides between idle,
// loading and done, and the pill turns green on success.
export const SubmitButton = ({ status = "idle", idle, loading, success = idle }) => {
  const busy = status === "loading" || status === "success";
  const shown = status === "loading" || status === "success" ? status : "idle";
  return (
    <motion.button
      type="submit"
      disabled={busy}
      aria-busy={status === "loading" || undefined}
      whileTap={busy ? undefined : { scale: 0.97 }}
      className={`group relative flex w-full items-center justify-center overflow-hidden rounded-full px-6 py-3.5 text-sm font-semibold transition-colors duration-300 disabled:cursor-not-allowed ${
        status === "success"
          ? "bg-ok text-paper"
          : status === "loading"
            ? "bg-signal-dim text-on-signal"
            : "bg-signal text-on-signal shadow-glow hover:bg-signal-dim"
      }`}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span key={shown} {...LABEL_SWAP} className="flex items-center gap-2">
          {shown === "loading" && <Loader2 size={16} className="animate-spin" />}
          {shown === "success" && <Check size={16} strokeWidth={3} />}
          {shown === "loading" ? loading : shown === "success" ? success : idle}
          {shown === "idle" && (
            <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
          )}
        </motion.span>
      </AnimatePresence>
    </motion.button>
  );
};

export const PasswordToggle = ({ shown, onToggle }) => (
  <button
    type="button"
    onClick={onToggle}
    className="grid h-8 w-8 place-items-center rounded-full text-slate transition-colors hover:bg-mist hover:text-ink"
    aria-label={shown ? "Hide password" : "Show password"}
  >
    <AnimatePresence mode="wait" initial={false}>
      <motion.span
        key={shown ? "hide" : "show"}
        initial={{ opacity: 0, scale: 0.5, rotate: -45 }}
        animate={{ opacity: 1, scale: 1, rotate: 0 }}
        exit={{ opacity: 0, scale: 0.5 }}
        transition={{ duration: 0.15 }}
      >
        {shown ? <EyeOff size={16} /> : <Eye size={16} />}
      </motion.span>
    </AnimatePresence>
  </button>
);

// A rough guide, not a rule: the backend only asks for six characters.
const passwordScore = (value) => {
  if (value.length < 6) return 0;
  let score = 1;
  if (value.length >= 10) score++;
  if (/[a-z]/.test(value) && /[A-Z]/.test(value)) score++;
  if (/\d/.test(value) && /[^A-Za-z0-9]/.test(value)) score++;
  return score;
};

const LEVELS = [
  { label: "Too short", tone: "bg-danger" },
  { label: "Okay", tone: "bg-marigold" },
  { label: "Good", tone: "bg-signal" },
  { label: "Strong", tone: "bg-ok" },
  { label: "Very strong", tone: "bg-ok" },
];

export const PasswordMeter = ({ value = "" }) => {
  if (!value) return null;
  const score = passwordScore(value);
  const level = LEVELS[score];
  const filled = Math.max(score, 1);
  return (
    <div className="mt-2 flex items-center gap-3">
      <div aria-hidden className="grid flex-1 grid-cols-4 gap-1">
        {[1, 2, 3, 4].map((i) => (
          <span key={i} className="h-1 overflow-hidden rounded-full bg-mist">
            <motion.span
              initial={false}
              animate={{ scaleX: i <= filled ? 1 : 0 }}
              transition={{ duration: 0.3, ease: EASE_OUT }}
              className={`block h-full origin-left rounded-full transition-colors ${level.tone}`}
            />
          </span>
        ))}
      </div>
      <span aria-live="polite" className="w-20 text-right text-[11px] font-semibold text-slate-dim">
        {level.label}
      </span>
    </div>
  );
};

export default AuthShell;
