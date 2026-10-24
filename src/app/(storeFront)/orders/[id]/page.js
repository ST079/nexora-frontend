 "use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useSelector } from "react-redux";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import {
  ChevronLeft,
  Loader2,
  RefreshCw,
  XCircle,
  MapPin,
  Wallet,
  Banknote,
  Ban,
  Package,
  CreditCard,
} from "lucide-react";
import OrderStatusBadge from "@/components/OrderStatusBadge";
import OrderTimeline from "@/components/OrderTimeline";
import Loader from "@/components/Loader";
import OrderCancelConformationModal from "@/components/OrderCancelConformationModal";
import CashConfirmModal from "@/components/CashConfirmModal";
import StripePaymentModal from "@/components/StripePaymentModal";
import toast from "react-hot-toast";
import { apiErrorMessage, formatDate, formatNPR } from "@/utils/format";
import { fadeUp } from "@/utils/motion";
import { useResource } from "@/hooks/useResource";
import {
  cancelOrder,
  getOrderById,
  payViaCash,
  payViaKhalti,
  payViaStripe,
} from "@/api/order";
import {
  CUSTOMER_CANCELLABLE,
  ORDER_STATUS_CANCELLED,
  ORDER_STATUS_PENDING,
} from "@/constants/orders";
import {
  isOrderPaid,
  PAYMENT_METHOD_CASH,
  PAYMENT_METHOD_LABELS,
  PAYMENT_STATUS_FAILED,
} from "@/constants/payment";
import { ORDERS_ROUTE, PRODUCTS_ROUTE } from "@/constants/routes";

const PAY_BUTTON =
  "flex w-full items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed transition-opacity";

// What the payment card says, in priority order.
const paymentState = (order) => {
  if (isOrderPaid(order)) return { label: "Paid", tone: "bg-ok/10 text-ok" };
  if (order.status === ORDER_STATUS_CANCELLED)
    return { label: "Not charged", tone: "bg-hairline text-slate-dim dark:bg-[#262932] dark:text-[#8b8fa8]" };
  if (order.payment?.method === PAYMENT_METHOD_CASH)
    return { label: "Pay on delivery", tone: "bg-blueprint/10 text-blueprint dark:text-[#9aa6ff]" };
  if (order.payment?.status === PAYMENT_STATUS_FAILED)
    return { label: "Failed", tone: "bg-danger/10 text-danger" };
  return { label: "Unpaid", tone: "bg-signal/10 text-signal-dim dark:text-signal" };
};

