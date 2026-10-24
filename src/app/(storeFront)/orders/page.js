"use client";

import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, RefreshCw, ShoppingBag, XCircle } from "lucide-react";
import OrderCard from "@/components/OrderCard";
import { PaginationControls } from "@/components/Pagination";
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
import { bouncy, fadeUp, spring } from "@/utils/motion";

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
    <div className="container-page min-h-screen pb-16 pt-6 lg:pt-10">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <motion.div {...fadeUp()}>
          <p className="eyebrow mb-2">Your account</p>
          <h1 className="font-display text-4xl font-bold tracking-tight text-ink sm:text-5xl">
            Your <span className="marker">orders</span>
          </h1>
        </motion.div>
        <motion.button
          {...fadeUp(0.05)}
          type="button"
          onClick={refresh}
          disabled={loading}
          className="btn-secondary py-2.5 disabled:opacity-50"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          Refresh
        </motion.button>
      </div>

      <AnimatePresence initial={false}>
        {awaitingPayment > 0 && activeTab !== ORDER_STATUS_PENDING && (
          <motion.div
            key="awaiting"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="mb-6 flex flex-wrap items-center gap-3 rounded-3xl bg-marigold-tint p-3 pl-4">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-marigold text-on-marigold">
                <AlertCircle size={17} aria-hidden />
              </span>
              <p className="min-w-48 flex-1 text-sm text-ink">
                <span className="font-semibold">
                  {awaitingPayment === 1
                    ? "1 order is waiting for payment."
                    : `${awaitingPayment} orders are waiting for payment.`}
                </span>{" "}
                <span className="text-slate-dim">
                  They ship once paid or switched to cash on delivery.
                </span>
              </p>
              <button
                type="button"
                onClick={() => handleTabChange(ORDER_STATUS_PENDING)}
                className="btn-primary px-4 py-2 text-xs"
              >
                Review
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        {...fadeUp(0.08)}
        role="group"
        aria-label="Filter orders by status"
        className="no-scrollbar -mx-4 mb-6 flex items-center gap-1.5 overflow-x-auto px-4 py-1 sm:-mx-5 sm:px-5 md:mx-0 md:px-0"
      >
        {TABS.map((tab) => {
          const active = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              aria-pressed={active}
              onClick={() => handleTabChange(tab.key)}
              className={`relative flex items-center gap-2 whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                active ? "text-paper" : "text-slate hover:bg-mist hover:text-ink"
              }`}
            >
              {active && (
                <motion.span
                  layoutId="ordersTabIndicator"
                  className="absolute inset-0 rounded-full bg-ink"
                  transition={spring}
                />
              )}
              <span className="relative">{tab.label}</span>
              <span
                className={`relative grid h-5 min-w-5 place-items-center rounded-full px-1 font-mono text-[10px] ${
                  active ? "bg-paper/20 text-paper" : "bg-mist text-slate-dim"
                }`}
              >
                {counts[tab.key] ?? 0}
              </span>
            </button>
          );
        })}
      </motion.div>

      {loading && !data ? (
        <ul className="space-y-3" role="status" aria-label="Loading your orders">
          {Array.from({ length: 4 }, (_, i) => (
            <li key={i} className="flex items-center gap-4 rounded-3xl border border-hairline bg-panel p-4">
              <span className="skeleton h-20 w-20 rounded-2xl" />
              <span className="flex-1 space-y-2">
                <span className="skeleton block h-3 w-32" />
                <span className="skeleton block h-4 w-2/3" />
                <span className="skeleton block h-5 w-24 rounded-full" />
              </span>
            </li>
          ))}
        </ul>
      ) : error ? (
        <div className="flex flex-col items-center justify-center gap-4 rounded-4xl border border-hairline bg-panel py-20 text-center">
          <span className="grid h-16 w-16 place-items-center rounded-3xl bg-danger/10 text-danger">
            <XCircle size={28} />
          </span>
          <p className="font-display text-xl font-bold text-ink">Could not load orders</p>
          <p className="max-w-sm text-sm text-slate">
            {apiErrorMessage(error, "Check your connection and try again.")}
          </p>
          <button type="button" onClick={refresh} className="btn-secondary mt-2">
            <RefreshCw size={14} /> Try again
          </button>
        </div>
      ) : orders.length === 0 ? (
        <div className="relative flex flex-col items-center justify-center gap-4 overflow-hidden rounded-4xl bg-signal-tint px-6 py-20 text-center">
          <span
            aria-hidden
            className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 animate-drift rounded-full bg-marigold/40 blur-3xl"
          />
          {/* The CSS float uses `transform`, so it sits inside the motion span. */}
          <motion.span
            initial={{ scale: 0.6, rotate: -12 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={bouncy}
            className="relative"
          >
            <span className="grid h-20 w-20 animate-float place-items-center rounded-3xl bg-panel text-signal shadow-soft">
              <ShoppingBag size={34} strokeWidth={1.7} />
            </span>
          </motion.span>
          <p className="relative font-display text-2xl font-bold text-ink">No orders yet</p>
          <p className="relative max-w-sm text-sm text-slate-dim">
            Once you place an order, every receipt and status update will
            appear here.
          </p>
          <Link href={PRODUCTS_ROUTE} className="btn-primary relative mt-2">
            Browse products
          </Link>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 rounded-4xl border border-dashed border-hairline py-20 text-center">
          <span className="grid h-16 w-16 place-items-center rounded-3xl bg-mist text-slate">
            <ShoppingBag size={28} />
          </span>
          <p className="font-display text-xl font-bold text-ink">
            No {activeLabel.toLowerCase()} orders
          </p>
          <p className="max-w-sm text-sm text-slate">
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
          <ul className="space-y-3">
            <AnimatePresence mode="popLayout" initial={false}>
              {paginated.map((order, i) => (
                <OrderCard key={order._id} order={order} index={i} />
              ))}
            </AnimatePresence>
          </ul>

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
