"use client";
import { confirmPayment } from "@/api/order";
import { apiErrorMessage } from "@/utils/format";
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

    // The backend re-checks the intent with Stripe before marking it paid.
    if (["succeeded", "processing"].includes(paymentIntent?.status)) {
      try {
        await confirmPayment(orderId);
        onSuccess();
      } catch (err) {
        setError(
          apiErrorMessage(
            err,
            "We couldn't confirm your payment yet. Refresh the order in a moment."
          )
        );
      }
    } else {
      setError("Payment wasn't completed. Please try again.");
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
        <p role="alert" className="rounded-2xl bg-danger/10 px-4 py-3 text-sm text-danger">
          {error}
        </p>
      )}

      {/* Actions */}
      <div className="flex flex-col-reverse gap-2 pt-1 sm:flex-row">
        <button
          type="button"
          onClick={onClose}
          disabled={paying}
          className="btn-secondary flex-1"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={!stripe || paying}
          className="inline-flex flex-2 items-center justify-center gap-2 rounded-full bg-[#635BFF] px-5 py-3 text-sm font-semibold text-white transition-all duration-300 ease-out-expo hover:-translate-y-0.5 hover:bg-[#5851EA] active:scale-[0.97] disabled:opacity-60 disabled:hover:translate-y-0"
        >
          {paying ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <Lock size={14} />
          )}
          {paying ? "Processing…" : "Pay now"}
        </button>
      </div>

      <p className="flex items-center justify-center gap-1.5 text-[11px] text-slate">
        <Lock size={10} /> Secured by Stripe
      </p>
    </form>
  );
};

export default StripeForm;
