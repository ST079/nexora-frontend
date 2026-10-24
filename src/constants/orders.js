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

export const STATUS_MAP = {
  PENDING: {
    label: "Pending",
    icon: Clock,
    color: "bg-signal/10 text-signal-dim dark:text-signal",
  },
  CONFIRMED: {
    label: "Confirmed",
    icon: CheckCircle2,
    color: "bg-ok/10 text-ok",
  },
  SHIPPED: {
    label: "Shipped",
    icon: Truck,
    color: "bg-blueprint/10 text-blueprint dark:text-[#8b9bff]",
  },
  DELIVERED: {
    label: "Delivered",
    icon: PackageCheck,
    color: "bg-ok/15 text-ok",
  },
  CANCELLED: {
    label: "Cancelled",
    icon: XCircle,
    color: "bg-danger/10 text-danger",
  },
};
