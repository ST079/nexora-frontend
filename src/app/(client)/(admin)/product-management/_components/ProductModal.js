"use client";

import { AlertTriangle, Check, Loader2, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import AnimatedField from "@/components/AnimatedField";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { useDropzone } from "react-dropzone";
import Image from "next/image";
import toast from "react-hot-toast";
import { useEscape } from "@/hooks/useEscape";
import { categories } from "@/constants/categories";
import { createProduct, updateProduct } from "@/api/product";
import { apiErrorMessage, formatExt, formatSize } from "@/utils/format";

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

// Mirrors the backend's product schema so mistakes show up before upload.
const RULES = {
  name: {
    required: "Product name is required.",
    minLength: { value: 3, message: "Use at least 3 characters." },
  },
  price: {
    required: "Price is required.",
    min: { value: 1, message: "Price must be at least Rs. 1." },
  },
  stock: {
    required: "Stock is required.",
    min: { value: 0, message: "Stock can't be negative." },
    validate: (v) => Number.isInteger(Number(v)) || "Use a whole number.",
  },
};

const rejectionMessage = ({ file, errors }) => {
  const code = errors[0]?.code;
  if (code === "file-too-large") return `${file.name} is larger than 5 MB.`;
  if (code === "file-invalid-type") return `${file.name} isn't a PNG or JPG.`;
  return `${file.name} couldn't be added.`;
};

const ProductModal = ({ product, onClose, onSave }) => {
  const isEdit = !!product?._id;
  const titleId = useId();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // URLs already on the server vs new files picked in this session. Each new
  // file gets one object URL when it's added, revoked when it's removed or
  // the modal goes away (creating them during render leaked one per render).
  const [existingUrls, setExistingUrls] = useState(product?.imageUrls ?? []);
  const [newFiles, setNewFiles] = useState([]);
  const filesRef = useRef(newFiles);
  useEffect(() => {
    filesRef.current = newFiles;
  });
  useEffect(
    () => () => filesRef.current.forEach((f) => URL.revokeObjectURL(f.preview)),
    [],
  );

  const onDrop = useCallback((accepted) => {
    setNewFiles((prev) => [
      ...prev,
      ...accepted.map((file) => ({ file, preview: URL.createObjectURL(file) })),
    ]);
  }, []);

  const onDropRejected = useCallback((rejections) => {
    rejections.forEach((r) => toast.error(rejectionMessage(r)));
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    onDropRejected,
    accept: { "image/png": [".png"], "image/jpeg": [".jpg", ".jpeg"] },
    maxSize: MAX_IMAGE_BYTES,
  });

  const removeExisting = (url) =>
    setExistingUrls((prev) => prev.filter((u) => u !== url));

  const removeNew = (entry) => {
    URL.revokeObjectURL(entry.preview);
    setNewFiles((prev) => prev.filter((f) => f !== entry));
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: product?.name ?? "",
      brand: product?.brand ?? "",
      category: product?.category ?? "",
      stock: product?.stock ?? "",
      price: product?.price ?? "",
      description: product?.description ?? "",
    },
  });

  useEscape(onClose, !saving);

  const submit = async (data) => {
    setSaving(true);
    setError("");
    try {
      const formData = new FormData();
      formData.append("name", data.name.trim());
      formData.append("brand", data.brand.trim());
      formData.append("category", data.category.trim());
      formData.append("stock", data.stock);
      formData.append("price", data.price);
      formData.append("description", data.description.trim());

      // The backend keeps exactly the URLs listed here, then appends uploads.
      // An empty value means "keep none" when every saved image was removed.
      if (isEdit) {
        if (existingUrls.length)
          existingUrls.forEach((url) => formData.append("existingImages", url));
        else formData.append("existingImages", "");
      }
      newFiles.forEach(({ file }) => formData.append("images", file));

      const saved = isEdit
        ? await updateProduct(product._id, formData)
        : await createProduct(formData);

      onSave(saved, isEdit);
    } catch (err) {
      setError(apiErrorMessage(err));
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-ink/50 dark:bg-black/70"
        onClick={() => !saving && onClose()}
      />

      <motion.div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 12 }}
        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto bg-paper dark:bg-[#16181f] border border-hairline dark:border-[#262932] shadow-lift"
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b border-hairline dark:border-[#262932] bg-paper dark:bg-[#16181f]">
          <div className="min-w-0">
            <p className="eyebrow dark:text-[#8b8fa8]">
              {isEdit ? "Edit product" : "New product"}
            </p>
            <h2
              id={titleId}
              className="font-display text-lg font-semibold text-ink dark:text-[#f0efe8] truncate"
            >
              {isEdit ? product.name || "Untitled" : "Add to catalog"}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="grid h-8 w-8 shrink-0 place-items-center text-slate dark:text-[#8b8fa8] hover:text-ink dark:hover:text-[#f0efe8] transition-colors"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(submit)} noValidate className="p-6 space-y-4">
          {error && (
            <div
              role="alert"
              className="flex items-start gap-2 border border-danger/40 bg-danger/5 dark:bg-danger/10 px-3 py-2.5 text-sm text-danger"
            >
              <AlertTriangle size={14} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid sm:grid-cols-2 gap-4">
            <AnimatedField
              label="Product name"
              placeholder="iPhone 16 Pro"
              required
              error={errors.name?.message}
              {...register("name", RULES.name)}
            />
            <AnimatedField label="Brand" placeholder="Apple" {...register("brand")} />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <AnimatedField
                label="Category"
                placeholder="e.g. Smartphones"
                list="product-categories"
                {...register("category")}
              />
              <datalist id="product-categories">
                {categories.map((c) => (
                  <option key={c.label} value={c.label} />
                ))}
              </datalist>
            </div>
            <AnimatedField
              label="Price (Rs.)"
              placeholder="197000"
              required
              type="number"
              inputMode="decimal"
              min={1}
              error={errors.price?.message}
              {...register("price", RULES.price)}
            />
          </div>

          <AnimatedField
            label="Stock"
            placeholder="10"
            required
            type="number"
            inputMode="numeric"
            min={0}
            step={1}
            error={errors.stock?.message}
            hint="Shoppers can't add it to their cart at 0."
            {...register("stock", RULES.stock)}
          />

          {/* ── Images ── */}
          <div>
            <p className="font-mono text-xs text-slate dark:text-[#8b8fa8] mb-1">Images</p>

            <div
              {...getRootProps()}
              className={`flex flex-col items-center justify-center w-full py-8 border border-dashed cursor-pointer transition-colors focus-visible:outline-2 focus-visible:outline-signal ${
                isDragActive
                  ? "border-signal bg-signal/5 dark:bg-signal/10"
                  : "border-hairline dark:border-[#262932] hover:border-ink dark:hover:border-[#f0efe8] bg-paper dark:bg-[#0e0f12]"
              }`}
            >
              <input {...getInputProps()} aria-label="Upload product images" />
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
                PNG, JPG or JPEG · max 5 MB each · first image is the cover
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
                          <Image
                            src={url}
                            alt={`Saved image ${i + 1}`}
                            width={80}
                            height={80}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-ink dark:text-[#f0efe8] truncate">
                            {url.split("/").pop()}
                          </p>
                          <span className="font-mono text-[10px] uppercase tracking-widest px-1.5 py-0.5 bg-ok/10 text-ok">
                            Saved
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeExisting(url)}
                          className="grid h-7 w-7 shrink-0 place-items-center text-slate dark:text-[#8b8fa8] hover:text-danger transition-colors"
                          aria-label={`Remove saved image ${i + 1}`}
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
                    {newFiles.map((entry, i) => (
                      <motion.li
                        key={entry.preview}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 8 }}
                        transition={{ duration: 0.2, delay: i * 0.04 }}
                        className="flex items-center gap-3 border border-hairline dark:border-[#262932] p-2 bg-paper dark:bg-[#0e0f12]"
                      >
                        <div className="h-12 w-12 shrink-0 overflow-hidden border border-hairline dark:border-[#262932]">
                          <Image
                            src={entry.preview}
                            alt={entry.file.name}
                            width={80}
                            height={80}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-ink dark:text-[#f0efe8] truncate">
                            {entry.file.name}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="font-mono text-[10px] uppercase tracking-widest px-1.5 py-0.5 bg-blueprint/10 dark:bg-blueprint/20 text-blueprint dark:text-[#5c78ff]">
                              {formatExt(entry.file.name)}
                            </span>
                            <span className="font-mono text-[11px] text-slate dark:text-[#8b8fa8]">
                              {formatSize(entry.file.size)}
                            </span>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeNew(entry)}
                          className="grid h-7 w-7 shrink-0 place-items-center text-slate dark:text-[#8b8fa8] hover:text-danger transition-colors"
                          aria-label={`Remove ${entry.file.name}`}
                        >
                          <X size={14} />
                        </button>
                      </motion.li>
                    ))}
                  </ul>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Description */}
          <div>
            <label
              htmlFor="product-description"
              className="font-mono text-xs text-slate dark:text-[#8b8fa8] mb-1 block"
            >
              Description
            </label>
            <textarea
              id="product-description"
              rows={3}
              placeholder="Brief product description…"
              aria-describedby="product-description-hint"
              className="w-full border border-hairline dark:border-[#262932] bg-paper dark:bg-[#16181f] text-ink dark:text-[#f0efe8] px-3 py-2.5 text-sm outline-none transition-colors focus:border-ink dark:focus:border-[#f0efe8] placeholder:text-slate-light dark:placeholder:text-[#5b5e72] resize-y"
              {...register("description")}
            />
            <p
              id="product-description-hint"
              className="mt-1 font-mono text-[11px] text-slate dark:text-[#8b8fa8]"
            >
              {isEdit
                ? "Shown on the product page."
                : "Leave blank and Nexora will draft one from the name, brand and category."}
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={saving} className="btn-primary flex-1">
              {saving ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Check size={14} />
              )}
              {saving ? "Saving…" : isEdit ? "Update product" : "Add product"}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
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
