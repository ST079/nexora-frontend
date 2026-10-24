"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { Minus, Plus, ShoppingCart, Zap } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { addToCart, cartItemFrom, stockLimit } from "@/redux/cart/cartSlice";
import { formatNPR, productImage } from "@/utils/format";
import Image from "next/image";
import { CART_ROUTE } from "@/constants/routes";
import { LOW_STOCK_THRESHOLD } from "@/constants/defaults";

const ProductDetailClient = ({ product }) => {
  const dispatch = useDispatch();
  const router = useRouter();
  const id = product._id || product.id;
  const inCart = useSelector(
    (state) => state.cart.items.find((i) => i.id === id)?.quantity ?? 0
  );

  const [activeImage, setActiveImage] = useState(0);
  const [qty, setQty] = useState(1);

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

  const add = () => {
    dispatch(addToCart(cartItemFrom(product, quantity)));
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

  const availability = outOfStock
    ? "Restocking soon"
    : allInCart
      ? "All available stock is in your cart"
      : `${Number.isFinite(remaining) ? `${remaining} available` : "In stock"}${
          inCart ? ` · ${inCart} in your cart` : ""
        }`;

  return (
    <div className="grid lg:grid-cols-2 gap-10">
      <div>
        <motion.div
          key={activeImage}
          initial={{ opacity: 0.4 }}
          animate={{ opacity: 1 }}
          className="card-frame aspect-square overflow-hidden mb-3 dark:border-[#262932]"
        >
          <Image
            src={images[activeImage]}
            alt={product.name}
            className="h-full w-full object-cover"
            width={1200}
            height={1200}
            sizes="(min-width: 1024px) 50vw, 100vw"
            preload={activeImage === 0}
          />
        </motion.div>
        {images.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-1">
            {images.map((img, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setActiveImage(i)}
                aria-label={`Show image ${i + 1} of ${images.length}`}
                aria-pressed={i === activeImage}
                className={`h-16 w-16 shrink-0 border overflow-hidden transition-colors ${
                  i === activeImage
                    ? "border-ink dark:border-[#f0efe8]"
                    : "border-hairline dark:border-[#262932]"
                }`}
              >
                <Image
                  src={img}
                  alt=""
                  className="h-full w-full object-cover"
                  width={64}
                  height={64}
                />
              </button>
            ))}
          </div>
        )}
      </div>

      <div>
        <p className="eyebrow dark:text-[#8b8fa8] mb-2">
          {product.brand} · {product.category}
        </p>
        <h1 className="font-display text-3xl font-semibold text-ink dark:text-[#f0efe8] mb-4">
          {product.name}
        </h1>
        <p className="font-mono text-2xl text-signal mb-6">
          {formatNPR(product.price)}
        </p>

        <div className="card-frame divide-y divide-hairline dark:divide-[#262932] dark:border-[#262932] mb-6">
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
          <SpecRow
            label="Listing ID"
            value={String(id ?? "").slice(-8)}
          />
        </div>

        {product.description && (
          <div className="relative mb-6 border border-hairline dark:border-[#262932]">
            <div className="max-h-40 overflow-y-auto px-4 py-3">
              {/* No typography plugin is installed, so style the markdown directly. */}
              <div className="text-sm text-slate dark:text-[#8b8fa8] leading-relaxed [&_p]:mb-2 [&_p:last-child]:mb-0 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:mb-1 [&_strong]:text-ink dark:[&_strong]:text-[#f0efe8] [&_a]:underline [&_h1]:font-display [&_h2]:font-display [&_h3]:font-display [&_h1]:font-semibold [&_h2]:font-semibold [&_h3]:font-semibold [&_h1]:text-ink [&_h2]:text-ink [&_h3]:text-ink dark:[&_h1]:text-[#f0efe8] dark:[&_h2]:text-[#f0efe8] dark:[&_h3]:text-[#f0efe8]">
                <ReactMarkdown>{product.description}</ReactMarkdown>
              </div>
            </div>
            <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-6 bg-linear-to-t from-paper dark:from-[#0e0f12] to-transparent" />
          </div>
        )}

        <div className="flex items-center gap-4 mb-6">
          <div className="flex items-center border border-hairline dark:border-[#262932]">
            <button
              type="button"
              onClick={() => setQty(Math.max(1, quantity - 1))}
              disabled={quantity <= 1 || outOfStock || allInCart}
              className="grid h-11 w-11 place-items-center hover:bg-hairline/40 dark:hover:bg-[#262932] dark:text-[#f0efe8] disabled:opacity-30 disabled:hover:bg-transparent"
              aria-label="Decrease quantity"
            >
              <Minus size={14} />
            </button>
            <span
              aria-live="polite"
              className="w-10 text-center font-mono text-ink dark:text-[#f0efe8]"
            >
              {outOfStock || allInCart ? 0 : quantity}
            </span>
            <button
              type="button"
              onClick={() => setQty(Math.min(remaining, quantity + 1))}
              disabled={quantity >= remaining}
              className="grid h-11 w-11 place-items-center hover:bg-hairline/40 dark:hover:bg-[#262932] dark:text-[#f0efe8] disabled:opacity-30 disabled:hover:bg-transparent"
              aria-label="Increase quantity"
            >
              <Plus size={14} />
            </button>
          </div>
          <span
            className={`font-mono text-xs ${
              outOfStock
                ? "text-danger"
                : lowStock
                  ? "text-signal-dim dark:text-signal"
                  : "text-slate dark:text-[#8b8fa8]"
            }`}
          >
            {availability}
          </span>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={outOfStock || allInCart}
            className="btn-secondary disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ShoppingCart size={15} /> Add to cart
          </button>
          <button
            type="button"
            onClick={handleBuyNow}
            disabled={outOfStock}
            className="btn-primary disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Zap size={15} /> {allInCart ? "Go to cart" : "Buy now"}
          </button>
        </div>
      </div>
    </div>
  );
};

function SpecRow({ label, value }) {
  return (
    <div className="spec-row px-4 border-b-0">
      <span className="text-slate dark:text-[#8b8fa8]">{label}</span>
      <span className="text-ink dark:text-[#f0efe8]">{value}</span>
    </div>
  );
}

export default ProductDetailClient;
