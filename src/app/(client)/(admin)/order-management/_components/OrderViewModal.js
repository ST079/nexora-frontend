"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { X, User, MapPin, Package, Mail, Phone } from "lucide-react";
import OrderStatusBadge from "@/components/OrderStatusBadge";
import PaymentBadge from "@/components/PaymentBadge";
import { formatDate, formatNPR } from "@/utils/format";
import { PAYMENT_METHOD_LABELS } from "@/constants/payment";

// Items keep the name and price captured at checkout; fall back to the
// live product only for orders placed before that snapshot existed.
const lineName = (item) =>
  item.name || item.product?.name || `Product #${String(item.product?._id ?? item.product).slice(-6)}`;
const linePrice = (item) => item.price ?? item.product?.price ?? 0;

const OrderViewModal = ({ order, onClose, merchantView = false }) => {
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const address = order.shippingAddress ?? {};
  const orderNo =
    order.orderNumber?.toUpperCase() ?? order._id?.slice(-8).toUpperCase();
  const itemsTotal = order.orderItems?.reduce(
    (sum, item) => sum + linePrice(item) * item.quantity,
    0,
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-ink/50 dark:bg-black/70"
        onClick={onClose}
      />

      <motion.div
        role="dialog"
        aria-modal="true"
        aria-labelledby="order-view-title"
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 12 }}
        transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full max-w-2xl max-h-[85vh] overflow-y-auto bg-paper dark:bg-[#16181f] border border-hairline dark:border-[#262932] shadow-lift"
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-3 px-6 py-4 border-b border-hairline dark:border-[#262932] sticky top-0 z-10 bg-paper dark:bg-[#16181f]">
          <div className="min-w-0">
            <p className="eyebrow dark:text-[#8b8fa8]">Order #{orderNo}</p>
            <h3
              id="order-view-title"
              className="font-display text-lg font-semibold text-ink dark:text-[#f0efe8]"
            >
              {formatNPR(merchantView ? order.merchantTotal : order.totalPrice)}
              {merchantView && (
                <span className="ml-2 font-mono text-xs font-normal text-slate dark:text-[#8b8fa8]">
                  your share
                </span>
              )}
            </h3>
          </div>
          <div className="flex items-center gap-3">
            <OrderStatusBadge status={order.status} />
            <button
              onClick={onClose}
              className="grid h-8 w-8 place-items-center text-slate dark:text-[#8b8fa8] hover:text-ink dark:hover:text-[#f0efe8] transition-colors"
              aria-label="Close"
              autoFocus
            >
              <X size={16} />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            {/* Customer info */}
            <div className="border border-hairline dark:border-[#262932] p-4">
              <div className="flex items-center gap-2 mb-3">
                <User size={14} className="text-signal" />
                <p className="eyebrow dark:text-[#8b8fa8]">Ordered by</p>
              </div>
              <p className="text-sm font-medium text-ink dark:text-[#f0efe8] mb-1">
                {order.user?.name || "Deleted account"}
              </p>
              {order.user?.email && (
                <p className="flex items-center gap-1.5 text-xs text-slate dark:text-[#8b8fa8] mb-1 break-all">
                  <Mail size={11} className="shrink-0" /> {order.user.email}
                </p>
              )}
              {order.user?.phone && (
                <p className="flex items-center gap-1.5 text-xs text-slate dark:text-[#8b8fa8]">
                  <Phone size={11} /> {order.user.phone}
                </p>
              )}
            </div>

            {/* Shipping */}
            <div className="border border-hairline dark:border-[#262932] p-4">
              <div className="flex items-center gap-2 mb-3">
                <MapPin size={14} className="text-signal" />
                <p className="eyebrow dark:text-[#8b8fa8]">Shipping to</p>
              </div>
              <p className="text-sm text-ink dark:text-[#f0efe8]">
                {address.street || "—"}
              </p>
              <p className="text-sm text-slate dark:text-[#8b8fa8]">
                {[address.city, address.province, address.country]
                  .filter(Boolean)
                  .join(", ")}
              </p>
            </div>
          </div>

          {/* Items */}
          <div className="border border-hairline dark:border-[#262932]">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-hairline dark:border-[#262932]">
              <Package size={14} className="text-signal" />
              <p className="eyebrow dark:text-[#8b8fa8]">
                {merchantView ? "Your items in this order" : "Items"}
              </p>
            </div>
            <div className="divide-y divide-hairline dark:divide-[#262932]">
              {order.orderItems?.map((item, i) => (
                <div
                  key={item._id || i}
                  className="flex items-center justify-between gap-3 px-4 py-3"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-ink dark:text-[#f0efe8] truncate">
                      {lineName(item)}
                    </p>
                    <p className="font-mono text-xs text-slate dark:text-[#8b8fa8]">
                      {formatNPR(linePrice(item))} × {item.quantity}
                    </p>
                  </div>
                  <p className="font-mono text-sm text-ink dark:text-[#f0efe8] shrink-0">
                    {formatNPR(linePrice(item) * item.quantity)}
                  </p>
                </div>
              ))}
            </div>
            <dl className="px-4 py-3 font-mono text-sm space-y-1.5 border-t border-hairline dark:border-[#262932]">
              {merchantView ? (
                <div className="flex justify-between">
                  <dt className="text-slate dark:text-[#8b8fa8]">Your share</dt>
                  <dd className="font-medium text-ink dark:text-[#f0efe8]">
                    {formatNPR(order.merchantTotal)}
                  </dd>
                </div>
              ) : (
                <>
                  <div className="flex justify-between">
                    <dt className="text-slate dark:text-[#8b8fa8]">Items</dt>
                    <dd className="text-ink dark:text-[#f0efe8]">{formatNPR(itemsTotal)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-slate dark:text-[#8b8fa8]">Delivery</dt>
                    <dd className="text-ink dark:text-[#f0efe8]">
                      {formatNPR(order.deliveryCharge ?? 0)}
                    </dd>
                  </div>
                  <div className="flex justify-between pt-1.5 border-t border-hairline dark:border-[#262932]">
                    <dt className="text-slate dark:text-[#8b8fa8]">Total</dt>
                    <dd className="text-base font-medium text-ink dark:text-[#f0efe8]">
                      {formatNPR(order.totalPrice)}
                    </dd>
                  </div>
                </>
              )}
            </dl>
          </div>

          {/* Payment */}
          <div className="border border-hairline dark:border-[#262932] p-4 space-y-2">
            <div className="flex items-center justify-between">
              <p className="eyebrow dark:text-[#8b8fa8]">Payment</p>
              <PaymentBadge order={order} />
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate dark:text-[#8b8fa8]">Method</span>
              <span className="text-ink dark:text-[#f0efe8]">
                {PAYMENT_METHOD_LABELS[order.payment?.method] ?? "Not chosen yet"}
              </span>
            </div>
            <p className="font-mono text-xs text-slate dark:text-[#8b8fa8]">
              Placed {formatDate(order.createdAt)}
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default OrderViewModal;
