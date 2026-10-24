"use client";

import { X, CreditCard } from "lucide-react";
import { useSelector } from "react-redux";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { Modal } from "./Modal";
import StripeForm from "./StripeForm";

const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
// loadStripe rejects without a key, so skip it and explain instead.
const stripePromise = publishableKey ? loadStripe(publishableKey) : null;

const APPEARANCE = {
  light: {
    theme: "stripe",
    variables: { colorBackground: "#ffffff", colorText: "#17151c", colorDanger: "#b32e22" },
  },
  dark: {
    theme: "night",
    variables: { colorBackground: "#191620", colorText: "#f5f2ec", colorDanger: "#f0675a" },
  },
};

const StripePaymentModal = ({ clientSecret, orderId, onClose, onSuccess }) => {
  const theme = useSelector((state) => state.userPreferences?.theme);

  const appearance = APPEARANCE[theme === "dark" ? "dark" : "light"];
  const stripeOptions = {
    clientSecret,
    appearance: {
      theme: appearance.theme,
      variables: {
        ...appearance.variables,
        colorPrimary: "#635BFF",
        // Elements renders in an iframe, so the site's web font isn't available.
        fontFamily: "system-ui, -apple-system, Segoe UI, sans-serif",
        borderRadius: "14px",
      },
    },
  };

  return (
    <Modal onClose={onClose} labelledBy="stripe-title" size="max-w-md">
      <div className="flex items-center justify-between gap-3 px-6 pb-2 pt-6">
        <div className="flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-[#635BFF] text-white">
            <CreditCard size={19} aria-hidden />
          </span>
          <div>
            <p className="eyebrow">Secure payment</p>
            <h3 id="stripe-title" className="font-display text-lg font-bold text-ink">
              Pay by card
            </h3>
          </div>
        </div>
        <button type="button" onClick={onClose} aria-label="Close" className="icon-btn">
          <X size={16} />
        </button>
      </div>

      <div className="p-6">
        {stripePromise ? (
          <Elements stripe={stripePromise} options={stripeOptions}>
            <StripeForm onClose={onClose} onSuccess={onSuccess} orderId={orderId} />
          </Elements>
        ) : (
          <p className="rounded-2xl bg-danger/10 px-4 py-3 text-sm text-danger">
            Card payments aren&apos;t set up yet. Please choose another
            payment method.
          </p>
        )}
      </div>
    </Modal>
  );
};

export default StripePaymentModal;
