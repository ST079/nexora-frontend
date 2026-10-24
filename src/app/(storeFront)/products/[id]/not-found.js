import Link from "next/link";
import { PackageSearch } from "lucide-react";
import { PRODUCTS_ROUTE } from "@/constants/routes";

// Rendered (with a real 404 status) when the product page calls notFound().
const ProductNotFound = () => (
  <section className="container-page py-20 bg-paper dark:bg-[#0e0f12] min-h-[60vh] transition-colors duration-300">
    <div className="mx-auto max-w-md text-center">
      <div className="mx-auto mb-5 grid h-14 w-14 place-items-center border border-hairline dark:border-[#262932]">
        <PackageSearch size={22} className="text-slate dark:text-[#8b8fa8]" />
      </div>
      <p className="eyebrow dark:text-[#8b8fa8] mb-2">Error 404</p>
      <h1 className="font-display text-2xl font-semibold text-ink dark:text-[#f0efe8] mb-2">
        Product not found
      </h1>
      <p className="text-sm text-slate dark:text-[#8b8fa8] mb-6">
        This listing may have been removed or the link is out of date.
      </p>
      <Link href={PRODUCTS_ROUTE} className="btn-primary">
        Browse products
      </Link>
    </div>
  </section>
);

export default ProductNotFound;
