"use client";

import { Suspense, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PackageOpen, Eye, AlertTriangle } from "lucide-react";
import { useSelector } from "react-redux";
import { ORDER_MANAGEMENT_PAGE_SIZE } from "@/constants/pagination";
import { formatDate, formatNPR } from "@/utils/format";
import { fadeUp } from "@/utils/motion";
import { ORDER_STATUSES, STATUS_MAP } from "@/constants/orders";
import { ROLE_ADMIN } from "@/constants/user";
import { getAllOrders, getMerchantOrders, getTotalCount } from "@/api/order";
import OrderViewModal from "./_components/OrderViewModal";
import OrderStatusAction from "./_components/OrderStatusAction";
import OrderStats from "./_components/OrderStats";
import Loader from "@/components/Loader";
import Pagination from "@/components/Pagination";
import PaymentBadge from "@/components/PaymentBadge";
import SearchField from "@/components/SearchField";
import { useQueryParams } from "@/hooks/useQueryParams";
import { useResource } from "@/hooks/useResource";

const OrderManagement = () => {
  const { user } = useSelector((state) => state.auth);
  const isAdmin = user?.roles?.includes(ROLE_ADMIN);
  const { searchParams, setParams } = useQueryParams();
  const [viewOrder, setViewOrder] = useState(null);
  const [statsVersion, setStatsVersion] = useState(0);

  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const status = searchParams.get("status") ?? "";
  const search = searchParams.get("search") ?? "";

  // Filtering and paging happen on the server, so search covers every
  // order rather than only the page in view. Merchants get their own
  // endpoint: orders trimmed to their lines, with a `merchantTotal`.
  const filters = { status, search };
  const queryKey = `${isAdmin}|${page}|${status}|${search}`;
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

  return (
    <div className="container-page py-8 lg:py-10 transition-colors duration-300">
      {/* Header */}
      <motion.div {...fadeUp()} className="mb-8">
        <p className="eyebrow dark:text-[#8b8fa8] mb-2">
          {isAdmin ? "Admin" : "Merchant"} · Orders
        </p>
        <h1 className="font-display text-3xl font-semibold text-ink dark:text-[#f0efe8]">
          {isAdmin ? "Order management" : "Orders for your products"}
        </h1>
        {!isAdmin && (
          <p className="mt-2 text-sm text-slate dark:text-[#8b8fa8] max-w-xl">
            Each order shows only the lines you sell. Fulfilment status is set by
            the Nexora team.
          </p>
        )}
      </motion.div>

      <OrderStats refreshKey={statsVersion} />

      {/* Filters */}
      <motion.div
        {...fadeUp(0.1)}
        className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between mb-4"
      >
        <SearchField
          value={search}
          onChange={(value) => setParams({ search: value })}
          placeholder="Search by order number…"
          label="Search orders"
          className="w-full lg:max-w-sm"
        />
        <div
          role="group"
          aria-label="Filter by status"
          className="flex gap-1 overflow-x-auto pb-1 lg:pb-0"
        >
          {["", ...ORDER_STATUSES].map((s) => {
            const active = status === s;
            return (
              <button
                key={s || "all"}
                onClick={() => setParams({ status: s })}
                aria-pressed={active}
                className={`shrink-0 px-3 py-1.5 font-mono text-[11px] uppercase tracking-widest border transition-colors ${
                  active
                    ? "border-ink dark:border-[#f0efe8] bg-ink dark:bg-[#f0efe8] text-paper dark:text-[#0e0f12]"
                    : "border-hairline dark:border-[#262932] text-slate dark:text-[#8b8fa8] hover:border-ink dark:hover:border-[#f0efe8] hover:text-ink dark:hover:text-[#f0efe8]"
                }`}
              >
                {s ? STATUS_MAP[s].label : "All"}
              </button>
            );
          })}
        </div>
      </motion.div>

      {/* Table */}
      <motion.div
        {...fadeUp(0.12)}
        className="border border-hairline dark:border-[#262932] overflow-x-auto"
      >
        {loading ? (
          <Loader label="Loading orders" />
        ) : error ? (
          <div role="alert" className="flex flex-col items-center justify-center py-20 gap-3 text-center px-6">
            <AlertTriangle size={26} className="text-danger" />
            <p className="font-display font-semibold text-ink dark:text-[#f0efe8]">
              Couldn&apos;t load orders
            </p>
            <p className="text-sm text-slate dark:text-[#8b8fa8]">
              {error?.response?.data?.message ?? "Check your connection and try again."}
            </p>
          </div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-center px-6">
            <PackageOpen size={28} className="text-slate dark:text-[#8b8fa8]" />
            <p className="font-display font-semibold text-ink dark:text-[#f0efe8]">
              No orders found
            </p>
            <p className="text-sm text-slate dark:text-[#8b8fa8]">
              {search || status
                ? "Try a different search or status."
                : "Orders will appear here as soon as customers check out."}
            </p>
            {(search || status) && (
              <button
                onClick={() => setParams({ search: "", status: "" })}
                className="btn-secondary mt-2"
              >
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-hairline dark:border-[#262932]">
                {[
                  "Order #",
                  "Customer",
                  "Placed",
                  isAdmin ? "Total" : "Your share",
                  "Payment",
                  "Status",
                  "",
                ].map((label) => (
                  <th
                    key={label || "actions"}
                    scope="col"
                    className="px-4 py-3 text-left font-mono text-[11px] uppercase tracking-widest text-slate dark:text-[#8b8fa8] whitespace-nowrap"
                  >
                    {label || <span className="sr-only">Actions</span>}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline dark:divide-[#262932]">
              {orders.map((order, i) => (
                <motion.tr
                  key={order._id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.03 }}
                  className="hover:bg-hairline/20 dark:hover:bg-[#262932]/40 transition-colors cursor-pointer"
                  onClick={() => setViewOrder(order)}
                >
                  <td className="px-4 py-3 font-mono text-ink dark:text-[#f0efe8] whitespace-nowrap">
                    #{order.orderNumber?.toUpperCase() ?? order._id?.slice(-8).toUpperCase()}
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-ink dark:text-[#f0efe8] max-w-40 truncate">
                      {order.user?.name || "Deleted account"}
                    </p>
                    <p className="text-xs text-slate dark:text-[#8b8fa8] max-w-40 truncate">
                      {order.user?.email}
                    </p>
                  </td>
                  <td className="px-4 py-3 text-slate dark:text-[#8b8fa8] whitespace-nowrap">
                    {formatDate(order.createdAt)}
                  </td>
                  <td className="px-4 py-3 font-mono text-ink dark:text-[#f0efe8] whitespace-nowrap">
                    {formatNPR(isAdmin ? order.totalPrice : order.merchantTotal)}
                  </td>
                  <td className="px-4 py-3">
                    <PaymentBadge order={order} />
                  </td>
                  <td className="px-4 py-3">
                    <OrderStatusAction
                      order={order}
                      onUpdated={handleUpdated}
                      readOnly={!isAdmin}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setViewOrder(order);
                      }}
                      className="grid h-8 w-8 place-items-center border border-hairline dark:border-[#262932] text-slate dark:text-[#8b8fa8] hover:border-ink dark:hover:border-[#f0efe8] hover:text-ink dark:hover:text-[#f0efe8] transition-colors"
                      aria-label={`View order ${order.orderNumber ?? ""}`}
                    >
                      <Eye size={13} />
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        )}
      </motion.div>

      <Pagination total={data?.total ?? 0} pageSize={ORDER_MANAGEMENT_PAGE_SIZE} />

      <AnimatePresence>
        {viewOrder && (
          <OrderViewModal
            key="order-view-modal"
            order={viewOrder}
            merchantView={!isAdmin}
            onClose={() => setViewOrder(null)}
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
