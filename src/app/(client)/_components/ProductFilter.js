"use client";
import { useRouter } from "next/navigation";
import React, { useState } from "react";

const ProductFilter = () => {
  const router = useRouter();

  const ApplyFilter = () => {
    router.push();
  };

  return (
    <div className="card-frame p-5 space-y-5 lg:sticky lg:top-24">
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
            // value={draft.min}

            placeholder="Min"
            type="number"
            className="field"
          />
          <span className="text-slate">–</span>
          <input
            // value={draft.max}

            placeholder="Max"
            type="number"
            className="field"
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
