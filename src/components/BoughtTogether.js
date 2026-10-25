"use client";

import { motion } from "framer-motion";
import { ShoppingBag } from "lucide-react";
import { revealUp } from "@/utils/motion";
import ProductCard from "@/components/ProductCard";
import { getBoughtTogether } from "@/api/product";
import { useResource } from "@/hooks/useResource";

// Apriori rules mined from past orders on the backend. A pair only counts
// once at least two orders contain it, so most products show nothing here;
// the section stays hidden instead of flashing a skeleton.
const BoughtTogether = ({ productId }) => {
  const { data, loading } = useResource(`bought|${productId}`, () =>
    getBoughtTogether(productId, 4)
  );
  const products = Array.isArray(data) ? data : [];

  if (loading || products.length === 0) return null;

  return (
    <section className="mt-20 lg:mt-28" aria-labelledby="bought-together-title">
      <motion.div {...revealUp()} className="mb-6">
        <p className="eyebrow mb-2">Frequently bought together</p>
        <h2
          id="bought-together-title"
          className="font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl"
        >
          Often bought <span className="marker">with this</span>
        </h2>
      </motion.div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {products.map((product, i) => (
          <div key={product._id} className="min-w-0">
            <ProductCard product={product} index={i} />
            <p className="mt-2 flex items-center gap-1.5 px-1 text-xs text-slate">
              <ShoppingBag size={12} aria-hidden className="shrink-0" />
              <span>
                In <span className="font-semibold text-ink">{product.orders}</span> orders with this item
              </span>
            </p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default BoughtTogether;
