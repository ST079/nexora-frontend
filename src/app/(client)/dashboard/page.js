"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Package, ShoppingCart, Users, TrendingUp,
  ArrowUpRight, ArrowDownRight, RefreshCw,
  Loader2, Clock, CheckCircle2, Truck, XCircle,
} from "lucide-react";
import { getAllOrders } from "@/api/order";
import { getAllUsers } from "@/api/user";
import { getProducts } from "@/api/product";
import { formatNPR } from "@/utils/format";
import { ORDER_MANAGEMENT_ROUTE, PRODUCT_MANAGEMENT_ROUTE, USER_MANAGEMENT_ROUTE } from "@/constants/routes";
import { PAYMENT_STATUS_SUCCESS } from "@/constants/payment";


const fadeUp = (delay = 0) => ({
  initial:    { opacity: 0, y: 12 },
  animate:    { opacity: 1, y: 0  },
  transition: { duration: 0.35, delay, ease: [0.22, 1, 0.36, 1] },
});

const formatDate = (v) => {
  if (!v) return "—";
  return new Date(v).toLocaleDateString("en-US", {
    day: "2-digit", month: "short", year: "numeric",
  });
};

/* ── Stat card ───────────────────────────────────────────────────────────── */

const StatCard = ({ label, value, icon: Icon, trend, trendLabel, href, delay }) => {
  const isUp = trend >= 0;
  return (
    <motion.div {...fadeUp(delay)}>
      <Link href={href ?? "#"} className="card-frame group flex flex-col gap-4 p-5 hover:border-ink dark:hover:border-[#f0efe8] transition-colors">
        <div className="flex items-start justify-between">
          <div className="grid h-10 w-10 place-items-center border border-hairline dark:border-[#262932] bg-paper dark:bg-[#0e0f12] group-hover:bg-ink group-hover:text-paper dark:group-hover:bg-[#f0efe8] dark:group-hover:text-[#0e0f12] transition-colors">
            <Icon size={17} />
          </div>
          <ArrowUpRight size={14} className="text-slate dark:text-[#8b8fa8] group-hover:text-signal transition-colors" />
        </div>
        <div>
          <p className="font-display text-2xl font-semibold text-ink dark:text-[#f0efe8]">{value}</p>
          <p className="eyebrow dark:text-[#8b8fa8] mt-1">{label}</p>
        </div>
        {trend !== undefined && (
          <div className={`inline-flex items-center gap-1 font-mono text-[11px] ${isUp ? "text-ok" : "text-danger"}`}>
            {isUp ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
            {Math.abs(trend)}% {trendLabel}
          </div>
        )}
      </Link>
    </motion.div>
  );
};

/* ── Mini order row ──────────────────────────────────────────────────────── */

const STATUS_STYLES = {
  PENDING:    { color: "text-signal",   icon: Clock         },
  PROCESSING: { color: "text-blueprint dark:text-[#5c78ff]", icon: Loader2 },
  SHIPPED:    { color: "text-blueprint dark:text-[#5c78ff]", icon: Truck   },
  DELIVERED:  { color: "text-ok",       icon: CheckCircle2  },
  COMPLETED:  { color: "text-ok",       icon: CheckCircle2  },
  CANCELLED:  { color: "text-danger",   icon: XCircle       },
};

const OrderRow = ({ order, index }) => {
  const id     = order._id;
  const key    = String(order.status ?? "").toUpperCase();
  const cfg    = STATUS_STYLES[key] ?? { color: "text-slate", icon: Clock };
  const Icon   = cfg.icon;
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: index * 0.04 }}
    >
      <Link
        href={`/orders/${id}`}
        className="flex items-center justify-between gap-4 px-5 py-3.5 hover:bg-hairline/20 dark:hover:bg-[#262932]/40 transition-colors group"
      >
        <div className="min-w-0">
          <p className="font-mono text-xs text-ink dark:text-[#f0efe8] font-medium">
            #{String(id).slice(-8).toUpperCase()}
          </p>
          <p className="text-xs text-slate dark:text-[#8b8fa8] mt-0.5">
            {order.shippingAddress?.city ?? "—"} · {formatDate(order.createdAt)}
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <span className="font-mono text-sm text-ink dark:text-[#f0efe8]">
            {formatNPR(order.totalPrice)}
          </span>
          <span className={`inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-widest ${cfg.color}`}>
            <Icon size={10} /> {order.status}
          </span>
        </div>
      </Link>
    </motion.div>
  );
};

/* ── Page ────────────────────────────────────────────────────────────────── */

