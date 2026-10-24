"use client";

import { Suspense, useCallback, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, Info, PackageOpen, RefreshCw } from "lucide-react";
import { useSelector } from "react-redux";
import { ORDER_MANAGEMENT_PAGE_SIZE } from "@/constants/pagination";
import { apiErrorMessage, formatDate, formatNPR } from "@/utils/format";
import { fadeUp } from "@/utils/motion";
import { ORDER_STATUSES, STATUS_MAP } from "@/constants/orders";

const STATUS_FILTERS = [
  { value: "", label: "All" },
  ...ORDER_STATUSES.map((key) => ({ value: key, label: STATUS_MAP[key].label, dot: STATUS_MAP[key].dot })),
];

const thClass =
  "px-4 py-3 text-left font-mono text-[11px] uppercase tracking-widest text-slate whitespace-nowrap";
import { ROLE_ADMIN } from "@/constants/user";
import { getAllOrders, getMerchantOrders, getTotalCount } from "@/api/order";
import OrderViewModal from "./_components/OrderViewModal";
import OrderStatusAction from "./_components/OrderStatusAction";
import OrderStats from "./_components/OrderStats";
import {
  ConsoleHeader,
  ConsoleTable,
  FilterChips,
  RowAction,
  TableCard,
  TableEmpty,
  TableError,
  TableSkeleton,
  rowMotion,
  tdClass,
} from "../_components/Console";
import Loader from "@/components/Loader";
import Pagination from "@/components/Pagination";
import PaymentBadge from "@/components/PaymentBadge";
import SearchField from "@/components/SearchField";
import { Avatar } from "@/components/UserProfile";
import { useQueryParams } from "@/hooks/useQueryParams";
import { useResource } from "@/hooks/useResource";

