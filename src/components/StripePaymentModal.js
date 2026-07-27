"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { X, Loader2, CreditCard, Lock } from "lucide-react";
import {
  Elements,
  CardNumberElement,
  CardExpiryElement,
  CardCvcElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
);

const elementStyle = {
  base: {
    fontSize: "14px",
    fontFamily: '"IBM Plex Mono", monospace',
    color: "#14151A",
    "::placeholder": { color: "#9CA3AF" },
  },
  invalid: { color: "#D8392B" },
};

const elementStyleDark = {
  base: {
    fontSize: "14px",
    fontFamily: '"IBM Plex Mono", monospace',
    color: "#f0efe8",
    "::placeholder": { color: "#5b5e72" },
    backgroundColor: "transparent",
  },
  invalid: { color: "#F04F3F" },
};

const StripeField = ({ label, children }) => (
  <div>
    <label className="font-mono text-xs text-slate dark:text-[#8b8fa8] mb-1 block">
      {label}
    </label>
    <div className="border border-hairline dark:border-[#262932] bg-white dark:bg-[#16181f] px-3 py-3 transition-colors focus-within:border-ink dark:focus-within:border-[#f0efe8]">
      {children}
    </div>
  </div>
);

const StripeForm = ({ onClose, onSuccess }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState("");

  // Detect dark mode
  const isDark =
    typeof window !== "undefined" &&
    document.documentElement.classList.contains("dark");
  const style = isDark ? elementStyleDark : elementStyle;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setPaying(true);
    setError("");

    const cardNumber = elements.getElement(CardNumberElement);

    const { error: stripeError, paymentIntent } =
      await stripe.confirmCardPayment(undefined, {
        payment_method: { card: cardNumber },
      });

    if (stripeError) {
      setError(stripeError.message || "Payment failed. Please try again.");
      setPaying(false);
      return;
    }

    if (paymentIntent?.status === "succeeded") {
      onSuccess();
    } else {
      setError(`Unexpected status: ${paymentIntent?.status}`);
      setPaying(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Card number — full width */}
      <StripeField label="Card number">
        <CardNumberElement options={{ style, showIcon: true }} />
      </StripeField>

      {/* Expiry + CVC — two columns */}
      <div className="grid grid-cols-2 gap-3">
        <StripeField label="Expiry date">
          <CardExpiryElement options={{ style }} />
        </StripeField>
        <StripeField label="CVC">
          <CardCvcElement options={{ style }} />
        </StripeField>
      </div>

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

const StripePaymentModal = ({ clientSecret, orderId, onClose, onSuccess }) => {
  const stripeOptions = {
    clientSecret,
    appearance: {
      theme: "none", // we style fields ourselves
    },
  };

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
        className="relative w-full max-w-sm bg-paper dark:bg-[#16181f] border border-hairline dark:border-[#262932] shadow-lift"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-hairline dark:border-[#262932]">
          <div className="flex items-center gap-2.5">
            <CreditCard size={16} className="text-[#635BFF]" />
            <div>
              <p className="eyebrow dark:text-[#8b8fa8]">Secure payment</p>
              <h3 className="font-display text-sm font-semibold text-ink dark:text-[#f0efe8]">
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

        <div className="p-5">
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
