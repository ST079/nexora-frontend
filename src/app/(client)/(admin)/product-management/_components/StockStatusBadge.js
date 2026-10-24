import { AlertTriangle, CheckCircle2, XCircle } from "lucide-react";
import { LOW_STOCK_THRESHOLD } from "@/constants/defaults";

// Status colour always travels with an icon and a label.
const STATES = {
  out: { label: "Out of stock", icon: XCircle, tone: "bg-danger/10 text-danger" },
  low: { label: "Low stock", icon: AlertTriangle, tone: "bg-marigold-tint text-marigold-dim" },
  in: { label: "In stock", icon: CheckCircle2, tone: "bg-ok/12 text-ok" },
};

const StatusBadge = ({ stock }) => {
  const count = Number(stock);
  const state = count <= 0 ? STATES.out : count <= LOW_STOCK_THRESHOLD ? STATES.low : STATES.in;
  const Icon = state.icon;
  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-semibold leading-none ${state.tone}`}
    >
      <Icon size={12} strokeWidth={2.4} aria-hidden />
      {state.label}
    </span>
  );
};

export default StatusBadge;
