import {
  isOrderPaid,
  PAYMENT_METHOD_CASH,
  PAYMENT_STATUS_FAILED,
} from "@/constants/payment";

const BADGE = {
  paid: { label: "Paid", tone: "bg-ok/10 text-ok" },
  cod: { label: "Cash on delivery", tone: "bg-blueprint/10 text-blueprint dark:text-[#9aa6ff]" },
  failed: { label: "Payment failed", tone: "bg-danger/10 text-danger" },
  unpaid: { label: "Unpaid", tone: "bg-signal/10 text-signal-dim dark:text-signal" },
};

// COD orders stay unpaid until delivery, which is expected, not a problem.
const badgeFor = (order) => {
  if (isOrderPaid(order)) return BADGE.paid;
  if (order?.payment?.method === PAYMENT_METHOD_CASH) return BADGE.cod;
  if (order?.payment?.status === PAYMENT_STATUS_FAILED) return BADGE.failed;
  return BADGE.unpaid;
};

const PaymentBadge = ({ order }) => {
  const { label, tone } = badgeFor(order);
  return (
    <span
      className={`inline-block whitespace-nowrap font-mono text-[11px] uppercase tracking-widest px-2 py-0.5 ${tone}`}
    >
      {label}
    </span>
  );
};

export default PaymentBadge;
