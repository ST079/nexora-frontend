"use client";

import { brands } from "@/constants/brands";
import {
  DEFAULT_BRAND,
  DEFAULT_CATEGORY,
  DEFAULT_MAX_Price,
  DEFAULT_MIN_Price,
  DEFAULT_SORT,
} from "@/constants/defaults";
import { SORT_OPTIONS } from "@/constants/sort";
import { motion } from "framer-motion";
import { ArrowUpDown, Check, SlidersHorizontal, X } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { spring } from "@/utils/motion";

const parseBrands = (value) =>
  (value ?? "")
    .split(",")
    .map((b) => b.trim())
    .filter(Boolean);

// One-tap price bands. Max is left empty for the open-ended one.
const PRICE_PRESETS = [
  { label: "Under 5k", min: 0, max: 5000 },
  { label: "5k – 20k", min: 5000, max: 20000 },
  { label: "20k – 50k", min: 20000, max: 50000 },
  { label: "50k +", min: 50000, max: "" },
];

const Section = ({ title, children, className = "" }) => (
  <fieldset className={className}>
    <legend className="eyebrow mb-3">{title}</legend>
    {children}
  </fieldset>
);

// The products page remounts this (keyed on the query) whenever the URL
// changes, so initial state from the URL is always current.
//
// Desktop: a sticky card beside the grid. Phones: a toolbar with a sort menu
// and a Filters button that slides the same form up as a bottom sheet.
const ProductFilter = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [minPrice, setMinPrice] = useState(
    () => searchParams.get("min") ?? DEFAULT_MIN_Price
  );
  const [maxPrice, setMaxPrice] = useState(
    () => searchParams.get("max") ?? DEFAULT_MAX_Price
  );
  const [sort, setSort] = useState(() => searchParams.get("sort") ?? DEFAULT_SORT);
  // Category is picked from the chips above the grid; it's kept here so
  // applying the other filters doesn't drop it.
  const [category] = useState(() => searchParams.get("category") ?? DEFAULT_CATEGORY);
  const [selectedBrands, setSelectedBrands] = useState(() => {
    const fromUrl = parseBrands(searchParams.get("brands"));
    return fromUrl.length ? fromUrl : DEFAULT_BRAND;
  });
  const [filtersOpen, setFiltersOpen] = useState(false);

  const activeCount = [
    searchParams.get("brands"),
    Number(searchParams.get("min")) > 0 || searchParams.get("max") ? "price" : null,
  ].filter(Boolean).length;

  const priceError =
    minPrice !== "" && maxPrice !== "" && Number(minPrice) > Number(maxPrice)
      ? "Min price can't be above max."
      : null;

  // Brands from the list, plus any in the URL that aren't in it.
  const brandOptions = [
    ...brands.map((b) => b.label),
    ...selectedBrands.filter((b) => !brands.some((x) => x.label === b)),
  ];

  const toggleBrand = (brand) => {
    setSelectedBrands((current) =>
      current.includes(brand) ? current.filter((b) => b !== brand) : [...current, brand]
    );
  };

  const presetActive = (p) =>
    Number(minPrice || 0) === p.min && String(maxPrice ?? "") === String(p.max);

  const pickPreset = (p) => {
    if (presetActive(p)) {
      setMinPrice(DEFAULT_MIN_Price);
      setMaxPrice(DEFAULT_MAX_Price);
    } else {
      setMinPrice(p.min);
      setMaxPrice(p.max);
    }
  };

  // The sheet locks page scroll and closes on Escape while it is open.
  useEffect(() => {
    if (!filtersOpen) return;
    const onKey = (e) => e.key === "Escape" && setFiltersOpen(false);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [filtersOpen]);

  const navigate = (next) => {
    // Only non-default values go in the URL; any page number is dropped.
    const params = new URLSearchParams();
    if (next.category?.trim()) params.set("category", next.category.trim());
    if (next.brands?.length) params.set("brands", next.brands.join(","));
    if (Number(next.min) > 0) params.set("min", String(next.min));
    if (next.max !== "" && next.max != null) params.set("max", String(next.max));
    if (next.sort && next.sort !== DEFAULT_SORT) params.set("sort", next.sort);
    const name = searchParams.get("name");
    if (name) params.set("name", name);
    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
    setFiltersOpen(false);
  };

  const applyFilter = (e) => {
    e.preventDefault();
    if (priceError) return;
    navigate({
      category,
      brands: selectedBrands,
      min: minPrice,
      max: maxPrice,
      sort,
    });
  };

  // Reset clears the panel's own filters (brand, price, sort) but keeps the
  // category chip and any search term, which have their own controls.
  const clearFilters = () => {
    setSort(DEFAULT_SORT);
    setSelectedBrands(DEFAULT_BRAND);
    setMaxPrice(DEFAULT_MAX_Price);
    setMinPrice(DEFAULT_MIN_Price);
    navigate({ category, sort: DEFAULT_SORT });
  };

  // Sorting applies at once; it isn't really a filter.
  const changeSort = (value) => {
    setSort(value);
    const params = new URLSearchParams(searchParams.toString());
    if (value === DEFAULT_SORT) params.delete("sort");
    else params.set("sort", value);
    params.delete("page");
    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  };

  return (
    <div className="lg:sticky lg:top-24">
      {/* Phone toolbar */}
      <div className="flex items-center gap-2 lg:hidden">
        <button
          type="button"
          onClick={() => setFiltersOpen(true)}
          aria-expanded={filtersOpen}
          aria-controls="product-filters"
          className="btn-secondary flex-1 py-2.5"
        >
          <SlidersHorizontal size={15} /> Filters
          {activeCount > 0 && (
            <span className="grid h-5 min-w-5 place-items-center rounded-full bg-signal px-1 font-mono text-[10px] text-on-signal">
              {activeCount}
            </span>
          )}
        </button>
        <label className="relative flex flex-1 items-center">
          <span className="sr-only">Sort by</span>
          <ArrowUpDown size={14} className="pointer-events-none absolute left-4 text-slate" aria-hidden />
          <select
            value={sort}
            onChange={(e) => changeSort(e.target.value)}
            className="w-full cursor-pointer appearance-none rounded-full border border-ink/15 bg-panel py-2.5 pl-10 pr-4 text-sm font-semibold text-ink outline-none focus:border-signal"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      {/* Sheet backdrop (phones only) */}
      <button
        type="button"
        tabIndex={-1}
        aria-label="Close filters"
        onClick={() => setFiltersOpen(false)}
        className={`fixed inset-0 z-57 bg-night/50 backdrop-blur-sm transition-opacity duration-300 lg:hidden ${
          filtersOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      <aside
        id="product-filters"
        aria-label="Product filters"
        className={`fixed inset-x-0 bottom-0 z-58 max-h-[85dvh] overflow-y-auto rounded-t-4xl border-t border-hairline bg-panel shadow-lift transition-[translate,visibility] duration-500 ease-out-expo lg:visible lg:static lg:z-auto lg:max-h-none lg:translate-y-0 lg:overflow-visible lg:rounded-card lg:border lg:shadow-none ${
          filtersOpen ? "visible translate-y-0" : "invisible translate-y-full"
        }`}
      >
        <form onSubmit={applyFilter} className="flex flex-col">
          {/* Sheet handle and title (phones) */}
          <div className="sticky top-0 z-10 flex items-center justify-between bg-panel px-5 pb-3 pt-3 lg:hidden">
            <span aria-hidden className="absolute left-1/2 top-2 h-1 w-10 -translate-x-1/2 rounded-full bg-hairline" />
            <p className="mt-3 font-display text-xl font-bold text-ink">Filters</p>
            <button
              type="button"
              onClick={() => setFiltersOpen(false)}
              className="icon-btn mt-3"
              aria-label="Close filters"
            >
              <X size={16} />
            </button>
          </div>

          <div className="space-y-6 p-5">
            <Section title="Sort by" className="hidden lg:block">
              <div className="flex flex-col gap-1" role="radiogroup" aria-label="Sort by">
                {SORT_OPTIONS.map((o) => {
                  const on = sort === o.value;
                  return (
                    <button
                      key={o.value}
                      type="button"
                      role="radio"
                      aria-checked={on}
                      onClick={() => changeSort(o.value)}
                      className={`relative flex items-center justify-between rounded-xl px-3 py-2 text-left text-sm transition-colors ${
                        on ? "font-semibold text-ink" : "text-slate hover:bg-mist hover:text-ink"
                      }`}
                    >
                      {on && (
                        <motion.span
                          layoutId="sort-active"
                          transition={spring}
                          className="absolute inset-0 rounded-xl bg-signal-tint"
                        />
                      )}
                      <span className="relative">{o.label}</span>
                      {on && <Check size={14} className="relative text-signal" />}
                    </button>
                  );
                })}
              </div>
            </Section>

            <Section title="Brand">
              <div className="flex flex-wrap gap-1.5">
                {brandOptions.map((brand) => {
                  const on = selectedBrands.includes(brand);
                  return (
                    <button
                      key={brand}
                      type="button"
                      aria-pressed={on}
                      onClick={() => toggleBrand(brand)}
                      className={`chip ${on ? "chip-active" : ""}`}
                    >
                      {on && <Check size={12} strokeWidth={3} aria-hidden />}
                      {brand}
                    </button>
                  );
                })}
              </div>
            </Section>

            <Section title="Price (Rs.)">
              <div className="mb-3 grid grid-cols-2 gap-1.5">
                {PRICE_PRESETS.map((p) => {
                  const on = presetActive(p);
                  return (
                    <button
                      key={p.label}
                      type="button"
                      aria-pressed={on}
                      onClick={() => pickPreset(p)}
                      className={`chip justify-center py-2 ${on ? "chip-active" : ""}`}
                    >
                      {p.label}
                    </button>
                  );
                })}
              </div>
              <div className="flex items-center gap-2">
                <input
                  value={minPrice}
                  placeholder="Min"
                  aria-label="Minimum price"
                  type="number"
                  inputMode="numeric"
                  min={0}
                  className="field py-2.5"
                  onChange={(e) => setMinPrice(e.target.value)}
                />
                <span aria-hidden className="text-slate-light">
                  –
                </span>
                <input
                  value={maxPrice}
                  placeholder="Max"
                  aria-label="Maximum price"
                  type="number"
                  inputMode="numeric"
                  min={0}
                  className="field py-2.5"
                  onChange={(e) => setMaxPrice(e.target.value)}
                />
              </div>
              {priceError && (
                <p role="alert" className="mt-2 font-mono text-[11px] text-danger">
                  {priceError}
                </p>
              )}
            </Section>
          </div>

          <div className="sticky bottom-0 flex gap-2 border-t border-hairline bg-panel p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] lg:static lg:flex-col lg:border-0 lg:bg-transparent lg:px-5 lg:pb-5 lg:pt-0">
            <button
              type="button"
              onClick={clearFilters}
              className="btn-secondary flex-1 lg:order-2 lg:border-0 lg:bg-transparent lg:py-2 lg:text-slate lg:hover:text-ink lg:hover:shadow-none"
            >
              Reset
            </button>
            <button type="submit" className="btn-primary flex-2 lg:w-full" disabled={!!priceError}>
              Apply filters
            </button>
          </div>
        </form>
      </aside>
    </div>
  );
};

export default ProductFilter;
