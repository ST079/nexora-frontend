"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { X, Loader2, CreditCard, Lock } from "lucide-react";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
);


const StripeForm = ({ onClose, onSuccess, orderId }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setPaying(true);
    setError("");

    const { error: stripeError, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: "if_required", // stay on page if no redirect needed
      confirmParams: {
        return_url: `${window.location.origin}/orders/payment-callback`,
      },
    });

    if (stripeError) {
      setError(stripeError.message || "Payment failed. Please try again.");
      setPaying(false);
      return;
    }

    if (paymentIntent?.status === "succeeded") {
      onSuccess();
    } else {
      setError(`Unexpected payment status: ${paymentIntent?.status}`);
    }

    setPaying(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Stripe's built-in card UI */}
      <PaymentElement
        options={{
          layout: "tabs",
          fields: { billingDetails: { name: "auto" } },
        }}
      />

      {/* Error */}
      {error && (
        <p className="text-sm text-danger border border-danger/40 bg-danger/5 dark:bg-danger/10 px-3 py-2.5">
          {error}
        </p>
      )}

      {/* Actions */}
      <div className="flex gap-3 pt-1">
        <button
          type="submit"
          disabled={!stripe || paying}
          className="flex flex-1 items-center justify-center gap-2 bg-[#635BFF] text-white px-4 py-2.5 text-sm font-medium hover:bg-[#5851EA] disabled:opacity-60 transition-colors"
        >
          {paying ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <Lock size={14} />
          )}
          {paying ? "Processing…" : "Pay now"}
        </button>
        <button
          type="button"
          onClick={onClose}
          disabled={paying}
          className="btn-secondary flex-1"
        >
          Cancel
        </button>
      </div>

      <p className="flex items-center justify-center gap-1.5 font-mono text-[11px] text-slate dark:text-[#8b8fa8]">
        <Lock size={10} /> Secured by Stripe
      </p>
    </form>
  );
};

/* ── Modal wrapper ───────────────────────────────────────────────────────── */

const StripePaymentModal = ({ clientSecret, orderId, onClose, onSuccess }) => {
  const stripeOptions = {
    clientSecret,
    appearance: {
      theme: "stripe",
      variables: {
        colorPrimary: "#635BFF",
        colorBackground: "#ffffff",
        colorText: "#14151A",
        colorDanger: "#D8392B",
        fontFamily: '"IBM Plex Sans", sans-serif',
        borderRadius: "0px",
      },
    },
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-ink/50 dark:bg-black/70"
        onClick={onClose}
      />

      {/* Panel */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 12 }}
        transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full max-w-md bg-paper dark:bg-[#16181f] border border-hairline dark:border-[#262932] shadow-lift"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-hairline dark:border-[#262932]">
          <div className="flex items-center gap-2">
            <CreditCard size={16} className="text-[#635BFF]" />
            <div>
              <p className="eyebrow dark:text-[#8b8fa8]">Secure payment</p>
              <h3 className="font-display text-base font-semibold text-ink dark:text-[#f0efe8]">
                Pay with Stripe
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="grid h-8 w-8 place-items-center text-slate dark:text-[#8b8fa8] hover:text-ink dark:hover:text-[#f0efe8] transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Stripe Elements */}
        <div className="p-6">
          <Elements stripe={stripePromise} options={stripeOptions}>
            <StripeForm
              onClose={onClose}
              onSuccess={onSuccess}
              orderId={orderId}
            />
          </Elements>
        </div>
      </motion.div>
    </div>
  );
};

export default StripePaymentModal;
