"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import {
  X,
  Mail,
  Phone,
  Calendar,
  ShieldCheck,
  MapPin,
} from "lucide-react";
import RoleBadge from "./RoleBadge";
import { formatDate, initials } from "@/utils/format";
import { ROLE_THEME } from "@/constants/user";

const getRoleTheme = (roles) => {
  if (roles?.includes("ADMIN")) return ROLE_THEME.ADMIN;
  if (roles?.includes("MERCHANT")) return ROLE_THEME.MERCHANT;
  return ROLE_THEME.USER;
};

const UserViewModal = ({ user, onClose }) => {
  const theme = getRoleTheme(user.roles);

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
        transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
        className={`relative w-full max-w-md max-h-[85vh] overflow-y-auto bg-paper dark:bg-[#16181f] border-2 ${theme.accent} shadow-lift`}
      >
        {/* Header band — color coded by role */}
        <div className={`px-6 py-6 ${theme.bg} border-b ${theme.accent}`}>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 grid h-8 w-8 place-items-center text-slate dark:text-[#8b8fa8] hover:text-ink dark:hover:text-[#f0efe8] transition-colors"
          >
            <X size={16} />
          </button>

          <div className="flex items-center gap-4">
            <div
              className={`h-16 w-16 shrink-0 overflow-hidden border border-hairline dark:border-[#262932] grid place-items-center ${theme.avatarBg}`}
            >
              {user.profileImageUrl ? (
                <Image
                  src={user.profileImageUrl}
                  alt={user.name}
                  width={64}
                  height={64}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="font-display text-lg text-paper dark:text-[#f0efe8]">
                  {initials(user.name)}
                </span>
              )}
            </div>
            <div>
              <h3 className="font-display text-xl font-semibold text-ink dark:text-[#f0efe8]">
                {user.name}
              </h3>
              <div className="flex flex-wrap gap-1 mt-1.5">
                {(user.roles ?? ["USER"]).map((r) => (
                  <RoleBadge key={r} role={r} />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Details */}
        <div className="p-6 space-y-4">
          <div className="border border-hairline dark:border-[#262932] divide-y divide-hairline dark:divide-[#262932]">
            <DetailRow icon={Mail} label="Email" value={user.email} />
            <DetailRow icon={Phone} label="Phone" value={user.phone ?? "—"} />
            <DetailRow
              icon={MapPin}
              label="Location"
              value={
                user.address?.city
                  ? `${user.address.street ? user.address.street + ", " : ""}${user.address.city}`
                  : "—"
              }
            />
            <DetailRow
              icon={Calendar}
              label="Joined"
              value={formatDate(user.createdAt)}
            />
          </div>

          <div className="flex items-center justify-between border border-hairline dark:border-[#262932] px-4 py-3">
            <span className="flex items-center gap-2 text-sm text-slate dark:text-[#8b8fa8]">
              <ShieldCheck size={14} /> Account status
            </span>
            <span
              className={`font-mono text-[11px] uppercase tracking-widest px-2 py-0.5 ${
                user.isActive !== false
                  ? "bg-ok/10 text-ok"
                  : "bg-danger/10 text-danger"
              }`}
            >
              {user.isActive !== false ? "Active" : "Inactive"}
            </span>
          </div>

          <p className="font-mono text-[11px] text-slate dark:text-[#8b8fa8] text-center pt-2">
            User ID: {user._id}
          </p>
        </div>
      </motion.div>
    </div>
  );
};

function DetailRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <Icon size={14} className="text-slate dark:text-[#8b8fa8] shrink-0" />
      <div className="min-w-0">
        <p className="font-mono text-[10px] uppercase tracking-widest text-slate dark:text-[#8b8fa8]">
          {label}
        </p>
        <p className="text-sm text-ink dark:text-[#f0efe8] truncate">{value}</p>
      </div>
    </div>
  );
}

export default UserViewModal;
