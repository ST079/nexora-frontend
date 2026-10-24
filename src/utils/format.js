import { DEFAULT_SORT, FALLBACK_IMG } from "@/constants/defaults";

export const productImage = (product, index = 0) => {
  const images = product?.imageUrls;
  if (Array.isArray(images) && images.length > index && images[index])
    return images[index];
  // Cart items store a single image string under imageUrls.
  if (typeof images === "string" && images) return images;
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

// Filters the backend understands, across products, orders and users.
const PASSTHROUGH_KEYS = [
  "name",
  "brands",
  "category",
  "min",
  "max",
  "createdBy",
  "stock",
  "status",
  "search",
  "role",
  "limit",
  "offset",
];

export const queryFormatter = (searchParams = {}) => {
  const params = new URLSearchParams();

  params.set("sort", searchParams.sort ?? DEFAULT_SORT);

  PASSTHROUGH_KEYS.forEach((key) => {
    const value = searchParams[key];
    if (value !== undefined && value !== null && value !== "")
      params.set(key, value);
  });

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
  PENDING: "bg-signal-tint text-signal-dim dark:bg-signal/15 dark:text-signal",
  CONFIRMED: "bg-ok/10 text-ok",
  SHIPPED: "bg-blueprint-tint text-blueprint-dim dark:bg-blueprint/20 dark:text-blueprint",
  DELIVERED: "bg-ok/10 text-ok",
  COMPLETED: "bg-ok/10 text-ok",
  FAILED: "bg-danger/10 text-danger",
  REFUNDED: "bg-hairline text-slate-dim dark:text-slate",
  CANCELLED: "bg-danger/10 text-danger",
  UNPAID: "bg-signal-tint text-signal-dim dark:bg-signal/15 dark:text-signal",
  PAID: "bg-ok/10 text-ok",
};

export function statusStyle(status) {
  return (
    STATUS_STYLES[slugStatus(status)] ||
    "bg-hairline text-slate-dim dark:text-slate"
  );
}


export const initials = (name = "") =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");

// Reads the first useful message out of an axios error (including Zod
// field errors) so toasts say what actually went wrong.
export const apiErrorMessage = (error, fallback = "Something went wrong.") => {
  const data = error?.response?.data;
  const fieldError = Object.values(data?.properties ?? {})
    .flatMap((field) => field?.errors ?? [])
    .find(Boolean);
  return fieldError || data?.message || error?.message || fallback;
};
