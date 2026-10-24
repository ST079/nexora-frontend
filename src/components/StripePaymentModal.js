"use client";

import { motion } from "framer-motion";
import { X, CreditCard } from "lucide-react";
import { useSelector } from "react-redux";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { useEscape } from "@/hooks/useEscape";
import StripeForm from "./StripeForm";

const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
// loadStripe rejects without a key, so skip it and explain instead.
const stripePromise = publishableKey ? loadStripe(publishableKey) : null;

const APPEARANCE = {
  light: {
    theme: "stripe",
    variables: { colorBackground: "#ffffff", colorText: "#14151A", colorDanger: "#b32e22" },
  },
  dark: {
    theme: "night",
    variables: { colorBackground: "#16181f", colorText: "#f0efe8", colorDanger: "#f0675a" },
  },
};

const StripePaymentModal = ({ clientSecret, orderId, onClose, onSuccess }) => {
  const theme = useSelector((state) => state.userPreferences?.theme);
  useEscape(onClose);

  const appearance = APPEARANCE[theme === "dark" ? "dark" : "light"];
  const stripeOptions = {
    clientSecret,
    appearance: {
      theme: appearance.theme,
      variables: {
        ...appearance.variables,
        colorPrimary: "#635BFF",
        fontFamily: '"IBM Plex Sans", sans-serif',
        borderRadius: "0px",
      },
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
        role="dialog"
        aria-modal="true"
        aria-labelledby="stripe-title"
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 12 }}
        transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full max-w-md max-h-[calc(100dvh-2rem)] overflow-y-auto bg-paper dark:bg-[#16181f] border border-hairline dark:border-[#262932] shadow-lift"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-hairline dark:border-[#262932]">
          <div className="flex items-center gap-2">
            <CreditCard size={16} className="text-[#635BFF]" />
            <div>
              <p className="eyebrow dark:text-[#8b8fa8]">Secure payment</p>
              <h3
                id="stripe-title"
                className="font-display text-base font-semibold text-ink dark:text-[#f0efe8]"
              >
                Pay by card
              </h3>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="grid h-8 w-8 place-items-center text-slate dark:text-[#8b8fa8] hover:text-ink dark:hover:text-[#f0efe8] transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <div className="p-6">
          {stripePromise ? (
            <Elements stripe={stripePromise} options={stripeOptions}>
              <StripeForm
                onClose={onClose}
                onSuccess={onSuccess}
                orderId={orderId}
              />
            </Elements>
          ) : (
            <p className="text-sm text-danger border border-danger/40 bg-danger/5 px-3 py-2.5">
              Card payments aren&apos;t set up yet. Please choose another
              payment method.
            </p>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default StripePaymentModal;
