"use client";

import { AlertTriangle, Check, Loader2, Lock, ShieldCheck, Store, Users, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import toast from "react-hot-toast";
import { Modal } from "@/components/Modal";
import { Avatar } from "@/components/UserProfile";
import { apiErrorMessage } from "@/utils/format";
import { bouncy, spring } from "@/utils/motion";
import { ROLE_ADMIN, ROLE_MERCHANT, ROLE_USER, ROLES } from "@/constants/user";
import { updateUserRoles } from "@/api/user";

const ROLE_META = {
  [ROLE_ADMIN]: {
    icon: ShieldCheck,
    label: "Admin",
    desc: "Full access to the admin dashboard",
    tone: "bg-blueprint-tint text-blueprint-dim",
  },
  [ROLE_MERCHANT]: {
    icon: Store,
    label: "Merchant",
    desc: "Can list and manage their own products",
    tone: "bg-signal-tint text-signal-dim",
  },
  [ROLE_USER]: {
    icon: Users,
    label: "Customer",
    desc: "Standard customer account",
    tone: "bg-mist text-slate-dim",
  },
};

const normalise = (roles) => (roles?.length ? roles : [ROLE_USER]).map((r) => r.toUpperCase());

const RoleModal = ({ user, isSelf = false, onClose, onSave }) => {
  const [selectedRoles, setSelectedRoles] = useState(() => normalise(user?.roles));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // The backend refuses to strip your own admin role, so don't offer it.
  const isLocked = (r) => isSelf && r === ROLE_ADMIN;

  const toggleRole = (r) => {
    setError("");
    setSelectedRoles((prev) =>
      prev.includes(r)
        ? prev.length === 1
          ? prev // always keep at least one role
          : prev.filter((x) => x !== r)
        : [...prev, r],
    );
  };

  const hasChanged =
    JSON.stringify([...selectedRoles].sort()) !==
    JSON.stringify(normalise(user?.roles).sort());

  const handleSave = async () => {
    setSaving(true);
    setError("");
    try {
      const updated = await updateUserRoles(user._id, selectedRoles);
      toast.success(`Roles updated for ${user.name}.`);
      onSave(updated ?? { ...user, roles: selectedRoles });
    } catch (err) {
      setError(apiErrorMessage(err, "Couldn't update roles."));
      setSaving(false);
    }
  };

  return (
    <Modal onClose={onClose} dismissable={!saving} labelledBy="role-modal-title" className="p-6">
      <button
        type="button"
        onClick={onClose}
        disabled={saving}
        aria-label="Close"
        className="icon-btn absolute right-4 top-4 h-9 w-9"
      >
        <X size={15} />
      </button>

      <motion.span
        initial={{ scale: 0.4, rotate: -20 }}
        animate={{ scale: 1, rotate: -6 }}
        transition={{ ...bouncy, delay: 0.05 }}
        className="mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-blueprint-tint text-blueprint-dim"
      >
        <ShieldCheck size={24} aria-hidden />
      </motion.span>
      <h3 id="role-modal-title" className="font-display text-xl font-bold text-ink">
        Change roles
      </h3>
      <p className="mb-4 mt-1 text-sm text-slate">
        Pick one or more. At least one must stay selected.
      </p>

      <div className="mb-5 flex items-center gap-3 rounded-2xl bg-mist p-3">
        <Avatar user={user} size="h-10 w-10 text-xs shrink-0" />
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-ink">{user?.name}</p>
          <p className="truncate text-xs text-slate">{user?.email}</p>
        </div>
      </div>

      <div className="mb-5 space-y-2" role="group" aria-labelledby="role-modal-title">
        {ROLES.map((r) => {
          const active = selectedRoles.includes(r);
          const meta = ROLE_META[r] ?? { icon: Users, label: r, desc: "", tone: "bg-mist text-slate-dim" };
          const Icon = meta.icon;
          const isLast = selectedRoles.length === 1 && active;
          const locked = isLocked(r) && active;

          return (
            <motion.button
              key={r}
              type="button"
              role="checkbox"
              aria-checked={active}
              onClick={() => toggleRole(r)}
              disabled={isLast || locked || saving}
              title={locked ? "You can't remove your own admin role" : isLast ? "At least one role must stay selected" : undefined}
              whileTap={{ scale: 0.98 }}
              transition={spring}
              className={`flex w-full items-center gap-3 rounded-2xl border-2 p-3 text-left transition-colors disabled:cursor-not-allowed ${
                active ? "border-signal bg-signal-tint/50 dark:bg-signal/10" : "border-hairline hover:border-ink/25"
              }`}
            >
              <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${meta.tone}`}>
                <Icon size={18} aria-hidden />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold text-ink">{meta.label}</span>
                <span className="block text-xs text-slate">
                  {locked ? "Your own admin role is locked" : meta.desc}
                </span>
              </span>
              <span
                className={`grid h-6 w-6 shrink-0 place-items-center rounded-full border-2 transition-colors ${
                  active ? "border-signal bg-signal text-on-signal" : "border-hairline"
                }`}
              >
                <AnimatePresence initial={false}>
                  {active &&
                    (locked ? (
                      <motion.span key="lock" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} transition={bouncy}>
                        <Lock size={11} strokeWidth={3} />
                      </motion.span>
                    ) : (
                      <motion.span key="check" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} transition={bouncy}>
                        <Check size={12} strokeWidth={3} />
                      </motion.span>
                    ))}
                </AnimatePresence>
              </span>
            </motion.button>
          );
        })}
      </div>

      <AnimatePresence>
        {error && (
          <motion.div
            role="alert"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0, x: [0, -5, 5, -3, 3, 0] }}
            exit={{ opacity: 0 }}
            className="mb-4 flex items-start gap-2 rounded-2xl border border-danger/30 bg-danger/10 px-3 py-2.5 text-sm text-danger"
          >
            <AlertTriangle size={14} className="mt-0.5 shrink-0" />
            <span>{error}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col-reverse gap-2 sm:flex-row">
        <button type="button" onClick={onClose} disabled={saving} className="btn-secondary flex-1">
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving || !hasChanged}
          className="btn-primary flex-1"
        >
          {saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
          {saving ? "Saving…" : hasChanged ? "Save roles" : "No changes"}
        </button>
      </div>
    </Modal>
  );
};

export default RoleModal;
