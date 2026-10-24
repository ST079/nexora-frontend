 "use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useSelector } from "react-redux";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import {
  ChevronLeft,
  ChevronRight,
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
import CheckoutSteps from "@/components/CheckoutSteps";
import Loader from "@/components/Loader";
import OrderCancelConformationModal from "@/components/OrderCancelConformationModal";
import CashConfirmModal from "@/components/CashConfirmModal";
import StripePaymentModal from "@/components/StripePaymentModal";
import toast from "react-hot-toast";
import { apiErrorMessage, formatDate, formatNPR } from "@/utils/format";
import { fadeUp, spring } from "@/utils/motion";
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

// One payment choice: a big tappable row with the provider's colour swatch.
const PayOption = ({ onClick, disabled, busy, icon: Icon, swatch, title, note }) => (
  <motion.button
    type="button"
    onClick={onClick}
    disabled={disabled}
    whileHover={disabled ? undefined : { x: 4 }}
    whileTap={disabled ? undefined : { scale: 0.98 }}
    transition={spring}
    className="group flex w-full items-center gap-3 rounded-2xl bg-on-night/8 p-2.5 pr-4 text-left transition-colors hover:bg-on-night/14 disabled:cursor-not-allowed disabled:opacity-50"
  >
    <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl text-white ${swatch}`}>
      {busy ? <Loader2 size={18} className="animate-spin" /> : <Icon size={18} aria-hidden />}
    </span>
    <span className="min-w-0 flex-1">
      <span className="block text-sm font-semibold">{title}</span>
      <span className="block truncate text-[11px] text-on-night/60">{note}</span>
    </span>
    <ChevronRight size={16} className="shrink-0 text-on-night/50 transition-transform group-hover:translate-x-0.5" aria-hidden />
  </motion.button>
);

// What the payment card says, in priority order.
const paymentState = (order) => {
  if (isOrderPaid(order)) return { label: "Paid", tone: "bg-ok/12 text-ok" };
  if (order.status === ORDER_STATUS_CANCELLED)
    return { label: "Not charged", tone: "bg-mist text-slate-dim" };
  if (order.payment?.method === PAYMENT_METHOD_CASH)
    return { label: "Pay on delivery", tone: "bg-blueprint-tint text-blueprint-dim" };
  if (order.payment?.status === PAYMENT_STATUS_FAILED)
    return { label: "Failed", tone: "bg-danger/10 text-danger" };
  return { label: "Unpaid", tone: "bg-marigold text-on-marigold" };
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
      <div className="container-page grid min-h-[70vh] place-items-center py-16">
        <motion.div
          {...fadeUp()}
          className="flex max-w-md flex-col items-center rounded-4xl border border-hairline bg-panel px-8 py-12 text-center"
        >
          <span className="mb-5 grid h-16 w-16 place-items-center rounded-3xl bg-danger/10 text-danger">
            <XCircle size={28} />
          </span>
          <h1 className="mb-2 font-display text-2xl font-bold text-ink">
            {missing ? "Order not found" : "Couldn't load this order"}
          </h1>
          <p className="mb-6 text-sm text-slate">
            {missing
              ? "It may have been removed, or it belongs to another account."
              : apiErrorMessage(error, "Check your connection and try again.")}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            {!missing && (
              <button type="button" onClick={refresh} className="btn-secondary">
                <RefreshCw size={14} /> Try again
              </button>
            )}
            <Link href={ORDERS_ROUTE} className="btn-primary">
              Back to orders
            </Link>
          </div>
        </motion.div>
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
    <div className="container-page min-h-screen pb-16 pt-6 lg:pt-10">
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

      <Link href={ORDERS_ROUTE} className="btn-ghost -ml-3 mb-4 px-3 text-slate">
        <ChevronLeft size={15} /> All orders
      </Link>

      <motion.header {...fadeUp()} className="mb-6">
        {canPay && <CheckoutSteps current={2} className="mb-5" />}
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow mb-2">
              Order #{order.orderNumber?.toUpperCase() ?? String(order._id).slice(-6)} · Placed{" "}
              {formatDate(order.createdAt)}
            </p>
            <h1 className="font-display text-4xl font-bold tracking-tight text-ink sm:text-5xl">
              {canPay ? (
                <>
                  One last <span className="marker">step</span>
                </>
              ) : (
                formatNPR(order.totalPrice)
              )}
            </h1>
            {canPay && (
              <p className="mt-2 text-sm text-slate">
                Choose how to pay {formatNPR(order.totalPrice)} and we&apos;ll get it moving.
              </p>
            )}
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
        </div>
      </motion.header>

      <div className="grid items-start gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          {status === ORDER_STATUS_CANCELLED ? (
            <motion.div
              {...fadeUp(0.05)}
              className="flex items-center gap-4 rounded-4xl bg-danger/10 p-5"
            >
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-danger text-paper">
                <Ban size={20} aria-hidden />
              </span>
              <div>
                <p className="font-display text-lg font-bold text-ink">
                  This order was cancelled
                </p>
                <p className="text-sm text-slate-dim">
                  {paid
                    ? "We'll be in touch about your refund."
                    : "You haven't been charged."}
                </p>
              </div>
            </motion.div>
          ) : (
            <motion.div {...fadeUp(0.05)}>
              <OrderTimeline status={order.status} />
            </motion.div>
          )}

          <motion.section
            {...fadeUp(0.08)}
            aria-labelledby="items-heading"
            className="rounded-4xl border border-hairline bg-panel p-3 sm:p-4"
          >
            <h2 id="items-heading" className="eyebrow px-2 pb-3 pt-2">
              Items · {items.length}
            </h2>
            <ul className="space-y-1">
              {items.map(({ key, product, name, quantity, lineTotal }, i) => (
                <motion.li
                  key={key}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.12 + i * 0.05 }}
                  className="group flex items-center gap-4 rounded-2xl p-2 transition-colors hover:bg-mist"
                >
                  <div className="h-16 w-16 shrink-0 overflow-hidden rounded-2xl bg-mist">
                    {product?.imageUrls?.[0] ? (
                      <Image
                        src={product.imageUrls[0]}
                        alt=""
                        width={64}
                        height={64}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    ) : (
                      <div className="grid h-full w-full place-items-center">
                        <Package size={18} className="text-slate" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    {product?._id ? (
                      <Link
                        href={`${PRODUCTS_ROUTE}/${product._id}`}
                        className="link-underline block truncate text-sm font-semibold text-ink"
                      >
                        {name}
                      </Link>
                    ) : (
                      <p className="truncate text-sm font-semibold text-ink">
                        {name}
                      </p>
                    )}
                    <p className="mt-0.5 font-mono text-xs text-slate">
                      Qty {quantity}
                    </p>
                  </div>
                  {lineTotal != null && (
                    <p className="shrink-0 font-mono text-sm font-medium text-ink">
                      {formatNPR(lineTotal)}
                    </p>
                  )}
                </motion.li>
              ))}
            </ul>
            <dl className="mx-2 mt-3 space-y-2 border-t border-dashed border-hairline pb-2 pt-4 text-sm">
              <div className="flex items-baseline justify-between">
                <dt className="text-slate">Subtotal</dt>
                <dd className="font-mono text-ink">{formatNPR(subtotal)}</dd>
              </div>
              <div className="flex items-baseline justify-between">
                <dt className="text-slate">Delivery</dt>
                <dd className="font-mono text-ink">
                  {delivery ? formatNPR(delivery) : "Free"}
                </dd>
              </div>
              <div className="flex items-baseline justify-between pt-1">
                <dt className="font-semibold text-ink">Total</dt>
                <dd className="font-display text-2xl font-bold text-ink">
                  {formatNPR(order.totalPrice)}
                </dd>
              </div>
            </dl>
          </motion.section>
        </div>

        {/* While payment is due, the payment card comes first on phones. */}
        <div className={`space-y-4 lg:sticky lg:top-24 ${canPay ? "order-first lg:order-0" : ""}`}>
          <motion.section
            {...fadeUp(0.1)}
            aria-labelledby="payment-heading"
            className={`rounded-4xl p-5 ${
              canPay ? "bg-night text-on-night shadow-lift dark:border dark:border-hairline" : "border border-hairline bg-panel"
            }`}
          >
            <div className="mb-4 flex items-center justify-between gap-2">
              <h2
                id="payment-heading"
                className={`eyebrow ${canPay ? "text-on-night/60" : ""}`}
              >
                Payment
              </h2>
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold leading-none ${payment.tone}`}
              >
                <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-current" />
                {payment.label}
              </span>
            </div>
            {order.payment?.method && (
              <div className={`flex items-center justify-between ${canPay ? "mb-4" : ""}`}>
                <span className={`text-sm ${canPay ? "text-on-night/60" : "text-slate"}`}>Method</span>
                <span className={`text-sm font-medium ${canPay ? "" : "text-ink"}`}>
                  {PAYMENT_METHOD_LABELS[order.payment.method] ?? order.payment.method}
                </span>
              </div>
            )}

            {canPay && (
              <div className="space-y-2">
                <p className="mb-3 text-sm text-on-night/75">
                  Pick one to confirm this order.
                </p>
                <PayOption
                  onClick={handlePayKhalti}
                  disabled={busy}
                  busy={busyAction === "khalti"}
                  icon={Wallet}
                  swatch="bg-[#5C2D91]"
                  title={busyAction === "khalti" ? "Opening Khalti…" : "Pay with Khalti"}
                  note="Pay from your Khalti account"
                />
                <PayOption
                  onClick={handlePayStripe}
                  disabled={busy}
                  busy={busyAction === "stripe"}
                  icon={CreditCard}
                  swatch="bg-[#635BFF]"
                  title="Pay by card"
                  note="Debit or credit card via Stripe"
                />
                <PayOption
                  onClick={() => setShowCash(true)}
                  disabled={busy}
                  icon={Banknote}
                  swatch="bg-[#1B7340]"
                  title="Cash on delivery"
                  note="Pay the courier at your door"
                />
              </div>
            )}
          </motion.section>

          <motion.section
            {...fadeUp(0.12)}
            aria-labelledby="shipping-heading"
            className="flex gap-3 rounded-4xl border border-hairline bg-panel p-5"
          >
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-signal-tint text-signal-dim">
              <MapPin size={18} aria-hidden />
            </span>
            <div className="min-w-0">
              <h2 id="shipping-heading" className="eyebrow mb-1">
                Shipping to
              </h2>
              <p className="text-sm font-semibold text-ink">{address.street}</p>
              <p className="text-sm text-slate">
                {[address.city, address.province, address.country]
                  .filter(Boolean)
                  .join(", ")}
              </p>
            </div>
          </motion.section>

          {cancellable && (
            <motion.div {...fadeUp(0.14)} className="px-1">
              <button
                type="button"
                onClick={() => setShowCancel(true)}
                disabled={busy}
                className="btn-ghost w-full text-danger hover:bg-danger/10 hover:text-danger disabled:opacity-50"
              >
                <Ban size={14} />
                Cancel order
              </button>
              <p className="mt-1 text-center text-[11px] text-slate">
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
