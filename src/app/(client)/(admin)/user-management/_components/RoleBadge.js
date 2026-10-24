import { ShieldCheck, Store, User } from "lucide-react";

const STYLES = {
  ADMIN: { label: "Admin", icon: ShieldCheck, tone: "bg-blueprint-tint text-blueprint-dim" },
  MERCHANT: { label: "Merchant", icon: Store, tone: "bg-signal-tint text-signal-dim" },
  USER: { label: "Customer", icon: User, tone: "bg-mist text-slate-dim" },
};

const RoleBadge = ({ role }) => {
  const style = STYLES[role?.toUpperCase()] ?? STYLES.USER;
  const Icon = style.icon;
  return (
    <span
      className={`inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2 py-1 text-[11px] font-semibold leading-none ${style.tone}`}
    >
      <Icon size={11} strokeWidth={2.4} aria-hidden />
      {style.label}
    </span>
  );
};

export default RoleBadge;
