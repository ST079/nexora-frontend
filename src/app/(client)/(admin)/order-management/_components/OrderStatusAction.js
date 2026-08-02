"use client";

import { useState } from "react";
import { Loader2, ChevronDown } from "lucide-react";
import toast from "react-hot-toast";
import { STATUS_MAP } from "@/constants/orders";
import { updateOrderStatus } from "@/api/order";

const OrderStatusAction = ({ order, onUpdated }) => {
  const [busy, setBusy] = useState(false);
  const currentStatus = order.status?.toUpperCase();

  const handleChange = async (e) => {
    const newStatus = e.target.value;
    if (newStatus === currentStatus) return;

    setBusy(true);
    try {
      const updated = await updateOrderStatus(order._id, newStatus);
      onUpdated({ ...order, ...updated, status: newStatus });
      toast.success(
        `Order marked as ${STATUS_MAP[newStatus]?.label ?? newStatus}.`,
      );
    } catch (err) {
      toast.error(
        err?.response?.data?.message || "Could not update order status.",
      );
    } finally {
      setBusy(false);
    }
  };

  const entry = STATUS_MAP[currentStatus];

  return (
    <div
      className={`relative inline-flex items-center gap-1 font-mono text-[11px] uppercase tracking-widest px-2 py-1 ${
        entry?.color || "bg-hairline text-slate"
      } ${busy ? "opacity-60" : ""}`}
      onClick={(e) => e.stopPropagation()}
    >
      {busy ? (
        <Loader2 size={11} className="animate-spin" />
      ) : (
        <ChevronDown size={11} />
      )}
      <select
        value={currentStatus}
        onChange={handleChange}
        disabled={busy}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
      >
        {Object.entries(STATUS_MAP).map(([key, val]) => (
          <option key={key} value={key}>
            {val.label}
          </option>
        ))}
      </select>
      <span className="pointer-events-none">
        {entry?.label ?? currentStatus}
      </span>
    </div>
  );
};

export default OrderStatusAction;
