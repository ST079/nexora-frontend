"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { useEscape } from "@/hooks/useEscape";
import { backdrop, bouncy, modalPanel } from "@/utils/motion";

// The shared dialog shell: a blurred backdrop and a rounded panel that rises
// on a spring. On phones it sits at the bottom, within thumb reach.
// Render it inside <AnimatePresence> so the exit animation plays.
export const Modal = ({
  onClose,
  dismissable = true,
  role = "dialog",
  labelledBy,
  describedBy,
  size = "max-w-sm",
  className = "",
  children,
}) => {
  useEscape(onClose, dismissable);

  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-3 sm:items-center sm:p-4">
      <motion.div
        {...backdrop}
        className="absolute inset-0 bg-night/50 backdrop-blur-sm"
        onClick={dismissable ? onClose : undefined}
      />
      <motion.div
        role={role}
        aria-modal="true"
        aria-labelledby={labelledBy}
        aria-describedby={describedBy}
        {...modalPanel}
        className={`custom-scrollbar relative max-h-[calc(100dvh-1.5rem)] w-full overflow-y-auto rounded-4xl border border-hairline bg-panel shadow-lift ${size} ${className}`}
      >
        {children}
      </motion.div>
    </div>
  );
};

const TONES = {
  danger: { tile: "bg-danger/10 text-danger", button: "bg-danger text-paper" },
  ok: { tile: "bg-ok/12 text-ok", button: "bg-ok text-paper" },
  signal: { tile: "bg-signal-tint text-signal-dim", button: "bg-signal text-on-signal" },
};

// A yes/no question. Cancel takes focus so Enter never confirms by accident.
export const ConfirmDialog = ({
  id,
  tone = "danger",
  icon: Icon,
  title,
  children,
  confirmLabel,
  busyLabel,
  cancelLabel = "Cancel",
  busy = false,
  onConfirm,
  onClose,
}) => {
  const t = TONES[tone] ?? TONES.danger;
  return (
    <Modal
      role="alertdialog"
      onClose={onClose}
      dismissable={!busy}
      labelledBy={`${id}-title`}
      describedBy={`${id}-body`}
      className="p-6"
    >
      <motion.span
        initial={{ scale: 0.4, rotate: -20 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ ...bouncy, delay: 0.05 }}
        className={`mb-4 grid h-14 w-14 place-items-center rounded-2xl ${t.tile}`}
      >
        {Icon && <Icon size={24} aria-hidden />}
      </motion.span>
      <h3 id={`${id}-title`} className="mb-1.5 font-display text-xl font-bold text-ink">
        {title}
      </h3>
      <div id={`${id}-body`} className="mb-6 text-sm leading-relaxed text-slate">
        {children}
      </div>
      <div className="flex flex-col-reverse gap-2 sm:flex-row">
        <button
          type="button"
          onClick={onClose}
          disabled={busy}
          autoFocus
          className="btn-secondary flex-1"
        >
          {cancelLabel}
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={busy}
          className={`inline-flex flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-full px-5 py-3 text-sm font-semibold transition-all duration-300 ease-out-expo hover:-translate-y-0.5 hover:brightness-110 active:translate-y-0 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 ${t.button}`}
        >
          {busy ? <Loader2 size={15} className="animate-spin" /> : Icon && <Icon size={15} aria-hidden />}
          {busy ? busyLabel : confirmLabel}
        </button>
      </div>
    </Modal>
  );
};

export default Modal;
