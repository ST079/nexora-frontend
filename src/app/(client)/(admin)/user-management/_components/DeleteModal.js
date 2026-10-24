"use client";

import { Loader2, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import toast from "react-hot-toast";
import { deleteUser } from "@/api/user";
import { useEscape } from "@/hooks/useEscape";
import { apiErrorMessage } from "@/utils/format";

const DeleteModal = ({ user, onClose, onConfirm }) => {
  const [deleting, setDeleting] = useState(false);

  useEscape(onClose, !deleting);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteUser(user._id);
      toast.success(`${user.name} was deleted.`);
      onConfirm(user._id);
    } catch (error) {
      toast.error(apiErrorMessage(error, "Couldn't delete this user."));
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
        onClick={() => !deleting && onClose()}
      />
      <motion.div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="delete-user-title"
        aria-describedby="delete-user-body"
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 12 }}
        transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full max-w-sm bg-paper dark:bg-[#16181f] border border-hairline dark:border-[#262932] shadow-lift p-6"
      >
        <div className="grid h-12 w-12 place-items-center border border-danger/40 bg-danger/5 dark:bg-danger/10 mb-4">
          <Trash2 size={20} className="text-danger" />
        </div>
        <h3
          id="delete-user-title"
          className="font-display text-lg font-semibold text-ink dark:text-[#f0efe8] mb-1"
        >
          Delete user?
        </h3>
        <p
          id="delete-user-body"
          className="text-sm text-slate dark:text-[#8b8fa8] mb-6 leading-relaxed"
        >
          <span className="font-medium text-ink dark:text-[#f0efe8]">
            {user?.name}
          </span>{" "}
          will be permanently removed and won&apos;t be able to sign in. To
          block access but keep their history, deactivate them instead.
        </p>
        <div className="flex gap-3">
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="flex flex-1 items-center justify-center gap-2 bg-danger text-paper dark:text-ink px-4 py-2.5 text-sm font-medium hover:bg-danger/90 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
          >
            {deleting ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Trash2 size={14} />
            )}
            {deleting ? "Deleting…" : "Yes, delete"}
          </button>
          <button
            onClick={onClose}
            disabled={deleting}
            className="btn-secondary flex-1"
            autoFocus
          >
            Cancel
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default DeleteModal;
