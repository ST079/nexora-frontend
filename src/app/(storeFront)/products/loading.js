import ProductGridSkeleton from "@/components/ProductGridSkeleton";

const ProductsLoading = () => {
  return (
    <section className="container-page pb-16 pt-6 lg:pt-10">
      <div className="skeleton mb-6 h-36 rounded-4xl sm:h-40" />
      <div className="no-scrollbar mb-6 flex gap-2 overflow-hidden">
        {Array.from({ length: 7 }, (_, i) => (
          <div key={i} className="skeleton h-9 w-28 shrink-0 rounded-full" />
        ))}
      </div>
      <div className="grid items-start gap-6 lg:grid-cols-[264px_1fr] lg:gap-8">
        <div className="skeleton hidden h-112 rounded-card lg:block" />
        <ProductGridSkeleton />
      </div>
    </section>
  );
};

export default ProductsLoading;
