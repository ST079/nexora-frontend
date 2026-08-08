"use client";

import {
  AlertTriangle,
  Check,
  Loader2,
  ShieldCheck,
  User,
  Users,
} from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import { initials } from "@/utils/format";
import { ROLE_ADMIN, ROLE_MERCHANT, ROLE_USER, ROLES } from "@/constants/user";
import { updateUserRoles } from "@/api/user";
import toast from "react-hot-toast";

const RoleModal = ({ user, onClose, onSave }) => {
  const [selectedRoles, setSelectedRoles] = useState(() =>
    (user?.roles ?? ["USER"]).map((r) => r.toUpperCase()),
  );
  const [saving, setSaving] = useState(false);

  const toggleRole = (r) => {
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
    JSON.stringify(
      [...(user?.roles ?? ["USER"])].map((r) => r.toUpperCase()).sort(),
    );

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateUserRoles(user._id, selectedRoles);
      onSave({ ...user, roles: selectedRoles });
      toast.success("Roles updated successfully.");
    } catch (err) {
      console.error("Failed to update roles:", err);
      toast.error("Failed to update roles.");
    } finally {
      setSaving(false);
    }
  };

  const ROLE_META = {
    [ROLE_ADMIN]: { icon: ShieldCheck, desc: "Full access to admin dashboard" },
    [ROLE_MERCHANT]: { icon: User, desc: "Can list and manage products" },
    [ROLE_USER]: { icon: Users, desc: "Standard customer account" },
  };

  return (
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
        {/* User info */}
        <div className="flex items-center gap-3 mb-5">
          <div className="grid h-10 w-10 shrink-0 place-items-center bg-ink dark:bg-[#262932] font-display text-sm text-paper dark:text-[#f0efe8]">
            {initials(user?.name)}
          </div>
          <div>
            <p className="font-medium text-sm text-ink dark:text-[#f0efe8]">
              {user?.name}
            </p>
            <p className="font-mono text-xs text-slate dark:text-[#8b8fa8]">
              {user?.email}
            </p>
          </div>
        </div>

        <p className="eyebrow dark:text-[#8b8fa8] mb-1">Change roles</p>
        <p className="text-xs text-slate dark:text-[#8b8fa8] mb-4">
          Select one or more roles. At least one must remain selected.
        </p>

        <div className="space-y-2 mb-6">
          {ROLES.map((r) => {
            const active = selectedRoles.includes(r);
            const meta = ROLE_META[r] ?? { icon: Users, desc: "" };
            const Icon = meta.icon;
            const isLast = selectedRoles.length === 1 && active; // can't deselect last

            return (
              <button
                key={r}
                onClick={() => toggleRole(r)}
                disabled={isLast}
                className={`flex w-full items-center justify-between px-3 py-2.5 border text-sm font-medium transition-colors disabled:cursor-not-allowed ${
                  active
                    ? "border-ink dark:border-[#f0efe8] bg-ink dark:bg-[#f0efe8] text-paper dark:text-[#0e0f12]"
                    : "border-hairline dark:border-[#262932] text-ink dark:text-[#f0efe8] hover:border-ink dark:hover:border-[#f0efe8]"
                }`}
              >
                <span className="flex items-start gap-2.5">
                  {/* Checkbox */}
                  <span
                    className={`mt-0.5 grid h-4 w-4 shrink-0 place-items-center border transition-colors ${
                      active
                        ? "border-paper dark:border-[#0e0f12] bg-paper dark:bg-[#0e0f12]"
                        : "border-hairline dark:border-[#262932]"
                    }`}
                  >
                    {active && (
                      <Check
                        size={10}
                        className="text-ink dark:text-[#f0efe8]"
                      />
                    )}
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
                      {meta.desc}
                    </span>
                  </span>
                </span>
              </button>
            );
          })}
        </div>

        {/* Selected summary */}
        <div className="flex flex-wrap gap-1.5 mb-5">
          {selectedRoles.map((r) => (
            <span
              key={r}
              className="font-mono text-[10px] uppercase tracking-widest px-2 py-0.5 bg-ink dark:bg-[#f0efe8] text-paper dark:text-[#0e0f12]"
            >
              {r}
            </span>
          ))}
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleSave}
            disabled={saving || !hasChanged}
            className="btn-primary flex-1 disabled:opacity-60"
          >
            {saving ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Check size={14} />
            )}
            {saving ? "Saving…" : "Save"}
          </button>
          <button onClick={onClose} className="btn-secondary flex-1">
            Cancel
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default RoleModal;
