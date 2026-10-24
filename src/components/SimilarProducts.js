"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { PRODUCTS_ROUTE } from "@/constants/routes";
import { revealUp } from "@/utils/motion";
import ProductCard from "@/components/ProductCard";
import ProductGridSkeleton from "@/components/ProductGridSkeleton";
import { getProducts } from "@/api/product";
import { useResource } from "@/hooks/useResource";

const toList = (data) => (Array.isArray(data) ? data : (data?.products ?? []));

const SimilarProducts = ({ category, currentProductId }) => {
  // One extra so the list still has four after the current product is dropped.
  const { data, loading } = useResource(category ?? "", () =>
    category ? getProducts({ category, limit: 5 }) : Promise.resolve([])
  );

  const products = toList(data)
    .filter((p) => (p._id || p.id) !== currentProductId)
    .slice(0, 4);

  // A failed fetch just hides the section; it's supplementary content.
  if (!category || (!loading && products.length === 0)) return null;

  return (
    <section className="mt-20 lg:mt-28">
      <motion.div {...revealUp()} className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="eyebrow mb-2">More like this</p>
          <h2 className="font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">
            Also in <span className="marker">{category}</span>
          </h2>
        </div>
        <Link
          href={`${PRODUCTS_ROUTE}?category=${encodeURIComponent(category)}`}
          className="btn-secondary group py-2.5"
        >
          See all
          <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
        </Link>
      </motion.div>

      {loading ? (
        <ProductGridSkeleton count={4} className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4" />
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {products.map((product, i) => (
            <ProductCard
              key={product._id || product.id}
              product={product}
              index={i}
            />
          ))}
        </div>
      )}
    </section>
  );
};

export default SimilarProducts;
