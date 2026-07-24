"use client";

import { AlertTriangle, Check, Loader2, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import AnimatedField from "@/components/AnimatedField";
import { useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import { useDropzone } from "react-dropzone";
import Image from "next/image";
import { categories } from "@/constants/categories";
import { createProduct, updateProduct } from "@/api/product";
import toast from "react-hot-toast";

const ProductModal = ({ product, onClose, onSave }) => {
  const isEdit = !!product?._id;

  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState("");

  // ── Images ──────────────────────────────────────────────────────────────
  // Separate state for existing URLs (from the server) vs new File objects
  const [existingUrls, setExistingUrls] = useState(product?.imageUrls ?? []);
  const [newFiles, setNewFiles]         = useState([]);

  const onDrop = useCallback((acceptedFiles) => {
    setNewFiles((prev) => [...prev, ...acceptedFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/png": [".png"], "image/jpeg": [".jpg", ".jpeg"] },
    maxSize: 5 * 1024 * 1024,
  });

  const removeExisting = (index) =>
    setExistingUrls((prev) => prev.filter((_, i) => i !== index));

  const removeNew = (index) =>
    setNewFiles((prev) => prev.filter((_, i) => i !== index));

  const formatSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatExt = (name) => name.split(".").pop().toUpperCase();

  // ── Form ─────────────────────────────────────────────────────────────────
  const { register, handleSubmit } = useForm({
    values: {
      name:        isEdit ? product.name        : "",
      brand:       isEdit ? product.brand       : "",
      category:    isEdit ? product.category    : "",
      stock:       isEdit ? product.stock       : "",
      price:       isEdit ? product.price       : "",
      description: isEdit ? product.description : "",
    },
  });

  const productDetails = async (data) => {
    setSaving(true);
    setError("");
    try {
      const formData = new FormData();
      formData.append("name",     data.name);
      formData.append("brand",    data.brand);
      formData.append("category", data.category);
      formData.append("stock",    data.stock ?? 1);
      formData.append("price",    data.price);
      if (data.description) formData.append("description", data.description);

      // Send remaining existing URLs so the backend knows which to keep
      existingUrls.forEach((url) => formData.append("existingImages", url));
      // Send new files
      newFiles.forEach((file) => formData.append("images", file));

      const response = isEdit
        ? await updateProduct(product._id, formData)
        : await createProduct(formData);

      onSave(response, isEdit);
      onClose();
      toast.success(isEdit ? "Product updated!" : "Product added!");
    } catch (err) {
      setError(
        err?.response?.data?.message || err.message || "Something went wrong.",
      );
    } finally {
      setSaving(false);
    }
  };

  // ── UI ───────────────────────────────────────────────────────────────────
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="absolute inset-0 bg-ink/50 dark:bg-black/70"
        onClick={onClose}
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1,    y: 0  }}
        exit={{   opacity: 0, scale: 0.96,  y: 12 }}
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
              {isEdit ? product.name || "Untitled" : "Add to Products"}
            </h2>
          </div>
          <button onClick={onClose} className="grid h-8 w-8 place-items-center text-slate dark:text-[#8b8fa8] hover:text-ink dark:hover:text-[#f0efe8] transition-colors">
            <X size={16} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(productDetails)} className="p-6 space-y-4">
          {error && (
            <div className="flex items-start gap-2 border border-danger/40 bg-danger/5 dark:bg-danger/10 px-3 py-2.5 text-sm text-danger">
              <AlertTriangle size={14} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid sm:grid-cols-2 gap-4">
            <AnimatedField label="Product name" placeholder="iPhone 16 Pro" required {...register("name")} />
            <AnimatedField label="Brand"        placeholder="Apple"         required {...register("brand")} />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <AnimatedField label="Category" placeholder="e.g. Smartphones" list="product-categories" {...register("category")} />
              <datalist id="product-categories">
                {categories.map((c, i) => <option key={i} value={c.label} />)}
              </datalist>
            </div>
            <AnimatedField label="Price (Rs.)" placeholder="197000" required type="number" {...register("price")} />
          </div>

          <AnimatedField label="Stock" placeholder="10" required type="number" {...register("stock")} />

          {/* ── Images ── */}
          <div>
            <label className="font-mono text-xs text-slate dark:text-[#8b8fa8] mb-1 block">
              Images
            </label>

            {/* Dropzone */}
            <div
              {...getRootProps()}
              className={`flex flex-col items-center justify-center w-full py-8 border border-dashed cursor-pointer transition-colors ${
                isDragActive
                  ? "border-signal bg-signal/5 dark:bg-signal/10"
                  : "border-hairline dark:border-[#262932] hover:border-ink dark:hover:border-[#f0efe8] bg-paper dark:bg-[#0e0f12]"
              }`}
            >
              <input {...getInputProps()} />
              <svg className="w-8 h-8 mb-3 text-slate dark:text-[#8b8fa8]" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h3a3 3 0 0 0 0-6h-.025a5.56 5.56 0 0 0 .025-.5A5.5 5.5 0 0 0 7.207 9.021C7.137 9.017 7.071 9 7 9a4 4 0 1 0 0 8h2.167M12 19v-9m0 0-2 2m2-2 2 2" />
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

            {/* Existing image previews (edit mode) */}
            <AnimatePresence>
              {existingUrls.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <p className="font-mono text-[10px] uppercase tracking-widest text-slate dark:text-[#8b8fa8] mt-3 mb-1.5">
                    Current images
                  </p>
                  <ul className="space-y-2">
                    {existingUrls.map((url, i) => (
                      <motion.li
                        key={url}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 8 }}
                        transition={{ duration: 0.2 }}
                        className="flex items-center gap-3 border border-hairline dark:border-[#262932] p-2 bg-paper dark:bg-[#0e0f12]"
                      >
                        <div className="h-12 w-12 shrink-0 overflow-hidden border border-hairline dark:border-[#262932]">
                          <Image src={url} alt={`Image ${i + 1}`} width={80} height={80} className="h-full w-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-ink dark:text-[#f0efe8] truncate">{url.split("/").pop()}</p>
                          <span className="font-mono text-[10px] uppercase tracking-widest px-1.5 py-0.5 bg-ok/10 text-ok">
                            Saved
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeExisting(i)}
                          className="grid h-7 w-7 shrink-0 place-items-center text-slate dark:text-[#8b8fa8] hover:text-danger transition-colors"
                          aria-label="Remove image"
                        >
                          <X size={14} />
                        </button>
                      </motion.li>
                    ))}
                  </ul>
                </motion.div>
              )}
            </AnimatePresence>

            {/* New file previews */}
            <AnimatePresence>
              {newFiles.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <p className="font-mono text-[10px] uppercase tracking-widest text-slate dark:text-[#8b8fa8] mt-3 mb-1.5">
                    New uploads
                  </p>
                  <ul className="space-y-2">
                    {newFiles.map((file, i) => {
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
                          <div className="h-12 w-12 shrink-0 overflow-hidden border border-hairline dark:border-[#262932]">
                            <Image src={url} alt={file.name} width={80} height={80} className="h-full w-full object-cover" onLoad={() => URL.revokeObjectURL(url)} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-ink dark:text-[#f0efe8] truncate">{file.name}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="font-mono text-[10px] uppercase tracking-widest px-1.5 py-0.5 bg-blueprint/10 dark:bg-blueprint/20 text-blueprint dark:text-[#5c78ff]">
                                {formatExt(file.name)}
                              </span>
                              <span className="font-mono text-[11px] text-slate dark:text-[#8b8fa8]">
                                {formatSize(file.size)}
                              </span>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeNew(i)}
                            className="grid h-7 w-7 shrink-0 place-items-center text-slate dark:text-[#8b8fa8] hover:text-danger transition-colors"
                            aria-label="Remove image"
                          >
                            <X size={14} />
                          </button>
                        </motion.li>
                      );
                    })}
                  </ul>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Description */}
          <div>
            <label className="font-mono text-xs text-slate dark:text-[#8b8fa8] mb-1 block">Description</label>
            <textarea
              rows={3}
              placeholder="Brief product description…"
              className="w-full border border-hairline dark:border-[#262932] bg-white dark:bg-[#16181f] text-ink dark:text-[#f0efe8] px-3 py-2.5 text-sm outline-none transition-colors focus:border-ink dark:focus:border-[#f0efe8] placeholder:text-slate-light dark:placeholder:text-[#5b5e72] resize-none"
              {...register("description")}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={saving} className="btn-primary flex-1 disabled:opacity-60">
              {saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
              {saving ? "Saving…" : isEdit ? "Update product" : "Add product"}
            </button>
            <button type="button" onClick={onClose} className="btn-secondary px-5">Cancel</button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default ProductModal;