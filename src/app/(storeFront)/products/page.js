import { Suspense } from "react";
import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import ProductFilter from "@/components/ProductFilter";
import Pagination from "@/components/Pagination";
import EmptyState from "@/components/EmptyState";
import { getProducts, getTotalCount } from "@/api/product";
import { PRODUCTS_PAGE_SIZE } from "@/constants/pagination";
import { PRODUCTS_ROUTE } from "@/constants/routes";

const FILTER_KEYS = ["category", "brands", "min", "max", "name"];

const headingFor = ({ category, name }) => {
  if (name) return `Results for “${name}”`;
  return category || "All products";
};

export const generateMetadata = async ({ searchParams }) => {
  const params = await searchParams;
  const onlyCategory =
    params.category && Object.keys(params).every((k) => k === "category");

  return {
    title: params.name
      ? `Search: ${params.name}`
      : params.category || "Shop all products",
    description: params.category
      ? `Shop ${params.category} from trusted merchants across Nepal. Pay with Khalti, card or cash on delivery.`
      : "Browse phones, laptops, fashion and home essentials from trusted merchants across Nepal.",
    alternates: {
      canonical: onlyCategory
        ? `${PRODUCTS_ROUTE}?category=${encodeURIComponent(params.category)}`
        : PRODUCTS_ROUTE,
    },
    // Sorted, searched and paged variants shouldn't compete with the main listing.
    robots:
      Object.keys(params).length === 0 || onlyCategory
        ? undefined
        : { index: false, follow: true },
  };
};

const ProductsPage = async ({ searchParams }) => {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page) || 1);
  const filters = Object.fromEntries(
    Object.entries(params).filter(([key]) => key !== "page")
  );

  const [products, count] = await Promise.all([
    getProducts({
      ...filters,
      limit: PRODUCTS_PAGE_SIZE,
      offset: (page - 1) * PRODUCTS_PAGE_SIZE,
    }),
    // The grid still renders if only the count fails.
    getTotalCount(filters).catch(() => null),
  ]);
  const total = count?.totalCount ?? products.length;
  const filtered = FILTER_KEYS.some((k) => params[k]);
  // Remount the filter panel whenever the query changes so it reflects the URL.
  const filterKey = new URLSearchParams(filters).toString();

  return (
    <section className="container-page py-12 bg-paper dark:bg-[#0e0f12] transition-colors duration-300">
      <header className="mb-8 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="eyebrow dark:text-[#8b8fa8] mb-2">Shop</p>
          <h1 className="font-display text-3xl font-semibold text-ink dark:text-[#f0efe8]">
            {headingFor(params)}
          </h1>
        </div>
        <p className="font-mono text-xs text-slate dark:text-[#8b8fa8]">
          {total} {total === 1 ? "product" : "products"}
          {filtered && (
            <>
              {" · "}
              <Link
                href={PRODUCTS_ROUTE}
                className="underline hover:text-ink dark:hover:text-[#f0efe8]"
              >
                Clear filters
              </Link>
            </>
          )}
        </p>
      </header>

      <div className="grid lg:grid-cols-[250px_1fr] gap-8 items-start">
        <Suspense>
          <ProductFilter key={filterKey} />
        </Suspense>

        <div>
          {products.length === 0 ? (
            page > 1 && total > 0 ? (
              <EmptyState
                title="Nothing on this page"
                description="The list is shorter than it was. Head back to the first page."
                action={
                  <Link
                    href={`${PRODUCTS_ROUTE}?${new URLSearchParams(filters)}`}
                    className="btn-secondary"
                  >
                    Go to page 1
                  </Link>
                }
              />
            ) : (
              <EmptyState
                title="No matches"
                description={
                  filtered
                    ? "Nothing fits those filters yet. Try widening the price range or clearing a filter."
                    : "There are no products listed yet. Check back soon."
                }
                action={
                  filtered ? (
                    <Link href={PRODUCTS_ROUTE} className="btn-secondary">
                      Clear all filters
                    </Link>
                  ) : null
                }
              />
            )
          ) : (
            <>
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {products.map((product, i) => (
                  <ProductCard key={product._id} product={product} index={i} />
                ))}
              </div>
              <Suspense>
                <Pagination total={total} pageSize={PRODUCTS_PAGE_SIZE} />
              </Suspense>
            </>
          )}
        </div>
      </div>
    </section>
  );
};

export default ProductsPage;
