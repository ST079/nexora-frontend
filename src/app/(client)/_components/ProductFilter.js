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

  const [minPrice, setMinPrice] = useState(DEFAULT_MIN_Price);
  const [maxPrice, setMaxPrice] = useState(DEFAULT_MAX_Price);
  const [sort, setSort] = useState(DEFAULT_SORT);
  const [category, setCategory] = useState(DEFAULT_CATEGORY);
  const [selectedBrands, setSelectedBrands] = useState(DEFAULT_BRAND);
  const [input, setInput] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);


  const addBrand = (brand) => {
    if (!selectedBrands.includes(brand)) {
      setSelectedBrands([...selectedBrands, brand]);
    }
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
    setBrand(DEFAULT_BRAND);
    setCategory(DEFAULT_CATEGORY);
    setMaxPrice(DEFAULT_MAX_Price);
    setMinPrice(DEFAULT_MIN_Price);
  };

  return (
    <div>
      <div>
        <button
          onClick={() => setFiltersOpen((o) => !o)}
          className="btn-secondary lg:hidden"
        >
          <SlidersHorizontal size={14} /> Filters
        </button>
      </div>
      <aside className={`${filtersOpen ? "block" : "hidden"} lg:block`}>
        <div className="card-frame p-5 space-y-5 lg:sticky lg:top-24">
          <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
            <div>
              <p className="eyebrow mb-2">For You</p>
              <h1 className="font-display text-3xl font-semibold">
                All listings
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="field max-w-[180px] cursor-pointer"
              >
                {SORT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <p className="eyebrow mb-2">Category</p>
            <input
              value={category}
              placeholder="e.g. Smartphones"
              className="field"
              list="product-categories"
              onChange={(e) => setCategory(e.target.value)}
            />
            <datalist id="product-categories">
              {categories.map((category, index) => (
                <option key={index} value={category.label} />
              ))}
            </datalist>
          </div>

          <div>
            <p className="eyebrow mb-2">Brand</p>

            <div className="field flex flex-wrap gap-2 items-center">
              {selectedBrands.map((brand) => (
                <span
                  key={brand}
                  className="inline-flex items-center gap-1 bg-ink text-paper px-2 py-1 text-xs"
                >
                  {brand}
                  <button type="button" onClick={() => removeBrand(brand)}>
                    <X size={12} />
                  </button>
                </span>
              ))}

              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Search brand..."
                className="flex-1 outline-none bg-transparent"
              />
            </div>

            {input && (
              <div className="border border-hairline bg-paper mt-1">
                {filteredBrands.map((brand) => (
                  <button
                    key={brand.label}
                    onClick={() => addBrand(brand.label)}
                    className="block w-full text-left px-3 py-2 hover:bg-gray-100"
                  >
                    {brand.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <p className="eyebrow mb-2">Price range (Rs.)</p>
            <div className="flex items-center gap-2">
              <input
                value={minPrice}
                placeholder="Min"
                type="number"
                min={DEFAULT_MIN_Price}
                className="field"
                onChange={(e) => setMinPrice(e.target.value)}
              />
              <span className="text-slate">–</span>
              <input
                value={maxPrice}
                placeholder="Max"
                type="number"
                className="field"
                onChange={(e) => setMaxPrice(e.target.value)}
              />
            </div>
          </div>
          <button className="btn-primary w-full" onClick={applyFilter}>
            Apply filters
          </button>
          <button
            onClick={clearFilters}
            className="btn-ghost w-full justify-center"
          >
            Reset
          </button>
        </div>
      </aside>
    </div>
  );
};

export default ProductFilter;
