"use client";

import { AlertTriangle, Ban, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { useEscape } from "@/hooks/useEscape";

const OrderCancelConformationModal = ({ onConfirm, onClose, busy, paid }) => {
  useEscape(onClose, !busy);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-ink/50 dark:bg-black/70"
        onClick={busy ? undefined : onClose}
      />

      {/* Panel */}
      <motion.div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="cancel-order-title"
        aria-describedby="cancel-order-body"
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 12 }}
        transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full max-w-sm bg-paper dark:bg-[#16181f] border border-hairline dark:border-[#262932] shadow-lift p-6"
      >
        <div className="grid h-12 w-12 place-items-center border border-danger/40 bg-danger/5 dark:bg-danger/10 mb-4">
          <AlertTriangle size={20} className="text-danger" />
        </div>

        <h3
          id="cancel-order-title"
          className="font-display text-lg font-semibold text-ink dark:text-[#f0efe8] mb-1"
        >
          Cancel this order?
        </h3>
        <p
          id="cancel-order-body"
          className="text-sm text-slate dark:text-[#8b8fa8] mb-6 leading-relaxed"
        >
          This can&apos;t be undone and the items go back on sale.
          {paid &&
            " Because you've already paid, we'll contact you about your refund."}
        </p>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onConfirm}
            disabled={busy}
            className="flex flex-1 items-center justify-center gap-2 bg-danger text-paper dark:text-ink px-4 py-2.5 text-sm font-medium hover:bg-danger/90 disabled:opacity-60 transition-colors"
          >
            {busy ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Ban size={14} />
            )}
            {busy ? "Cancelling…" : "Yes, cancel"}
          </button>
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            autoFocus
            className="btn-secondary flex-1"
          >
            Keep order
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default OrderCancelConformationModal;
