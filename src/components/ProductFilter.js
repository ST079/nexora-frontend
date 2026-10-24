"use client";

import { brands } from "@/constants/brands";
import { categories } from "@/constants/categories";
import {
  DEFAULT_BRAND,
  DEFAULT_CATEGORY,
  DEFAULT_MAX_Price,
  DEFAULT_MIN_Price,
  DEFAULT_SORT,
} from "@/constants/defaults";
import { SORT_OPTIONS } from "@/constants/sort";
import { SlidersHorizontal, X } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

const fieldClass =
  "field dark:border-[#262932] dark:bg-[#16181f] dark:text-[#f0efe8] dark:placeholder:text-[#5b5e72]";

const parseBrands = (value) =>
  (value ?? "")
    .split(",")
    .map((b) => b.trim())
    .filter(Boolean);

// The products page remounts this (keyed on the query) whenever the URL
// changes, so initial state from the URL is always current.
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
  const [category, setCategory] = useState(
    () => searchParams.get("category") ?? DEFAULT_CATEGORY
  );
  const [selectedBrands, setSelectedBrands] = useState(() => {
    const fromUrl = parseBrands(searchParams.get("brands"));
    return fromUrl.length ? fromUrl : DEFAULT_BRAND;
  });
  const [input, setInput] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);

  const activeCount = [
    searchParams.get("category"),
    searchParams.get("brands"),
    Number(searchParams.get("min")) > 0 ? "min" : null,
    searchParams.get("max"),
  ].filter(Boolean).length;

  const priceError =
    minPrice !== "" && maxPrice !== "" && Number(minPrice) > Number(maxPrice)
      ? "Min price can't be above max."
      : null;

  const addBrand = (brand) => {
    if (!selectedBrands.includes(brand))
      setSelectedBrands([...selectedBrands, brand]);
    setInput("");
  };

  const removeBrand = (brand) => {
    setSelectedBrands(selectedBrands.filter((b) => b !== brand));
  };

  const filteredBrands = brands.filter(
    (b) =>
      b.label.toLowerCase().includes(input.trim().toLowerCase()) &&
      !selectedBrands.includes(b.label)
  );

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

  const clearFilters = () => {
    setSort(DEFAULT_SORT);
    setSelectedBrands(DEFAULT_BRAND);
    setCategory(DEFAULT_CATEGORY);
    setMaxPrice(DEFAULT_MAX_Price);
    setMinPrice(DEFAULT_MIN_Price);
    navigate({ sort: DEFAULT_SORT });
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
    <div>
      <div className="flex items-center gap-2 lg:hidden">
        <button
          type="button"
          onClick={() => setFiltersOpen((o) => !o)}
          aria-expanded={filtersOpen}
          aria-controls="product-filters"
          className="btn-secondary"
        >
          <SlidersHorizontal size={14} /> Filters
          {activeCount > 0 && (
            <span className="min-w-5 px-1 bg-ink text-paper dark:bg-[#f0efe8] dark:text-[#0e0f12] font-mono text-[10px]">
              {activeCount}
            </span>
          )}
        </button>
      </div>

      <aside
        id="product-filters"
        aria-label="Product filters"
        className={`${filtersOpen ? "block mt-3" : "hidden"} lg:block`}
      >
        <form
          onSubmit={applyFilter}
          className="card-frame p-5 space-y-5 lg:sticky lg:top-24 dark:border-[#262932]"
        >
          <div>
            <label htmlFor="filter-sort" className="eyebrow dark:text-[#8b8fa8] mb-2 block">
              Sort by
            </label>
            <select
              id="filter-sort"
              value={sort}
              onChange={(e) => changeSort(e.target.value)}
              className={`${fieldClass} cursor-pointer`}
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="filter-category" className="eyebrow dark:text-[#8b8fa8] mb-2 block">
              Category
            </label>
            <input
              id="filter-category"
              value={category}
              placeholder="e.g. Smartphones"
              className={fieldClass}
              list="product-categories"
              onChange={(e) => setCategory(e.target.value)}
            />
            <datalist id="product-categories">
              {categories.map((c) => (
                <option key={c.label} value={c.label} />
              ))}
            </datalist>
          </div>

          <div>
            <label htmlFor="filter-brand" className="eyebrow dark:text-[#8b8fa8] mb-2 block">
              Brand
            </label>

            <div className="field flex flex-wrap gap-2 items-center dark:border-[#262932] dark:bg-[#16181f]">
              {selectedBrands.map((brand) => (
                <span
                  key={brand}
                  className="inline-flex items-center gap-1 bg-ink dark:bg-[#f0efe8] text-paper dark:text-[#0e0f12] px-2 py-1 text-xs"
                >
                  {brand}
                  <button
                    type="button"
                    onClick={() => removeBrand(brand)}
                    aria-label={`Remove ${brand}`}
                    className="hover:text-signal dark:hover:text-signal transition-colors"
                  >
                    <X size={12} />
                  </button>
                </span>
              ))}

              <input
                id="filter-brand"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  // Enter picks the top match instead of submitting the form.
                  if (e.key === "Enter" && input.trim()) {
                    e.preventDefault();
                    if (filteredBrands[0]) addBrand(filteredBrands[0].label);
                  }
                  if (e.key === "Backspace" && !input && selectedBrands.length)
                    removeBrand(selectedBrands[selectedBrands.length - 1]);
                }}
                placeholder={selectedBrands.length ? "Add another…" : "Search brand…"}
                autoComplete="off"
                className="flex-1 min-w-24 outline-none bg-transparent text-ink dark:text-[#f0efe8] placeholder:text-slate-light dark:placeholder:text-[#5b5e72] text-sm"
              />
            </div>

            {input.trim() && (
              <div className="border border-hairline dark:border-[#262932] bg-paper dark:bg-[#16181f] mt-1 max-h-48 overflow-y-auto">
                {filteredBrands.length === 0 ? (
                  <p className="px-3 py-2 text-sm text-slate dark:text-[#8b8fa8]">
                    No brands found
                  </p>
                ) : (
                  filteredBrands.map((brand) => (
                    <button
                      type="button"
                      key={brand.label}
                      onClick={() => addBrand(brand.label)}
                      className="block w-full text-left px-3 py-2 text-sm text-ink dark:text-[#f0efe8] hover:bg-hairline/40 dark:hover:bg-[#262932] transition-colors"
                    >
                      {brand.label}
                    </button>
                  ))
                )}
              </div>
            )}
          </div>

          <fieldset>
            <legend className="eyebrow dark:text-[#8b8fa8] mb-2">Price range (Rs.)</legend>
            <div className="flex items-center gap-2">
              <input
                value={minPrice}
                placeholder="Min"
                aria-label="Minimum price"
                type="number"
                inputMode="numeric"
                min={0}
                className={fieldClass}
                onChange={(e) => setMinPrice(e.target.value)}
              />
              <span aria-hidden className="text-slate dark:text-[#8b8fa8]">
                –
              </span>
              <input
                value={maxPrice}
                placeholder="Max"
                aria-label="Maximum price"
                type="number"
                inputMode="numeric"
                min={0}
                className={fieldClass}
                onChange={(e) => setMaxPrice(e.target.value)}
              />
            </div>
            {priceError && (
              <p role="alert" className="mt-1.5 font-mono text-[11px] text-danger">
                {priceError}
              </p>
            )}
          </fieldset>

          <button type="submit" className="btn-primary w-full" disabled={!!priceError}>
            Apply filters
          </button>
          <button
            type="button"
            onClick={clearFilters}
            className="btn-ghost w-full justify-center dark:text-[#8b8fa8] dark:hover:text-[#f0efe8]"
          >
            Reset
          </button>
        </form>
      </aside>
    </div>
  );
};

export default ProductFilter;
