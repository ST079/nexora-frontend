"use client";
import { confirmPayment, payViaStripe } from "@/api/order";
import { PAYMENT_STATUS_COMPLETED } from "@/constants/payment";
import {
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { Loader2, Lock } from "lucide-react";
import { useState } from "react";

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
      redirect: "if_required",
    });

    if (stripeError) {
      setError(stripeError.message || "Payment failed. Please try again.");
      setPaying(false);
      return;
    }

    if (paymentIntent?.status === "succeeded") {
      await confirmPayment(orderId, PAYMENT_STATUS_COMPLETED);
      onSuccess();
    } else {
      setError(`Unexpected payment status: ${paymentIntent?.status}`);
    }

    setPaying(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <PaymentElement
        options={{
          layout: "tabs",
          fields: { billingDetails: { name: "auto" } },
          wallets: {
            link: "never",
          },
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

export default StripeForm;
