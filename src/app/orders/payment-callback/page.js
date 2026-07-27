/* eslint-disable react/no-unescaped-entities */
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { confirmPayment } from "@/api/order";

const PaymentCallbackPage = () => {
  const searchParams = useSearchParams();
  const [state, setState] = useState("working");
  const [message, setMessage] = useState("");
  const khaltiStatus = searchParams.get("status");
  const orderId = searchParams.get("purchase_order_id");

  useEffect(() => {
    const verify = async () => {
      try {
        if (!orderId) {
          setState("unknown");
          return;
        }

        if (khaltiStatus && khaltiStatus.toLowerCase() !== "completed") {
          setState("failed");
          setMessage(`Khalti reported status: ${khaltiStatus}`);
          return;
        }

        await confirmPayment(orderId, "Completed");
        setState("success");
      } catch (err) {
        setState("failed");
        setMessage(
          err?.response?.data?.message ||
            err.message ||
            "Something went wrong confirming your payment.",
        );
      }
    };

    verify();
  }, [orderId, khaltiStatus]);

  return (
    <div className="container-page py-24 max-w-lg mx-auto text-center bg-paper dark:bg-[#0e0f12] min-h-screen transition-colors duration-300">
      {/* Working */}
      {state === "working" && (
        <div>
          <Loader2
            size={28}
            className="mx-auto mb-4 animate-spin text-signal"
          />
          <h1 className="font-display text-2xl font-semibold mb-2 text-ink dark:text-[#f0efe8]">
            Confirming your payment
          </h1>
          <p className="text-sm text-slate dark:text-[#8b8fa8]">
            Checking the result with Khalti and the Nexora API…
          </p>
        </div>
      )}

      {/* Success */}
      {state === "success" && (
        <div>
          <div className="grid h-16 w-16 place-items-center border border-ok/40 bg-ok/5 dark:bg-ok/10 mx-auto mb-6">
            <CheckCircle2 size={28} className="text-ok" />
          </div>
          <h1 className="font-display text-2xl font-semibold mb-2 text-ink dark:text-[#f0efe8]">
            Payment confirmed
          </h1>
          <p className="text-sm text-slate dark:text-[#8b8fa8] mb-8">
            Your order has been marked as paid. You can track it from your order
            history.
          </p>
          <Link
            href={orderId ? `/orders/${orderId}` : "/orders"}
            className="btn-primary"
          >
            View order
          </Link>
        </div>
      )}

      {/* Failed */}
      {state === "failed" && (
        <div>
          <div className="grid h-16 w-16 place-items-center border border-danger/40 bg-danger/5 dark:bg-danger/10 mx-auto mb-6">
            <XCircle size={28} className="text-danger" />
          </div>
          <h1 className="font-display text-2xl font-semibold mb-2 text-ink dark:text-[#f0efe8]">
            Payment not confirmed
          </h1>
          <p className="text-sm text-slate dark:text-[#8b8fa8] mb-8">
            {message || "Something interrupted the payment flow."}
          </p>
          <div className="flex items-center justify-center gap-3">
            <Link href="/orders" className="btn-secondary">
              Go to my orders
            </Link>
            <Link
              href={orderId ? `/orders/${orderId}` : "/orders"}
              className="btn-primary"
            >
              Try paying again
            </Link>
          </div>
        </div>
      )}

      {/* Unknown */}
      {state === "unknown" && (
        <div>
          <div className="grid h-16 w-16 place-items-center border border-hairline dark:border-[#262932] bg-paper dark:bg-[#16181f] mx-auto mb-6">
            <XCircle size={28} className="text-slate dark:text-[#8b8fa8]" />
          </div>
          <h1 className="font-display text-2xl font-semibold mb-2 text-ink dark:text-[#f0efe8]">
            No order in progress
          </h1>
          <p className="text-sm text-slate dark:text-[#8b8fa8] mb-8">
            We couldn't find an order tied to this session. If you completed a
            payment, check your order history.
          </p>
          <Link href="/orders" className="btn-secondary">
            Go to my orders
          </Link>
        </div>
      )}
    </div>
  );
};

export default PaymentCallbackPage;
