import { CheckCircle2, Clock, PackageCheck, Truck, XCircle } from "lucide-react";

export const ORDER_STATUS_PENDING = "PENDING";
export const ORDER_STATUS_CONFIRMED = "CONFIRMED";
export const ORDER_STATUS_SHIPPED = "SHIPPED";
export const ORDER_STATUS_DELIVERED = "DELIVERED";
export const ORDER_STATUS_CANCELLED = "CANCELLED";

// Mirrors the backend enum (nexora-backend/src/constants/orderStatuses.js).
export const ORDER_STATUSES = [
  ORDER_STATUS_PENDING,
  ORDER_STATUS_CONFIRMED,
  ORDER_STATUS_SHIPPED,
  ORDER_STATUS_DELIVERED,
  ORDER_STATUS_CANCELLED,
];

// Customers can cancel until the parcel leaves the warehouse.
export const CUSTOMER_CANCELLABLE = [ORDER_STATUS_PENDING, ORDER_STATUS_CONFIRMED];

// Delivered and cancelled orders are locked on the backend.
export const FINAL_STATUSES = [ORDER_STATUS_DELIVERED, ORDER_STATUS_CANCELLED];

// `color` is the pill (tint + text); `dot` is the solid mark used in meters.
export const STATUS_MAP = {
  PENDING: {
    label: "Pending",
    icon: Clock,
    color: "bg-marigold-tint text-marigold-dim",
    dot: "bg-marigold",
  },
  CONFIRMED: {
    label: "Confirmed",
    icon: CheckCircle2,
    color: "bg-signal-tint text-signal-dim",
    dot: "bg-signal",
  },
  SHIPPED: {
    label: "Shipped",
    icon: Truck,
    color: "bg-blueprint-tint text-blueprint-dim",
    dot: "bg-blueprint",
  },
  DELIVERED: {
    label: "Delivered",
    icon: PackageCheck,
    color: "bg-ok/12 text-ok",
    dot: "bg-ok",
  },
  CANCELLED: {
    label: "Cancelled",
    icon: XCircle,
    color: "bg-danger/10 text-danger",
    dot: "bg-danger",
  },
};
