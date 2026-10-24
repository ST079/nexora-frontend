"use client";

import { Trash2 } from "lucide-react";
import { ConfirmDialog } from "@/components/Modal";
import { useState } from "react";
import toast from "react-hot-toast";
import { deleteUser } from "@/api/user";
import { apiErrorMessage } from "@/utils/format";

const DeleteModal = ({ user, onClose, onConfirm }) => {
  const [deleting, setDeleting] = useState(false);

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
    <ConfirmDialog
      id="delete-user"
      icon={Trash2}
      title="Delete user?"
      confirmLabel="Yes, delete"
      busyLabel="Deleting…"
      busy={deleting}
      onConfirm={handleDelete}
      onClose={onClose}
    >
      <span className="font-semibold text-ink">{user?.name}</span> will be
      permanently removed and won&apos;t be able to sign in. To block access but
      keep their history, deactivate them instead.
    </ConfirmDialog>
  );
};

export default DeleteModal;
