"use client";

import { Ban } from "lucide-react";
import { ConfirmDialog } from "./Modal";

const OrderCancelConformationModal = ({ onConfirm, onClose, busy, paid }) => (
  <ConfirmDialog
    id="cancel-order"
    icon={Ban}
    title="Cancel this order?"
    confirmLabel="Yes, cancel"
    busyLabel="Cancelling…"
    cancelLabel="Keep order"
    busy={busy}
    onConfirm={onConfirm}
    onClose={onClose}
  >
    This can&apos;t be undone and the items go back on sale.
    {paid && " Because you've already paid, we'll contact you about your refund."}
  </ConfirmDialog>
);

export default OrderCancelConformationModal;
