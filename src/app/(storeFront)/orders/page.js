"use client";

import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { AlertCircle, RefreshCw, ShoppingBag, XCircle } from "lucide-react";
import OrderCard from "@/components/OrderCard";
import { PaginationControls } from "@/components/Pagination";
import Loader from "@/components/Loader";
import { LOGIN_ROUTE, ORDERS_ROUTE, PRODUCTS_ROUTE } from "@/constants/routes";
import { getMyOrders } from "@/api/order";
import {
  ORDER_STATUS_CANCELLED,
  ORDER_STATUS_CONFIRMED,
  ORDER_STATUS_DELIVERED,
  ORDER_STATUS_PENDING,
  ORDER_STATUS_SHIPPED,
} from "@/constants/orders";
import { ORDERS_PAGE_SIZE } from "@/constants/pagination";
import { useResource } from "@/hooks/useResource";
import { apiErrorMessage } from "@/utils/format";
import { fadeUp } from "@/utils/motion";

const TABS = [
  { key: "ALL", label: "All" },
  { key: ORDER_STATUS_PENDING, label: "Awaiting payment" },
  { key: ORDER_STATUS_CONFIRMED, label: "Confirmed" },
  { key: ORDER_STATUS_SHIPPED, label: "Shipped" },
  { key: ORDER_STATUS_DELIVERED, label: "Delivered" },
  { key: ORDER_STATUS_CANCELLED, label: "Cancelled" },
];

const toList = (data) =>
  [data, data?.orders, data?.data].find(Array.isArray) ?? [];

const OrdersPage = () => {
  const { user } = useSelector((state) => state.auth);
  const router = useRouter();

  const [version, setVersion] = useState(0);
  const [page, setPage] = useState(1);
  const [activeTab, setActiveTab] = useState("ALL");

  // Orders sit outside the (client) guard, so this page signs visitors in.
  useEffect(() => {
    if (!user)
      router.replace(`${LOGIN_ROUTE}?next=${encodeURIComponent(ORDERS_ROUTE)}`);
  }, [user, router]);

  const { data, error, loading } = useResource(
    `${user?._id}|${version}`,
    () => (user ? getMyOrders() : Promise.resolve([]))
  );
  const orders = toList(data);
  const refresh = () => setVersion((v) => v + 1);

  const counts = orders.reduce(
    (acc, o) => {
      const status = o.status?.toUpperCase();
      acc[status] = (acc[status] ?? 0) + 1;
      return acc;
    },
    { ALL: orders.length }
  );
  const awaitingPayment = counts[ORDER_STATUS_PENDING] ?? 0;

  const filteredOrders =
    activeTab === "ALL"
      ? orders
      : orders.filter((o) => o.status?.toUpperCase() === activeTab);
  const activeLabel = TABS.find((t) => t.key === activeTab)?.label ?? "";

  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / ORDERS_PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paginated = filteredOrders.slice(
    (safePage - 1) * ORDERS_PAGE_SIZE,
    safePage * ORDERS_PAGE_SIZE
  );

  const handleTabChange = (key) => {
    setActiveTab(key);
    setPage(1);
  };

  if (!user) return null;

  return (
    <div className="container-page py-10 bg-paper dark:bg-[#0e0f12] min-h-screen transition-colors duration-300">
      <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
        <motion.div {...fadeUp()}>
          <p className="eyebrow dark:text-[#8b8fa8] mb-2">Account</p>
          <h1 className="font-display text-3xl font-semibold text-ink dark:text-[#f0efe8]">
            Order history
          </h1>
        </motion.div>
        <motion.button
          {...fadeUp(0.05)}
          type="button"
          onClick={refresh}
          disabled={loading}
          className="btn-secondary disabled:opacity-50"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          Refresh
        </motion.button>
      </div>

      {awaitingPayment > 0 && activeTab !== ORDER_STATUS_PENDING && (
        <motion.div
          {...fadeUp(0.06)}
          className="mb-6 flex flex-wrap items-center gap-3 border border-signal/40 bg-signal-tint/40 dark:bg-signal/10 px-4 py-3"
        >
          <AlertCircle size={16} className="text-signal-dim dark:text-signal shrink-0" />
          <p className="flex-1 min-w-48 text-sm text-ink dark:text-[#f0efe8]">
            {awaitingPayment === 1
              ? "1 order is waiting for payment."
              : `${awaitingPayment} orders are waiting for payment.`}{" "}
            <span className="text-slate dark:text-[#8b8fa8]">
              They ship once paid or switched to cash on delivery.
            </span>
          </p>
          <button
            type="button"
            onClick={() => handleTabChange(ORDER_STATUS_PENDING)}
            className="font-mono text-xs uppercase tracking-widest text-signal-dim dark:text-signal hover:underline"
          >
            Review
          </button>
        </motion.div>
      )}

      <motion.div
        {...fadeUp(0.08)}
        role="group"
        aria-label="Filter orders by status"
        className="flex items-center gap-1 mb-8 border-b border-hairline dark:border-[#262932] overflow-x-auto"
      >
        {TABS.map((tab) => {
          const active = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              aria-pressed={active}
              onClick={() => handleTabChange(tab.key)}
              className={`relative flex items-center gap-2 px-4 py-2.5 font-mono text-xs uppercase tracking-widest whitespace-nowrap transition-colors ${
                active
                  ? "text-ink dark:text-[#f0efe8]"
                  : "text-slate dark:text-[#8b8fa8] hover:text-ink dark:hover:text-[#f0efe8]"
              }`}
            >
              {tab.label}
              <span
                className={`min-w-5 px-1 py-px text-[10px] text-center ${
                  active
                    ? "bg-ink text-paper dark:bg-[#f0efe8] dark:text-[#0e0f12]"
                    : "bg-hairline dark:bg-[#262932]"
                }`}
              >
                {counts[tab.key] ?? 0}
              </span>
              {active && (
                <motion.div
                  layoutId="ordersTabIndicator"
                  className="absolute left-0 right-0 -bottom-px h-0.5 bg-ink dark:bg-[#f0efe8]"
                  transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                />
              )}
            </button>
          );
        })}
      </motion.div>

      {loading && !data ? (
        <Loader label="Loading your orders" />
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
          <XCircle size={28} className="text-danger" />
          <p className="font-display font-semibold text-ink dark:text-[#f0efe8]">
            Could not load orders
          </p>
          <p className="text-sm text-slate dark:text-[#8b8fa8] max-w-sm">
            {apiErrorMessage(error, "Check your connection and try again.")}
          </p>
          <button type="button" onClick={refresh} className="btn-secondary mt-2">
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
            Once you place an order, every receipt and status update will
            appear here.
          </p>
          <Link href={PRODUCTS_ROUTE} className="btn-primary mt-2">
            Browse products
          </Link>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4 text-center border border-dashed border-hairline dark:border-[#262932]">
          <ShoppingBag size={32} className="text-slate dark:text-[#8b8fa8]" />
          <p className="font-display text-xl font-semibold text-ink dark:text-[#f0efe8]">
            No {activeLabel.toLowerCase()} orders
          </p>
          <p className="text-sm text-slate dark:text-[#8b8fa8] max-w-sm">
            Nothing matches this filter yet.
          </p>
          <button
            type="button"
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

          <PaginationControls
            page={safePage}
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
