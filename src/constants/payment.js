export const PAYMENT_STATUS_PENDING = "PENDING";
export const PAYMENT_STATUS_COMPLETED = "COMPLETED";
export const PAYMENT_STATUS_FAILED = "FAILED";
export const PAYMENT_STATUS_REFUNDED = "REFUNDED";

export const PAYMENT_METHOD_CARD = "CARD";
export const PAYMENT_METHOD_CASH = "COD";
export const PAYMENT_METHOD_KHALTI = "ONLINE";

export const PAYMENT_METHOD_LABELS = {
  [PAYMENT_METHOD_CARD]: "Card · Stripe",
  [PAYMENT_METHOD_CASH]: "Cash on delivery",
  [PAYMENT_METHOD_KHALTI]: "Khalti",
};

// An order counts as paid only once the provider confirmed the payment.
export const isOrderPaid = (order) =>
  order?.payment?.status === PAYMENT_STATUS_COMPLETED;
