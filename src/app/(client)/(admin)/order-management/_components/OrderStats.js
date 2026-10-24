"use client";

import { motion } from "framer-motion";
import { Receipt, Wallet } from "lucide-react";
import { getOrderStats } from "@/api/order";
import CountUp from "@/components/CountUp";
import { StatTile } from "../../_components/Console";
import { useResource } from "@/hooks/useResource";
import { fadeUp } from "@/utils/motion";
import { formatNPR } from "@/utils/format";
import { ORDER_STATUSES, STATUS_MAP } from "@/constants/orders";

const rupees = (n) => formatNPR(Math.round(n));

// Counts come from /orders/stats (one aggregate, scoped to the caller's role)
// instead of downloading every order. `refreshKey` re-fetches after edits.
// With `onFilter`, each status tile toggles the table's status filter.
const OrderStats = ({ refreshKey = 0, status = "", onFilter }) => {
  const { data: stats, loading } = useResource(`order-stats|${refreshKey}`, getOrderStats);
  const initial = loading && !stats;

  return (
    <motion.div
      {...fadeUp(0.07)}
      className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4"
    >
      {/* Revenue leads, on a night card. */}
      <div className="relative col-span-2 flex items-center gap-4 overflow-hidden rounded-3xl bg-night p-4 text-on-night dark:border dark:border-hairline">
        <span
          aria-hidden
          className="pointer-events-none absolute -right-10 -top-12 h-32 w-32 animate-drift rounded-full bg-signal/40 blur-3xl"
        />
        <span className="relative grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-marigold text-on-marigold">
          <Wallet size={19} aria-hidden />
        </span>
        <span className="relative min-w-0">
          <span className="block truncate text-2xl font-semibold leading-tight">
            {stats ? (
              <CountUp value={stats.revenue ?? 0} format={rupees} />
            ) : initial ? (
              <span className="inline-block h-6 w-28 animate-pulse rounded-lg bg-on-night/15 align-middle" />
            ) : (
              "—"
            )}
          </span>
          <span className="mt-0.5 block text-xs font-medium text-on-night/60">Revenue</span>
        </span>
      </div>

      <StatTile
        label="Total orders"
        value={stats?.total}
        icon={Receipt}
        tone="bg-mist text-ink"
        loading={initial}
        active={Boolean(onFilter) && !status}
        onClick={onFilter && (() => onFilter(""))}
        index={0}
      />

      {ORDER_STATUSES.map((key, i) => {
        const entry = STATUS_MAP[key];
        const active = status === key;
        return (
          <StatTile
            key={key}
            label={entry.label}
            value={stats ? (stats.byStatus?.[key] ?? 0) : undefined}
            icon={entry.icon}
            tone={entry.color}
            loading={initial}
            active={active}
            onClick={onFilter && (() => onFilter(active ? "" : key))}
            index={i + 1}
          />
        );
      })}
    </motion.div>
  );
};

export default OrderStats;
