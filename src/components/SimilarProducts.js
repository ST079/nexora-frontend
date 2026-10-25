"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { PRODUCTS_ROUTE } from "@/constants/routes";
import { revealUp } from "@/utils/motion";
import ProductCard from "@/components/ProductCard";
import ProductGridSkeleton from "@/components/ProductGridSkeleton";
import { getProducts, getSimilarProducts } from "@/api/product";
import { useResource } from "@/hooks/useResource";

const toList = (data) => (Array.isArray(data) ? data : (data?.products ?? []));

// TF-IDF matches from the backend first. If that request fails or finds
// nothing close, fall back to the newest products in the same category.
const loadSimilar = async (id, category) => {
  try {
    const similar = toList(await getSimilarProducts(id, 4));
    if (similar.length) return { mode: "similar", products: similar };
  } catch {
    // Fall through to the category list.
  }
  if (!category) return { mode: "category", products: [] };

  // One extra so the list still has four after the current product is dropped.
  const list = toList(await getProducts({ category, limit: 5 }));
  return {
    mode: "category",
    products: list.filter((p) => (p._id || p.id) !== id).slice(0, 4),
  };
};

const SimilarProducts = ({ category, currentProductId }) => {
  const { data, loading } = useResource(`${currentProductId}|${category ?? ""}`, () =>
    loadSimilar(currentProductId, category)
  );

  const products = data?.products ?? [];

  // A failed fetch just hides the section; it's supplementary content.
  if (!loading && products.length === 0) return null;

  return (
    <section className="mt-20 lg:mt-28" aria-labelledby="similar-products-title">
      <motion.div {...revealUp()} className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="eyebrow mb-2">More like this</p>
          <h2
            id="similar-products-title"
            className="font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl"
          >
            {data?.mode === "category" ? (
              <>
                Also in <span className="marker">{category}</span>
              </>
            ) : (
              <>
                Similar <span className="marker">products</span>
              </>
            )}
          </h2>
        </div>
        {category && (
          <Link
            href={`${PRODUCTS_ROUTE}?category=${encodeURIComponent(category)}`}
            className="btn-secondary group py-2.5"
          >
            See all {category}
            <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
          </Link>
        )}
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
