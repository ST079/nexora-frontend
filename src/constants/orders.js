import { CheckCircle2, Clock, Loader2, Truck, XCircle } from "lucide-react";

export const STATUS_MAP = {
  PENDING: { label: "Pending", icon: Clock, color: "bg-signal/10 text-signal" },
  PROCESSING: {
    label: "Processing",
    icon: Loader2,
    color: "bg-blueprint/10 text-blueprint dark:text-[#5c78ff]",
  },
  SHIPPED: {
    label: "Shipped",
    icon: Truck,
    color: "bg-blueprint/10 text-blueprint dark:text-[#5c78ff]",
  },
  DELIVERED: {
    label: "Delivered",
    icon: CheckCircle2,
    color: "bg-ok/10 text-ok",
  },
  COMPLETED: {
    label: "Completed",
    icon: CheckCircle2,
    color: "bg-ok/10 text-ok",
  },
  CANCELLED: {
    label: "Cancelled",
    icon: XCircle,
    color: "bg-danger/10 text-danger",
  },
};

export const ORDER_STATUS_CONFIRMED = "CONFIRMED";
export const ORDER_STATUS_PENDING = "PENDING";
export const ORDER_STATUS_PROCESSING = "PROCESSING";
export const ORDER_STATUS_SHIPPED = "SHIPPED";
export const ORDER_STATUS_DELIVERED = "DELIVERED";
export const ORDER_STATUS_CANCELLED = "CANCELLED";
export const ORDER_STATUS_RETURNED = "RETURNED";
export const ORDER_STATUS_REFUNDED = "REFUNDED";