const OrderManagement = () => {
  const { user } = useSelector((state) => state.auth);
  const isAdmin = user?.roles?.includes(ROLE_ADMIN);
  const { searchParams, setParams } = useQueryParams();
  const [viewOrder, setViewOrder] = useState(null);
  const [statsVersion, setStatsVersion] = useState(0);
  const [listVersion, setListVersion] = useState(0);

  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const status = searchParams.get("status") ?? "";
  const search = searchParams.get("search") ?? "";

  // Filtering and paging happen on the server, so search covers every
  // order rather than only the page in view. Merchants get their own
  // endpoint: orders trimmed to their lines, with a `merchantTotal`.
  const filters = { status, search };
  const queryKey = `${isAdmin}|${page}|${status}|${search}|${listVersion}`;
  const { data, loading, error, setData } = useResource(queryKey, async () => {
    const limit = ORDER_MANAGEMENT_PAGE_SIZE;
    const offset = (page - 1) * limit;
    const list = isAdmin ? getAllOrders : getMerchantOrders;
    const [orders, count] = await Promise.all([
      list({ ...filters, limit, offset }),
      getTotalCount(filters),
    ]);
    return { orders, total: count.totalCount };
  });
  const orders = data?.orders ?? [];

  const handleUpdated = (updated) => {
    setData((d) => ({
      ...d,
      orders: d.orders.map((o) => (o._id === updated._id ? { ...o, ...updated } : o)),
    }));
    setStatsVersion((v) => v + 1);
  };

  // Stable, so the modal's Escape listener isn't re-bound on every render.
  const closeView = useCallback(() => setViewOrder(null), []);

  const refresh = () => {
    setListVersion((v) => v + 1);
    setStatsVersion((v) => v + 1);
  };

  return (
    <div className="container-page py-8 transition-colors duration-300 lg:py-10">
      <ConsoleHeader
        eyebrow={`${isAdmin ? "Admin" : "Merchant"} · Orders`}
        title={
          isAdmin ? (
            <>
              Order <span className="marker">management</span>
            </>
          ) : (
            <>
              Orders for your <span className="marker">products</span>
            </>
          )
        }
        description={
          isAdmin
            ? "Tap a status to filter, and change an order's status right from the table."
            : undefined
        }
      >
        <button
          type="button"
          onClick={refresh}
          disabled={loading}
          className="btn-secondary"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          {loading ? "Refreshing…" : "Refresh"}
        </button>
      </ConsoleHeader>

      {!isAdmin && (
        <motion.p
          {...fadeUp(0.04)}
          className="-mt-4 mb-6 flex items-start gap-2.5 rounded-2xl border border-blueprint/20 bg-blueprint-tint px-4 py-3 text-sm text-blueprint-dim"
        >
          <Info size={16} className="mt-0.5 shrink-0" aria-hidden />
          Each order shows only the lines you sell. Fulfilment status is set by the Nexora team.
        </motion.p>
      )}

      <OrderStats
        refreshKey={statsVersion}
        status={status}
        onFilter={(value) => setParams({ status: value })}
      />

      <motion.div
        {...fadeUp(0.1)}
        className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between"
      >
        <SearchField
          value={search}
          onChange={(value) => setParams({ search: value })}
          placeholder="Search by order number…"
          label="Search orders"
          className="w-full lg:max-w-sm"
        />
        <FilterChips
          label="Filter by status"
          layoutId="order-status-filter"
          options={STATUS_FILTERS}
          value={status}
          onChange={(value) => setParams({ status: value })}
        />
      </motion.div>

      <TableCard stale={loading && Boolean(data)}>
        {loading && !data ? (
          <TableSkeleton label="Loading orders" />
        ) : error ? (
          <TableError
            title="Couldn't load orders"
            message={apiErrorMessage(error, "Check your connection and try again.")}
            onRetry={refresh}
          />
        ) : orders.length === 0 ? (
          <TableEmpty
            icon={PackageOpen}
            title="No orders found"
            description={
              search || status
                ? "Try a different search or status."
                : "Orders will appear here as soon as customers check out."
            }
          >
            {(search || status) && (
              <button
                type="button"
                onClick={() => setParams({ search: "", status: "" })}
                className="btn-secondary"
              >
                Clear filters
              </button>
            )}
          </TableEmpty>
        ) : (
          <ConsoleTable>
            <thead>
              <tr>
                {[
                  "Order #",
                  "Customer",
                  "Placed",
                  isAdmin ? "Total" : "Your share",
                  "Payment",
                  "Status",
                  "",
                ].map((label) => (
                  <th key={label || "actions"} scope="col" className={thClass}>
                    {label || <span className="sr-only">Actions</span>}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {orders.map((order, i) => (
                <motion.tr
                  key={order._id}
                  {...rowMotion(i)}
                  className="group cursor-pointer"
                  onClick={() => setViewOrder(order)}
                >
                  <td className={`${tdClass} whitespace-nowrap`}>
                    <span className="rounded-full bg-mist px-2.5 py-1 font-mono text-xs font-medium text-ink transition-colors group-hover:bg-panel">
                      #{order.orderNumber?.toUpperCase() ?? order._id?.slice(-8).toUpperCase()}
                    </span>
                  </td>
                  <td className={tdClass}>
                    <div className="flex items-center gap-3">
                      <Avatar user={order.user} size="h-8 w-8 text-[11px] shrink-0" />
                      <div className="min-w-0">
                        <p className="max-w-40 truncate font-semibold text-ink">
                          {order.user?.name || "Deleted account"}
                        </p>
                        <p className="max-w-40 truncate text-xs text-slate">{order.user?.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className={`${tdClass} whitespace-nowrap text-slate`}>
                    {formatDate(order.createdAt)}
                  </td>
                  <td className={`${tdClass} whitespace-nowrap font-semibold tabular-nums text-ink`}>
                    {formatNPR(isAdmin ? order.totalPrice : order.merchantTotal)}
                  </td>
                  <td className={tdClass}>
                    <PaymentBadge order={order} />
                  </td>
                  <td className={tdClass}>
                    <OrderStatusAction
                      order={order}
                      onUpdated={handleUpdated}
                      readOnly={!isAdmin}
                    />
                  </td>
                  <td className={tdClass}>
                    <div className="flex justify-end">
                      <RowAction
                        onClick={(e) => {
                          e.stopPropagation();
                          setViewOrder(order);
                        }}
                        aria-label={`View order ${order.orderNumber ?? ""}`}
                        title="View details"
                      >
                        <Eye size={14} />
                      </RowAction>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </ConsoleTable>
        )}
      </TableCard>

      <Pagination total={data?.total ?? 0} pageSize={ORDER_MANAGEMENT_PAGE_SIZE} />

      <AnimatePresence>
        {viewOrder && (
          <OrderViewModal
            key="order-view-modal"
            order={viewOrder}
            merchantView={!isAdmin}
            onClose={closeView}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

// useSearchParams needs a Suspense boundary or the route can't prerender.
const OrderManagementPage = () => (
  <Suspense fallback={<Loader label="Loading orders" />}>
    <OrderManagement />
  </Suspense>
);

export default OrderManagementPage;
