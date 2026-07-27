"use client";

import { motion } from "framer-motion";
import { X, Loader2, CreditCard, Lock } from "lucide-react";
import {
  Elements,
} from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import StripeForm from "./StripeForm";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
);

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
