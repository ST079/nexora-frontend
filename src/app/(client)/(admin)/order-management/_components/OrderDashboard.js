"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  X,
  Loader2,
  PackageOpen,
  ChevronDown,
  ChevronUp,
  Eye,
} from "lucide-react";
import OrderStatusBadge from "@/components/OrderStatusBadge";
import Pagination from "@/components/Pagination";
import { ORDER_MANAGEMENT_PAGE_SIZE } from "@/constants/pagination";
import { formatDate, formatNPR } from "@/utils/format";
import OrderViewModal from "./OrderViewModal";
import {
  PAYMENT_STATUS_SUCCESS,
} from "@/constants/payment";
import {
  ORDER_STATUS_CANCELLED,
  ORDER_STATUS_CONFIRMED,
  ORDER_STATUS_PENDING,
} from "@/constants/orders";

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.35, delay, ease: [0.22, 1, 0.36, 1] },
});

const OrderDashboard = ({ allOrders }) => {
  const orders = allOrders;
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState("createdAt");
  const [sortDir, setSortDir] = useState("desc");
  const [viewOrder, setViewOrder] = useState(null);
  const [page, setPage] = useState(1);

  console.log("orders", orders[0]);
  const toggleSort = (field) => {
    if (sortField === field) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortField(field);
      setSortDir("asc");
    }
    setPage(1);
  };

  const handleSearch = (val) => {
    setSearch(val);
    setPage(1);
  };

  const SortIcon = ({ field }) => {
    if (sortField !== field) return null;
    return sortDir === "asc" ? (
      <ChevronUp size={12} />
    ) : (
      <ChevronDown size={12} />
    );
  };

  // Filter — search by order number, customer name, or email
  const filtered = orders
    .filter((o) =>
      [
        o.orderNumber,
        o.user?.name,
        o.user?.email,
        o.shippingAddress?.city,
      ].some((v) => v?.toLowerCase().includes(search.toLowerCase())),
    )
    .sort((a, b) => {
      const dir = sortDir === "asc" ? 1 : -1;
      if (sortField === "totalPrice")
        return (a.totalPrice - b.totalPrice) * dir;
      if (sortField === "createdAt")
        return (new Date(a.createdAt) - new Date(b.createdAt)) * dir;
      return (
        String(a[sortField] ?? "").localeCompare(String(b[sortField] ?? "")) *
        dir
      );
    });

  // Pagination
  const totalPages = Math.max(
    1,
    Math.ceil(filtered.length / ORDER_MANAGEMENT_PAGE_SIZE),
  );
  const safePage = Math.min(page, totalPages);
  const paginated = filtered.slice(
    (safePage - 1) * ORDER_MANAGEMENT_PAGE_SIZE,
    safePage * ORDER_MANAGEMENT_PAGE_SIZE,
  );

  return (
    <div className="container-page py-10 bg-paper dark:bg-[#0e0f12] min-h-screen transition-colors duration-300">
      {/* Header */}
      <motion.div {...fadeUp()} className="mb-8">
        <p className="eyebrow dark:text-[#8b8fa8] mb-2">Admin · Orders</p>
        <h1 className="font-display text-3xl font-semibold text-ink dark:text-[#f0efe8]">
          Order management
        </h1>
      </motion.div>

      {/* Stats strip */}
      <motion.div
        {...fadeUp(0.07)}
        className="grid grid-cols-2 sm:grid-cols-5 border border-hairline dark:border-[#262932] mb-6"
      >
        {[
          { label: "Total orders", value: orders.length },
          {
            label: "Pending",
            value: orders.filter(
              (o) => o.status.toUpperCase() === ORDER_STATUS_PENDING,
            ).length,
          },
           {
            label: "Confirmed",
            value: orders.filter(
              (o) =>
                o.status.toUpperCase() === ORDER_STATUS_CONFIRMED,
            ).length,
          },
          {
            label: "Paid",
            value: orders.filter(
              (o) =>
                o.payment?.status.toUpperCase() === PAYMENT_STATUS_SUCCESS,
            ).length,
          },
          {
            label: "Cancelled",
            value: orders.filter(
              (o) => o.status.toUpperCase() === ORDER_STATUS_CANCELLED,
            ).length,
          },
        ].map((s, i) => (
          <div
            key={s.label}
            className={`px-5 py-4 ${
              i < 3 ? "border-r border-hairline dark:border-[#262932]" : ""
            }`}
          >
            <p className="font-display text-2xl font-semibold text-ink dark:text-[#f0efe8]">
              {s.value}
            </p>
            <p className="eyebrow dark:text-[#8b8fa8] mt-1">{s.label}</p>
          </div>
        ))}
      </motion.div>

      {/* Search */}
      <motion.div
        {...fadeUp(0.1)}
        className="flex items-center border border-hairline dark:border-[#262932] px-3 py-2.5 gap-2 mb-4 max-w-sm focus-within:border-ink dark:focus-within:border-[#f0efe8] transition-colors"
      >
        <Search size={14} className="text-slate dark:text-[#8b8fa8] shrink-0" />
        <input
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Search order #, customer, city…"
          className="w-full bg-transparent text-sm outline-none text-ink dark:text-[#f0efe8] placeholder:text-slate-light dark:placeholder:text-[#5b5e72]"
        />
        {search && (
          <button
            onClick={() => handleSearch("")}
            className="text-slate dark:text-[#8b8fa8] hover:text-ink dark:hover:text-[#f0efe8]"
          >
            <X size={13} />
          </button>
        )}
      </motion.div>

      {/* Table */}
      <motion.div
        {...fadeUp(0.12)}
        className="border border-hairline dark:border-[#262932] overflow-x-auto"
      >
        {loading ? (
          <div className="flex items-center justify-center gap-2 py-20 text-slate dark:text-[#8b8fa8]">
            <Loader2 size={16} className="animate-spin" />
            <span className="font-mono text-sm">Loading orders…</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <PackageOpen size={28} className="text-slate dark:text-[#8b8fa8]" />
            <p className="font-display font-semibold text-ink dark:text-[#f0efe8]">
              No orders found
            </p>
            <p className="text-sm text-slate dark:text-[#8b8fa8]">
              Try a different search term.
            </p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-hairline dark:border-[#262932] bg-paper dark:bg-[#0e0f12]">
                {[
                  { label: "Order #", field: "orderNumber" },
                  { label: "Customer", field: null },
                  { label: "Placed", field: "createdAt" },
                  { label: "Total", field: "totalPrice" },
                  { label: "Payment", field: null },
                  { label: "Status", field: null },
                  { label: "", field: null },
                ].map((col) => (
                  <th
                    key={col.label || "actions"}
                    onClick={() => col.field && toggleSort(col.field)}
                    className={`px-4 py-3 text-left font-mono text-[11px] uppercase tracking-widest text-slate dark:text-[#8b8fa8] whitespace-nowrap ${
                      col.field
                        ? "cursor-pointer hover:text-ink dark:hover:text-[#f0efe8] select-none"
                        : ""
                    }`}
                  >
                    <span className="inline-flex items-center gap-1">
                      {col.label} <SortIcon field={col.field} />
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline dark:divide-[#262932]">
              {paginated.map((order, i) => {
                const isPaid = order.payment?.status == PAYMENT_STATUS_SUCCESS;
                return (
                  <motion.tr
                    key={order._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                    className="hover:bg-hairline/20 dark:hover:bg-[#262932]/40 transition-colors cursor-pointer"
                    onClick={() => setViewOrder(order)}
                  >
                    <td className="px-4 py-3 font-mono text-ink dark:text-[#f0efe8]">
                      #
                      {order.orderNumber?.toUpperCase() ??
                        order._id?.slice(-8).toUpperCase()}
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-ink dark:text-[#f0efe8] max-w-[160px] truncate">
                        {order.user?.name || "Guest"}
                      </p>
                      <p className="text-xs text-slate dark:text-[#8b8fa8] max-w-[160px] truncate">
                        {order.user?.email}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-slate dark:text-[#8b8fa8] whitespace-nowrap">
                      {formatDate(order.createdAt)}
                    </td>
                    <td className="px-4 py-3 font-mono text-ink dark:text-[#f0efe8]">
                      {formatNPR(order.totalPrice)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`font-mono text-[11px] uppercase tracking-widest px-2 py-0.5 ${
                          isPaid
                            ? "bg-ok/10 text-ok"
                            : "bg-signal/10 text-signal"
                        }`}
                      >
                        {isPaid ? "Paid" : "Unpaid"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <OrderStatusBadge status={order.status} />
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setViewOrder(order);
                        }}
                        className="grid h-8 w-8 place-items-center border border-hairline dark:border-[#262932] text-slate dark:text-[#8b8fa8] hover:border-ink dark:hover:border-[#f0efe8] hover:text-ink dark:hover:text-[#f0efe8] transition-colors"
                        aria-label="View order"
                      >
                        <Eye size={13} />
                      </button>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        )}
      </motion.div>

      {/* Pagination */}
      <Pagination
        page={safePage}
        totalPages={totalPages}
        total={filtered.length}
        pageSize={ORDER_MANAGEMENT_PAGE_SIZE}
        onPageChange={setPage}
      />

      {/* View modal */}
      <AnimatePresence>
        {viewOrder && (
          <OrderViewModal
            key="order-view-modal"
            order={viewOrder}
            onClose={() => setViewOrder(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default OrderDashboard;
