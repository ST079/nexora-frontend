"use client";

import { ViewTransition, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { AnimatePresence, motion, useInView } from "framer-motion";
import toast from "react-hot-toast";
import {
  BadgeCheck,
  ChevronDown,
  Minus,
  PackageCheck,
  Plus,
  ShoppingBag,
  Wallet,
  Zap,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import { addToCart, cartItemFrom, stockLimit } from "@/redux/cart/cartSlice";
import { formatNPR, productImage } from "@/utils/format";
import Image from "next/image";
import { CART_ROUTE } from "@/constants/routes";
import { LOW_STOCK_THRESHOLD } from "@/constants/defaults";
import { flyToCart } from "@/utils/flyToCart";
import { EASE_OUT, softSpring } from "@/utils/motion";
import { productTransitionName } from "./ProductCard";

// Descriptions longer than this start collapsed behind "Read more".
const LONG_DESCRIPTION = 420;

const PERKS = [
  { icon: Wallet, text: "Khalti, card or cash on delivery" },
  { icon: PackageCheck, text: "Track it from your orders page" },
  { icon: BadgeCheck, text: "Sold by a Nexora merchant" },
];

// Markdown without a typography plugin: style the elements directly.
const MARKDOWN =
  "text-sm leading-relaxed text-slate [&_a]:text-signal-dim [&_a]:underline [&_h1]:font-display [&_h1]:font-semibold [&_h1]:text-ink [&_h2]:font-display [&_h2]:font-semibold [&_h2]:text-ink [&_h3]:font-display [&_h3]:font-semibold [&_h3]:text-ink [&_li]:mb-1 [&_ol]:list-decimal [&_ol]:pl-5 [&_p:last-child]:mb-0 [&_p]:mb-2 [&_strong]:text-ink [&_ul]:list-disc [&_ul]:pl-5";

const ProductDetailClient = ({ product }) => {
  const dispatch = useDispatch();
  const router = useRouter();
  const id = product._id || product.id;
  const inCart = useSelector(
    (state) => state.cart.items.find((i) => i.id === id)?.quantity ?? 0
  );

  const [activeImage, setActiveImage] = useState(0);
  const [qty, setQty] = useState(1);
  const [expanded, setExpanded] = useState(false);
  const imageRef = useRef(null);
  const ctaRef = useRef(null);
  // The phone add bar appears once the main buttons scroll out of view.
  const ctaVisible = useInView(ctaRef, { initial: true });

  const limit = stockLimit(cartItemFrom(product));
  const outOfStock = limit <= 0;
  // What's left to add once the cart's share of the stock is taken out.
  const remaining = Math.max(0, limit - inCart);
  const allInCart = !outOfStock && remaining === 0;
  const quantity = Math.max(1, Math.min(qty, remaining || 1));
  const lowStock = !outOfStock && limit <= LOW_STOCK_THRESHOLD;
  const images =
    Array.isArray(product.imageUrls) && product.imageUrls.length
      ? product.imageUrls
      : [productImage(product)];
  const longDescription = (product.description ?? "").length > LONG_DESCRIPTION;

  const add = () => {
    dispatch(addToCart(cartItemFrom(product, quantity)));
    flyToCart(imageRef.current, images[activeImage]);
    setQty(1);
  };

  const handleAddToCart = () => {
    add();
    toast.success(`${quantity} × ${product.name} added to cart`);
  };

  const handleBuyNow = () => {
    if (!allInCart) add();
    router.push(CART_ROUTE);
  };

  // Hover zoom: the photo scales up around the pointer (mouse only).
  const onZoomMove = (e) => {
    if (e.pointerType !== "mouse") return;
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty("--zx", `${((e.clientX - r.left) / r.width) * 100}%`);
    e.currentTarget.style.setProperty("--zy", `${((e.clientY - r.top) / r.height) * 100}%`);
  };

  const availability = outOfStock
    ? "Restocking soon"
    : allInCart
      ? "All available stock is in your cart"
      : `${Number.isFinite(remaining) ? `${remaining} available` : "In stock"}${
          inCart ? ` · ${inCart} in your cart` : ""
        }`;

  const stockPill = outOfStock
    ? { text: "Out of stock", className: "bg-danger/10 text-danger", dot: "bg-danger" }
    : lowStock
      ? { text: `Only ${limit} left`, className: "bg-marigold-tint text-marigold-dim", dot: "bg-marigold" }
      : { text: "In stock", className: "bg-ok/10 text-ok", dot: "bg-ok" };

  return (
    <div className="grid gap-8 lg:grid-cols-[1.1fr_1fr] lg:gap-12">
      {/* Gallery */}
      <div className="lg:sticky lg:top-24 lg:self-start">
        <div
          ref={imageRef}
          onPointerMove={onZoomMove}
          className="group relative aspect-square cursor-zoom-in overflow-hidden rounded-4xl border border-hairline bg-mist"
        >
          <ViewTransition name={productTransitionName(id)} share="morph">
            <div className="absolute inset-0">
              <AnimatePresence initial={false}>
                <motion.div
                  key={activeImage}
                  initial={{ opacity: 0, scale: 1.04 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.45, ease: EASE_OUT }}
                  className="absolute inset-0"
                >
                  <Image
                    src={images[activeImage]}
                    alt={product.name}
                    fill
                    sizes="(min-width: 1024px) 50vw, 100vw"
                    preload={activeImage === 0}
                    className="object-cover transition-transform duration-300 ease-out origin-[var(--zx,50%)_var(--zy,50%)] group-hover:scale-[1.6] pointer-coarse:group-hover:scale-100"
                  />
                </motion.div>
              </AnimatePresence>
            </div>
          </ViewTransition>

          {images.length > 1 && (
            <span className="glass pointer-events-none absolute bottom-4 left-4 rounded-full px-3 py-1 font-mono text-[11px] text-ink">
              {activeImage + 1} / {images.length}
            </span>
          )}
        </div>

        {images.length > 1 && (
          <div className="no-scrollbar mt-3 flex gap-2 overflow-x-auto p-1">
            {images.map((img, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setActiveImage(i)}
                aria-label={`Show image ${i + 1} of ${images.length}`}
                aria-pressed={i === activeImage}
                className={`relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl border-2 transition-all duration-300 ease-spring ${
                  i === activeImage
                    ? "scale-95 border-signal"
                    : "border-transparent opacity-70 hover:opacity-100"
                }`}
              >
                <Image src={img} alt="" fill sizes="80px" className="object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Buy box */}
      <div>
        <div className="mb-4 flex flex-wrap items-center gap-2">
          {product.brand && <span className="chip pointer-events-none">{product.brand}</span>}
          {product.category && (
            <span className="chip pointer-events-none text-slate-dim">{product.category}</span>
          )}
        </div>

        <h1 className="font-display text-4xl font-bold leading-[1.02] tracking-tight text-ink sm:text-5xl">
          {product.name}
        </h1>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <p className="font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">
            {formatNPR(product.price)}
          </p>
          <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${stockPill.className}`}>
            <span className={`h-2 w-2 rounded-full ${stockPill.dot} ${!outOfStock ? "animate-pulse" : ""}`} />
            {stockPill.text}
          </span>
        </div>

        {/* Quantity + actions */}
        <div ref={ctaRef} className="mt-8 rounded-3xl border border-hairline bg-panel p-4 sm:p-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center rounded-full border border-hairline bg-paper p-1">
              <button
                type="button"
                onClick={() => setQty(Math.max(1, quantity - 1))}
                disabled={quantity <= 1 || outOfStock || allInCart}
                className="grid h-10 w-10 place-items-center rounded-full text-ink transition-all hover:bg-mist active:scale-90 disabled:pointer-events-none disabled:opacity-30"
                aria-label="Decrease quantity"
              >
                <Minus size={15} />
              </button>
              <span aria-live="polite" className="relative w-10 overflow-hidden text-center font-mono font-semibold text-ink">
                <AnimatePresence mode="popLayout" initial={false}>
                  <motion.span
                    key={outOfStock || allInCart ? 0 : quantity}
                    initial={{ y: 12, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -12, opacity: 0 }}
                    transition={softSpring}
                    className="inline-block"
                  >
                    {outOfStock || allInCart ? 0 : quantity}
                  </motion.span>
                </AnimatePresence>
              </span>
              <button
                type="button"
                onClick={() => setQty(Math.min(remaining, quantity + 1))}
                disabled={quantity >= remaining}
                className="grid h-10 w-10 place-items-center rounded-full text-ink transition-all hover:bg-mist active:scale-90 disabled:pointer-events-none disabled:opacity-30"
                aria-label="Increase quantity"
              >
                <Plus size={15} />
              </button>
            </div>
            <span
              className={`font-mono text-xs ${
                outOfStock ? "text-danger" : lowStock ? "text-marigold-dim" : "text-slate"
              }`}
            >
              {availability}
            </span>
          </div>

          <div className="grid gap-2 sm:grid-cols-2">
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={outOfStock || allInCart}
              className="btn-primary py-3.5 text-base"
            >
              <ShoppingBag size={17} /> Add to bag
            </button>
            <button
              type="button"
              onClick={handleBuyNow}
              disabled={outOfStock}
              className="btn-accent py-3.5 text-base disabled:hover:translate-y-0"
            >
              <Zap size={17} /> {allInCart ? "Go to bag" : "Buy now"}
            </button>
          </div>

          <ul className="mt-4 grid gap-2 border-t border-hairline pt-4 text-xs text-slate-dim sm:grid-cols-3">
            {PERKS.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-2">
                <Icon size={15} className="shrink-0 text-signal" aria-hidden />
                {text}
              </li>
            ))}
          </ul>
        </div>

        {product.description && (
          <section className="mt-6 rounded-3xl border border-hairline bg-panel p-5">
            <h2 className="eyebrow mb-3">About this item</h2>
            <div className="relative">
              <motion.div
                initial={false}
                animate={{ height: longDescription && !expanded ? 176 : "auto" }}
                transition={{ duration: 0.45, ease: EASE_OUT }}
                className={`overflow-hidden ${MARKDOWN}`}
              >
                <ReactMarkdown>{product.description}</ReactMarkdown>
              </motion.div>
              {longDescription && !expanded && (
                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-linear-to-t from-panel to-transparent" />
              )}
            </div>
            {longDescription && (
              <button
                type="button"
                onClick={() => setExpanded((v) => !v)}
                aria-expanded={expanded}
                className="btn-ghost -ml-3 mt-2 text-signal-dim"
              >
                {expanded ? "Show less" : "Read more"}
                <ChevronDown size={15} className={`transition-transform ${expanded ? "rotate-180" : ""}`} />
              </button>
            )}
          </section>
        )}

        <dl className="mt-6 divide-y divide-hairline rounded-3xl border border-hairline bg-panel px-5">
          <SpecRow label="Brand" value={product.brand} />
          <SpecRow label="Category" value={product.category} />
          <SpecRow
            label="Stock"
            value={
              outOfStock
                ? "Out of stock"
                : Number.isFinite(limit)
                  ? `${limit} units`
                  : "In stock"
            }
          />
          <SpecRow label="Listing ID" value={String(id ?? "").slice(-8)} mono />
        </dl>
      </div>

      {/* Phone add bar, above the tab bar, once the main buttons are off screen */}
      <AnimatePresence>
        {!ctaVisible && !outOfStock && (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            transition={softSpring}
            className="glass fixed inset-x-3 bottom-[calc(5.25rem+env(safe-area-inset-bottom))] z-30 flex items-center gap-3 rounded-full p-1.5 pl-2 shadow-lift lg:hidden"
          >
            <span className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full bg-mist">
              <Image src={images[0]} alt="" fill sizes="40px" className="object-cover" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-xs font-medium text-slate">{product.name}</span>
              <span className="block font-mono text-sm font-semibold text-ink">{formatNPR(product.price)}</span>
            </span>
            <button
              type="button"
              onClick={allInCart ? handleBuyNow : handleAddToCart}
              className="btn-primary shrink-0 px-5 py-2.5"
            >
              <ShoppingBag size={15} /> {allInCart ? "View bag" : "Add"}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

function SpecRow({ label, value, mono = false }) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-3 text-sm">
      <dt className="text-slate">{label}</dt>
      <dd className={`text-right text-ink ${mono ? "font-mono text-xs" : "font-medium"}`}>{value || "—"}</dd>
    </div>
  );
}

export default ProductDetailClient;
