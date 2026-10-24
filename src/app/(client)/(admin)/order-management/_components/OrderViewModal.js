"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Check, Copy, CreditCard, Mail, MapPin, Package, Phone, User, X } from "lucide-react";
import { Modal } from "@/components/Modal";
import OrderStatusBadge from "@/components/OrderStatusBadge";
import OrderTimeline from "@/components/OrderTimeline";
import PaymentBadge from "@/components/PaymentBadge";
import { Avatar } from "@/components/UserProfile";
import { formatDate, formatNPR } from "@/utils/format";
import { stagger, item as listItem } from "@/utils/motion";
import { PAYMENT_METHOD_LABELS } from "@/constants/payment";

// Items keep the name and price captured at checkout; fall back to the
// live product only for orders placed before that snapshot existed.
const lineName = (item) =>
  item.name || item.product?.name || `Product #${String(item.product?._id ?? item.product).slice(-6)}`;
const linePrice = (item) => item.price ?? item.product?.price ?? 0;

const InfoCard = ({ icon: Icon, title, children }) => (
  <motion.div variants={listItem} className="rounded-3xl border border-hairline bg-panel p-4">
    <div className="mb-3 flex items-center gap-2">
      <span className="grid h-7 w-7 place-items-center rounded-xl bg-signal-tint text-signal-dim">
        <Icon size={14} aria-hidden />
      </span>
      <p className="eyebrow">{title}</p>
    </div>
    {children}
  </motion.div>
);

