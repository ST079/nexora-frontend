"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { Loader2, X, UserCheck, UserX, AlertTriangle } from "lucide-react";
import { updateUser } from "@/api/user";
import { useEscape } from "@/hooks/useEscape";
import { apiErrorMessage, initials } from "@/utils/format";

const UserStatusModal = ({ user, onClose, onSave }) => {
  const isCurrentlyActive = user?.isActive !== false;
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEscape(onClose, !saving);

  // Whatever the current status is, flip it.
  const newStatus = !isCurrentlyActive;

  const handleSave = async () => {
    setSaving(true);
    setError("");
    try {
      const updated = await updateUser(user._id, { isActive: newStatus });
      toast.success(`${user.name} is now ${newStatus ? "active" : "inactive"}.`);
      onSave(updated ?? { ...user, isActive: newStatus });
    } catch (err) {
      setError(apiErrorMessage(err, "Couldn't update this account's status."));
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-ink/50 dark:bg-black/70"
        onClick={() => !saving && onClose()}
      />

      <motion.div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="status-modal-title"
        aria-describedby="status-modal-body"
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 12 }}
        transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full max-w-sm bg-paper dark:bg-[#16181f] border border-hairline dark:border-[#262932] shadow-lift p-6"
      >
        <button
          onClick={onClose}
          disabled={saving}
          aria-label="Close"
          className="absolute right-4 top-4 grid h-7 w-7 place-items-center text-slate dark:text-[#8b8fa8] hover:text-ink dark:hover:text-[#f0efe8] transition-colors"
        >
          <X size={15} />
        </button>

        <div
          className={`grid h-12 w-12 place-items-center border mb-4 ${
            newStatus
              ? "border-ok/40 bg-ok/5 dark:bg-ok/10"
              : "border-danger/40 bg-danger/5 dark:bg-danger/10"
          }`}
        >
          {newStatus ? (
            <UserCheck size={20} className="text-ok" />
          ) : (
            <UserX size={20} className="text-danger" />
          )}
        </div>

        <p className="eyebrow dark:text-[#8b8fa8] mb-1">Change status</p>
        <h3
          id="status-modal-title"
          className="font-display text-lg font-semibold text-ink dark:text-[#f0efe8] mb-1"
        >
          {newStatus ? "Activate user?" : "Deactivate user?"}
        </h3>

        <div className="flex items-center gap-3 my-4 p-3 border border-hairline dark:border-[#262932] bg-paper dark:bg-[#0e0f12]">
          <div className="grid h-9 w-9 shrink-0 place-items-center bg-ink dark:bg-[#262932] font-display text-sm text-paper dark:text-[#f0efe8]">
            {initials(user?.name)}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-ink dark:text-[#f0efe8] truncate">{user?.name}</p>
            <p className="font-mono text-xs text-slate dark:text-[#8b8fa8] truncate">{user?.email}</p>
          </div>
          <span
            className={`ml-auto shrink-0 font-mono text-[10px] uppercase tracking-widest px-2 py-0.5 ${
              isCurrentlyActive ? "bg-ok/10 text-ok" : "bg-danger/10 text-danger"
            }`}
          >
            {isCurrentlyActive ? "Active" : "Inactive"}
          </span>
        </div>

        <p id="status-modal-body" className="text-sm text-slate dark:text-[#8b8fa8] mb-6 leading-relaxed">
          {newStatus
            ? "They'll be able to sign in and place orders again."
            : "They'll be signed out of new sessions and blocked from signing in. Their orders and data are kept."}
        </p>

        {error && (
          <div
            role="alert"
            className="flex items-start gap-2 border border-danger/40 bg-danger/5 dark:bg-danger/10 px-3 py-2.5 text-sm text-danger mb-4"
          >
            <AlertTriangle size={14} className="mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={handleSave}
            disabled={saving}
            className={`flex flex-1 items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-paper dark:text-ink disabled:opacity-60 disabled:cursor-not-allowed transition-colors ${
              newStatus ? "bg-ok hover:bg-ok/90" : "bg-danger hover:bg-danger/90"
            }`}
          >
            {saving ? (
              <Loader2 size={14} className="animate-spin" />
            ) : newStatus ? (
              <UserCheck size={14} />
            ) : (
              <UserX size={14} />
            )}
            {saving ? "Saving…" : newStatus ? "Yes, activate" : "Yes, deactivate"}
          </button>
          <button onClick={onClose} disabled={saving} className="btn-secondary flex-1" autoFocus>
            Cancel
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default UserStatusModal;
