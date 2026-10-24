import Link from "next/link";
import { PackageSearch } from "lucide-react";
import { PRODUCTS_ROUTE } from "@/constants/routes";

// Rendered (with a real 404 status) when the product page calls notFound().
const ProductNotFound = () => (
  <section className="container-page grid min-h-[60vh] place-items-center py-20">
    <div className="relative mx-auto max-w-md text-center">
      <span
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-0 h-48 w-48 -translate-x-1/2 rounded-full bg-marigold/25 blur-3xl"
      />
      <div className="relative mx-auto mb-6 grid h-20 w-20 animate-float place-items-center rounded-3xl bg-signal-tint text-signal [--float-rotate:-6deg]">
        <PackageSearch size={34} strokeWidth={1.6} />
      </div>
      <p className="eyebrow relative mb-2">Error 404</p>
      <h1 className="relative font-display text-4xl font-bold tracking-tight text-ink">
        This one got away
      </h1>
      <p className="relative mx-auto mt-3 max-w-sm text-sm text-slate">
        The listing may have been removed or the link is out of date.
      </p>
      <Link href={PRODUCTS_ROUTE} className="btn-primary relative mt-7">
        Browse products
      </Link>
    </div>
  </section>
);

export default ProductNotFound;
