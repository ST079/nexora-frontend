// Placeholder cards shaped like ProductCard, shown while a listing loads.
export const ProductCardSkeleton = () => (
  <div className="rounded-card border border-hairline bg-panel p-2">
    <div className="skeleton aspect-4/5 rounded-[1.1rem]" />
    <div className="space-y-2 px-2 pb-2 pt-3">
      <div className="skeleton h-2.5 w-1/3" />
      <div className="skeleton h-4 w-4/5" />
      <div className="skeleton mt-3 h-4 w-1/2" />
    </div>
  </div>
);

const ProductGridSkeleton = ({ count = 6, className = "grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3" }) => (
  <div className={className} role="status" aria-label="Loading products">
    {Array.from({ length: count }, (_, i) => (
      <ProductCardSkeleton key={i} />
    ))}
  </div>
);

export default ProductGridSkeleton;
