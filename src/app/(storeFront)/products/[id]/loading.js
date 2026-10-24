import ProductGridSkeleton from "@/components/ProductGridSkeleton";

const ProductDetailLoading = () => {
  return (
    <section className="container-page pb-16 pt-6 lg:pt-10" role="status" aria-label="Loading product">
      <div className="skeleton mb-6 h-9 w-40 rounded-full" />
      <div className="grid gap-8 lg:grid-cols-[1.1fr_1fr] lg:gap-12">
        <div className="space-y-3">
          <div className="skeleton aspect-square rounded-4xl" />
          <div className="flex gap-2">
            {Array.from({ length: 4 }, (_, i) => (
              <div key={i} className="skeleton h-20 w-20 rounded-2xl" />
            ))}
          </div>
        </div>
        <div className="space-y-4">
          <div className="skeleton h-3 w-24" />
          <div className="skeleton h-12 w-4/5" />
          <div className="skeleton h-8 w-40" />
          <div className="skeleton h-28 w-full rounded-3xl" />
          <div className="skeleton h-14 w-full rounded-full" />
        </div>
      </div>
      <div className="mt-20">
        <ProductGridSkeleton count={4} className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4" />
      </div>
    </section>
  );
};

export default ProductDetailLoading;
