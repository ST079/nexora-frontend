"use client";
import { Loader2, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";

const DeleteModal = ({ product, onClose, onConfirm }) => {
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      // await deleteProduct(product._id);
      await new Promise((r) => setTimeout(r, 600)); // ← remove when wired up
      onConfirm();
    } finally {
      setDeleting(false);
    }
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
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        transition={{ duration: 0.2 }}
        className="relative w-full max-w-sm bg-paper dark:bg-[#16181f] border border-hairline dark:border-[#262932] shadow-lift p-6"
      >
        <div className="grid h-12 w-12 place-items-center border border-danger/40 bg-danger/5 dark:bg-danger/10 mb-4">
          <Trash2 size={18} className="text-danger" />
        </div>
        <h3 className="font-display text-lg font-semibold text-ink dark:text-[#f0efe8] mb-1">
          Delete product?
        </h3>
        <p className="text-sm text-slate dark:text-[#8b8fa8] mb-6">
          <span className="font-medium text-ink dark:text-[#f0efe8]">
            {product?.name}
          </span>{" "}
          will be permanently removed from the catalog. This cannot be undone.
        </p>
        <div className="flex gap-3">
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="flex flex-1 items-center justify-center gap-2 bg-danger text-paper px-4 py-2.5 text-sm font-medium hover:bg-danger/90 disabled:opacity-60 transition-colors"
          >
            {deleting ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Trash2 size={14} />
            )}
            {deleting ? "Deleting…" : "Delete"}
          </button>
          <button onClick={onClose} className="btn-secondary flex-1">
            Cancel
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default DeleteModal;