const OrderViewModal = ({ order, onClose, merchantView = false }) => {
  const [copied, setCopied] = useState(false);
  const address = order.shippingAddress ?? {};
  const orderNo =
    order.orderNumber?.toUpperCase() ?? order._id?.slice(-8).toUpperCase();
  const itemsTotal = order.orderItems?.reduce(
    (sum, item) => sum + linePrice(item) * item.quantity,
    0,
  );

  const copyOrderNo = async () => {
    try {
      await navigator.clipboard.writeText(orderNo);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard can be blocked (http, permissions); the number is on screen anyway.
    }
  };

  return (
    <Modal onClose={onClose} labelledBy="order-view-title" size="max-w-2xl">
      {/* Header */}
      <div className="sticky top-0 z-10 flex items-start justify-between gap-3 border-b border-hairline bg-panel/90 px-6 py-5 backdrop-blur-xl">
        <div className="min-w-0">
          <button
            type="button"
            onClick={copyOrderNo}
            className="group mb-1 inline-flex items-center gap-1.5 rounded-full bg-mist px-2.5 py-1 font-mono text-[11px] text-slate-dim transition-colors hover:bg-signal-tint hover:text-signal-dim"
            aria-label={`Copy order number ${orderNo}`}
          >
            #{orderNo}
            {copied ? <Check size={11} className="text-ok" /> : <Copy size={11} className="opacity-60 group-hover:opacity-100" />}
          </button>
          <h3 id="order-view-title" className="font-display text-2xl font-bold text-ink">
            {formatNPR(merchantView ? order.merchantTotal : order.totalPrice)}
            {merchantView && (
              <span className="ml-2 align-middle text-xs font-medium text-slate">your share</span>
            )}
          </h3>
          <p className="mt-0.5 text-xs text-slate">Placed {formatDate(order.createdAt)}</p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <OrderStatusBadge status={order.status} />
          <button
            type="button"
            onClick={onClose}
            className="icon-btn h-9 w-9"
            aria-label="Close"
            autoFocus
          >
            <X size={16} />
          </button>
        </div>
      </div>

      <motion.div variants={stagger(0.06, 0.05)} initial="hidden" animate="show" className="space-y-4 p-6">
        <motion.div variants={listItem}>
          <OrderTimeline status={order.status} />
        </motion.div>

        <div className="grid gap-4 sm:grid-cols-2">
          <InfoCard icon={User} title="Ordered by">
            <div className="flex items-center gap-3">
              <Avatar user={order.user} size="h-10 w-10 text-xs shrink-0" />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-ink">
                  {order.user?.name || "Deleted account"}
                </p>
                {order.user?.email && (
                  <a
                    href={`mailto:${order.user.email}`}
                    className="flex items-center gap-1.5 break-all text-xs text-slate hover:text-signal-dim"
                  >
                    <Mail size={11} className="shrink-0" /> {order.user.email}
                  </a>
                )}
                {order.user?.phone && (
                  <a
                    href={`tel:${order.user.phone}`}
                    className="flex items-center gap-1.5 text-xs text-slate hover:text-signal-dim"
                  >
                    <Phone size={11} /> {order.user.phone}
                  </a>
                )}
              </div>
            </div>
          </InfoCard>

          <InfoCard icon={MapPin} title="Shipping to">
            <p className="text-sm font-medium text-ink">{address.street || "—"}</p>
            <p className="text-sm text-slate">
              {[address.city, address.province, address.country].filter(Boolean).join(", ")}
            </p>
          </InfoCard>
        </div>

        {/* Items */}
        <motion.div variants={listItem} className="overflow-hidden rounded-3xl border border-hairline">
          <div className="flex items-center gap-2 border-b border-hairline px-4 py-3">
            <span className="grid h-7 w-7 place-items-center rounded-xl bg-signal-tint text-signal-dim">
              <Package size={14} aria-hidden />
            </span>
            <p className="eyebrow">{merchantView ? "Your items in this order" : "Items"}</p>
            <span className="ml-auto rounded-full bg-mist px-2 py-0.5 text-[11px] font-semibold text-slate-dim">
              {order.orderItems?.length ?? 0}
            </span>
          </div>
          <ul className="space-y-0.5 p-2">
            {order.orderItems?.map((item, i) => (
              <li
                key={item._id || i}
                className="flex items-center justify-between gap-3 rounded-2xl px-3 py-2.5 transition-colors hover:bg-mist"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span className="grid h-8 min-w-8 place-items-center rounded-xl bg-ink px-1.5 text-xs font-bold text-paper">
                    ×{item.quantity}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-ink">{lineName(item)}</p>
                    <p className="text-xs tabular-nums text-slate">{formatNPR(linePrice(item))} each</p>
                  </div>
                </div>
                <p className="shrink-0 text-sm font-semibold tabular-nums text-ink">
                  {formatNPR(linePrice(item) * item.quantity)}
                </p>
              </li>
            ))}
          </ul>
          <dl className="space-y-1.5 border-t border-hairline bg-mist/40 px-5 py-4 text-sm">
            {merchantView ? (
              <div className="flex justify-between">
                <dt className="text-slate">Your share</dt>
                <dd className="font-bold tabular-nums text-ink">{formatNPR(order.merchantTotal)}</dd>
              </div>
            ) : (
              <>
                <div className="flex justify-between">
                  <dt className="text-slate">Items</dt>
                  <dd className="tabular-nums text-ink">{formatNPR(itemsTotal)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate">Delivery</dt>
                  <dd className="tabular-nums text-ink">{formatNPR(order.deliveryCharge ?? 0)}</dd>
                </div>
                <div className="flex justify-between border-t border-dashed border-ink/15 pt-2">
                  <dt className="font-semibold text-ink">Total</dt>
                  <dd className="text-base font-bold tabular-nums text-ink">
                    {formatNPR(order.totalPrice)}
                  </dd>
                </div>
              </>
            )}
          </dl>
        </motion.div>

        {/* Payment */}
        <InfoCard icon={CreditCard} title="Payment">
          <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
            <span className="font-medium text-ink">
              {PAYMENT_METHOD_LABELS[order.payment?.method] ?? "Not chosen yet"}
            </span>
            <PaymentBadge order={order} methodShown />
          </div>
        </InfoCard>
      </motion.div>
    </Modal>
  );
};

export default OrderViewModal;
