"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Calendar, Check, CheckCircle2, Copy, Mail, MapPin, Phone, X, XCircle } from "lucide-react";
import RoleBadge from "./RoleBadge";
import { Modal } from "@/components/Modal";
import { Avatar } from "@/components/UserProfile";
import { formatDate } from "@/utils/format";
import { bouncy, item as listItem, stagger } from "@/utils/motion";
import { ROLE_ADMIN, ROLE_MERCHANT, ROLE_THEME, ROLE_USER } from "@/constants/user";

const getRoleTheme = (roles) => {
  if (roles?.includes(ROLE_ADMIN)) return ROLE_THEME[ROLE_ADMIN];
  if (roles?.includes(ROLE_MERCHANT)) return ROLE_THEME[ROLE_MERCHANT];
  return ROLE_THEME[ROLE_USER];
};

const formatAddress = (address) =>
  [address?.street, address?.city, address?.province, address?.country]
    .filter(Boolean)
    .join(", ") || "—";

const UserViewModal = ({ user, onClose }) => {
  const theme = getRoleTheme(user.roles);
  const active = user.isActive !== false;
  const [copied, setCopied] = useState(false);

  const copyId = async () => {
    try {
      await navigator.clipboard.writeText(user._id);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard can be blocked; the ID is on screen anyway.
    }
  };

  return (
    <Modal onClose={onClose} labelledBy="user-view-title" size="max-w-md">
      {/* Header band, tinted by the user's highest role */}
      <div className={`relative overflow-hidden px-6 pb-6 pt-8 ${theme.bg}`}>
        <span
          aria-hidden
          className={`pointer-events-none absolute -right-12 -top-16 h-40 w-40 animate-drift rounded-full opacity-25 blur-3xl ${theme.avatarBg}`}
        />
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          autoFocus
          className="icon-btn absolute right-4 top-4 h-9 w-9 bg-panel/70"
        >
          <X size={16} />
        </button>

        <div className="relative flex items-center gap-4">
          <motion.div
            initial={{ scale: 0.6, rotate: -8 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ ...bouncy, delay: 0.05 }}
            className="relative shrink-0"
          >
            <Avatar user={user} size="h-18 w-18 text-xl ring-4 ring-panel" />
            <span
              aria-hidden
              className={`absolute bottom-0.5 right-0.5 h-4 w-4 rounded-full border-2 border-panel ${active ? "bg-ok" : "bg-danger"}`}
            />
          </motion.div>
          <div className="min-w-0 pr-8">
            <h3 id="user-view-title" className="font-display text-xl font-bold text-ink wrap-break-word">
              {user.name}
            </h3>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {(user.roles?.length ? user.roles : [ROLE_USER]).map((r) => (
                <RoleBadge key={r} role={r} />
              ))}
            </div>
          </div>
        </div>
      </div>

      <motion.div variants={stagger(0.05, 0.08)} initial="hidden" animate="show" className="space-y-3 p-6">
        <motion.div
          variants={listItem}
          className={`flex items-center justify-between gap-3 rounded-2xl px-4 py-3 ${active ? "bg-ok/12" : "bg-danger/10"}`}
        >
          <span className="text-sm font-medium text-ink">Account status</span>
          <span
            className={`inline-flex items-center gap-1.5 rounded-full bg-panel px-2.5 py-1 text-[11px] font-semibold ${active ? "text-ok" : "text-danger"}`}
          >
            {active ? <CheckCircle2 size={12} aria-hidden /> : <XCircle size={12} aria-hidden />}
            {active ? "Active" : "Inactive"}
          </span>
        </motion.div>

        <motion.dl variants={listItem} className="space-y-1 rounded-3xl border border-hairline p-2">
          <DetailRow icon={Mail} label="Email" value={user.email} href={user.email && `mailto:${user.email}`} />
          <DetailRow icon={Phone} label="Phone" value={user.phone || "—"} href={user.phone && `tel:${user.phone}`} />
          <DetailRow icon={MapPin} label="Address" value={formatAddress(user.address)} />
          <DetailRow icon={Calendar} label="Joined" value={formatDate(user.createdAt)} />
        </motion.dl>

        <motion.div variants={listItem} className="flex justify-center pt-1">
          <button
            type="button"
            onClick={copyId}
            aria-label={`Copy user ID ${user._id}`}
            className="group inline-flex items-center gap-1.5 rounded-full bg-mist px-3 py-1 font-mono text-[11px] text-slate-dim transition-colors hover:bg-signal-tint hover:text-signal-dim"
          >
            ID {user._id}
            {copied ? <Check size={11} className="text-ok" /> : <Copy size={11} className="opacity-60 group-hover:opacity-100" />}
          </button>
        </motion.div>
      </motion.div>
    </Modal>
  );
};

function DetailRow({ icon: Icon, label, value, href }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl px-3 py-2.5 transition-colors hover:bg-mist">
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-mist text-slate-dim">
        <Icon size={15} aria-hidden />
      </span>
      <div className="min-w-0">
        <dt className="text-[11px] font-medium text-slate">{label}</dt>
        <dd className="text-sm font-medium text-ink wrap-break-word">
          {href ? (
            <a href={href} className="hover:text-signal-dim hover:underline">
              {value}
            </a>
          ) : (
            value
          )}
        </dd>
      </div>
    </div>
  );
}

export default UserViewModal;
