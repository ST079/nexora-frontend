"use client";
import { DEFAULT_MIN_Price, DEFAULT_SORT } from "@/constants/defaults";
import { SORT_OPTIONS } from "@/constants/sort";
import { SlidersHorizontal } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useState } from "react";

const ProductFilter = () => {
  const router = useRouter();
  const [minPrice, setMinPrice] = useState(DEFAULT_MIN_Price);
  const [maxPrice, setMaxPrice] = useState("");
  const [sort, setSort] = useState(DEFAULT_SORT);

  const ApplyFilter = () => {
    const params = new URLSearchParams();
    params.set("min", minPrice);
    params.set("max", maxPrice);
    params.set("sort", sort);

    router.push(`?${params.toString()}`);
  };

  return (
    <div className="card-frame p-5 space-y-5 lg:sticky lg:top-24">
      <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
        <div>
          <p className="eyebrow mb-2">For You</p>
          <h1 className="font-display text-3xl font-semibold">All listings</h1>
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
          <button className="btn-secondary lg:hidden">
            <SlidersHorizontal size={14} /> Filters
          </button>
        </div>
      </div>

      <div>
        <p className="eyebrow mb-2">Category</p>
        <input
          // value={draft.category}
          placeholder="e.g. Smartphones"
          className="field"
        />
      </div>
      <div>
        <p className="eyebrow mb-2">Brand</p>
        <input
          // value={draft.brand}
          placeholder="apple,xiaomi"
          className="field"
        />
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
      <button className="btn-primary w-full" onClick={ApplyFilter}>
        Apply filters
      </button>
      <button className="btn-ghost w-full justify-center">Reset</button>
    </div>
  );
};

export default ProductFilter;
