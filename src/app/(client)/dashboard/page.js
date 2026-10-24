"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useSelector } from "react-redux";
import {
  AlertTriangle,
  ArrowUpRight,
  Clock,
  Loader2,
  Package,
  PackageX,
  RefreshCw,
  ShoppingCart,
  TrendingUp,
  Users,
} from "lucide-react";
import { getAllOrders, getMerchantOrders, getOrderStats } from "@/api/order";
import { getUserStats } from "@/api/user";
import { getTotalCount as getProductCount } from "@/api/product";
import { formatDate, formatNPR } from "@/utils/format";
import { fadeUp } from "@/utils/motion";
import { useResource } from "@/hooks/useResource";
import {
  ORDER_MANAGEMENT_ROUTE,
  PRODUCT_MANAGEMENT_ROUTE,
  USER_MANAGEMENT_ROUTE,
} from "@/constants/routes";
import { ORDER_STATUS_PENDING, ORDER_STATUSES, STATUS_MAP } from "@/constants/orders";
import { ROLE_ADMIN } from "@/constants/user";

const RECENT_LIMIT = 5;

/* ── Stat card ───────────────────────────────────────────────────────────── */

const StatCard = ({ label, value, hint, icon: Icon, href, delay, loading }) => (
  <motion.div {...fadeUp(delay)}>
    <Link
      href={href}
      className="card-frame group flex h-full flex-col gap-4 p-5 hover:border-ink dark:hover:border-[#f0efe8] transition-colors"
    >
      <div className="flex items-start justify-between">
        <div className="grid h-10 w-10 place-items-center border border-hairline dark:border-[#262932] bg-paper dark:bg-[#0e0f12] text-ink dark:text-[#f0efe8] group-hover:bg-ink group-hover:text-paper dark:group-hover:bg-[#f0efe8] dark:group-hover:text-[#0e0f12] transition-colors">
          <Icon size={17} />
        </div>
        <ArrowUpRight
          size={14}
          className="text-slate dark:text-[#8b8fa8] group-hover:text-signal transition-colors"
        />
      </div>
      <div>
        {loading ? (
          <div className="h-8 w-24 animate-pulse bg-hairline/60 dark:bg-[#262932]" />
        ) : (
          <p className="font-display text-2xl font-semibold tabular-nums text-ink dark:text-[#f0efe8] truncate">
            {value}
          </p>
        )}
        <p className="eyebrow dark:text-[#8b8fa8] mt-1">{label}</p>
      </div>
      {hint && !loading && (
        <p className="font-mono text-[11px] text-slate dark:text-[#8b8fa8] -mt-1">{hint}</p>
      )}
    </Link>
  </motion.div>
);

/* ── Recent order row ────────────────────────────────────────────────────── */

const OrderRow = ({ order, index, isAdmin }) => {
  const cfg = STATUS_MAP[order.status] ?? { label: order.status, icon: Clock, color: "text-slate" };
  const Icon = cfg.icon;
  // Merchants see their share of a mixed basket, not the whole total.
  const amount = isAdmin ? order.totalPrice : (order.merchantTotal ?? order.totalPrice);
  const ref = order.orderNumber ?? String(order._id).slice(-8).toUpperCase();

  return (
    <motion.li initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: index * 0.04 }}>
      <Link
        href={`${ORDER_MANAGEMENT_ROUTE}?search=${encodeURIComponent(order.orderNumber ?? "")}`}
        className="flex items-center justify-between gap-4 px-5 py-3.5 hover:bg-hairline/20 dark:hover:bg-[#262932]/40 transition-colors"
      >
        <div className="min-w-0">
          <p className="font-mono text-xs text-ink dark:text-[#f0efe8] font-medium truncate">
            #{ref}
          </p>
          <p className="text-xs text-slate dark:text-[#8b8fa8] mt-0.5 truncate">
            {order.shippingAddress?.city ?? "—"} · {formatDate(order.createdAt)}
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <span className="font-mono text-sm tabular-nums text-ink dark:text-[#f0efe8]">
            {formatNPR(amount)}
          </span>
          <span
            className={`hidden sm:inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-widest px-2 py-0.5 ${cfg.color}`}
          >
            <Icon size={10} /> {cfg.label}
          </span>
        </div>
      </Link>
    </motion.li>
  );
};

const SectionError = ({ message, onRetry }) => (
  <div role="alert" className="flex flex-col items-center gap-2 py-12 px-6 text-center">
    <AlertTriangle size={18} className="text-danger" />
    <p className="text-sm text-slate dark:text-[#8b8fa8]">{message}</p>
    <button onClick={onRetry} className="btn-ghost text-xs">
      <RefreshCw size={12} /> Try again
    </button>
  </div>
);

/* ── Page ────────────────────────────────────────────────────────────────── */

