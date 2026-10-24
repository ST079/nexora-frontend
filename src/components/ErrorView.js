"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { AlertTriangle, Home, RefreshCw } from "lucide-react";
import { HOME_ROUTE } from "@/constants/routes";
import { bouncy, fadeUp } from "@/utils/motion";

// Shared body for error.js boundaries. `retry` should be Next's
// `unstable_retry`, which refetches; `reset` only re-renders.
const ErrorView = ({
  error,
  retry,
  title = "Something went wrong",
  description = "This page hit a problem while loading. It's usually temporary.",
  backHref = HOME_ROUTE,
  backLabel = "Back to home",
}) => {
  const [retrying, setRetrying] = useState(false);

  useEffect(() => {
    // Swap for an error reporter (Sentry etc.) when one is added.
    console.error(error);
  }, [error]);

  const handleRetry = () => {
    setRetrying(true);
    retry?.();
    // The boundary unmounts on success; this only matters if it fails again.
    setTimeout(() => setRetrying(false), 800);
  };

  return (
    <div role="alert" className="container-page flex min-h-[60vh] items-center justify-center py-20">
      <motion.div
        {...fadeUp()}
        className="relative w-full max-w-md overflow-hidden rounded-4xl border border-hairline bg-panel p-8 text-center shadow-soft"
      >
        <span
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-0 h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full bg-danger/15 blur-3xl"
        />
        <motion.span
          initial={{ scale: 0.3, rotate: -25 }}
          animate={{ scale: 1, rotate: -6 }}
          transition={{ ...bouncy, delay: 0.1 }}
          className="relative mx-auto mb-6 grid h-16 w-16 place-items-center"
        >
          <span aria-hidden className="absolute inset-0 animate-pulse-ring rounded-3xl bg-danger/25" />
          <span className="relative grid h-16 w-16 place-items-center rounded-3xl bg-danger text-paper">
            <AlertTriangle size={26} aria-hidden />
          </span>
        </motion.span>
        <h1 className="relative font-display text-2xl font-bold tracking-tight text-ink">{title}</h1>
        <p className="relative mx-auto mt-2 max-w-xs text-sm leading-relaxed text-slate">{description}</p>

        <div className="relative mt-7 flex flex-wrap justify-center gap-3">
          {retry && (
            <button
              type="button"
              onClick={handleRetry}
              disabled={retrying}
              className="btn-primary disabled:opacity-60"
            >
              <RefreshCw size={14} className={retrying ? "animate-spin" : ""} />
              {retrying ? "Retrying…" : "Try again"}
            </button>
          )}
          <Link href={backHref} className="btn-secondary">
            <Home size={14} /> {backLabel}
          </Link>
        </div>

        {/* Server errors only carry a digest in production; it matches the server log. */}
        {error?.digest && (
          <p className="relative mx-auto mt-6 w-fit rounded-full bg-mist px-3 py-1 font-mono text-[11px] text-slate">
            Reference: {error.digest}
          </p>
        )}
      </motion.div>
    </div>
  );
};

export default ErrorView;
