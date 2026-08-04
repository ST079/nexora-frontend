import { AlertTriangle, Check, Loader2, ShieldCheck, User, Users } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import { initials } from "@/utils/format";
import { ROLES } from "@/constants/user";

const RoleModal = ({ user, onClose, onSave }) => {
  const [role, setRole] = useState(user?.roles?.[0]?.toUpperCase() ?? "USER");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async () => {
    setSaving(true);
    setError("");
    try {
      // await updateUser(user._id, { roles: [role] });
      await new Promise((r) => setTimeout(r, 600));
      onSave({ ...user, roles: [role] });
    } catch (err) {
      setError(
        err?.response?.data?.message || err.message || "Could not update role.",
      );
    } finally {
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
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 12 }}
        transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full max-w-sm bg-paper dark:bg-[#16181f] border border-hairline dark:border-[#262932] shadow-lift p-6"
      >
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

        <p className="eyebrow dark:text-[#8b8fa8] mb-3">Change role</p>

        {error && (
          <div className="flex items-start gap-2 border border-danger/40 bg-danger/5 dark:bg-danger/10 px-3 py-2.5 text-sm text-danger mb-4">
            <AlertTriangle size={14} className="mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="space-y-2 mb-6">
          {ROLES.map((r) => (
            <button
              key={r}
              onClick={() => setRole(r)}
              className={`flex w-full items-center justify-between px-3 py-2.5 border text-sm font-medium transition-colors ${
                role === r
                  ? "border-ink dark:border-[#f0efe8] bg-ink dark:bg-[#f0efe8] text-paper dark:text-[#0e0f12]"
                  : "border-hairline dark:border-[#262932] text-ink dark:text-[#f0efe8] hover:border-ink dark:hover:border-[#f0efe8]"
              }`}
            >
              <span className="flex items-center gap-2">
                {r === "ADMIN" && <ShieldCheck size={14} />}
                {r === "MERCHANT" && <User size={14} />}
                {r === "USER" && <Users size={14} />}
                {r}
              </span>
              {role === r && <Check size={14} />}
            </button>
          ))}
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleSave}
            disabled={saving || role === user?.roles?.[0]?.toUpperCase()}
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
