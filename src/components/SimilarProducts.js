"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import ProductCard from "@/components/ProductCard";
import Loader from "@/components/Loader";
import { getProducts } from "@/api/product";

const SimilarProducts = ({ category, currentProductId }) => {
  console.log(category);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!category) return;

    let active = true;

    const fetch = async () => {
      setLoading(true);
      try {
        const data = await getProducts({ category });
        if (!active) return;
        const filtered = (Array.isArray(data) ? data : (data?.products ?? []))
          .filter((p) => (p._id || p.id) !== currentProductId)
          .slice(0, 4);
        setProducts(filtered);
      } catch (err) {
        console.error("Similar products fetch failed:", err);
      } finally {
        if (active) setLoading(false);
      }
    };

    fetch();
    return () => {
      active = false;
    };
  }, [category, currentProductId]);

  if (!loading && products.length === 0) return null;

  return (
    <section className="mt-20">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-40px" }}
        transition={{ duration: 0.4 }}
        className="mb-6"
      >
        <p className="eyebrow dark:text-[#8b8fa8] mb-2">More like this</p>
        <h2 className="font-display text-2xl font-semibold text-ink dark:text-[#f0efe8]">
          Also in {category}
        </h2>
      </motion.div>

      {loading ? (
        <Loader label="Loading similar products" />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
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
