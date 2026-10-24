"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useSelector } from "react-redux";
import {
  AlertTriangle,
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  Clock,
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
import { EASE_OUT, fadeUp, spring } from "@/utils/motion";
import { useResource } from "@/hooks/useResource";
import CountUp from "@/components/CountUp";
import {
  ORDER_MANAGEMENT_ROUTE,
  PRODUCT_MANAGEMENT_ROUTE,
  USER_MANAGEMENT_ROUTE,
} from "@/constants/routes";
import { ORDER_STATUS_PENDING, ORDER_STATUSES, STATUS_MAP } from "@/constants/orders";
import { ROLE_ADMIN } from "@/constants/user";

const RECENT_LIMIT = 5;
const rupees = (n) => formatNPR(Math.round(n));

// While a refresh is in flight the previous numbers stay on screen, dimmed,
// instead of flashing back to skeletons.
const staleClass = (resource) =>
  resource.loading && resource.data ? "opacity-60 transition-opacity" : "transition-opacity";

/* ── Hero: the one number the dashboard leads with ─────────────────────── */

const RevenueHero = ({ stats, resource, isAdmin, pending }) => (
  <motion.section
    {...fadeUp(0.05)}
    aria-labelledby="revenue-title"
    className="relative flex flex-col overflow-hidden rounded-4xl bg-night p-6 text-on-night dark:border dark:border-hairline sm:p-8"
  >
    <span aria-hidden className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 animate-drift rounded-full bg-signal/35 blur-3xl" />
    <span aria-hidden className="pointer-events-none absolute -bottom-24 left-1/3 h-48 w-48 animate-drift rounded-full bg-marigold/20 blur-3xl [animation-delay:-6s]" />

    <div className="relative flex flex-wrap items-start justify-between gap-4">
      <div className="flex items-center gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-2xl bg-on-night/10 text-marigold">
          <TrendingUp size={18} aria-hidden />
        </span>
        <div>
          <h2 id="revenue-title" className="text-sm font-semibold text-on-night">
            Revenue
          </h2>
          <p className="text-xs text-on-night/60">
            {isAdmin ? "Paid or delivered orders" : "Your lines on paid or delivered orders"}
          </p>
        </div>
      </div>
      <Link
        href={ORDER_MANAGEMENT_ROUTE}
        className="group inline-flex items-center gap-1.5 rounded-full bg-on-night/10 px-3.5 py-2 text-xs font-semibold text-on-night transition-colors hover:bg-on-night/20"
      >
        All orders
        <ArrowUpRight size={13} className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
      </Link>
    </div>

    {/* mt-auto pins the figure to the bottom when the tile column is taller. */}
    <div className={`relative mt-auto pt-8 ${staleClass(resource)}`}>
      {resource.loading && !stats ? (
        <div className="h-14 w-64 animate-pulse rounded-2xl bg-on-night/10" />
      ) : (
        <CountUp
          value={stats?.revenue ?? 0}
          format={rupees}
          duration={1.4}
          className="block font-sans text-5xl font-semibold tracking-tight sm:text-6xl"
        />
      )}
    </div>

    <div className="relative mt-6 flex flex-wrap gap-2">
      <span className="inline-flex items-center gap-2 rounded-full bg-on-night/10 px-3 py-1.5 text-xs text-on-night/80">
        <ShoppingCart size={13} aria-hidden /> {stats?.total ?? 0} orders in total
      </span>
      {pending > 0 ? (
        <Link
          href={`${ORDER_MANAGEMENT_ROUTE}?status=${ORDER_STATUS_PENDING}`}
          className="inline-flex items-center gap-2 rounded-full bg-marigold px-3 py-1.5 text-xs font-semibold text-on-marigold transition-transform hover:scale-[1.03]"
        >
          <Clock size={13} aria-hidden /> {pending} waiting for you
          <ArrowRight size={12} aria-hidden />
        </Link>
      ) : (
        <span className="inline-flex items-center gap-2 rounded-full bg-on-night/10 px-3 py-1.5 text-xs text-on-night/80">
          <CheckCircle2 size={13} aria-hidden /> Nothing waiting
        </span>
      )}
    </div>
  </motion.section>
);

/* ── Stat tile ─────────────────────────────────────────────────────────── */

const StatTile = ({ label, value, hint, icon: Icon, tone, href, delay, loading, stale }) => (
  <motion.div {...fadeUp(delay)}>
    <motion.div whileHover={{ y: -4 }} transition={spring} className="h-full">
      <Link
        href={href}
        className="group flex h-full items-center gap-4 rounded-3xl border border-hairline bg-panel p-5 transition-shadow hover:shadow-lift"
      >
        <span
          className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl transition-transform duration-500 ease-spring group-hover:-rotate-12 group-hover:scale-110 ${tone}`}
        >
          <Icon size={19} aria-hidden />
        </span>
        <div className={`min-w-0 flex-1 ${stale ? "opacity-60 transition-opacity" : "transition-opacity"}`}>
          <p className="text-sm text-slate">{label}</p>
          {loading ? (
            <div className="mt-1.5 h-9 w-20 animate-pulse rounded-xl bg-mist" />
          ) : typeof value === "number" ? (
            <CountUp value={value} className="mt-0.5 block text-3xl font-semibold tracking-tight text-ink" />
          ) : (
            <p className="mt-0.5 text-3xl font-semibold tracking-tight text-ink">{value}</p>
          )}
          {hint && !loading && <p className="mt-1 truncate text-xs text-slate">{hint}</p>}
        </div>
        <span className="grid h-8 w-8 shrink-0 self-start place-items-center rounded-full bg-mist text-slate transition-colors group-hover:bg-ink group-hover:text-paper">
          <ArrowUpRight size={14} aria-hidden />
        </span>
      </Link>
    </motion.div>
  </motion.div>
);

/* ── Orders by status: one series, one hue, value at the tip ───────────── */

// The full-width track reads as 100% of orders, so each fill is the status's
// share of the total, the same number printed beside it.
const StatusBars = ({ stats }) => {
  return (
    <ul className="space-y-1">
      {ORDER_STATUSES.map((status, i) => {
        const cfg = STATUS_MAP[status];
        const Icon = cfg.icon;
        const count = stats?.byStatus?.[status] ?? 0;
        const share = stats?.total ? count / stats.total : 0;
        const pct = Math.round(share * 100);
        return (
          <li key={status}>
            <Link
              href={`${ORDER_MANAGEMENT_ROUTE}?status=${status}`}
              className="group block rounded-2xl px-3 py-2.5 transition-colors hover:bg-mist focus-visible:bg-mist"
            >
              <div className="mb-2 flex items-center justify-between gap-3 text-sm">
                <span className="inline-flex items-center gap-2 font-medium text-ink">
                  <span className={`grid h-6 w-6 place-items-center rounded-lg ${cfg.color}`}>
                    <Icon size={12} aria-hidden />
                  </span>
                  {cfg.label}
                </span>
                <span className="tabular-nums text-slate">
                  <span className="font-semibold text-ink">{count}</span> · {pct}%
                </span>
              </div>
              <div className="h-2 w-full rounded-r-sm bg-signal-tint" role="presentation">
                <motion.div
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: share }}
                  transition={{ duration: 0.8, ease: EASE_OUT, delay: 0.3 + i * 0.06 }}
                  className="h-full origin-left rounded-r-sm bg-signal"
                />
              </div>
            </Link>
          </li>
        );
      })}
    </ul>
  );
};

/* ── Catalog health: part-to-whole, status colours with labels ─────────── */

const StockHealth = ({ cat }) => {
  const [focus, setFocus] = useState(null);
  const healthy = Math.max(0, (cat?.products ?? 0) - (cat?.low ?? 0) - (cat?.out ?? 0));
  const total = cat?.products ?? 0;
  const parts = [
    { key: "ok", label: "In stock", count: healthy, mark: "bg-ok", icon: CheckCircle2, href: PRODUCT_MANAGEMENT_ROUTE },
    { key: "low", label: "Running low", count: cat?.low ?? 0, mark: "bg-marigold", icon: Package, href: `${PRODUCT_MANAGEMENT_ROUTE}?stock=low` },
    { key: "out", label: "Out of stock", count: cat?.out ?? 0, mark: "bg-danger", icon: PackageX, href: `${PRODUCT_MANAGEMENT_ROUTE}?stock=out` },
  ];

  return (
    <div onMouseLeave={() => setFocus(null)}>
      {/* 2px surface gaps between segments, 4px rounding only at the ends. */}
      <div className="flex h-3 w-full gap-0.5" role="presentation">
        {total === 0 ? (
          <span className="h-full w-full rounded-sm bg-mist" />
        ) : (
          parts
            .filter((p) => p.count > 0)
            .map((p, i) => (
              <motion.span
                key={p.key}
                onMouseEnter={() => setFocus(p.key)}
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1, opacity: focus && focus !== p.key ? 0.35 : 1 }}
                transition={{
                  scaleX: { duration: 0.6, ease: EASE_OUT, delay: 0.3 + i * 0.1 },
                  opacity: { duration: 0.2 },
                }}
                style={{ flexGrow: p.count, flexBasis: 0 }}
                className={`h-full origin-left first:rounded-l-sm last:rounded-r-sm ${p.mark}`}
              />
            ))
        )}
      </div>

      <ul className="mt-4 space-y-1">
        {parts.map((p) => {
          const Icon = p.icon;
          return (
            <li key={p.key}>
              <Link
                href={p.href}
                onMouseEnter={() => setFocus(p.key)}
                onFocus={() => setFocus(p.key)}
                onBlur={() => setFocus(null)}
                className={`flex items-center justify-between gap-3 rounded-2xl px-3 py-2 text-sm transition-colors hover:bg-mist ${
                  focus === p.key ? "bg-mist" : ""
                }`}
              >
                <span className="inline-flex items-center gap-2.5 text-ink">
                  <span className={`h-2.5 w-2.5 rounded-full ${p.mark}`} aria-hidden />
                  <Icon size={14} className="text-slate" aria-hidden />
                  {p.label}
                </span>
                <span className="tabular-nums text-slate">
                  <span className="font-semibold text-ink">{p.count}</span>
                  {total ? ` · ${Math.round((p.count / total) * 100)}%` : ""}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

/* ── Recent order row ──────────────────────────────────────────────────── */

const OrderRow = ({ order, index, isAdmin }) => {
  const cfg = STATUS_MAP[order.status] ?? { label: order.status, icon: Clock, color: "bg-mist text-slate" };
  const Icon = cfg.icon;
  // Merchants see their share of a mixed basket, not the whole total.
  const amount = isAdmin ? order.totalPrice : (order.merchantTotal ?? order.totalPrice);
  const ref = order.orderNumber ?? String(order._id).slice(-8).toUpperCase();

  return (
    <motion.li
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.25 + index * 0.05, ease: EASE_OUT }}
    >
      <Link
        href={`${ORDER_MANAGEMENT_ROUTE}?search=${encodeURIComponent(order.orderNumber ?? "")}`}
        className="group flex items-center justify-between gap-4 rounded-2xl px-3 py-3 transition-colors hover:bg-mist"
      >
        <div className="flex min-w-0 items-center gap-3">
          <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-2xl ${cfg.color}`}>
            <Icon size={16} aria-hidden />
          </span>
          <div className="min-w-0">
            <p className="truncate font-mono text-xs font-semibold text-ink">#{ref}</p>
            <p className="mt-0.5 truncate text-xs text-slate">
              {order.shippingAddress?.city ?? "—"} · {formatDate(order.createdAt)}
            </p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <span className={`badge hidden sm:inline-flex ${cfg.color}`}>{cfg.label}</span>
          <span className="text-sm font-semibold tabular-nums text-ink">{formatNPR(amount)}</span>
          <ArrowRight
            size={14}
            aria-hidden
            className="hidden text-slate-light transition-transform group-hover:translate-x-0.5 group-hover:text-ink sm:block"
          />
        </div>
      </Link>
    </motion.li>
  );
};

