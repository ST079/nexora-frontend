"use client";

import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  RefreshCw,
  ShoppingBag,
  XCircle,
} from "lucide-react";
import OrderCard from "@/components/OrderCard";
import { LOGIN_ROUTE, PRODUCTS_ROUTE } from "@/constants/routes";
import { getMyOrders } from "@/api/order";
import Loader from "@/components/Loader";

export const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.35, delay, ease: [0.22, 1, 0.36, 1] },
});

const OrdersPage = () => {
  const { user } = useSelector((state) => state.auth);
  const router = useRouter();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  // Stats derived from orders
  const stats = {
    total: orders.length,
    pending: orders.filter((o) =>
      ["PENDING", "PROCESSING"].includes(o.status?.toUpperCase()),
    ).length,
    shipped: orders.filter((o) => o.status?.toUpperCase() === "SHIPPED").length,
    completed: orders.filter((o) =>
      ["DELIVERED", "COMPLETED"].includes(o.status?.toUpperCase()),
    ).length,
  };

  useEffect(() => {
    if (!user) {
      router.replace(LOGIN_ROUTE);
      return;
    }

    let active = true;

    const fetchOrders = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await getMyOrders();
        if (!active) return;
        const list = Array.isArray(data)
          ? data
          : Array.isArray(data?.orders)
            ? data.orders
            : Array.isArray(data?.data)
              ? data.data
              : [];
        setOrders(list);
      } catch (err) {
        if (!active) return;
        setError(
          err?.response?.data?.message ||
            err.message ||
            "Could not load orders.",
        );
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchOrders();

    return () => {
      active = false;
    };
  }, [user, router, reloadKey]);

  return (
    <div className="container-page py-10 bg-paper dark:bg-[#0e0f12] min-h-screen transition-colors duration-300">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
        <motion.div {...fadeUp()}>
          <p className="eyebrow dark:text-[#8b8fa8] mb-2">Account</p>
          <h1 className="font-display text-3xl font-semibold text-ink dark:text-[#f0efe8]">
            Order history
          </h1>
        </motion.div>
        <motion.button
          {...fadeUp(0.05)}
          onClick={() => setReloadKey((k) => k + 1)}
          disabled={loading}
          className="btn-secondary disabled:opacity-50"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          Refresh
        </motion.button>
      </div>

      {/* Stats strip */}
      <motion.div
        {...fadeUp(0.07)}
        className="grid grid-cols-2 sm:grid-cols-4 border border-hairline dark:border-[#262932] mb-8"
      >
        {[
          { label: "Total orders", value: stats.total },
          { label: "In progress", value: stats.pending },
          { label: "Shipped", value: stats.shipped },
          { label: "Completed", value: stats.completed },
        ].map((s, i) => (
          <div
            key={s.label}
            className={`px-5 py-4 ${i < 3 ? "border-r border-hairline dark:border-[#262932]" : ""}`}
          >
            <p className="font-display text-2xl font-semibold text-ink dark:text-[#f0efe8]">
              {s.value}
            </p>
            <p className="eyebrow dark:text-[#8b8fa8] mt-1">{s.label}</p>
          </div>
        ))}
      </motion.div>

      {/* Content */}
      {loading ? (
        <Loader label="Loading your orders"/>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
          <XCircle size={28} className="text-danger" />
          <p className="font-display font-semibold text-ink dark:text-[#f0efe8]">
            Could not load orders
          </p>
          <p className="text-sm text-slate dark:text-[#8b8fa8] max-w-sm">
            {error}
          </p>
          <button
            onClick={() => setReloadKey((k) => k + 1)}
            className="btn-secondary mt-2"
          >
            <RefreshCw size={14} /> Try again
          </button>
        </div>
      ) : orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4 text-center border border-dashed border-hairline dark:border-[#262932]">
          <ShoppingBag size={32} className="text-slate dark:text-[#8b8fa8]" />
          <p className="font-display text-xl font-semibold text-ink dark:text-[#f0efe8]">
            No orders yet
          </p>
          <p className="text-sm text-slate dark:text-[#8b8fa8] max-w-sm">
            Once you place an order every receipt and status update will appear
            here.
          </p>
          <Link href={PRODUCTS_ROUTE} className="btn-primary mt-2">
            Browse Products
          </Link>
        </div>
      ) : (
        <motion.div
          {...fadeUp(0.1)}
          className="border border-hairline dark:border-[#262932] divide-y divide-hairline dark:divide-[#262932]"
        >
          {orders.map((order, i) => (
            <OrderCard key={order._id} order={order} index={i} />
          ))}
        </motion.div>
      )}
    </div>
  );
};

export default OrdersPage;
