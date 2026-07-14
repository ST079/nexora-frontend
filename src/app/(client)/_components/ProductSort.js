"use client";
import { DEFAULT_SORT } from "@/constants/Defaults";
import { SORT_OPTIONS } from "@/constants/Sort";
import { SlidersHorizontal } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useState } from "react";

const ProductSort = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [sort, setSort] = useState(searchParams.get("sort") ?? DEFAULT_SORT);

  return (
    <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
      <div>
        <p className="eyebrow mb-2">For You</p>
        <h1 className="font-display text-3xl font-semibold">All listings</h1>
      </div>
      <div className="flex items-center gap-3">
        <select
          value={sort}
          onChange={(e) => {
            const value = e.target.value;
            setSort(value);
            router.push(`?sort=${value}`);
          }}
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
  );
};

export default ProductSort;
