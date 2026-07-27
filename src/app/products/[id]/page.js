import { config } from "@/config/config";
import Link from "next/link";
import { ChevronLeft, IdCard } from "lucide-react";
import ProductDetailClient from "@/components/ProductDetailClient";
import { getProductById } from "@/api/product";
import { PRODUCTS_ROUTE } from "@/constants/routes";

export const generateMetadata = async ({ params }) => {
  const id = (await params).id;
  const product = await getProductById(id);
  return {
    title: product?.name ?? config.appName,
  };
};

const ProductDetailPage = async ({ params }) => {
  const id = (await params).id;
  const product = await getProductById(id);

  if (!product) {
    return (
      <section className="container-page py-16 bg-paper dark:bg-[#0e0f12] min-h-screen transition-colors duration-300">
        <div className="text-center">
          <p className="font-display text-xl font-semibold text-ink dark:text-[#f0efe8] mb-2">
            Product not found
          </p>
          <p className="text-sm text-slate dark:text-[#8b8fa8] mb-6">
            This listing may have been removed or the link is out of date.
          </p>
          <Link href="/products" className="btn-primary">
            Back to Products
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="container-page py-10 bg-paper dark:bg-[#0e0f12] min-h-screen transition-colors duration-300">
      <Link
        href={PRODUCTS_ROUTE}
        className="btn-ghost mb-6 -ml-4 inline-flex dark:text-[#8b8fa8] dark:hover:text-[#f0efe8]"
      >
        <ChevronLeft size={15} /> Back
      </Link>

      <ProductDetailClient product={product} />
    </section>
  );
};

export default ProductDetailPage;
