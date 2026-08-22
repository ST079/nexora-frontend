import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getAllOrders } from "@/api/order";
import { fadeUp } from "@/app/(storeFront)/orders/page";
import { ORDER_STATUS_CANCELLED, ORDER_STATUS_CONFIRMED, ORDER_STATUS_PENDING } from "@/constants/orders";
import { PAYMENT_STATUS_SUCCESS } from "@/constants/payment";

const OrderStats =  () => {
  const [orders, setOrders] = useState([]);
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const data = await getAllOrders();
        setOrders(data);
      } catch (error) {
        console.error("Error fetching orders:", error);
      }
    };

    fetchOrders();
  }, []);

  return (
    <motion.div
      {...fadeUp(0.07)}
      className="grid grid-cols-2 sm:grid-cols-5 border border-hairline dark:border-[#262932] mb-6"
    >
      {[
        { label: "Total orders", value: orders.length },
        {
          label: "Pending",
          value: orders.filter(
            (o) => o.status.toUpperCase() === ORDER_STATUS_PENDING,
          ).length,
        },
        {
          label: "Confirmed",
          value: orders.filter(
            (o) => o.status.toUpperCase() === ORDER_STATUS_CONFIRMED,
          ).length,
        },
        {
          label: "Paid",
          value: orders.filter(
            (o) => o.payment?.status.toUpperCase() === PAYMENT_STATUS_SUCCESS,
          ).length,
        },
        {
          label: "Cancelled",
          value: orders.filter(
            (o) => o.status.toUpperCase() === ORDER_STATUS_CANCELLED,
          ).length,
        },
      ].map((s, i) => (
        <div
          key={s.label}
          className={`px-5 py-4 ${
            i < 3 ? "border-r border-hairline dark:border-[#262932]" : ""
          }`}
        >
          <p className="font-display text-2xl font-semibold text-ink dark:text-[#f0efe8]">
            {s.value}
          </p>
          <p className="eyebrow dark:text-[#8b8fa8] mt-1">{s.label}</p>
        </div>
      ))}
    </motion.div>
  );
};

export default OrderStats;
