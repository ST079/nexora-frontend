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

  return (
    <div
      className={`relative inline-flex items-center gap-1 font-mono text-[11px] uppercase tracking-widest px-2 py-1 focus-within:ring-2 focus-within:ring-signal/50 ${
        entry?.color || "bg-hairline text-slate-dim"
      } ${busy ? "opacity-60" : ""}`}
      onClick={(e) => e.stopPropagation()}
    >
      {busy ? <Loader2 size={11} className="animate-spin" /> : <ChevronDown size={11} />}
      <select
        value={currentStatus}
        onChange={handleChange}
        disabled={busy}
        aria-label={`Status for order ${order.orderNumber ?? ""}`}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
      >
        {ORDER_STATUSES.map((key) => (
          <option key={key} value={key}>
            {STATUS_MAP[key].label}
          </option>
        ))}
      </select>
      <span className="pointer-events-none">{entry?.label ?? currentStatus}</span>
    </div>
  );
};

export default OrderStatusAction;
