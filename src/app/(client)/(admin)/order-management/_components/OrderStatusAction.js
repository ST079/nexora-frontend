"use client";

import { useState } from "react";
import { Loader2, ChevronDown } from "lucide-react";
import toast from "react-hot-toast";
import { FINAL_STATUSES, ORDER_STATUSES, STATUS_MAP } from "@/constants/orders";
import { updateOrderStatus } from "@/api/order";
import OrderStatusBadge from "@/components/OrderStatusBadge";
import { apiErrorMessage } from "@/utils/format";

// Inline status picker for admins. Delivered and cancelled orders are final
// on the backend, so they render as a plain badge instead of a dead select.
const OrderStatusAction = ({ order, onUpdated, readOnly = false }) => {
  const [busy, setBusy] = useState(false);
  const currentStatus = order.status?.toUpperCase();

  if (readOnly || FINAL_STATUSES.includes(currentStatus))
    return <OrderStatusBadge status={currentStatus} />;

  const handleChange = async (e) => {
    const newStatus = e.target.value;
    if (newStatus === currentStatus) return;

    setBusy(true);
    try {
      const updated = await updateOrderStatus(order._id, newStatus);
      onUpdated?.({ ...order, ...updated, status: newStatus });
      toast.success(`Order marked as ${STATUS_MAP[newStatus]?.label ?? newStatus}.`);
    } catch (err) {
      toast.error(apiErrorMessage(err, "Could not update order status."));
    } finally {
      setBusy(false);
    }
  };

  const entry = STATUS_MAP[currentStatus];
  const Icon = entry?.icon;

  // The native select sits invisibly on top, so the pill keeps the platform
  // picker (and its keyboard support) on every device.
  return (
    <div
      className={`group/status relative inline-flex items-center gap-1.5 whitespace-nowrap rounded-full py-1 pl-2.5 pr-2 text-xs font-semibold leading-none ring-1 ring-transparent transition-all hover:ring-current/30 focus-within:ring-2 focus-within:ring-signal/50 ${
        entry?.color || "bg-mist text-slate-dim"
      } ${busy ? "opacity-60" : ""}`}
      onClick={(e) => e.stopPropagation()}
    >
      {busy ? (
        <Loader2 size={13} className="animate-spin" />
      ) : (
        Icon && <Icon size={13} strokeWidth={2.4} aria-hidden />
      )}
      <span className="pointer-events-none">{entry?.label ?? currentStatus}</span>
      <ChevronDown
        size={12}
        aria-hidden
        className="pointer-events-none opacity-60 transition-transform group-hover/status:translate-y-px"
      />
      <select
        value={currentStatus}
        onChange={handleChange}
        disabled={busy}
        aria-label={`Status for order ${order.orderNumber ?? ""}`}
        className="absolute inset-0 h-full w-full cursor-pointer opacity-0 disabled:cursor-not-allowed"
      >
        {ORDER_STATUSES.map((key) => (
          <option key={key} value={key}>
            {STATUS_MAP[key].label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default OrderStatusAction;
