"use client";

import { Trash2 } from "lucide-react";
import { ConfirmDialog } from "@/components/Modal";
import { useState } from "react";
import toast from "react-hot-toast";
import { deleteProduct } from "@/api/product";
import { apiErrorMessage } from "@/utils/format";

const DeleteModal = ({ product, onClose, onConfirm }) => {
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteProduct(product._id);
      onConfirm(product._id);
    } catch (error) {
      toast.error(apiErrorMessage(error, "Couldn't delete this product."));
      setDeleting(false);
    }
  };

  return (
    <ConfirmDialog
      id="delete-product"
      icon={Trash2}
      title="Delete product?"
      confirmLabel="Delete"
      busyLabel="Deleting…"
      busy={deleting}
      onConfirm={handleDelete}
      onClose={onClose}
    >
      <span className="font-semibold text-ink">{product?.name}</span> will be
      permanently removed from the catalog. Past orders keep their copy of the
      name and price.
    </ConfirmDialog>
  );
};

export default DeleteModal;
