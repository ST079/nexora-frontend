import { DEFAULT_SORT, FALLBACK_IMG } from "@/constants/defaults";

export const productImage = (product, index = 0) => {
  const images = product?.imageUrls;
  if (Array.isArray(images) && images.length > index && images[index])
    return images[index];
  if (typeof product?.image === "string" && product.image) return product.image;
  return FALLBACK_IMG;
};

export const formatNPR = (amount) => {
  const n = Number(amount);
  if (Number.isNaN(n)) return "Rs. —";
  return "Rs. " + n.toLocaleString("en-IN");
};

export const formatSize = (bytes) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export const formatExt = (name) => name.split(".").pop().toUpperCase();

export const queryFormatter = (searchParams = {}) => {
  const params = new URLSearchParams();

  params.set("sort", searchParams.sort ?? DEFAULT_SORT);

  if (searchParams.name) params.set("name", searchParams.name);
  if (searchParams.brands) params.set("brands", searchParams.brands);
  if (searchParams.category) params.set("category", searchParams.category);
  if (searchParams.min) params.set("min", searchParams.min);
  if (searchParams.max) params.set("max", searchParams.max);

  return params.toString();
};

export const formatDate = (value) => {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-US", {
    day: "2-digit", month: "short", year: "numeric",
  });
};

export function slugStatus(status = "") {
  return String(status).trim().toUpperCase();
}

export const STATUS_STYLES = {
  PENDING: "bg-signal-tint text-signal-dim",
  PROCESSING: "bg-blueprint-tint text-blueprint-dim",
  SHIPPED: "bg-blueprint-tint text-blueprint-dim",
  DELIVERED: "bg-ok/10 text-ok",
  COMPLETED: "bg-ok/10 text-ok",
  CANCELLED: "bg-danger/10 text-danger",
  CANCELED: "bg-danger/10 text-danger",
  UNPAID: "bg-signal-tint text-signal-dim",
  PAID: "bg-ok/10 text-ok",
};

export function statusStyle(status) {
  return STATUS_STYLES[slugStatus(status)] || "bg-hairline text-slate";
}
