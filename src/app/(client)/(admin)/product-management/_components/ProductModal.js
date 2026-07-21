"use client";

import { AlertTriangle, Check, Loader2, X, FileImage } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import AnimatedField from "@/components/AnimatedField";
import { useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import { useDropzone } from "react-dropzone";
import Image from "next/image";

const ProductModal = ({ product, onClose, onSave }) => {
  const isEdit = !!product?._id;
  const [saving, setSaving] = useState(false);
  const [images, setImages] = useState([]);
  const [error, setError] = useState("");
  const { register, handleSubmit } = useForm();

  const onDrop = useCallback((acceptedFiles) => {
    setImages((prev) => [...prev, ...acceptedFiles]);
  }, []);
  console.log(images)

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/png": [".png"],
      "image/jpeg": [".jpg", ".jpeg"],
    },
    maxSize: 5 * 1024 * 1024,
  });

  const removeImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const formatSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatExt = (name) => name.split(".").pop().toUpperCase();

  const productDetails = async (data) => {
    console.log(data);
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
        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto bg-paper dark:bg-[#16181f] border border-hairline dark:border-[#262932] shadow-lift"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-hairline dark:border-[#262932]">
          <div>
            <p className="eyebrow dark:text-[#8b8fa8]">
              {isEdit ? "Edit product" : "New product"}
            </p>
            <h2 className="font-display text-lg font-semibold text-ink dark:text-[#f0efe8]">
              {isEdit ? product.name || "Untitled" : "Add to catalog"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="grid h-8 w-8 place-items-center text-slate dark:text-[#8b8fa8] hover:text-ink dark:hover:text-[#f0efe8] transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(productDetails)} className="p-6 space-y-4">
          {/* Error banner */}
          {error && (
            <div className="flex items-start gap-2 border border-danger/40 bg-danger/5 dark:bg-danger/10 px-3 py-2.5 text-sm text-danger">
              <AlertTriangle size={14} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid sm:grid-cols-2 gap-4">
            <AnimatedField
              label="Product name"
              placeholder="iPhone 16 Pro"
              required
              {...register("name")}
            />
            <AnimatedField
              label="Brand"
              placeholder="Apple"
              required
              {...register("brand")}
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <AnimatedField
              label="Category"
              placeholder="Smartphones"
              required
              {...register("category")}
            />
            <AnimatedField
              label="Price (Rs.)"
              placeholder="197000"
              required
              type="number"
              {...register("price")}
            />
          </div>

          <AnimatedField
            label="Stock"
            placeholder="10"
            required
            type="number"
            {...register("stock")}
          />

          {/* Dropzone */}
          <div>
            <label className="font-mono text-xs text-slate dark:text-[#8b8fa8] mb-1 block">
              Images
            </label>

            <div
              {...getRootProps()}
              className={`flex flex-col items-center justify-center w-full py-8 border border-dashed cursor-pointer transition-colors ${
                isDragActive
                  ? "border-signal bg-signal/5 dark:bg-signal/10"
                  : "border-hairline dark:border-[#262932] hover:border-ink dark:hover:border-[#f0efe8] bg-paper dark:bg-[#0e0f12]"
              }`}
            >
              <input {...getInputProps()} />
              <svg
                className="w-8 h-8 mb-3 text-slate dark:text-[#8b8fa8]"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M15 17h3a3 3 0 0 0 0-6h-.025a5.56 5.56 0 0 0 .025-.5A5.5 5.5 0 0 0 7.207 9.021C7.137 9.017 7.071 9 7 9a4 4 0 1 0 0 8h2.167M12 19v-9m0 0-2 2m2-2 2 2"
                />
              </svg>
              <p className="text-sm text-ink dark:text-[#f0efe8]">
                <span className="font-semibold">
                  {isDragActive ? "Drop images here…" : "Click to upload"}
                </span>
                {!isDragActive && " or drag and drop"}
              </p>
              <p className="font-mono text-[11px] text-slate dark:text-[#8b8fa8] mt-1">
                PNG, JPG or JPEG · max 5 MB each
              </p>
            </div>

            {/* Image previews */}
            <AnimatePresence>
              {images.length > 0 && (
                <motion.ul
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-2 space-y-2 overflow-hidden"
                >
                  {images.map((file, i) => {
                    const url = URL.createObjectURL(file);
                    return (
                      <motion.li
                        key={`${file.name}-${i}`}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 8 }}
                        transition={{ duration: 0.2, delay: i * 0.04 }}
                        className="flex items-center gap-3 border border-hairline dark:border-[#262932] p-2 bg-paper dark:bg-[#0e0f12]"
                      >
                        {/* Thumbnail */}
                        <div className="h-12 w-12 shrink-0 overflow-hidden border border-hairline dark:border-[#262932]">
                          <Image
                            src={url}
                            alt={file.name}
                            width={80}
                            height={80}
                            className="h-full w-full object-cover"
                            onLoad={() => URL.revokeObjectURL(url)}
                          />
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-ink dark:text-[#f0efe8] truncate">
                            {file.name}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="font-mono text-[10px] uppercase tracking-widest px-1.5 py-0.5 bg-blueprint/10 dark:bg-blueprint/20 text-blueprint dark:text-[#5c78ff]">
                              {formatExt(file.name)}
                            </span>
                            <span className="font-mono text-[11px] text-slate dark:text-[#8b8fa8]">
                              {formatSize(file.size)}
                            </span>
                          </div>
                        </div>

                        {/* Remove */}
                        <button
                          type="button"
                          onClick={() => removeImage(i)}
                          className="grid h-7 w-7 shrink-0 place-items-center text-slate dark:text-[#8b8fa8] hover:text-danger dark:hover:text-danger transition-colors"
                          aria-label="Remove image"
                        >
                          <X size={14} />
                        </button>
                      </motion.li>
                    );
                  })}
                </motion.ul>
              )}
            </AnimatePresence>
          </div>

          {/* Description */}
          <div>
            <label className="font-mono text-xs text-slate dark:text-[#8b8fa8] mb-1 block">
              Description
            </label>
            <textarea
              rows={3}
              placeholder="Brief product description…"
              className="w-full border border-hairline dark:border-[#262932] bg-white dark:bg-[#16181f] text-ink dark:text-[#f0efe8] px-3 py-2.5 text-sm outline-none transition-colors focus:border-ink dark:focus:border-[#f0efe8] placeholder:text-slate-light dark:placeholder:text-[#5b5e72] resize-none"
              {...register("description")}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="btn-primary flex-1 disabled:opacity-60"
            >
              {saving ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Check size={14} />
              )}
              {saving ? "Saving…" : isEdit ? "Save changes" : "Add product"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary px-5"
            >
              Cancel
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default ProductModal;
