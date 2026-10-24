"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { getOrderStats } from "@/api/order";
import { fadeUp } from "@/utils/motion";
import { formatNPR } from "@/utils/format";
import {
  ORDER_STATUS_CANCELLED,
  ORDER_STATUS_CONFIRMED,
  ORDER_STATUS_DELIVERED,
  ORDER_STATUS_PENDING,
  ORDER_STATUS_SHIPPED,
} from "@/constants/orders";

// Counts come from /orders/stats (one aggregate, scoped to the caller's role)
// instead of downloading every order. `refreshKey` re-fetches after edits.
const OrderStats = ({ refreshKey = 0 }) => {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    let cancelled = false;
    getOrderStats()
      .then((data) => !cancelled && setStats(data))
      .catch(() => !cancelled && setStats(null));
    return () => {
      cancelled = true;
    };
  }, [refreshKey]);

  const count = (status) => stats?.byStatus?.[status] ?? "—";
  const tiles = [
    { label: "Total orders", value: stats?.total ?? "—" },
    { label: "Pending", value: count(ORDER_STATUS_PENDING) },
    { label: "Confirmed", value: count(ORDER_STATUS_CONFIRMED) },
    { label: "Shipped", value: count(ORDER_STATUS_SHIPPED) },
    { label: "Delivered", value: count(ORDER_STATUS_DELIVERED) },
    { label: "Cancelled", value: count(ORDER_STATUS_CANCELLED) },
    { label: "Revenue", value: stats ? formatNPR(stats.revenue) : "—", wide: true },
  ];

  return (
    <motion.div
      {...fadeUp(0.07)}
      className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-7 gap-px bg-hairline dark:bg-[#262932] border border-hairline dark:border-[#262932] mb-6"
    >
      {tiles.map((s) => (
        <div
          key={s.label}
          className={`bg-paper dark:bg-[#0e0f12] px-5 py-4 ${s.wide ? "col-span-2 sm:col-span-1" : ""}`}
        >
          <p className="font-display text-2xl font-semibold tabular-nums text-ink dark:text-[#f0efe8] truncate">
            {s.value}
          </p>
          <p className="eyebrow dark:text-[#8b8fa8] mt-1">{s.label}</p>
        </div>
      ))}
    </motion.div>
  );
};

export default OrderStats;
