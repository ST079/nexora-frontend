"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight, PackageOpen } from "lucide-react";
import { formatNPR, productImage } from "@/utils/format";
import { PRODUCTS_ROUTE } from "@/constants/routes";

const FeaturedProducts = ({ products = [] }) => {
  if (products.length === 0) return null;

  return (
    <section className="container-page py-16 lg:py-20 border-t border-hairline dark:border-[#262932]">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="flex items-end justify-between gap-4 mb-8"
      >
        <div>
          <p className="eyebrow dark:text-[#8b8fa8] mb-2">Just landed</p>
          <h2 className="font-display text-2xl sm:text-3xl font-semibold text-ink dark:text-[#f0efe8]">
            Featured products
          </h2>
        </div>
        <Link
          href={PRODUCTS_ROUTE}
          className="hidden sm:inline-flex items-center gap-1.5 text-sm font-medium text-ink dark:text-[#f0efe8] hover:opacity-70 transition-opacity"
        >
          View all <ArrowRight size={14} />
        </Link>
      </motion.div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {products.slice(0, 8).map((product, i) => {
          const outOfStock = (product.stock ?? 0) <= 0;
          return (
            <motion.div
              key={product._id || product.id}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: i * 0.04 }}
            >
              <Link
                href={`/products/${product._id || product.id}`}
                className="group block"
              >
                <div className="aspect-square border border-hairline dark:border-[#262932] overflow-hidden mb-3 bg-hairline/10 dark:bg-[#16181f] relative">
                  {product.imageUrls?.[0] ? (
                    <Image
                      src={product.imageUrls[0] ?? productImage(product)}
                      alt={product.name}
                      width={400}
                      height={400}
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="h-full w-full grid place-items-center">
                      <PackageOpen
                        size={20}
                        className="text-slate dark:text-[#8b8fa8]"
                      />
                    </div>
                  )}
                  {outOfStock && (
                    <span className="absolute top-2 left-2 font-mono text-[10px] uppercase tracking-widest px-2 py-0.5 bg-paper dark:bg-[#0e0f12] text-slate dark:text-[#8b8fa8] border border-hairline dark:border-[#262932]">
                      Sold out
                    </span>
                  )}
                </div>
                <p className="text-sm font-medium text-ink dark:text-[#f0efe8] truncate">
                  {product.name}
                </p>
                <p className="font-mono text-sm text-signal mt-0.5">
                  {formatNPR(product.price)}
                </p>
              </Link>
            </motion.div>
          );
        })}
      </div>

      <div className="mt-8 sm:hidden">
        <Link href={PRODUCTS_ROUTE} className="btn-secondary w-full justify-center">
          View all products <ArrowRight size={15} />
        </Link>
      </div>
    </section>
  );
};

export default FeaturedProducts;