"use client";

import { Banknote } from "lucide-react";
import { ConfirmDialog } from "./Modal";
import { formatNPR } from "@/utils/format";

const CashConfirmModal = ({ onConfirm, onClose, busy, amount }) => (
  <ConfirmDialog
    id="cash"
    tone="ok"
    icon={Banknote}
    title="Pay with cash?"
    confirmLabel="Yes, pay on delivery"
    busyLabel="Confirming…"
    busy={busy}
    onConfirm={onConfirm}
    onClose={onClose}
  >
    You&apos;ll pay
    {amount != null && (
      <strong className="font-mono text-ink"> {formatNPR(amount)}</strong>
    )}{" "}
    in cash when the order arrives. We&apos;ll confirm the order now and start
    packing it.
  </ConfirmDialog>
);

export default CashConfirmModal;
