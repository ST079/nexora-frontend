"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AlertTriangle, Home, RefreshCw } from "lucide-react";
import { HOME_ROUTE } from "@/constants/routes";

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
    <div
      role="alert"
      className="container-page min-h-[60vh] py-20 flex items-center justify-center"
    >
      <div className="card-frame dark:border-[#262932] max-w-md w-full p-8 text-center">
        <div className="mx-auto mb-5 grid h-12 w-12 place-items-center border border-danger/30 bg-danger/5">
          <AlertTriangle size={20} className="text-danger" />
        </div>
        <h1 className="font-display text-2xl font-semibold text-ink dark:text-[#f0efe8]">
          {title}
        </h1>
        <p className="mt-2 text-sm text-slate dark:text-[#8b8fa8]">{description}</p>

        <div className="mt-6 flex flex-wrap justify-center gap-3">
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
          <p className="mt-6 font-mono text-[11px] text-slate dark:text-[#8b8fa8]">
            Reference: {error.digest}
          </p>
        )}
      </div>
    </div>
  );
};

export default ErrorView;
