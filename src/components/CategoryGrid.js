"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";

const CATEGORIES = [
  { name: "Apparel", slug: "apparel", desc: "Shirts, jackets, essentials" },
  { name: "Accessories", slug: "accessories", desc: "Bags, belts, small goods" },
  { name: "Footwear", slug: "footwear", desc: "Sneakers, sandals, boots" },
  { name: "Home", slug: "home", desc: "Decor, kitchen, everyday" },
];

const CategoryGrid = () => {
  return (
    <section id="categories" className="container-page py-16 lg:py-20">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="flex items-end justify-between gap-4 mb-8"
      >
        <div>
          <p className="eyebrow dark:text-[#8b8fa8] mb-2">Shop by category</p>
          <h2 className="font-display text-2xl sm:text-3xl font-semibold text-ink dark:text-[#f0efe8]">
            Find what you need
          </h2>
        </div>
      </motion.div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {CATEGORIES.map((cat, i) => (
          <motion.div
            key={cat.slug}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.3, delay: i * 0.06 }}
          >
            <Link
              href={`/products?category=${cat.slug}`}
              className="group flex flex-col justify-between h-40 border border-hairline dark:border-[#262932] p-5 hover:border-ink dark:hover:border-[#f0efe8] transition-colors"
            >
              <ArrowUpRight
                size={16}
                className="text-slate dark:text-[#8b8fa8] group-hover:text-ink dark:group-hover:text-[#f0efe8] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all self-end"
              />
              <div>
                <p className="font-display text-lg font-semibold text-ink dark:text-[#f0efe8]">
                  {cat.name}
                </p>
                <p className="text-xs text-slate dark:text-[#8b8fa8] mt-1">
                  {cat.desc}
                </p>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default CategoryGrid;