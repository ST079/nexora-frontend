import { STATUS_MAP } from "@/constants/orders";

const OrderStatusBadge = ({ status }) => {
  const entry = STATUS_MAP[(status || "").toUpperCase()];
  const Icon = entry?.icon;

  return (
    <span
      className={`inline-flex items-center justify-center gap-1 px-2.5 py-1 font-mono text-[12px] uppercase tracking-wide leading-none ${
        entry?.color || "bg-hairline text-slate"
      }`}
    >
      {Icon && <Icon size={14} />}
      {entry?.label || status || "Unknown"}
    </span>
  );
};

export default OrderStatusBadge;