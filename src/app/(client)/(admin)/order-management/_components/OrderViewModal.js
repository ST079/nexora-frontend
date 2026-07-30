"use client";

import { motion } from "framer-motion";
import { X, User, MapPin, Package, Mail, Phone } from "lucide-react";
import OrderStatusBadge from "@/components/OrderStatusBadge";
import { formatDate, formatNPR } from "@/utils/format";
import { PAYMENT_STATUS_SUCCESS } from "@/constants/payment";

const OrderViewModal = ({ order, onClose }) => {
  const isPaid = order.payment?.status == PAYMENT_STATUS_SUCCESS;

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
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 12 }}
        transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full max-w-2xl max-h-[85vh] overflow-y-auto bg-paper dark:bg-[#16181f] border border-hairline dark:border-[#262932] shadow-lift"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-hairline dark:border-[#262932] sticky top-0 bg-paper dark:bg-[#16181f]">
          <div>
            <p className="eyebrow dark:text-[#8b8fa8]">
              Order #
              {order.orderNumber?.toUpperCase() ??
                order._id?.slice(-8).toUpperCase()}
            </p>
            <h3 className="font-display text-lg font-semibold text-ink dark:text-[#f0efe8]">
              {formatNPR(order.totalPrice)}
            </h3>
          </div>
          <div className="flex items-center gap-3">
            <OrderStatusBadge status={order.status} />
            <button
              onClick={onClose}
              className="grid h-8 w-8 place-items-center text-slate dark:text-[#8b8fa8] hover:text-ink dark:hover:text-[#f0efe8] transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Customer info */}
          <div className="border border-hairline dark:border-[#262932] p-4">
            <div className="flex items-center gap-2 mb-3">
              <User size={14} className="text-signal" />
              <p className="eyebrow dark:text-[#8b8fa8]">Ordered by</p>
            </div>
            <p className="text-sm font-medium text-ink dark:text-[#f0efe8] mb-1">
              {order.user?.name || "Guest"}
            </p>
            {order.user?.email && (
              <p className="flex items-center gap-1.5 text-xs text-slate dark:text-[#8b8fa8] mb-1">
                <Mail size={11} /> {order.user.email}
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
              {order.shippingAddress?.street}
            </p>
            <p className="text-sm text-slate dark:text-[#8b8fa8]">
              {order.shippingAddress?.city}
            </p>
          </div>

          {/* Items */}
          <div className="border border-hairline dark:border-[#262932]">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-hairline dark:border-[#262932]">
              <Package size={14} className="text-signal" />
              <p className="eyebrow dark:text-[#8b8fa8]">Items</p>
            </div>
            <div className="divide-y divide-hairline dark:divide-[#262932]">
              {order.orderItems?.map((item, i) => {
                const product =
                  typeof item.product === "object" ? item.product : null;
                return (
                  <div
                    key={item._id || i}
                    className="flex items-center justify-between px-4 py-3"
                  >
                    <div>
                      <p className="text-sm font-medium text-ink dark:text-[#f0efe8]">
                        {product?.name ||
                          `Product #${String(item.product).slice(-6)}`}
                      </p>
                      <p className="font-mono text-xs text-slate dark:text-[#8b8fa8]">
                        Qty {item.quantity}
                      </p>
                    </div>
                    {product?.price && (
                      <p className="font-mono text-sm text-ink dark:text-[#f0efe8]">
                        {formatNPR(product.price * item.quantity)}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
            <div className="flex items-baseline justify-between px-4 py-3 font-mono border-t border-hairline dark:border-[#262932]">
              <span className="text-slate dark:text-[#8b8fa8] text-sm">
                Total
              </span>
              <span className="text-base font-medium text-ink dark:text-[#f0efe8]">
                {formatNPR(order.totalPrice)}
              </span>
            </div>
          </div>

          {/* Payment */}
          <div className="border border-hairline dark:border-[#262932] p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="eyebrow dark:text-[#8b8fa8]">Payment status</p>
              <span
                className={`font-mono text-[11px] uppercase tracking-widest px-2 py-0.5 ${
                  isPaid ? "bg-ok/10 text-ok" : "bg-signal/10 text-signal"
                }`}
              >
                {isPaid ? "Paid" : "Unpaid"}
              </span>
            </div>
            {order.payment && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate dark:text-[#8b8fa8]">
                  Method
                </span>
                <span className="text-sm text-ink dark:text-[#f0efe8] capitalize">
                  {order.payment?.method}
                </span>
              </div>
            )}
            <p className="font-mono text-xs text-slate dark:text-[#8b8fa8] mt-2">
              Placed {formatDate(order.createdAt)}
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default OrderViewModal;
