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
import { useRouter } from "next/navigation";
import React, { useState } from "react";

const ProductFilter = () => {
  const router = useRouter();

  const [minPrice, setMinPrice]         = useState(DEFAULT_MIN_Price);
  const [maxPrice, setMaxPrice]         = useState(DEFAULT_MAX_Price);
  const [sort, setSort]                 = useState(DEFAULT_SORT);
  const [category, setCategory]         = useState(DEFAULT_CATEGORY);
  const [selectedBrands, setSelectedBrands] = useState(DEFAULT_BRAND);
  const [input, setInput]               = useState("");
  const [filtersOpen, setFiltersOpen]   = useState(false);

  const addBrand = (brand) => {
    if (!selectedBrands.includes(brand)) setSelectedBrands([...selectedBrands, brand]);
    setInput("");
  };

  const removeBrand = (brand) => {
    setSelectedBrands(selectedBrands.filter((b) => b !== brand));
  };

  const filteredBrands = brands.filter(
    (b) =>
      b.label.toLowerCase().includes(input.toLowerCase()) &&
      !selectedBrands.includes(b.label),
  );

  const applyFilter = () => {
    const params = new URLSearchParams();
    params.set("min", minPrice);
    params.set("max", maxPrice);
    params.set("sort", sort);
    params.set("category", category);
    params.set("brands", selectedBrands.join(","));
    router.push(`?${params.toString()}`);
  };

  const clearFilters = () => {
    setSort(DEFAULT_SORT);
    setSelectedBrands(DEFAULT_BRAND);
    setCategory(DEFAULT_CATEGORY);
    setMaxPrice(DEFAULT_MAX_Price);
    setMinPrice(DEFAULT_MIN_Price);
  };

  return (
    <div>
      {/* Mobile toggle */}
      <div>
        <button
          onClick={() => setFiltersOpen((o) => !o)}
          className="btn-secondary lg:hidden"
        >
          <SlidersHorizontal size={14} /> Filters
        </button>
      </div>

      <aside className={`${filtersOpen ? "block" : "hidden"} lg:block`}>
        <div className="card-frame p-5 space-y-5 lg:sticky lg:top-24 items-start">

          {/* Header + sort */}
          <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
            <div>
              <p className="eyebrow dark:text-[#8b8fa8] mb-2">For You</p>
              <h1 className="font-display text-3xl font-semibold text-ink dark:text-[#f0efe8]">
                All listings
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="field max-w-[180px] cursor-pointer dark:border-[#262932] dark:bg-[#16181f] dark:text-[#f0efe8]"
              >
                {SORT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Category */}
          <div>
            <p className="eyebrow dark:text-[#8b8fa8] mb-2">Category</p>
            <input
              value={category}
              placeholder="e.g. Smartphones"
              className="field dark:border-[#262932] dark:bg-[#16181f] dark:text-[#f0efe8] dark:placeholder:text-[#5b5e72]"
              list="product-categories"
              onChange={(e) => setCategory(e.target.value)}
            />
            <datalist id="product-categories">
              {categories.map((category, index) => (
                <option key={index} value={category.label} />
              ))}
            </datalist>
          </div>

          {/* Brand */}
          <div>
            <p className="eyebrow dark:text-[#8b8fa8] mb-2">Brand</p>

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
                    className="hover:text-signal dark:hover:text-signal transition-colors"
                  >
                    <X size={12} />
                  </button>
                </span>
              ))}

              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Search brand..."
                className="flex-1 outline-none bg-transparent text-ink dark:text-[#f0efe8] placeholder:text-slate-light dark:placeholder:text-[#5b5e72] text-sm"
              />
            </div>

            {/* Brand dropdown */}
            {input && (
              <div className="border border-hairline dark:border-[#262932] bg-paper dark:bg-[#16181f] mt-1">
                {filteredBrands.length === 0 ? (
                  <p className="px-3 py-2 text-sm text-slate dark:text-[#8b8fa8]">
                    No brands found
                  </p>
                ) : (
                  filteredBrands.map((brand) => (
                    <button
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

          {/* Price range */}
          <div>
            <p className="eyebrow dark:text-[#8b8fa8] mb-2">Price range (Rs.)</p>
            <div className="flex items-center gap-2">
              <input
                value={minPrice}
                placeholder="Min"
                type="number"
                min={DEFAULT_MIN_Price}
                className="field dark:border-[#262932] dark:bg-[#16181f] dark:text-[#f0efe8] dark:placeholder:text-[#5b5e72]"
                onChange={(e) => setMinPrice(e.target.value)}
              />
              <span className="text-slate dark:text-[#8b8fa8]">–</span>
              <input
                value={maxPrice}
                placeholder="Max"
                type="number"
                className="field dark:border-[#262932] dark:bg-[#16181f] dark:text-[#f0efe8] dark:placeholder:text-[#5b5e72]"
                onChange={(e) => setMaxPrice(e.target.value)}
              />
            </div>
          </div>

          <button className="btn-primary w-full" onClick={applyFilter}>
            Apply filters
          </button>
          <button onClick={clearFilters} className="btn-ghost w-full justify-center">
            Reset
          </button>
        </div>
      </aside>
    </div>
  );
};

export default ProductFilter;