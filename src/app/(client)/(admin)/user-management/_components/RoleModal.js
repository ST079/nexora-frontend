"use client";

import { AlertTriangle, Check, Loader2, ShieldCheck, Store, Users, X } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import toast from "react-hot-toast";
import { apiErrorMessage, initials } from "@/utils/format";
import { ROLE_ADMIN, ROLE_MERCHANT, ROLE_USER, ROLES } from "@/constants/user";
import { updateUserRoles } from "@/api/user";
import { useEscape } from "@/hooks/useEscape";

const ROLE_META = {
  [ROLE_ADMIN]: { icon: ShieldCheck, desc: "Full access to the admin dashboard" },
  [ROLE_MERCHANT]: { icon: Store, desc: "Can list and manage their own products" },
  [ROLE_USER]: { icon: Users, desc: "Standard customer account" },
};

const normalise = (roles) => (roles?.length ? roles : [ROLE_USER]).map((r) => r.toUpperCase());

const RoleModal = ({ user, isSelf = false, onClose, onSave }) => {
  const [selectedRoles, setSelectedRoles] = useState(() => normalise(user?.roles));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEscape(onClose, !saving);

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-ink/50 dark:bg-black/70"
        onClick={() => !saving && onClose()}
      />
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-labelledby="role-modal-title"
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

        {/* User info */}
        <div className="flex items-center gap-3 mb-5 pr-8">
          <div className="grid h-10 w-10 shrink-0 place-items-center bg-ink dark:bg-[#262932] font-display text-sm text-paper dark:text-[#f0efe8]">
            {initials(user?.name)}
          </div>
          <div className="min-w-0">
            <p className="font-medium text-sm text-ink dark:text-[#f0efe8] truncate">
              {user?.name}
            </p>
            <p className="font-mono text-xs text-slate dark:text-[#8b8fa8] truncate">
              {user?.email}
            </p>
          </div>
        </div>

        <h3 id="role-modal-title" className="eyebrow dark:text-[#8b8fa8] mb-1">
          Change roles
        </h3>
        <p className="text-xs text-slate dark:text-[#8b8fa8] mb-4">
          Select one or more roles. At least one must stay selected.
        </p>

        <div className="space-y-2 mb-5" role="group" aria-labelledby="role-modal-title">
          {ROLES.map((r) => {
            const active = selectedRoles.includes(r);
            const meta = ROLE_META[r] ?? { icon: Users, desc: "" };
            const Icon = meta.icon;
            const isLast = selectedRoles.length === 1 && active;
            const locked = isLocked(r) && active;

            return (
              <button
                key={r}
                type="button"
                role="checkbox"
                aria-checked={active}
                onClick={() => toggleRole(r)}
                disabled={isLast || locked || saving}
                title={locked ? "You can't remove your own admin role" : undefined}
                className={`flex w-full items-center justify-between px-3 py-2.5 border text-left text-sm font-medium transition-colors disabled:cursor-not-allowed ${
                  active
                    ? "border-ink dark:border-[#f0efe8] bg-ink dark:bg-[#f0efe8] text-paper dark:text-[#0e0f12]"
                    : "border-hairline dark:border-[#262932] text-ink dark:text-[#f0efe8] hover:border-ink dark:hover:border-[#f0efe8]"
                }`}
              >
                <span className="flex items-start gap-2.5">
                  <span
                    className={`mt-0.5 grid h-4 w-4 shrink-0 place-items-center border transition-colors ${
                      active
                        ? "border-paper dark:border-[#0e0f12] bg-paper dark:bg-[#0e0f12]"
                        : "border-hairline dark:border-[#262932]"
                    }`}
                  >
                    {active && <Check size={10} className="text-ink dark:text-[#f0efe8]" />}
                  </span>
                  <span>
                    <span className="flex items-center gap-1.5">
                      <Icon size={13} />
                      {r}
                    </span>
                    <span
                      className={`block font-mono text-[10px] mt-0.5 ${
                        active ? "opacity-70" : "text-slate dark:text-[#8b8fa8]"
                      }`}
                    >
                      {locked ? "Your own admin role is locked" : meta.desc}
                    </span>
                  </span>
                </span>
              </button>
            );
          })}
        </div>

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
            disabled={saving || !hasChanged}
            className="btn-primary flex-1 disabled:opacity-60"
          >
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
            {saving ? "Saving…" : "Save"}
          </button>
          <button onClick={onClose} disabled={saving} className="btn-secondary flex-1">
            Cancel
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default RoleModal;
