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
