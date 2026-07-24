import { FALLBACK_IMG } from "@/constants/defaults";

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
