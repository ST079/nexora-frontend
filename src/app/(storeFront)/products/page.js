import { Suspense } from "react";
import Link from "next/link";
import { X } from "lucide-react";
import ProductCard from "@/components/ProductCard";
import ProductFilter from "@/components/ProductFilter";
import Pagination from "@/components/Pagination";
import EmptyState from "@/components/EmptyState";
import { getProducts, getTotalCount } from "@/api/product";
import { categories } from "@/constants/categories";
import { PRODUCTS_PAGE_SIZE } from "@/constants/pagination";
import { PRODUCTS_ROUTE } from "@/constants/routes";
import { formatNPR } from "@/utils/format";

const FILTER_KEYS = ["category", "brands", "min", "max", "name"];

const headingFor = ({ category, name }) => {
  if (name) return `Results for “${name}”`;
  return category || "All products";
};

// A link to the listing with `changes` applied on top of the current filters.
// Any page number is dropped because the result set changes.
const hrefWith = (filters, changes) => {
  const next = { ...filters, ...changes };
  const params = new URLSearchParams(
    Object.entries(next).filter(([, v]) => v !== undefined && v !== null && v !== "")
  );
  const query = params.toString();
  return query ? `${PRODUCTS_ROUTE}?${query}` : PRODUCTS_ROUTE;
};

// One removable pill per active filter, so undoing a choice is a single tap.
const activePills = (filters) => {
  const pills = [];
  if (filters.name) pills.push({ label: `“${filters.name}”`, href: hrefWith(filters, { name: undefined }) });
  if (filters.category)
    pills.push({ label: filters.category, href: hrefWith(filters, { category: undefined }) });
  const brands = (filters.brands ?? "").split(",").map((b) => b.trim()).filter(Boolean);
  brands.forEach((b) =>
    pills.push({
      label: b,
      href: hrefWith(filters, { brands: brands.filter((x) => x !== b).join(",") || undefined }),
    })
  );
  const min = Number(filters.min) > 0 ? Number(filters.min) : null;
  const max = filters.max !== undefined && filters.max !== "" ? Number(filters.max) : null;
  if (min !== null || max !== null) {
    const label =
      min !== null && max !== null
        ? `${formatNPR(min)} – ${formatNPR(max)}`
        : min !== null
          ? `From ${formatNPR(min)}`
          : `Up to ${formatNPR(max)}`;
    pills.push({ label, href: hrefWith(filters, { min: undefined, max: undefined }) });
  }
  return pills;
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
  const pills = activePills(filters);
  // Keep a category from an old link visible as a chip even if it's not in the list.
  const chipLabels = categories.map((c) => c.label);
  if (filters.category && !chipLabels.includes(filters.category)) chipLabels.push(filters.category);

  return (
    <section className="container-page pb-16 pt-6 lg:pt-10">
      <header className="relative mb-6 overflow-hidden rounded-4xl bg-signal-tint px-6 py-8 sm:px-10 sm:py-10">
        <span
          aria-hidden
          className="pointer-events-none absolute -right-10 -top-16 h-56 w-56 animate-drift rounded-full bg-marigold/40 blur-3xl"
        />
        <span
          aria-hidden
          className="pointer-events-none absolute -bottom-20 right-1/3 h-48 w-48 animate-drift rounded-full bg-signal/25 blur-3xl"
          style={{ animationDelay: "-6s" }}
        />
        <div className="relative flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow mb-2 text-signal-dim">Shop</p>
            <h1 className="font-display text-4xl font-bold tracking-tight text-ink sm:text-5xl">
              {headingFor(params)}
            </h1>
          </div>
          <p className="rounded-full bg-panel/80 px-3.5 py-1.5 font-mono text-xs text-slate-dim shadow-soft">
            <span className="font-semibold text-ink">{total}</span>{" "}
            {total === 1 ? "product" : "products"}
          </p>
        </div>
      </header>

      {/* Category chips: switch in one tap, other filters stay */}
      <nav aria-label="Categories" className="-mx-4 mb-4 sm:-mx-5 md:mx-0">
        <ul className="no-scrollbar flex gap-2 overflow-x-auto px-4 py-1 sm:px-5 md:flex-wrap md:px-0">
          <li>
            <Link
              href={hrefWith(filters, { category: undefined })}
              aria-current={!filters.category ? "page" : undefined}
              className={`chip whitespace-nowrap py-2 ${!filters.category ? "chip-active" : ""}`}
            >
              All
            </Link>
          </li>
          {chipLabels.map((label) => {
            const active = filters.category === label;
            const Icon = categories.find((c) => c.label === label)?.icon;
            return (
              <li key={label}>
                <Link
                  href={hrefWith(filters, { category: active ? undefined : label })}
                  aria-current={active ? "page" : undefined}
                  className={`chip whitespace-nowrap py-2 ${active ? "chip-active" : ""}`}
                >
                  {Icon && <Icon size={13} aria-hidden />}
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {pills.length > 0 && (
        <div className="mb-6 flex flex-wrap items-center gap-2">
          <span className="eyebrow mr-1">Active</span>
          {pills.map((p) => (
            <Link
              key={p.label}
              href={p.href}
              className="group inline-flex items-center gap-1.5 rounded-full bg-ink py-1.5 pl-3 pr-2 text-xs font-medium text-paper transition-colors hover:bg-danger"
              aria-label={`Remove filter ${p.label}`}
            >
              {p.label}
              <span className="grid h-4 w-4 place-items-center rounded-full bg-paper/20 transition-transform group-hover:rotate-90">
                <X size={10} strokeWidth={3} />
              </span>
            </Link>
          ))}
          {filtered && (
            <Link href={PRODUCTS_ROUTE} className="btn-ghost px-3 py-1.5 text-xs text-slate">
              Clear all
            </Link>
          )}
        </div>
      )}

      <div className="grid items-start gap-6 lg:grid-cols-[264px_1fr] lg:gap-8">
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
              <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3">
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
