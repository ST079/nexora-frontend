"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
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
import { formatDate, formatNPR } from "@/utils/format";
import {
  cancelOrder,
  getOrderById,
  payViaCash,
  payViaKhalti,
} from "@/api/order";
import OrderTimeline from "@/components/OrderTimeline";
import Loader from "@/components/Loader";
import toast from "react-hot-toast";
import OrderCancelConformationModal from "@/components/OrderCancelConformationModal";
import CashConfirmModal from "@/components/CashConfirmModal";

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.35, delay, ease: [0.22, 1, 0.36, 1] },
});

const OrderDetailPage = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [showCancel, setShowCancel] = useState(false);
  const [showCash, setShowCash] = useState(false);

  const fetchOrder = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getOrderById(id);
      setOrder(data?.order ?? data?.data ?? data);
    } catch (err) {
      setError(
        err?.response?.data?.message || err.message || "Could not load order.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const handleCancel = async () => {
    setBusy(true);
    try {
      await cancelOrder(id);
      setOrder((prev) => ({ ...prev, status: "CANCELLED" }));
      toast.error("Order cancelled successfully.");
      setShowCancel(false);
    } catch (err) {
      toast.error(
        err?.response?.data?.message ||
          err.message ||
          "Could not cancel order.",
      );
    } finally {
      setBusy(false);
    }
  };

  const handlePayKhalti = async (id) => {
    setBusy(true);
    try {
      const response = await payViaKhalti(id);
      console.log(response);
      const url = response.payment_url;
      if (url) {
        sessionStorage.setItem("nexora_last_order_id", id);
        window.location.href = url;
      }
    } catch (err) {
      toast.error(
        err?.response?.data?.message || "Could not initiate payment.",
      );
    } finally {
      setBusy(false);
    }
  };

  const handlePayCash = async () => {
    setBusy(true);
    try {
      await payViaCash(id);
      setOrder((prev) => ({ ...prev, isPaid: true }));
      toast.success("Order confirmed for cash on delivery.");
      setShowCash(false);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Could not update payment.");
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <Loader label="Fetching your order details" />;

  if (error || !order)
    return (
      <div className="container-page py-16 text-center">
        <XCircle size={28} className="text-danger mx-auto mb-4" />
        <p className="font-display text-xl font-semibold text-ink dark:text-[#f0efe8] mb-2">
          Order not found
        </p>
        <p className="text-sm text-slate dark:text-[#8b8fa8] mb-6">{error}</p>
        <div className="flex items-center justify-center gap-3">
          <button onClick={fetchOrder} className="btn-secondary">
            <RefreshCw size={14} /> Retry
          </button>
          <Link href="/orders" className="btn-primary">
            Back to orders
          </Link>
        </div>
      </div>
    );

  const status = order.status?.toUpperCase();
  const cancellable = ["PENDING"].includes(status);
  const isPaid = order.status?.toLowerCase() === "confirmed";

  return (
    <div className="container-page py-10 bg-paper dark:bg-[#0e0f12] min-h-screen transition-colors duration-300">
      {/* Cancel confirm modal */}
      <AnimatePresence>
        {showCancel && (
          <OrderCancelConformationModal
            busy={busy}
            onConfirm={handleCancel}
            onClose={() => !busy && setShowCancel(false)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showCash && (
          <CashConfirmModal
            busy={busy}
            onConfirm={handlePayCash}
            onClose={() => !busy && setShowCash(false)}
          />
        )}
      </AnimatePresence>

      {/* Back */}
      <Link href="/orders" className="btn-ghost mb-6 -ml-4 inline-flex">
        <ChevronLeft size={15} /> Back to orders
      </Link>

      {/* Header */}
      <motion.div
        {...fadeUp()}
        className="flex flex-wrap items-start justify-between gap-4 mb-8"
      >
        <div>
          <p className="eyebrow dark:text-[#8b8fa8] mb-1">
            Order #{order.orderNumber?.toUpperCase()}
          </p>
          <h1 className="font-display text-3xl font-semibold text-ink dark:text-[#f0efe8]">
            {formatNPR(order.totalPrice)}
          </h1>
          <p className="font-mono text-xs text-slate dark:text-[#8b8fa8] mt-1">
            Placed {formatDate(order.createdAt)}
          </p>
        </div>
        <OrderStatusBadge status={order.status} />
      </motion.div>

      {/* Timeline */}
      {!["CANCELLED"].includes(status) && (
        <motion.div {...fadeUp(0.05)} className="mb-6">
          <OrderTimeline status={order.status} />
        </motion.div>
      )}

      <div className="grid lg:grid-cols-[1fr_300px] gap-6 items-start">
        {/* Items */}
        <motion.div
          {...fadeUp(0.08)}
          className="card-frame divide-y divide-hairline dark:divide-[#262932]"
        >
          <p className="eyebrow dark:text-[#8b8fa8] px-5 py-4">Items</p>
          {order.orderItems?.map((item, i) => {
            const product =
              typeof item.product === "object" ? item.product : null;
            return (
              <div
                key={item._id || i}
                className="flex items-center gap-4 px-5 py-4"
              >
                <div className="h-14 w-14 shrink-0 border border-hairline dark:border-[#262932] bg-paper dark:bg-[#0e0f12] overflow-hidden">
                  {product?.imageUrls?.[0] ? (
                    <Image
                      src={product.imageUrls[0]}
                      alt={product.name}
                      width={56}
                      height={56}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full grid place-items-center">
                      <Package
                        size={16}
                        className="text-slate dark:text-[#8b8fa8]"
                      />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-ink dark:text-[#f0efe8] truncate">
                    {product?.name ||
                      `Product #${String(item.product).slice(-6)}`}
                  </p>
                  <p className="font-mono text-xs text-slate dark:text-[#8b8fa8] mt-0.5">
                    Qty {item.quantity}
                  </p>
                </div>
                {product?.price && (
                  <p className="font-mono text-sm text-ink dark:text-[#f0efe8] shrink-0">
                    {formatNPR(product.price * item.quantity)}
                  </p>
                )}
              </div>
            );
          })}
          <div className="flex-col px-5 py-4 ">
            <div className="flex items-baseline justify-between font-mono">
              <span className="text-slate dark:text-[#8b8fa8] text-sm">
                Delivery Charge
              </span>
              <span className="text-base font-medium text-ink dark:text-[#f0efe8]">
                {formatNPR(200)}
              </span>
            </div>
            <div className="flex items-baseline justify-between font-mono">
              <span className="text-slate dark:text-[#8b8fa8] text-sm">
                Total
              </span>
              <span className="text-base font-medium text-ink dark:text-[#f0efe8]">
                {formatNPR(order.totalPrice)}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Shipping */}
          <motion.div {...fadeUp(0.1)} className="card-frame p-5">
            <div className="flex items-center gap-2 mb-3">
              <MapPin size={14} className="text-signal" />
              <p className="eyebrow dark:text-[#8b8fa8]">Shipping to</p>
            </div>
            <p className="text-sm font-medium text-ink dark:text-[#f0efe8]">
              {order.shippingAddress?.street}
            </p>
            <p className="text-sm text-slate dark:text-[#8b8fa8]">
              {order.shippingAddress?.city}
            </p>
          </motion.div>

          {/* Payment */}
          <motion.div {...fadeUp(0.12)} className="card-frame p-5">
            <div className="flex items-center gap-2 mb-3">
              <Wallet size={14} className="text-signal" />
              <p className="eyebrow dark:text-[#8b8fa8]">Payment</p>
            </div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-slate dark:text-[#8b8fa8]">
                Status
              </span>
              <span
                className={`font-mono text-[11px] uppercase tracking-widest px-2 py-0.5 ${
                  isPaid ? "bg-ok/10 text-ok" : "bg-signal/10 text-signal"
                }`}
              >
                {isPaid ? "Paid" : "Unpaid"}
              </span>
            </div>

            {!isPaid && !["CANCELLED", "CANCELED"].includes(status) && (
              <div className="mt-4 space-y-2">
                <button
                  onClick={() => handlePayKhalti(id)}
                  disabled={busy}
                  className="flex w-full items-center justify-center gap-2 rounded px-4 py-2.5 text-sm font-medium text-white hover:opacity-90 disabled:opacity-60 transition-opacity bg-[#5C2D91]"
                >
                  {busy ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Wallet size={14} />
                  )}
                  Pay with Khalti
                </button>
                <button
                  disabled={busy}
                  className="flex w-full items-center justify-center gap-2 rounded px-4 py-2.5 text-sm font-medium text-white hover:opacity-90 disabled:opacity-60 transition-opacity bg-[#635BFF]"
                >
                  {busy ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <CreditCard size={14} />
                  )}
                  Pay with Stripe
                </button>
                <button
                  onClick={() => setShowCash(true)}
                  disabled={busy}
                  className="flex w-full items-center justify-center gap-2 rounded px-4 py-2.5 text-sm font-medium text-white hover:opacity-90 disabled:opacity-60 transition-opacity bg-[#1B7340]"
                >
                  {busy ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Banknote size={14} />
                  )}
                  Cash on delivery
                </button>
              </div>
            )}
          </motion.div>

          {/* Cancel — now opens modal instead of cancelling directly */}
          {cancellable && (
            <motion.div {...fadeUp(0.14)}>
              <button
                onClick={() => setShowCancel(true)}
                disabled={busy}
                className="flex w-full items-center justify-center gap-2 border border-danger text-danger px-5 py-3 text-sm font-medium hover:bg-danger hover:text-paper transition-colors disabled:opacity-50"
              >
                <Ban size={14} />
                Cancel order
              </button>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderDetailPage;
