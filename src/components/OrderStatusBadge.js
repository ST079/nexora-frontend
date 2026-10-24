import { STATUS_MAP } from "@/constants/orders";

const OrderStatusBadge = ({ status }) => {
  const entry = STATUS_MAP[(status || "").toUpperCase()];
  const Icon = entry?.icon;

  return (
    <span
      className={`inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold leading-none ${
        entry?.color || "bg-mist text-slate-dim"
      }`}
    >
      {Icon && <Icon size={13} strokeWidth={2.4} aria-hidden />}
      {entry?.label || status || "Unknown"}
    </span>
  );
};

export default OrderStatusBadge;
