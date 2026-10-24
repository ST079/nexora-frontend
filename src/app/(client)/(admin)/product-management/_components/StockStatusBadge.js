import { LOW_STOCK_THRESHOLD } from "@/constants/defaults";

const StatusBadge = ({ stock }) => {
  const count = Number(stock);
  const outOfStock = count <= 0;
  const lowStock = count > 0 && count <= LOW_STOCK_THRESHOLD;
  return (
    <span
      className={`inline-block whitespace-nowrap font-mono text-[10px] uppercase tracking-widest px-2 py-0.5 ${
        outOfStock
          ? "bg-danger/10 text-danger"
          : lowStock
            ? "bg-signal-tint text-signal-dim dark:bg-signal/15 dark:text-signal"
            : "bg-ok/10 text-ok"
      }`}
    >
      {outOfStock ? "Out of stock" : lowStock ? "Low stock" : "In stock"}
    </span>
  );
};

export default StatusBadge;
