const StatusBadge = ({ stock }) => {
  const outOfStock = Number(stock) <= 0;
  const lowStock = Number(stock) > 0 && Number(stock) <= 5;
  return (
    <span
      className={`font-mono text-[10px] uppercase tracking-widest px-2 py-0.5 ${
        outOfStock
          ? "bg-danger/10 text-danger"
          : lowStock
            ? "bg-signal-tint text-signal-dim"
            : "bg-ok/10 text-ok"
      }`}
    >
      {outOfStock ? "Out of stock" : lowStock ? "Low stock" : "In stock"}
    </span>
  );
};

export default StatusBadge