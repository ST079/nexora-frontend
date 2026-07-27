"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { Minus, Plus, ShoppingCart, Zap } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { addToCart } from "@/redux/cart/cartSlice";
import { formatNPR, productImage } from "@/utils/format";
import Image from "next/image";
import { CART_ROUTE } from "@/constants/routes";
import { FALLBACK_IMG } from "@/constants/defaults";

const ProductDetailClient = ({ product }) => {
  const dispatch = useDispatch();
  const router = useRouter();

  const [activeImage, setActiveImage] = useState(0);
  const [qty, setQty] = useState(1);

  const outOfStock = (product.stock ?? 0) <= 0;
  const images =
    Array.isArray(product.imageUrls) && product.imageUrls.length
      ? product.imageUrls
      : [productImage(product)];

  const handleAddToCart = () => {
    dispatch(
      addToCart({
        id: product._id,
        name: product.name,
        price: product.price,
        imageUrls: product.imageUrls[0] ?? FALLBACK_IMG,
        stock: product.stock,
        brand: product.brand,
        quantity: qty,
      }),
    );
    toast.success(`${qty} × ${product.name} added to cart`);
  };

  const handleBuyNow = () => {
    dispatch(
      addToCart({
        id: product._id,
        name: product.name,
        price: product.price,
        imageUrls: product.imageUrls[0] ?? FALLBACK_IMG,
        stock: product.stock,
        brand: product.brand,
        quantity: qty,
      }),
    );
    router.push(CART_ROUTE);
  };

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
            width={1600}
            height={1600}
          />
        </motion.div>
        {images.length > 1 && (
          <div className="flex gap-2">
            {images.map((img, i) => (
              <button
                key={i}
                onClick={() => setActiveImage(i)}
                className={`h-16 w-16 border overflow-hidden ${
                  i === activeImage
                    ? "border-ink dark:border-[#f0efe8]"
                    : "border-hairline dark:border-[#262932]"
                }`}
              >
                <Image
                  src={img}
                  alt={product.name}
                  className="h-full w-full object-cover"
                  width={1600}
                  height={1600}
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
            value={outOfStock ? "Out of stock" : `${product.stock} units`}
          />
          <SpecRow
            label="Listing ID"
            value={(product._id || product.id || "").slice(-8)}
          />
        </div>

        {product.description && (
          <div className="relative mb-6 border border-hairline dark:border-[#262932]">
            <div className="max-h-40 overflow-y-auto px-4 py-3">
              <div className="text-sm text-slate dark:text-[#8b8fa8] leading-relaxed prose prose-sm dark:prose-invert max-w-none">
                <ReactMarkdown>{product.description}</ReactMarkdown>
              </div>
            </div>
            <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-paper dark:from-[#0e0f12] to-transparent" />
          </div>
        )}

        <div className="flex items-center gap-4 mb-6">
          <div className="flex items-center border border-hairline dark:border-[#262932]">
            <button
              onClick={() => setQty((q) => Math.max(1, q - 1))}
              className="grid h-11 w-11 place-items-center hover:bg-hairline/40 dark:hover:bg-[#262932] dark:text-[#f0efe8]"
              aria-label="Decrease quantity"
            >
              <Minus size={14} />
            </button>
            <span className="w-10 text-center font-mono text-ink dark:text-[#f0efe8]">
              {qty}
            </span>
            <button
              onClick={() =>
                setQty((q) => Math.min(product.stock ?? 99, q + 1))
              }
              className="grid h-11 w-11 place-items-center hover:bg-hairline/40 dark:hover:bg-[#262932] dark:text-[#f0efe8]"
              aria-label="Increase quantity"
            >
              <Plus size={14} />
            </button>
          </div>
          <span className="font-mono text-xs text-slate dark:text-[#8b8fa8]">
            {outOfStock ? "Restocking soon" : `${product.stock} available`}
          </span>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleAddToCart}
            disabled={outOfStock}
            className="btn-secondary disabled:opacity-40"
          >
            <ShoppingCart size={15} /> Add to cart
          </button>
          <button
            onClick={handleBuyNow}
            disabled={outOfStock}
            className="btn-primary disabled:opacity-40"
          >
            <Zap size={15} /> Buy now
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
