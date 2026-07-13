"use client"
import React from "react";
import { motion } from "framer-motion";
import { useState } from "react";
import { Plus, ShoppingBag, ShoppingCart } from "lucide-react";
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
        <div className="relative aspect-square overflow-hidden bg-paper">
          <Image
            src={productImage(product)}
            alt={product.name}
            height={400}
            width={600}
            loading="eager"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
          />
          {hover && (
            <span className="pointer-events-none absolute inset-y-0 left-0 w-1/3 bg-linear-to-r from-transparent via-white/40 to-transparent animate-sweep" />
          )}
          <span className="absolute left-3 top-3 eyebrow bg-paper/90 px-2 py-1">
            {product.brand}
          </span>
          {/* {outOfStock && (
            <span className="absolute right-3 top-3 bg-ink px-2 py-1 font-mono text-[10px] uppercase tracking-widest2 text-paper">
              Sold out
            </span>
          )} */}
          <button
            className="absolute bottom-3 right-3 grid h-9 w-9 place-items-center bg-ink text-paper opacity-0 transition-all duration-300 group-hover:opacity-100 hover:bg-signal disabled:cursor-not-allowed disabled:opacity-0"
            aria-label="Add to cart"
          >
            {/* <Plus size={16} /> */}
            <ShoppingCart size={16}/>
          </button>
        </div>

        <div className="p-4">
          <h3 className="font-display text-[15px] font-semibold leading-tight line-clamp-1">
            {product.name}
          </h3>
          <p className="mt-1 eyebrow">{product.category}</p>
          <div className="mt-3 flex items-baseline justify-between border-t border-hairline pt-3">
            <span className="font-mono text-base font-medium">
              {formatNPR(product.price)}
            </span>
            <span className="font-mono text-[11px] text-slate">
              {`${product.stock} in stock`}
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default ProductCard;
