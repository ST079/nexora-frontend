const RoleBadge = ({ role }) => {
  const styles = {
    ADMIN:    "bg-blueprint/10 text-blueprint dark:text-[#5c78ff]",
    MERCHANT: "bg-signal/10 text-signal",
    USER:     "bg-hairline dark:bg-[#262932] text-slate dark:text-[#8b8fa8]",
  };
  return (
    <span className={`font-mono text-[10px] uppercase tracking-widest px-2 py-0.5 ${styles[role?.toUpperCase()] ?? styles.USER}`}>
      {role ?? "USER"}
    </span>
  );
};

export default RoleBadge;