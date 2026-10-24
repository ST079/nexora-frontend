import {
  isOrderPaid,
  PAYMENT_METHOD_CASH,
  PAYMENT_STATUS_FAILED,
} from "@/constants/payment";

const BADGE = {
  paid: { label: "Paid", tone: "bg-ok/12 text-ok" },
  cod: { label: "Cash on delivery", tone: "bg-blueprint-tint text-blueprint-dim" },
  codDue: { label: "Due on delivery", tone: "bg-blueprint-tint text-blueprint-dim" },
  failed: { label: "Payment failed", tone: "bg-danger/10 text-danger" },
  unpaid: { label: "Unpaid", tone: "bg-marigold-tint text-marigold-dim" },
};

// COD orders stay unpaid until delivery, which is expected, not a problem.
// With `methodShown` the method is already printed beside the badge, so the
// badge states only when the money is due.
const badgeFor = (order, methodShown) => {
  if (isOrderPaid(order)) return BADGE.paid;
  if (order?.payment?.method === PAYMENT_METHOD_CASH) return methodShown ? BADGE.codDue : BADGE.cod;
  if (order?.payment?.status === PAYMENT_STATUS_FAILED) return BADGE.failed;
  return BADGE.unpaid;
};

const PaymentBadge = ({ order, methodShown = false }) => {
  const { label, tone } = badgeFor(order, methodShown);
  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-semibold leading-none ${tone}`}
    >
      <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-current" />
      {label}
    </span>
  );
};

export default PaymentBadge;