const DashboardPage = () => {
  const { user } = useSelector((state) => state.auth);
  const isAdmin = Boolean(user?.roles?.includes(ROLE_ADMIN));
  const [version, setVersion] = useState(0);
  const refresh = () => setVersion((v) => v + 1);

  // Every number below is scoped on the server: admins see the whole
  // store, merchants only their own products and order lines.
  const scopeKey = `${isAdmin}|${user?._id}|${version}`;

  const orderStats = useResource(`orders|${scopeKey}`, getOrderStats);

  const recent = useResource(`recent|${scopeKey}`, () =>
    (isAdmin ? getAllOrders : getMerchantOrders)({ limit: RECENT_LIMIT, offset: 0 }),
  );

  const catalog = useResource(`catalog|${scopeKey}`, async () => {
    const scope = isAdmin ? {} : { createdBy: user._id };
    const [all, low, out, people] = await Promise.all([
      getProductCount(scope),
      getProductCount({ ...scope, stock: "low" }),
      getProductCount({ ...scope, stock: "out" }),
      isAdmin ? getUserStats() : null,
    ]);
    return {
      products: all.totalCount,
      low: low.totalCount,
      out: out.totalCount,
      people,
    };
  });

  const stats = orderStats.data;
  const cat = catalog.data;
  const pending = stats?.byStatus?.[ORDER_STATUS_PENDING] ?? 0;
  const busy = orderStats.loading || recent.loading || catalog.loading;

  const cards = [
    {
      label: "Revenue",
      value: formatNPR(stats?.revenue ?? 0),
      hint: isAdmin ? "Paid or delivered orders" : "Your lines on paid or delivered orders",
      icon: TrendingUp,
      href: ORDER_MANAGEMENT_ROUTE,
      loading: orderStats.loading,
    },
    {
      label: "Orders",
      value: stats?.total ?? "—",
      hint: pending ? `${pending} awaiting confirmation` : "Nothing waiting",
      icon: ShoppingCart,
      href: ORDER_MANAGEMENT_ROUTE,
      loading: orderStats.loading,
    },
    {
      label: isAdmin ? "Products" : "Your products",
      value: cat?.products ?? "—",
      hint: cat ? `${cat.low} low · ${cat.out} out of stock` : null,
      icon: Package,
      href: PRODUCT_MANAGEMENT_ROUTE,
      loading: catalog.loading,
    },
    isAdmin
      ? {
          label: "Users",
          value: cat?.people?.total ?? "—",
          hint: cat?.people
            ? `${cat.people.merchants} merchants · ${cat.people.inactive} inactive`
            : null,
          icon: Users,
          href: USER_MANAGEMENT_ROUTE,
          loading: catalog.loading,
        }
      : {
          label: "Pending",
          value: pending,
          hint: "Orders to confirm",
          icon: Clock,
          href: `${ORDER_MANAGEMENT_ROUTE}?status=${ORDER_STATUS_PENDING}`,
          loading: orderStats.loading,
        },
  ];

  const alerts = [
    pending > 0 && {
      key: "pending",
      icon: Clock,
      title: `${pending} pending order${pending === 1 ? "" : "s"}`,
      body: "Confirm them so customers know they're on the way.",
      href: `${ORDER_MANAGEMENT_ROUTE}?status=${ORDER_STATUS_PENDING}`,
      cta: "Review orders",
    },
    cat?.out > 0 && {
      key: "out",
      icon: PackageX,
      title: `${cat.out} product${cat.out === 1 ? "" : "s"} out of stock`,
      body: "Shoppers can't buy these until you restock.",
      href: `${PRODUCT_MANAGEMENT_ROUTE}?stock=out`,
      cta: "Restock",
    },
    cat?.low > 0 && {
      key: "low",
      icon: Package,
      title: `${cat.low} running low`,
      body: "Five or fewer left in stock.",
      href: `${PRODUCT_MANAGEMENT_ROUTE}?stock=low`,
      cta: "View products",
    },
  ].filter(Boolean);

  const firstName = user?.name?.split(" ")[0];

  return (
    <div className="container-page py-8 lg:py-10 transition-colors duration-300">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
        <motion.div {...fadeUp()}>
          <p className="eyebrow dark:text-[#8b8fa8] mb-2">
            {isAdmin ? "Admin" : "Merchant"} · Overview
          </p>
          <h1 className="font-display text-3xl font-semibold text-ink dark:text-[#f0efe8]">
            {firstName ? `Welcome back, ${firstName}` : "Dashboard"}
          </h1>
          <p className="text-sm text-slate dark:text-[#8b8fa8] mt-1">
            {isAdmin
              ? "How the whole store is doing right now."
              : "How your products and orders are doing right now."}
          </p>
        </motion.div>
        <motion.button {...fadeUp(0.05)} onClick={refresh} disabled={busy} className="btn-secondary">
          <RefreshCw size={14} className={busy ? "animate-spin" : ""} />
          Refresh
        </motion.button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {cards.map((c, i) => (
          <StatCard key={c.label} {...c} delay={0.06 + i * 0.04} />
        ))}
      </div>

      <div className="grid lg:grid-cols-[1fr_320px] gap-6">
        {/* Recent orders */}
        <motion.section {...fadeUp(0.2)} aria-labelledby="recent-orders-title">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="eyebrow dark:text-[#8b8fa8] mb-1">Latest activity</p>
              <h2
                id="recent-orders-title"
                className="font-display text-xl font-semibold text-ink dark:text-[#f0efe8]"
              >
                Recent orders
              </h2>
            </div>
            <Link href={ORDER_MANAGEMENT_ROUTE} className="btn-ghost text-xs dark:text-[#8b8fa8]">
              View all <ArrowUpRight size={13} />
            </Link>
          </div>

          <div className="card-frame">
            {recent.loading && !recent.data ? (
              <div className="flex items-center justify-center gap-2 py-16 text-slate dark:text-[#8b8fa8]">
                <Loader2 size={16} className="animate-spin" />
                <span className="font-mono text-sm">Loading…</span>
              </div>
            ) : recent.error ? (
              <SectionError message="Couldn't load recent orders." onRetry={refresh} />
            ) : !recent.data?.length ? (
              <div className="py-16 px-6 text-center">
                <p className="text-sm text-slate dark:text-[#8b8fa8]">
                  {isAdmin
                    ? "No orders yet. They'll show up here as soon as someone checks out."
                    : "No orders for your products yet."}
                </p>
              </div>
            ) : (
              <ul className="divide-y divide-hairline dark:divide-[#262932]">
                {recent.data.map((order, i) => (
                  <OrderRow key={order._id} order={order} index={i} isAdmin={isAdmin} />
                ))}
              </ul>
            )}
          </div>
        </motion.section>

        {/* Right column */}
        <div className="space-y-6">
          <motion.section {...fadeUp(0.25)} aria-labelledby="status-breakdown-title">
            <h2 id="status-breakdown-title" className="eyebrow dark:text-[#8b8fa8] mb-3">
              Orders by status
            </h2>
            <div className="card-frame">
              {orderStats.loading && !stats ? (
                <div className="py-10 text-center">
                  <Loader2 size={14} className="animate-spin text-slate dark:text-[#8b8fa8] mx-auto" />
                </div>
              ) : orderStats.error ? (
                <SectionError message="Couldn't load order stats." onRetry={refresh} />
              ) : (
                <ul className="divide-y divide-hairline dark:divide-[#262932]">
                  {ORDER_STATUSES.map((status) => {
                    const cfg = STATUS_MAP[status];
                    const Icon = cfg.icon;
                    const count = stats?.byStatus?.[status] ?? 0;
                    const pct = stats?.total ? Math.round((count / stats.total) * 100) : 0;
                    return (
                      <li key={status}>
                        <Link
                          href={`${ORDER_MANAGEMENT_ROUTE}?status=${status}`}
                          className="block px-4 py-3 hover:bg-hairline/20 dark:hover:bg-[#262932]/40 transition-colors"
                        >
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-widest text-ink dark:text-[#f0efe8]">
                              <Icon size={11} /> {cfg.label}
                            </span>
                            <span className="font-mono text-xs tabular-nums text-slate dark:text-[#8b8fa8]">
                              {count} · {pct}%
                            </span>
                          </div>
                          <div
                            className="h-1 w-full bg-hairline dark:bg-[#262932] overflow-hidden"
                            role="presentation"
                          >
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${pct}%` }}
                              transition={{ duration: 0.6, ease: "easeOut", delay: 0.3 }}
                              className="h-full bg-signal"
                            />
                          </div>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </motion.section>

          {alerts.length > 0 && (
            <motion.section {...fadeUp(0.35)} aria-labelledby="attention-title">
              <h2 id="attention-title" className="eyebrow dark:text-[#8b8fa8] mb-3">
                Needs attention
              </h2>
              <ul className="space-y-3">
                {alerts.map((a) => {
                  const Icon = a.icon;
                  return (
                    <li
                      key={a.key}
                      className="card-frame border-signal/40 bg-signal/5 dark:bg-signal/10 px-4 py-4"
                    >
                      <p className="flex items-center gap-2 font-display font-semibold text-ink dark:text-[#f0efe8]">
                        <Icon size={15} className="text-signal" /> {a.title}
                      </p>
                      <p className="text-xs text-slate dark:text-[#8b8fa8] mt-0.5 mb-3">{a.body}</p>
                      <Link href={a.href} className="btn-primary text-xs py-2">
                        {a.cta}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </motion.section>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
