"use client";

import React from "react";
import { motion } from "framer-motion";
import { useState } from "react";
import { ShoppingCart } from "lucide-react";
import { formatNPR, productImage } from "@/utils/format";
import Image from "next/image";
import Link from "next/link";

const ProductCard = ({ product, index = 0 }) => {
  const [hover, setHover] = useState(false);
  const id = product._id || product.id;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.4, delay: Math.min(index, 6) * 0.04 }}
    >
      <Link
        href={`/products/${id}`}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        className="card-frame group block"
      >
        {/* ── Image ── */}
        <div className="relative aspect-square overflow-hidden bg-paper dark:bg-[#16181f]">
          <Image
            src={productImage(product)}
            alt={product.name}
            height={400}
            width={600}
            loading="eager"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
          />

          {/* Sweep shimmer on hover */}
          {hover && (
            <span className="pointer-events-none absolute inset-y-0 left-0 w-1/3 bg-linear-to-r from-transparent via-white/40 to-transparent animate-sweep" />
          )}

          {/* Brand badge */}
          <span className="absolute left-3 top-3 eyebrow bg-paper/90 dark:bg-[#0e0f12]/90 dark:text-[#8b8fa8] px-2 py-1">
            {product.brand}
          </span>

          {/* Add to cart button */}
          <button
            className="absolute bottom-3 right-3 grid h-9 w-9 place-items-center bg-ink dark:bg-[#f0efe8] text-paper dark:text-[#0e0f12] opacity-0 transition-all duration-300 group-hover:opacity-100 hover:bg-signal dark:hover:bg-signal dark:hover:text-paper disabled:cursor-not-allowed disabled:opacity-0"
            aria-label="Add to cart"
          >
            <ShoppingCart size={16} />
          </button>
        </div>

        {/* ── Info ── */}
        <div className="p-4">
          <h3 className="font-display text-[15px] font-semibold leading-tight line-clamp-1 text-ink dark:text-[#f0efe8]">
            {product.name}
          </h3>
          <p className="mt-1 eyebrow dark:text-[#8b8fa8]">{product.category}</p>
          <div className="mt-3 flex items-baseline justify-between border-t border-hairline dark:border-[#262932] pt-3">
            <span className="font-mono text-base font-medium text-ink dark:text-[#f0efe8]">
              {formatNPR(product.price)}
            </span>
            <span className="font-mono text-[11px] text-slate dark:text-[#8b8fa8]">
              {`${product.stock} in stock`}
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default ProductCard;