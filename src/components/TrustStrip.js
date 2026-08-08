"use client";

import { motion } from "framer-motion";
import { Truck, ShieldCheck, RotateCcw, Headphones } from "lucide-react";

const ITEMS = [
  { icon: Truck, label: "Fast delivery", desc: "2–4 days, nationwide" },
  { icon: ShieldCheck, label: "Secure payment", desc: "Khalti, card, or cash" },
  { icon: RotateCcw, label: "Easy returns", desc: "7-day return window" },
  { icon: Headphones, label: "Real support", desc: "We actually reply" },
];

const TrustStrip = () => {
  return (
    <section className="border-y border-hairline dark:border-[#262932]">
      <div className="container-page grid grid-cols-2 sm:grid-cols-4">
        {ITEMS.map((item, i) => {
          const Icon = item.icon;
          return (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
              className={`flex items-start gap-3 px-5 py-6 ${
                i < 3 ? "sm:border-r border-hairline dark:border-[#262932]" : ""
              } ${i % 2 === 0 ? "border-r sm:border-r-0 border-hairline dark:border-[#262932]" : ""}`}
            >
              <Icon size={18} className="text-signal shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-ink dark:text-[#f0efe8]">
                  {item.label}
                </p>
                <p className="text-xs text-slate dark:text-[#8b8fa8] mt-0.5">
                  {item.desc}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
};

export default TrustStrip;