const SectionError = ({ message, onRetry }) => (
  <div role="alert" className="flex flex-col items-center gap-3 px-6 py-12 text-center">
    <span className="grid h-10 w-10 place-items-center rounded-2xl bg-danger/10 text-danger">
      <AlertTriangle size={18} aria-hidden />
    </span>
    <p className="text-sm text-slate">{message}</p>
    <button type="button" onClick={onRetry} className="btn-secondary px-4 py-2 text-xs">
      <RefreshCw size={12} /> Try again
    </button>
  </div>
);

const Card = ({ title, eyebrow, action, delay, id, children }) => (
  <motion.section
    {...fadeUp(delay)}
    aria-labelledby={id}
    className="rounded-4xl border border-hairline bg-panel p-4 sm:p-5"
  >
    <div className="mb-3 flex items-end justify-between gap-3 px-1 sm:px-2">
      <div>
        {eyebrow && <p className="eyebrow mb-1">{eyebrow}</p>}
        <h2 id={id} className="font-display text-lg font-bold tracking-tight text-ink">
          {title}
        </h2>
      </div>
      {action}
    </div>
    {children}
  </motion.section>
);

/* ── Page ──────────────────────────────────────────────────────────────── */

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

  const tiles = [
    {
      label: "Orders",
      value: stats?.total ?? "—",
      hint: pending ? `${pending} awaiting confirmation` : "Nothing waiting",
      icon: ShoppingCart,
      tone: "bg-signal-tint text-signal-dim",
      href: ORDER_MANAGEMENT_ROUTE,
      loading: orderStats.loading && !stats,
      stale: orderStats.loading && Boolean(stats),
    },
    {
      label: isAdmin ? "Products" : "Your products",
      value: cat?.products ?? "—",
      hint: cat ? `${cat.low} low · ${cat.out} out of stock` : null,
      icon: Package,
      tone: "bg-blueprint-tint text-blueprint-dim",
      href: PRODUCT_MANAGEMENT_ROUTE,
      loading: catalog.loading && !cat,
      stale: catalog.loading && Boolean(cat),
    },
    isAdmin
      ? {
          label: "Users",
          value: cat?.people?.total ?? "—",
          hint: cat?.people
            ? `${cat.people.merchants} merchants · ${cat.people.inactive} inactive`
            : null,
          icon: Users,
          tone: "bg-ok/12 text-ok",
          href: USER_MANAGEMENT_ROUTE,
          loading: catalog.loading && !cat,
          stale: catalog.loading && Boolean(cat),
        }
      : {
          label: "Pending",
          value: pending,
          hint: "Orders to confirm",
          icon: Clock,
          tone: "bg-marigold-tint text-marigold-dim",
          href: `${ORDER_MANAGEMENT_ROUTE}?status=${ORDER_STATUS_PENDING}`,
          loading: orderStats.loading && !stats,
          stale: orderStats.loading && Boolean(stats),
        },
  ];

  const alerts = [
    pending > 0 && {
      key: "pending",
      icon: Clock,
      tone: "bg-marigold text-on-marigold",
      title: `${pending} pending order${pending === 1 ? "" : "s"}`,
      body: "Confirm them so customers know they're on the way.",
      href: `${ORDER_MANAGEMENT_ROUTE}?status=${ORDER_STATUS_PENDING}`,
      cta: "Review orders",
    },
    cat?.out > 0 && {
      key: "out",
      icon: PackageX,
      tone: "bg-danger text-paper",
      title: `${cat.out} product${cat.out === 1 ? "" : "s"} out of stock`,
      body: "Shoppers can't buy these until you restock.",
      href: `${PRODUCT_MANAGEMENT_ROUTE}?stock=out`,
      cta: "Restock",
    },
    cat?.low > 0 && {
      key: "low",
      icon: Package,
      tone: "bg-signal text-on-signal",
      title: `${cat.low} running low`,
      body: "Five or fewer left in stock.",
      href: `${PRODUCT_MANAGEMENT_ROUTE}?stock=low`,
      cta: "View products",
    },
  ].filter(Boolean);

  const firstName = user?.name?.split(" ")[0];
  const today = new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" });

  return (
    <div className="container-page py-8 transition-colors duration-300 lg:py-10">
      {/* Header */}
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <motion.div {...fadeUp()}>
          <p className="eyebrow mb-2">
            {isAdmin ? "Admin" : "Merchant"} · {today}
          </p>
          <h1 className="font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">
            {firstName ? (
              <>
                {/* nowrap keeps the comma with the name; the marker is an inline-block. */}
                Hey <span className="whitespace-nowrap"><span className="marker">{firstName}</span>,</span>{" "}
                here&apos;s your day
              </>
            ) : (
              "Dashboard"
            )}
          </h1>
          <p className="mt-1.5 text-sm text-slate">
            {isAdmin
              ? "How the whole store is doing right now."
              : "How your products and orders are doing right now."}
          </p>
        </motion.div>
        <motion.button
          {...fadeUp(0.05)}
          type="button"
          onClick={refresh}
          disabled={busy}
          className="btn-secondary"
        >
          <RefreshCw size={14} className={busy ? "animate-spin" : ""} />
          {busy ? "Refreshing…" : "Refresh"}
        </motion.button>
      </div>

      {/* Hero + KPI tiles */}
      <div className="mb-6 grid gap-4 xl:grid-cols-[1.35fr_1fr]">
        <RevenueHero stats={stats} resource={orderStats} isAdmin={isAdmin} pending={pending} />
        <div className="grid gap-4 sm:grid-cols-3 xl:grid-cols-1 xl:grid-rows-3">
          {tiles.map((t, i) => (
            <StatTile key={t.label} {...t} delay={0.1 + i * 0.05} />
          ))}
        </div>
      </div>

      {/* Needs attention */}
      {alerts.length > 0 && (
        <motion.section {...fadeUp(0.2)} aria-labelledby="attention-title" className="mb-6">
          <h2 id="attention-title" className="eyebrow mb-3">
            Needs attention
          </h2>
          <ul className="grid gap-3 md:grid-cols-3">
            {alerts.map((a, i) => {
              const Icon = a.icon;
              return (
                <motion.li
                  key={a.key}
                  initial={{ opacity: 0, y: 12, rotate: i % 2 ? 1 : -1 }}
                  animate={{ opacity: 1, y: 0, rotate: 0 }}
                  transition={{ ...spring, delay: 0.25 + i * 0.06 }}
                >
                  <Link
                    href={a.href}
                    className="group flex h-full items-start gap-3 rounded-3xl border border-hairline bg-panel p-4 transition-all hover:-translate-y-0.5 hover:shadow-lift"
                  >
                    <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-2xl ${a.tone}`}>
                      <Icon size={17} aria-hidden />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-semibold text-ink">{a.title}</span>
                      <span className="mt-0.5 block text-xs text-slate">{a.body}</span>
                      <span className="mt-2.5 inline-flex items-center gap-1 text-xs font-semibold text-signal-dim">
                        {a.cta}
                        <ArrowRight size={12} className="transition-transform group-hover:translate-x-1" />
                      </span>
                    </span>
                  </Link>
                </motion.li>
              );
            })}
          </ul>
        </motion.section>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        {/* Recent orders */}
        <Card
          id="recent-orders-title"
          eyebrow="Latest activity"
          title="Recent orders"
          delay={0.25}
          action={
            <Link href={ORDER_MANAGEMENT_ROUTE} className="btn-ghost px-3 py-1.5 text-xs">
              View all <ArrowUpRight size={13} />
            </Link>
          }
        >
          {recent.loading && !recent.data ? (
            <ul className="space-y-2 px-1">
              {Array.from({ length: RECENT_LIMIT }, (_, i) => (
                <li key={i} className="flex items-center gap-3 px-2 py-2">
                  <span className="skeleton h-10 w-10 rounded-2xl" />
                  <span className="flex-1 space-y-1.5">
                    <span className="skeleton block h-3 w-24 rounded-full" />
                    <span className="skeleton block h-3 w-40 rounded-full" />
                  </span>
                  <span className="skeleton h-4 w-16 rounded-full" />
                </li>
              ))}
            </ul>
          ) : recent.error ? (
            <SectionError message="Couldn't load recent orders." onRetry={refresh} />
          ) : !recent.data?.length ? (
            <div className="px-6 py-14 text-center">
              <span className="mx-auto mb-3 grid h-12 w-12 animate-float place-items-center rounded-2xl bg-signal-tint text-signal-dim">
                <ShoppingCart size={20} aria-hidden />
              </span>
              <p className="text-sm text-slate">
                {isAdmin
                  ? "No orders yet. They'll show up here as soon as someone checks out."
                  : "No orders for your products yet."}
              </p>
            </div>
          ) : (
            <ul className={`space-y-0.5 ${staleClass(recent)}`}>
              {recent.data.map((order, i) => (
                <OrderRow key={order._id} order={order} index={i} isAdmin={isAdmin} />
              ))}
            </ul>
          )}
        </Card>

        {/* Right column */}
        <div className="space-y-6">
          <Card id="status-breakdown-title" eyebrow="Pipeline" title="Orders by status" delay={0.3}>
            {orderStats.loading && !stats ? (
              <div className="space-y-4 px-3 py-2">
                {ORDER_STATUSES.map((s) => (
                  <span key={s} className="skeleton block h-7 rounded-xl" />
                ))}
              </div>
            ) : orderStats.error ? (
              <SectionError message="Couldn't load order stats." onRetry={refresh} />
            ) : (
              <div className={staleClass(orderStats)}>
                <StatusBars stats={stats} />
              </div>
            )}
          </Card>

          <Card id="stock-health-title" eyebrow="Catalog" title="Stock health" delay={0.35}>
            {catalog.loading && !cat ? (
              <div className="space-y-3 px-3 py-2">
                <span className="skeleton block h-3 rounded-full" />
                <span className="skeleton block h-20 rounded-2xl" />
              </div>
            ) : catalog.error ? (
              <SectionError message="Couldn't load the catalog." onRetry={refresh} />
            ) : (
              <div className={`px-1 sm:px-2 ${staleClass(catalog)}`}>
                <StockHealth cat={cat} />
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
