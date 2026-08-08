"use client";

import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { RefreshCw, ShoppingBag, XCircle } from "lucide-react";
import OrderCard from "@/components/OrderCard";
import Pagination from "@/components/Pagination";
import { LOGIN_ROUTE, PRODUCTS_ROUTE } from "@/constants/routes";
import { getMyOrders } from "@/api/order";
import Loader from "@/components/Loader";
import {
  ORDER_STATUS_CANCELLED,
  ORDER_STATUS_CONFIRMED,
  ORDER_STATUS_DELIVERED,
  ORDER_STATUS_PENDING,
  ORDER_STATUS_PROCESSING,
  ORDER_STATUS_SHIPPED,
} from "@/constants/orders";
import { ORDERS_PAGE_SIZE } from "@/constants/pagination";

export const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.35, delay, ease: [0.22, 1, 0.36, 1] },
});

const TABS = [
  { key: "ALL", label: "All", statuses: null },
  {
    key: "PENDING",
    label: "Pending",
    statuses: [ORDER_STATUS_PENDING],
  },
  { key: "CONFIRMED", label: "Confirmed", statuses: [ORDER_STATUS_CONFIRMED] },
  { key: "SHIPPED", label: "Shipped", statuses: [ORDER_STATUS_SHIPPED] },
  { key: "DELIVERED", label: "Completed", statuses: [ORDER_STATUS_DELIVERED] },
  { key: "CANCELLED", label: "Cancelled", statuses: [ORDER_STATUS_CANCELLED] },
];

const OrdersPage = () => {
  const { user } = useSelector((state) => state.auth);
  const router = useRouter();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);
  const [page, setPage] = useState(1);
  const [activeTab, setActiveTab] = useState("ALL");

  const stats = {
    total: orders.length,
    pending: orders.filter((o) =>
      [ORDER_STATUS_PENDING, ORDER_STATUS_PROCESSING].includes(
        o.status?.toUpperCase(),
      ),
    ).length,
    confirmed: orders.filter((o) =>
      [ORDER_STATUS_CONFIRMED].includes(o.status?.toUpperCase()),
    ).length,
    shipped: orders.filter(
      (o) => o.status?.toUpperCase() === ORDER_STATUS_SHIPPED,
    ).length,
    completed: orders.filter((o) =>
      [ORDER_STATUS_DELIVERED].includes(o.status?.toUpperCase()),
    ).length,
    cancelled: orders.filter((o) =>
      [ORDER_STATUS_CANCELLED].includes(o.status?.toUpperCase()),
    ).length,
  };

  // Filter by active tab
  const activeTabDef = TABS.find((t) => t.key === activeTab);
  const filteredOrders = activeTabDef?.statuses
    ? orders.filter((o) =>
        activeTabDef.statuses.includes(o.status?.toUpperCase()),
      )
    : orders;

  // Pagination (now based on filtered list)
  const totalPages = Math.max(
    1,
    Math.ceil(filteredOrders.length / ORDERS_PAGE_SIZE),
  );
  const safePage = Math.min(page, totalPages);
  const paginated = filteredOrders.slice(
    (safePage - 1) * ORDERS_PAGE_SIZE,
    safePage * ORDERS_PAGE_SIZE,
  );

  const handleTabChange = (key) => {
    setActiveTab(key);
    setPage(1);
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
        setPage(1);
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
        className="grid grid-cols-2 sm:grid-cols-6 border border-hairline dark:border-[#262932] mb-6"
      >
        {[
          { label: "Total orders", value: stats.total },
          { label: "In progress", value: stats.pending },
          { label: "Confirmed", value: stats.confirmed },
          { label: "Shipped", value: stats.shipped },
          { label: "Completed", value: stats.completed },
          { label: "Cancelled", value: stats.cancelled },
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

      {/* Status tabs */}
      <motion.div
        {...fadeUp(0.08)}
        className="flex items-center gap-1 mb-8 border-b border-hairline dark:border-[#262932] overflow-x-auto"
      >
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => handleTabChange(tab.key)}
            className={`relative px-4 py-2.5 font-mono text-xs uppercase tracking-widest whitespace-nowrap transition-colors ${
              activeTab === tab.key
                ? "text-ink dark:text-[#f0efe8]"
                : "text-slate dark:text-[#8b8fa8] hover:text-ink dark:hover:text-[#f0efe8]"
            }`}
          >
            {tab.label}
            {activeTab === tab.key && (
              <motion.div
                layoutId="ordersTabIndicator"
                className="absolute left-0 right-0 -bottom-px h-0.5 bg-ink dark:bg-[#f0efe8]"
                transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
              />
            )}
          </button>
        ))}
      </motion.div>

      {/* Content */}
      {loading ? (
        <Loader label="Loading your orders" />
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
      ) : filteredOrders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4 text-center border border-dashed border-hairline dark:border-[#262932]">
          <ShoppingBag size={32} className="text-slate dark:text-[#8b8fa8]" />
          <p className="font-display text-xl font-semibold text-ink dark:text-[#f0efe8]">
            No {activeTabDef?.label.toLowerCase()} orders
          </p>
          <p className="text-sm text-slate dark:text-[#8b8fa8] max-w-sm">
            Nothing matches this filter yet.
          </p>
          <button
            onClick={() => handleTabChange("ALL")}
            className="btn-secondary mt-2"
          >
            View all orders
          </button>
        </div>
      ) : (
        <>
          <motion.div
            {...fadeUp(0.1)}
            className="border border-hairline dark:border-[#262932] divide-y divide-hairline dark:divide-[#262932]"
          >
            {paginated.map((order, i) => (
              <OrderCard key={order._id} order={order} index={i} />
            ))}
          </motion.div>

          <Pagination
            page={safePage}
            totalPages={totalPages}
            total={filteredOrders.length}
            pageSize={ORDERS_PAGE_SIZE}
            onPageChange={(p) => {
              setPage(p);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          />
        </>
      )}
    </div>
  );
};

export default OrdersPage;