const STYLES = {
  ADMIN: "bg-blueprint-tint text-blueprint dark:bg-blueprint/20 dark:text-[#9aa6ff]",
  MERCHANT: "bg-signal-tint text-signal-dim dark:bg-signal/15 dark:text-signal",
  USER: "bg-hairline dark:bg-[#262932] text-slate-dim dark:text-[#8b8fa8]",
};

const RoleBadge = ({ role }) => (
  <span
    className={`font-mono text-[10px] uppercase tracking-widest px-2 py-0.5 whitespace-nowrap ${
      STYLES[role?.toUpperCase()] ?? STYLES.USER
    }`}
  >
    {role ?? "USER"}
  </span>
);

export default RoleBadge;
