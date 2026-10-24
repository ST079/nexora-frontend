"use client";

import { AlertTriangle, Check, ImagePlus, Loader2, PackageOpen, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import AnimatedField from "@/components/AnimatedField";
import { Modal } from "@/components/Modal";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { useDropzone } from "react-dropzone";
import Image from "next/image";
import toast from "react-hot-toast";
import StatusBadge from "./StockStatusBadge";
import { categories } from "@/constants/categories";
import { createProduct, updateProduct } from "@/api/product";
import { apiErrorMessage, formatExt, formatNPR, formatSize } from "@/utils/format";
import { bouncy } from "@/utils/motion";

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

const Section = ({ step, title, children }) => (
  <section className="space-y-4">
    <h3 className="flex items-center gap-2.5 text-sm font-bold text-ink">
      <span className="grid h-6 w-6 place-items-center rounded-full bg-ink text-[11px] text-paper">
        {step}
      </span>
      {title}
    </h3>
    {children}
  </section>
);

// One photo in the gallery grid. The first one is the cover.
const Thumb = ({ src, alt, cover, meta, onRemove, removeLabel }) => (
  <motion.li
    layout
    initial={{ opacity: 0, scale: 0.8 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.8 }}
    transition={bouncy}
    className="group relative aspect-square overflow-hidden rounded-2xl border border-hairline bg-mist"
  >
    <Image src={src} alt={alt} fill sizes="120px" className="object-cover" />
    {cover && <span className="sticker absolute left-1.5 top-1.5">Cover</span>}
    {meta && (
      <span className="absolute inset-x-1.5 bottom-1.5 truncate rounded-full bg-night/70 px-2 py-0.5 text-center font-mono text-[10px] text-on-night backdrop-blur-sm">
        {meta}
      </span>
    )}
    <button
      type="button"
      onClick={onRemove}
      className="absolute right-1.5 top-1.5 grid h-7 w-7 place-items-center rounded-full bg-panel/90 text-ink shadow-soft transition-all hover:bg-danger hover:text-paper sm:opacity-0 sm:group-hover:opacity-100 sm:focus-visible:opacity-100"
      aria-label={removeLabel}
    >
      <X size={13} />
    </button>
  </motion.li>
);

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
    control,
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

  // Drives the live preview card at the bottom of the form.
  const [name, brand, category, price, stock] = useWatch({
    control,
    name: ["name", "brand", "category", "price", "stock"],
  });
  const cover = existingUrls[0] ?? newFiles[0]?.preview;
  const photoCount = existingUrls.length + newFiles.length;

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
    <Modal onClose={onClose} dismissable={!saving} labelledBy={titleId} size="max-w-2xl">
      {/* Header */}
      <div className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-hairline bg-panel/90 px-6 py-4 backdrop-blur-xl">
        <div className="flex min-w-0 items-center gap-3">
          <motion.span
            initial={{ scale: 0.4, rotate: -20 }}
            animate={{ scale: 1, rotate: -6 }}
            transition={{ ...bouncy, delay: 0.05 }}
            className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-signal text-on-signal shadow-glow"
          >
            <PackageOpen size={20} aria-hidden />
          </motion.span>
          <div className="min-w-0">
            <p className="eyebrow">{isEdit ? "Edit product" : "New product"}</p>
            <h2 id={titleId} className="truncate font-display text-xl font-bold text-ink">
              {isEdit ? product.name || "Untitled" : "Add to catalog"}
            </h2>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          disabled={saving}
          className="icon-btn h-9 w-9"
          aria-label="Close"
        >
          <X size={16} />
        </button>
      </div>

      <form onSubmit={handleSubmit(submit)} noValidate>
        <div className="space-y-8 p-6">
          <AnimatePresence>
            {error && (
              <motion.div
                role="alert"
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0, x: [0, -5, 5, -3, 3, 0] }}
                exit={{ opacity: 0, y: -6 }}
                className="flex items-start gap-2.5 rounded-2xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger"
              >
                <AlertTriangle size={16} className="mt-0.5 shrink-0" />
                <span>{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <Section step={1} title="The basics">
            <div className="grid gap-4 sm:grid-cols-2">
              <AnimatedField
                label="Product name"
                placeholder="iPhone 16 Pro"
                required
                error={errors.name?.message}
                {...register("name", RULES.name)}
              />
              <AnimatedField label="Brand" placeholder="e.g. Himalayan Java" {...register("brand")} />
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
              <div className="grid grid-cols-2 gap-3">
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
                <AnimatedField
                  label="Stock"
                  placeholder="10"
                  required
                  type="number"
                  inputMode="numeric"
                  min={0}
                  step={1}
                  error={errors.stock?.message}
                  {...register("stock", RULES.stock)}
                />
              </div>
            </div>
            <p className="text-[11px] text-slate">Shoppers can&apos;t add it to their cart at 0 stock.</p>
          </Section>

          <Section step={2} title="Photos">
            <ul className="grid grid-cols-3 gap-3 sm:grid-cols-4">
              <AnimatePresence initial={false}>
                {existingUrls.map((url, i) => (
                  <Thumb
                    key={url}
                    src={url}
                    alt={`Saved image ${i + 1}`}
                    cover={i === 0}
                    meta="Saved"
                    onRemove={() => removeExisting(url)}
                    removeLabel={`Remove saved image ${i + 1}`}
                  />
                ))}
                {newFiles.map((entry, i) => (
                  <Thumb
                    key={entry.preview}
                    src={entry.preview}
                    alt={entry.file.name}
                    cover={existingUrls.length === 0 && i === 0}
                    meta={`${formatExt(entry.file.name)} · ${formatSize(entry.file.size)}`}
                    onRemove={() => removeNew(entry)}
                    removeLabel={`Remove ${entry.file.name}`}
                  />
                ))}
              </AnimatePresence>
              <motion.li layout className={photoCount ? "" : "col-span-3 sm:col-span-4"}>
                <div
                  {...getRootProps()}
                  className={`flex h-full min-h-28 cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed p-4 text-center transition-all focus-visible:outline-2 focus-visible:outline-signal ${
                    isDragActive
                      ? "scale-[1.02] border-signal bg-signal-tint"
                      : "border-hairline bg-mist/50 hover:border-signal/50 hover:bg-signal-tint/50"
                  } ${photoCount ? "aspect-square" : "py-8"}`}
                >
                  <input {...getInputProps()} aria-label="Upload product images" />
                  <motion.span
                    animate={isDragActive ? { y: [0, -4, 0] } : { y: 0 }}
                    transition={{ repeat: isDragActive ? Infinity : 0, duration: 0.8 }}
                    className="grid h-10 w-10 place-items-center rounded-2xl bg-panel text-signal shadow-soft"
                  >
                    <ImagePlus size={18} aria-hidden />
                  </motion.span>
                  <p className="text-xs font-semibold text-ink">
                    {isDragActive ? "Drop them here" : photoCount ? "Add more" : "Click or drag photos here"}
                  </p>
                  {!photoCount && (
                    <p className="text-[11px] text-slate">
                      PNG or JPG · up to 5 MB each · the first photo is the cover
                    </p>
                  )}
                </div>
              </motion.li>
            </ul>
          </Section>

          <Section step={3} title="Description">
            <div>
              <label htmlFor="product-description" className="sr-only">
                Description
              </label>
              <textarea
                id="product-description"
                rows={4}
                placeholder="What makes it worth buying? Size, materials, what's in the box…"
                aria-describedby="product-description-hint"
                className="field resize-y"
                {...register("description")}
              />
              <p id="product-description-hint" className="mt-1.5 text-[11px] text-slate">
                {isEdit
                  ? "Shown on the product page."
                  : "Leave blank and Nexora will draft one from the name, brand and category."}
              </p>
            </div>
          </Section>

          {/* Live preview of the listing */}
          <div className="rounded-3xl border border-dashed border-ink/15 bg-mist/40 p-4">
            <p className="eyebrow mb-3">Shoppers will see</p>
            <div className="flex items-center gap-4">
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl border border-hairline bg-panel">
                {cover ? (
                  <Image src={cover} alt="" fill sizes="64px" className="object-cover" />
                ) : (
                  <span className="grid h-full w-full place-items-center text-slate-light">
                    <PackageOpen size={20} aria-hidden />
                  </span>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-ink">{name?.trim() || "Product name"}</p>
                <p className="truncate text-xs text-slate">
                  {[brand?.trim(), category?.trim()].filter(Boolean).join(" · ") || "Brand · Category"}
                </p>
                <div className="mt-1.5 flex flex-wrap items-center gap-2">
                  <span className="font-semibold text-ink">{price ? formatNPR(price) : "Rs. —"}</span>
                  {stock !== "" && stock != null && <StatusBadge stock={stock} />}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="sticky bottom-0 flex flex-col-reverse gap-2 border-t border-hairline bg-panel/90 px-6 py-4 backdrop-blur-xl sm:flex-row sm:justify-end">
          <button type="button" onClick={onClose} disabled={saving} className="btn-secondary">
            Cancel
          </button>
          <button type="submit" disabled={saving} className="btn-primary sm:min-w-44">
            {saving ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />}
            {saving ? "Saving…" : isEdit ? "Update product" : "Add product"}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default ProductModal;
