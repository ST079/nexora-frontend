"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { PRODUCTS_ROUTE } from "@/constants/routes";
import { revealUp } from "@/utils/motion";
import ProductCard from "./ProductCard";

const FeaturedProducts = ({ products = [] }) => {
  if (products.length === 0) return null;

  return (
    <section className="container-page py-16 lg:py-24">
      <motion.div {...revealUp()} className="mb-8 flex flex-wrap items-end justify-between gap-4 lg:mb-10">
        <div>
          <p className="eyebrow mb-3">Just landed</p>
          <h2 className="font-display text-4xl font-bold tracking-tight text-ink sm:text-5xl">
            Fresh on the shelf
          </h2>
        </div>
        <Link href={PRODUCTS_ROUTE} className="btn-secondary group py-2.5">
          View all
          <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
        </Link>
      </motion.div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
        {products.slice(0, 8).map((product, i) => (
          <ProductCard key={product._id || product.id} product={product} index={i} />
        ))}
      </div>
    </section>
  );
};

export default FeaturedProducts;
