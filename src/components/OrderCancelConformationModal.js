/* eslint-disable react/no-unescaped-entities */
import { AlertTriangle, Ban, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

const OrderCancelConformationModal = ({ onConfirm, onClose, busy }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
    {/* Backdrop */}
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 bg-ink/50 dark:bg-black/70"
      onClick={onClose}
    />

    {/* Panel */}
    <motion.div
      initial={{ opacity: 0, scale: 0.96, y: 12 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96, y: 12 }}
      transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
      className="relative w-full max-w-sm bg-paper dark:bg-[#16181f] border border-hairline dark:border-[#262932] shadow-lift p-6"
    >
      {/* Icon */}
      <div className="grid h-12 w-12 place-items-center border border-danger/40 bg-danger/5 dark:bg-danger/10 mb-4">
        <AlertTriangle size={20} className="text-danger" />
      </div>

      <h3 className="font-display text-lg font-semibold text-ink dark:text-[#f0efe8] mb-1">
        Cancel this order?
      </h3>
      <p className="text-sm text-slate dark:text-[#8b8fa8] mb-6 leading-relaxed">
        This action cannot be undone. If you've already paid, a refund will be
        processed according to our refund policy.
      </p>

      <div className="flex gap-3">
        <button
          onClick={onConfirm}
          disabled={busy}
          className="flex flex-1 items-center justify-center gap-2 bg-danger text-paper px-4 py-2.5 text-sm font-medium hover:bg-danger/90 disabled:opacity-60 transition-colors"
        >
          {busy ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <Ban size={14} />
          )}
          {busy ? "Cancelling…" : "Yes, cancel"}
        </button>
        <button
          onClick={onClose}
          disabled={busy}
          className="btn-secondary flex-1"
        >
          Keep order
        </button>
      </div>
    </motion.div>
  </div>
);

export default OrderCancelConformationModal;
