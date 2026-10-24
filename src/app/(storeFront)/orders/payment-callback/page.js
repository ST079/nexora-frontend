"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { CheckCircle2, XCircle, Loader2, Clock, RefreshCw } from "lucide-react";
import { confirmPayment } from "@/api/order";
import { ORDERS_ROUTE } from "@/constants/routes";
import { useResource } from "@/hooks/useResource";
import { apiErrorMessage } from "@/utils/format";
import { EASE_OUT, bouncy } from "@/utils/motion";

// Khalti's own status values on the return URL.
const KHALTI_CANCELLED = ["user canceled", "expired", "refunded"];
const KHALTI_WAITING = ["pending", "initiated"];

// A burst of dots behind the success icon.
const BURST = Array.from({ length: 10 }, (_, i) => {
  const angle = (i / 10) * Math.PI * 2;
  return { x: Math.cos(angle) * 64, y: Math.sin(angle) * 64, tone: ["bg-signal", "bg-marigold", "bg-blueprint"][i % 3] };
});

const Panel = ({ icon: Icon, tone, title, children, actions, celebrate = false }) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, ease: EASE_OUT }}
    className="rounded-4xl border border-hairline bg-panel px-6 py-12 sm:px-10"
  >
    <div className="relative mx-auto mb-7 h-20 w-20">
      {celebrate &&
        BURST.map((d, i) => (
          <motion.span
            key={i}
            aria-hidden
            initial={{ x: 0, y: 0, scale: 0, opacity: 1 }}
            animate={{ x: d.x, y: d.y, scale: [0, 1.2, 0], opacity: [1, 1, 0] }}
            transition={{ duration: 0.9, delay: 0.25, ease: EASE_OUT }}
            className={`absolute left-1/2 top-1/2 -ml-1.5 -mt-1.5 h-3 w-3 rounded-full ${d.tone}`}
          />
        ))}
      <motion.div
        initial={{ scale: 0.3, rotate: -25 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={bouncy}
        className={`relative grid h-20 w-20 place-items-center rounded-3xl ${tone}`}
      >
        <Icon size={34} />
      </motion.div>
    </div>
    <h1 className="mb-2 font-display text-3xl font-bold tracking-tight text-ink">{title}</h1>
    <p className="mx-auto mb-8 max-w-sm text-sm text-slate">{children}</p>
    {actions && (
      <div className="flex flex-wrap items-center justify-center gap-3">
        {actions}
      </div>
    )}
  </motion.div>
);

const PaymentResult = () => {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("purchase_order_id");
  const pidx = searchParams.get("pidx");
  const khaltiStatus = searchParams.get("status")?.toLowerCase() ?? "";
  const [attempt, setAttempt] = useState(0);

  // The backend looks the payment up with Khalti before marking it paid,
  // so the status in the URL only decides whether it's worth asking.
  const { data, error, loading } = useResource(
    `${orderId}|${pidx}|${khaltiStatus}|${attempt}`,
    async () => {
      if (!orderId) return "unknown";
      if (KHALTI_CANCELLED.includes(khaltiStatus)) return "cancelled";
      await confirmPayment(orderId, { pidx });
      return "success";
    }
  );

  const orderLink = orderId ? `${ORDERS_ROUTE}/${orderId}` : ORDERS_ROUTE;
  const checkAgain = (
    <button
      type="button"
      onClick={() => setAttempt((n) => n + 1)}
      className="btn-secondary"
    >
      <RefreshCw size={14} /> Check again
    </button>
  );

  if (loading)
    return (
      <div role="status" className="rounded-4xl border border-hairline bg-panel px-6 py-12">
        <span className="mx-auto mb-6 grid h-20 w-20 place-items-center rounded-3xl bg-signal-tint text-signal">
          <Loader2 size={32} className="animate-spin" />
        </span>
        <h1 className="mb-2 font-display text-3xl font-bold tracking-tight text-ink">
          Confirming your payment
        </h1>
        <p className="text-sm text-slate">
          Checking the result with Khalti. This takes a few seconds.
        </p>
      </div>
    );

  if (error) {
    const waiting = KHALTI_WAITING.includes(khaltiStatus);
    return waiting ? (
      <Panel
        icon={Clock}
        tone="bg-marigold-tint text-marigold-dim"
        title="Payment still processing"
        actions={
          <>
            {checkAgain}
            <Link href={orderLink} className="btn-primary">
              View order
            </Link>
          </>
        }
      >
        Khalti hasn&apos;t finished processing this payment. You won&apos;t be
        charged twice; check again in a minute.
      </Panel>
    ) : (
      <Panel
        icon={XCircle}
        tone="bg-danger/10 text-danger"
        title="Payment not confirmed"
        actions={
          <>
            {checkAgain}
            <Link href={orderLink} className="btn-primary">
              Try paying again
            </Link>
          </>
        }
      >
        {apiErrorMessage(error, "Something interrupted the payment.")}
      </Panel>
    );
  }

  if (data === "success")
    return (
      <Panel
        icon={CheckCircle2}
        tone="bg-ok text-paper"
        title="Payment confirmed"
        celebrate
        actions={
          <Link href={orderLink} className="btn-primary">
            View order
          </Link>
        }
      >
        Thanks! Your order is confirmed and we&apos;re getting it ready. You
        can track it from your order history.
      </Panel>
    );

  if (data === "cancelled")
    return (
      <Panel
        icon={XCircle}
        tone="bg-mist text-slate"
        title="Payment cancelled"
        actions={
          <Link href={orderLink} className="btn-primary">
            Choose another way to pay
          </Link>
        }
      >
        No money was taken. Your order is saved, so you can pay whenever
        you&apos;re ready.
      </Panel>
    );

  return (
    <Panel
      icon={XCircle}
      tone="bg-mist text-slate"
      title="No order in progress"
      actions={
        <Link href={ORDERS_ROUTE} className="btn-secondary">
          Go to my orders
        </Link>
      }
    >
      We couldn&apos;t find an order tied to this page. If you completed a
      payment, check your order history.
    </Panel>
  );
};

const PaymentCallbackPage = () => (
  <div className="container-page mx-auto min-h-[80vh] max-w-lg py-16 text-center sm:py-24">
    <Suspense
      fallback={
        <Loader2 size={28} className="mx-auto animate-spin text-signal" />
      }
    >
      <PaymentResult />
    </Suspense>
  </div>
);

export default PaymentCallbackPage;
