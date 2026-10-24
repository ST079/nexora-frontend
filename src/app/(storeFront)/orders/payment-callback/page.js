"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, XCircle, Loader2, Clock, RefreshCw } from "lucide-react";
import { confirmPayment } from "@/api/order";
import { ORDERS_ROUTE } from "@/constants/routes";
import { useResource } from "@/hooks/useResource";
import { apiErrorMessage } from "@/utils/format";

// Khalti's own status values on the return URL.
const KHALTI_CANCELLED = ["user canceled", "expired", "refunded"];
const KHALTI_WAITING = ["pending", "initiated"];

const Panel = ({ icon: Icon, tone, title, children, actions }) => (
  <div>
    <div
      className={`grid h-16 w-16 place-items-center border mx-auto mb-6 ${tone}`}
    >
      <Icon size={28} />
    </div>
    <h1 className="font-display text-2xl font-semibold mb-2 text-ink dark:text-[#f0efe8]">
      {title}
    </h1>
    <p className="text-sm text-slate dark:text-[#8b8fa8] mb-8">{children}</p>
    {actions && (
      <div className="flex flex-wrap items-center justify-center gap-3">
        {actions}
      </div>
    )}
  </div>
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
      <div role="status">
        <Loader2 size={28} className="mx-auto mb-4 animate-spin text-signal" />
        <h1 className="font-display text-2xl font-semibold mb-2 text-ink dark:text-[#f0efe8]">
          Confirming your payment
        </h1>
        <p className="text-sm text-slate dark:text-[#8b8fa8]">
          Checking the result with Khalti. This takes a few seconds.
        </p>
      </div>
    );

  if (error) {
    const waiting = KHALTI_WAITING.includes(khaltiStatus);
    return waiting ? (
      <Panel
        icon={Clock}
        tone="border-signal/40 bg-signal/5 text-signal-dim dark:text-signal"
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
        tone="border-danger/40 bg-danger/5 dark:bg-danger/10 text-danger"
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
        tone="border-ok/40 bg-ok/5 dark:bg-ok/10 text-ok"
        title="Payment confirmed"
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
        tone="border-hairline dark:border-[#262932] bg-paper dark:bg-[#16181f] text-slate dark:text-[#8b8fa8]"
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
      tone="border-hairline dark:border-[#262932] bg-paper dark:bg-[#16181f] text-slate dark:text-[#8b8fa8]"
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
  <div className="container-page py-24 max-w-lg mx-auto text-center bg-paper dark:bg-[#0e0f12] min-h-screen transition-colors duration-300">
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