const DashboardPage = () => {
  const [data, setData]         = useState(null);
  const [loading, setLoading]   = useState(true);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let active = true;

    const fetch = async () => {
      setLoading(true);
      try {
        const [orders, users, products] = await Promise.all([
          getAllOrders(),
          getAllUsers(),
          getProducts(),
        ]);

        if (!active) return;

        const revenue  = orders.filter((o) => o.payment?.status === PAYMENT_STATUS_SUCCESS).reduce((s, o) => s + o.totalPrice, 0);
        const pending  = orders.filter((o) => ["PENDING", "PROCESSING"].includes(o.status?.toUpperCase())).length;

        setData({ orders, users, products, revenue, pending });
      } catch (err) {
        console.error("Dashboard fetch failed:", err);
      } finally {
        if (active) setLoading(false);
      }
    };

    fetch();
    return () => { active = false; };
  }, [reloadKey]);

  console.log(data)

  const recentOrders = (data?.orders ?? [])
    .slice()
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);

  const ordersByStatus = (data?.orders ?? []).reduce((acc, o) => {
    const key = o.status?.toUpperCase() ?? "UNKNOWN";
    acc[key] = (acc[key] ?? 0) + 1;
    return acc;
  }, {});

  const STAT_CARDS = [
    { label: "Total revenue",  value: formatNPR(data?.revenue ?? 0),        icon: TrendingUp,   trend: 12,  trendLabel: "vs last month", href: "/admin/orders",   delay: 0.08  },
    { label: "Total orders",   value: data?.orders?.length ?? 0,             icon: ShoppingCart, trend: 8,   trendLabel: "vs last month", href: ORDER_MANAGEMENT_ROUTE,   delay: 0.12  },
    { label: "Products",       value: data?.products?.length ?? 0,           icon: Package,      trend: 3,   trendLabel: "new this week", href: PRODUCT_MANAGEMENT_ROUTE, delay: 0.16 },
    { label: "Users",          value: data?.users?.length ?? 0,              icon: Users,        trend: 5,   trendLabel: "new this week", href: USER_MANAGEMENT_ROUTE,    delay: 0.20  },
  ];

  return (
    <div className="container-page py-10 bg-paper dark:bg-[#0e0f12] min-h-screen transition-colors duration-300">

      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
        <motion.div {...fadeUp()}>
          <p className="eyebrow dark:text-[#8b8fa8] mb-2">Admin · Overview</p>
          <h1 className="font-display text-3xl font-semibold text-ink dark:text-[#f0efe8]">
            Dashboard
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

      {/* Stat cards */}
      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="card-frame p-5 h-32 animate-pulse bg-hairline/30 dark:bg-[#262932]/30" />
          ))}
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {STAT_CARDS.map((s) => (
            <StatCard key={s.label} {...s} />
          ))}
        </div>
      )}

      <div className="grid lg:grid-cols-[1fr_300px] gap-6">

        {/* ── Recent orders ── */}
        <motion.div {...fadeUp(0.2)}>
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="eyebrow dark:text-[#8b8fa8] mb-1">Latest activity</p>
              <h2 className="font-display text-xl font-semibold text-ink dark:text-[#f0efe8]">
                Recent orders
              </h2>
            </div>
            <Link href={ORDER_MANAGEMENT_ROUTE} className="btn-ghost text-xs dark:text-[#8b8fa8]">
              View all <ArrowUpRight size={13} />
            </Link>
          </div>

          <div className="card-frame divide-y divide-hairline dark:divide-[#262932]">
            {loading ? (
              <div className="flex items-center justify-center gap-2 py-16 text-slate dark:text-[#8b8fa8]">
                <Loader2 size={16} className="animate-spin" />
                <span className="font-mono text-sm">Loading…</span>
              </div>
            ) : recentOrders.length === 0 ? (
              <div className="py-16 text-center">
                <p className="text-sm text-slate dark:text-[#8b8fa8]">No orders yet.</p>
              </div>
            ) : (
              recentOrders.map((order, i) => (
                <OrderRow key={order._id} order={order} index={i} />
              ))
            )}
          </div>
        </motion.div>

        {/* ── Right sidebar ── */}
        <div className="space-y-6">

          {/* Order status breakdown */}
          <motion.div {...fadeUp(0.25)}>
            <p className="eyebrow dark:text-[#8b8fa8] mb-3">Orders by status</p>
            <div className="card-frame divide-y divide-hairline dark:divide-[#262932]">
              {loading ? (
                <div className="py-10 text-center">
                  <Loader2 size={14} className="animate-spin text-slate dark:text-[#8b8fa8] mx-auto" />
                </div>
              ) : (
                Object.entries(ordersByStatus).map(([status, count]) => {
                  const cfg  = STATUS_STYLES[status] ?? { color: "text-slate", icon: Clock };
                  const Icon = cfg.icon;
                  const pct  = Math.round((count / (data?.orders?.length ?? 1)) * 100);
                  return (
                    <div key={status} className="px-4 py-3">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className={`inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-widest ${cfg.color}`}>
                          <Icon size={11} /> {status}
                        </span>
                        <span className="font-mono text-xs text-ink dark:text-[#f0efe8]">
                          {count}
                        </span>
                      </div>
                      {/* Progress bar */}
                      <div className="h-1 w-full bg-hairline dark:bg-[#262932] overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 0.6, ease: "easeOut", delay: 0.3 }}
                          className="h-full bg-signal"
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </motion.div>

          {/* Pending attention */}
          {!loading && data?.pending > 0 && (
            <motion.div {...fadeUp(0.35)}>
              <div className="card-frame border-signal/40 bg-signal/5 dark:bg-signal/10 px-4 py-4">
                <p className="font-mono text-xs text-signal uppercase tracking-widest mb-1">
                  Needs attention
                </p>
                <p className="font-display font-semibold text-ink dark:text-[#f0efe8]">
                  {data.pending} pending order{data.pending === 1 ? "" : "s"}
                </p>
                <p className="text-xs text-slate dark:text-[#8b8fa8] mt-0.5 mb-3">
                  Waiting to be processed or shipped.
                </p>
                <Link href={ORDER_MANAGEMENT_ROUTE} className="btn-primary text-xs py-2">
                  Review orders
                </Link>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;