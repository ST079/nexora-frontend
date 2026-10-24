"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import toast from "react-hot-toast";
import { UserCheck, UserX, AlertTriangle } from "lucide-react";
import { ConfirmDialog } from "@/components/Modal";
import { Avatar } from "@/components/UserProfile";
import { updateUser } from "@/api/user";
import { apiErrorMessage } from "@/utils/format";

const UserStatusModal = ({ user, onClose, onSave }) => {
  const isCurrentlyActive = user?.isActive !== false;
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

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
    <ConfirmDialog
      id="status-modal"
      tone={newStatus ? "ok" : "danger"}
      icon={newStatus ? UserCheck : UserX}
      title={newStatus ? "Activate user?" : "Deactivate user?"}
      confirmLabel={newStatus ? "Yes, activate" : "Yes, deactivate"}
      busyLabel="Saving…"
      busy={saving}
      onConfirm={handleSave}
      onClose={onClose}
    >
      <span className="mb-4 flex items-center gap-3 rounded-2xl bg-mist p-3">
        <Avatar user={user} size="h-10 w-10 text-xs shrink-0" />
        <span className="min-w-0">
          <span className="block truncate text-sm font-semibold text-ink">{user?.name}</span>
          <span className="block truncate text-xs text-slate">{user?.email}</span>
        </span>
        <span
          className={`ml-auto inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${
            isCurrentlyActive ? "bg-ok/12 text-ok" : "bg-danger/10 text-danger"
          }`}
        >
          <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-current" />
          {isCurrentlyActive ? "Active" : "Inactive"}
        </span>
      </span>

      {newStatus
        ? "They'll be able to sign in and place orders again."
        : "They'll be signed out of new sessions and blocked from signing in. Their orders and data are kept."}

      <AnimatePresence>
        {error && (
          <motion.span
            role="alert"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0, x: [0, -5, 5, -3, 3, 0] }}
            exit={{ opacity: 0 }}
            className="mt-4 flex items-start gap-2 rounded-2xl border border-danger/30 bg-danger/10 px-3 py-2.5 text-sm text-danger"
          >
            <AlertTriangle size={14} className="mt-0.5 shrink-0" />
            <span>{error}</span>
          </motion.span>
        )}
      </AnimatePresence>
    </ConfirmDialog>
  );
};

export default UserStatusModal;
