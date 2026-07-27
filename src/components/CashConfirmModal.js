/* eslint-disable react/no-unescaped-entities */
import { Banknote, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

const CashConfirmModal = ({ onConfirm, onClose, busy }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 bg-ink/50 dark:bg-black/70"
      onClick={onClose}
    />
    <motion.div
      initial={{ opacity: 0, scale: 0.96, y: 12 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96, y: 12 }}
      transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
      className="relative w-full max-w-sm bg-paper dark:bg-[#16181f] border border-hairline dark:border-[#262932] shadow-lift p-6"
    >
      <div className="grid h-12 w-12 place-items-center border border-ok/40 bg-ok/5 dark:bg-ok/10 mb-4">
        <Banknote size={20} className="text-ok" />
      </div>
      <h3 className="font-display text-lg font-semibold text-ink dark:text-[#f0efe8] mb-1">
        Pay with cash?
      </h3>
      <p className="text-sm text-slate dark:text-[#8b8fa8] mb-6 leading-relaxed">
        You'll pay in cash when the order arrives at your door. Make sure you
        have the exact amount ready.
      </p>
      <div className="flex gap-3">
        <button
          onClick={onConfirm}
          disabled={busy}
          className="flex flex-1 items-center justify-center gap-2 bg-ok text-paper px-4 py-2.5 text-sm font-medium hover:bg-ok/90 disabled:opacity-60 transition-colors"
        >
          {busy ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <Banknote size={14} />
          )}
          {busy ? "Confirming…" : "Yes, pay on delivery"}
        </button>
        <button
          onClick={onClose}
          disabled={busy}
          className="btn-secondary flex-1"
        >
          Cancel
        </button>
      </div>
    </motion.div>
  </div>
);

export default CashConfirmModal;