const OrderDetailPage = () => {
  const { id } = useParams();
  const me = useSelector((state) => state.auth.user);
  const [version, setVersion] = useState(0);
  const [busyAction, setBusyAction] = useState(null);
  const [showCancel, setShowCancel] = useState(false);
  const [showCash, setShowCash] = useState(false);
  const [stripeSecret, setStripeSecret] = useState("");

  const { data, error, loading } = useResource(`${id}|${version}`, () =>
    getOrderById(id)
  );
  const order = data?.order ?? data?.data ?? data;
  const refresh = () => setVersion((v) => v + 1);

  const run = async (action, task) => {
    setBusyAction(action);
    try {
      return await task();
    } finally {
      setBusyAction(null);
    }
  };

  const handleCancel = () =>
    run("cancel", async () => {
      try {
        await cancelOrder(id);
        toast.success("Order cancelled.");
        setShowCancel(false);
        refresh();
      } catch (err) {
        toast.error(apiErrorMessage(err, "Could not cancel this order."));
      }
    });

  const handlePayKhalti = async () => {
    setBusyAction("khalti");
    try {
      const response = await payViaKhalti(id);
      if (!response?.payment_url) throw new Error("Khalti didn't return a payment link.");
      // Stay busy: the browser is leaving for Khalti.
      window.location.assign(response.payment_url);
    } catch (err) {
      toast.error(apiErrorMessage(err, "Could not start the Khalti payment."));
      setBusyAction(null);
    }
  };

  const handlePayStripe = () =>
    run("stripe", async () => {
      try {
        const response = await payViaStripe(id);
        setStripeSecret(response.client_secret);
      } catch (err) {
        toast.error(apiErrorMessage(err, "Could not start the card payment."));
      }
    });

  const handlePayCash = () =>
    run("cash", async () => {
      try {
        await payViaCash(id);
        toast.success("Order confirmed. Pay in cash when it arrives.");
        setShowCash(false);
        refresh();
      } catch (err) {
        toast.error(apiErrorMessage(err, "Could not choose cash on delivery."));
      }
    });

  // Keep showing the order while it refreshes after an action.
  if (loading && !order) return <Loader label="Fetching your order details" />;

  if (error || !order) {
    const missing = [403, 404, 400].includes(error?.response?.status);
    return (
      <div className="container-page py-16 text-center">
        <XCircle size={28} className="text-danger mx-auto mb-4" />
        <h1 className="font-display text-xl font-semibold text-ink dark:text-[#f0efe8] mb-2">
          {missing ? "Order not found" : "Couldn't load this order"}
        </h1>
        <p className="text-sm text-slate dark:text-[#8b8fa8] mb-6">
          {missing
            ? "It may have been removed, or it belongs to another account."
            : apiErrorMessage(error, "Check your connection and try again.")}
        </p>
        <div className="flex items-center justify-center gap-3">
          {!missing && (
            <button type="button" onClick={refresh} className="btn-secondary">
              <RefreshCw size={14} /> Try again
            </button>
          )}
          <Link href={ORDERS_ROUTE} className="btn-primary">
            Back to orders
          </Link>
        </div>
      </div>
    );
  }

  const status = order.status?.toUpperCase();
  const paid = isOrderPaid(order);
  const isOwner = String(order.user?._id ?? order.user) === String(me?._id);
  // Mirrors the backend: only the customer pays, and only while pending.
  const canPay = isOwner && status === ORDER_STATUS_PENDING && !paid;
  const cancellable = isOwner && CUSTOMER_CANCELLABLE.includes(status);
  const payment = paymentState(order);
  const busy = Boolean(busyAction);

  const items = (order.orderItems ?? []).map((item, i) => {
    const product = typeof item.product === "object" ? item.product : null;
    const price = item.price ?? product?.price;
    return {
      key: item._id || i,
      product,
      name: item.name || product?.name || "Product no longer listed",
      quantity: item.quantity,
      lineTotal: price != null ? price * item.quantity : null,
    };
  });
  const subtotal = items.reduce((sum, item) => sum + (item.lineTotal ?? 0), 0);
  // Derived from the total so legacy orders without a stored charge add up.
  const delivery = Math.max(0, (order.totalPrice ?? 0) - subtotal);
  const address = order.shippingAddress ?? {};

  return (
    <div className="container-page py-10 bg-paper dark:bg-[#0e0f12] min-h-screen transition-colors duration-300">
      <AnimatePresence>
        {showCancel && (
          <OrderCancelConformationModal
            busy={busyAction === "cancel"}
            paid={paid}
            onConfirm={handleCancel}
            onClose={() => setShowCancel(false)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showCash && (
          <CashConfirmModal
            busy={busyAction === "cash"}
            amount={order.totalPrice}
            onConfirm={handlePayCash}
            onClose={() => setShowCash(false)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {stripeSecret && (
          <StripePaymentModal
            clientSecret={stripeSecret}
            orderId={id}
            onClose={() => setStripeSecret("")}
            onSuccess={() => {
              setStripeSecret("");
              toast.success("Payment received. Thank you!");
              refresh();
            }}
          />
        )}
      </AnimatePresence>

      <Link href={ORDERS_ROUTE} className="btn-ghost mb-6 -ml-4 inline-flex">
        <ChevronLeft size={15} /> Back to orders
      </Link>

      <motion.div
        {...fadeUp()}
        className="flex flex-wrap items-start justify-between gap-4 mb-8"
      >
        <div>
          <p className="eyebrow dark:text-[#8b8fa8] mb-1">
            Order #{order.orderNumber?.toUpperCase() ?? String(order._id).slice(-6)}
          </p>
          <h1 className="font-display text-3xl font-semibold text-ink dark:text-[#f0efe8]">
            {formatNPR(order.totalPrice)}
          </h1>
          <p className="font-mono text-xs text-slate dark:text-[#8b8fa8] mt-1">
            Placed {formatDate(order.createdAt)}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {loading && (
            <Loader2
              size={14}
              className="animate-spin text-slate"
              aria-label="Refreshing"
            />
          )}
          <OrderStatusBadge status={order.status} />
        </div>
      </motion.div>

      {status === ORDER_STATUS_CANCELLED ? (
        <motion.div
          {...fadeUp(0.05)}
          className="mb-6 flex items-start gap-3 border border-danger/30 bg-danger/5 dark:bg-danger/10 px-5 py-4"
        >
          <Ban size={16} className="text-danger mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-medium text-ink dark:text-[#f0efe8]">
              This order was cancelled
            </p>
            <p className="text-sm text-slate dark:text-[#8b8fa8]">
              {paid
                ? "We'll be in touch about your refund."
                : "You haven't been charged."}
            </p>
          </div>
        </motion.div>
      ) : (
        <motion.div {...fadeUp(0.05)} className="mb-6">
          <OrderTimeline status={order.status} />
        </motion.div>
      )}

      <div className="grid lg:grid-cols-[1fr_300px] gap-6 items-start">
        <motion.section
          {...fadeUp(0.08)}
          aria-label="Items"
          className="card-frame divide-y divide-hairline dark:divide-[#262932]"
        >
          <p className="eyebrow dark:text-[#8b8fa8] px-5 py-4">
            Items · {items.length}
          </p>
          {items.map(({ key, product, name, quantity, lineTotal }) => (
            <div key={key} className="flex items-center gap-4 px-5 py-4">
              <div className="h-14 w-14 shrink-0 border border-hairline dark:border-[#262932] bg-paper dark:bg-[#0e0f12] overflow-hidden">
                {product?.imageUrls?.[0] ? (
                  <Image
                    src={product.imageUrls[0]}
                    alt=""
                    width={56}
                    height={56}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="h-full w-full grid place-items-center">
                    <Package size={16} className="text-slate dark:text-[#8b8fa8]" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                {product?._id ? (
                  <Link
                    href={`${PRODUCTS_ROUTE}/${product._id}`}
                    className="font-medium text-sm text-ink dark:text-[#f0efe8] truncate block hover:text-signal-dim dark:hover:text-signal"
                  >
                    {name}
                  </Link>
                ) : (
                  <p className="font-medium text-sm text-ink dark:text-[#f0efe8] truncate">
                    {name}
                  </p>
                )}
                <p className="font-mono text-xs text-slate dark:text-[#8b8fa8] mt-0.5">
                  Qty {quantity}
                </p>
              </div>
              {lineTotal != null && (
                <p className="font-mono text-sm text-ink dark:text-[#f0efe8] shrink-0">
                  {formatNPR(lineTotal)}
                </p>
              )}
            </div>
          ))}
          <dl className="px-5 py-4 space-y-1.5 font-mono text-sm">
            <div className="flex items-baseline justify-between">
              <dt className="text-slate dark:text-[#8b8fa8]">Subtotal</dt>
              <dd className="text-ink dark:text-[#f0efe8]">{formatNPR(subtotal)}</dd>
            </div>
            <div className="flex items-baseline justify-between">
              <dt className="text-slate dark:text-[#8b8fa8]">Delivery</dt>
              <dd className="text-ink dark:text-[#f0efe8]">
                {delivery ? formatNPR(delivery) : "Free"}
              </dd>
            </div>
            <div className="flex items-baseline justify-between pt-2 mt-1 border-t border-hairline dark:border-[#262932]">
              <dt className="text-ink dark:text-[#f0efe8] font-medium">Total</dt>
              <dd className="text-base font-medium text-ink dark:text-[#f0efe8]">
                {formatNPR(order.totalPrice)}
              </dd>
            </div>
          </dl>
        </motion.section>

        <div className="space-y-4">
          <motion.section {...fadeUp(0.1)} className="card-frame p-5">
            <div className="flex items-center gap-2 mb-3">
              <MapPin size={14} className="text-signal" />
              <h2 className="eyebrow dark:text-[#8b8fa8]">Shipping to</h2>
            </div>
            <p className="text-sm font-medium text-ink dark:text-[#f0efe8]">
              {address.street}
            </p>
            <p className="text-sm text-slate dark:text-[#8b8fa8]">
              {[address.city, address.province, address.country]
                .filter(Boolean)
                .join(", ")}
            </p>
          </motion.section>

          <motion.section {...fadeUp(0.12)} className="card-frame p-5">
            <div className="flex items-center gap-2 mb-3">
              <Wallet size={14} className="text-signal" />
              <h2 className="eyebrow dark:text-[#8b8fa8]">Payment</h2>
            </div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-slate dark:text-[#8b8fa8]">Status</span>
              <span
                className={`font-mono text-[11px] uppercase tracking-widest px-2 py-0.5 ${payment.tone}`}
              >
                {payment.label}
              </span>
            </div>
            {order.payment?.method && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate dark:text-[#8b8fa8]">Method</span>
                <span className="text-sm text-ink dark:text-[#f0efe8]">
                  {PAYMENT_METHOD_LABELS[order.payment.method] ?? order.payment.method}
                </span>
              </div>
            )}

            {canPay && (
              <div className="mt-4 space-y-2">
                <p className="text-xs text-slate dark:text-[#8b8fa8] mb-2">
                  Choose how you&apos;d like to pay to confirm this order.
                </p>
                <button
                  type="button"
                  onClick={handlePayKhalti}
                  disabled={busy}
                  className={`${PAY_BUTTON} bg-[#5C2D91]`}
                >
                  {busyAction === "khalti" ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Wallet size={14} />
                  )}
                  {busyAction === "khalti" ? "Opening Khalti…" : "Pay with Khalti"}
                </button>

                <button
                  type="button"
                  onClick={handlePayStripe}
                  disabled={busy}
                  className={`${PAY_BUTTON} bg-[#635BFF]`}
                >
                  {busyAction === "stripe" ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <CreditCard size={14} />
                  )}
                  Pay by card
                </button>

                <button
                  type="button"
                  onClick={() => setShowCash(true)}
                  disabled={busy}
                  className={`${PAY_BUTTON} bg-[#1B7340]`}
                >
                  <Banknote size={14} />
                  Cash on delivery
                </button>
              </div>
            )}
          </motion.section>

          {cancellable && (
            <motion.div {...fadeUp(0.14)}>
              <button
                type="button"
                onClick={() => setShowCancel(true)}
                disabled={busy}
                className="flex w-full items-center justify-center gap-2 border border-danger text-danger px-5 py-3 text-sm font-medium hover:bg-danger hover:text-paper dark:hover:text-ink transition-colors disabled:opacity-50"
              >
                <Ban size={14} />
                Cancel order
              </button>
              <p className="mt-2 text-center font-mono text-[11px] text-slate dark:text-[#8b8fa8]">
                You can cancel until the order ships.
              </p>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderDetailPage;
