"use client";

import { motion } from "framer-motion";
import { ShoppingCart } from "lucide-react";
import { formatNPR, productImage } from "@/utils/format";
import Image from "next/image";
import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
import { addToCart, cartItemFrom, stockLimit } from "@/redux/cart/cartSlice";
import { LOW_STOCK_THRESHOLD } from "@/constants/defaults";
import { PRODUCTS_ROUTE } from "@/constants/routes";
import toast from "react-hot-toast";

const stockLabel = (stock) => {
  if (!Number.isFinite(Number(stock))) return null;
  if (stock <= 0) return { text: "Out of stock", tone: "text-danger" };
  if (stock <= LOW_STOCK_THRESHOLD)
    return { text: `Only ${stock} left`, tone: "text-signal-dim dark:text-signal" };
  return { text: `${stock} in stock`, tone: "text-slate dark:text-[#8b8fa8]" };
};

const ProductCard = ({ product, index = 0 }) => {
  const id = product._id || product.id;
  const dispatch = useDispatch();
  const inCart = useSelector(
    (state) => state.cart.items.find((i) => i.id === id)?.quantity ?? 0
  );

  const item = cartItemFrom(product);
  const soldOut = stockLimit(item) <= 0;
  const maxedOut = !soldOut && inCart >= stockLimit(item);
  const stock = stockLabel(product.stock);

  const handleAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (soldOut) return;
    if (maxedOut) {
      toast.error("You already have all available stock in your cart");
      return;
    }
    dispatch(addToCart(item));
    toast.success(`${product.name} added to cart`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.4, delay: Math.min(index, 6) * 0.04 }}
    >
      <Link href={`${PRODUCTS_ROUTE}/${id}`} className="card-frame group block">
        <div className="relative aspect-square overflow-hidden bg-paper dark:bg-[#16181f]">
          <Image
            src={productImage(product)}
            alt={product.name}
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
            className={`object-cover transition-transform duration-500 group-hover:scale-[1.04] ${
              soldOut ? "opacity-60 grayscale" : ""
            }`}
          />

          <span className="pointer-events-none absolute inset-y-0 left-0 hidden w-1/3 bg-linear-to-r from-transparent via-white/40 to-transparent group-hover:block group-hover:animate-sweep" />

          {product.brand && (
            <span className="absolute left-3 top-3 eyebrow bg-paper/90 dark:bg-[#0e0f12]/90 dark:text-[#8b8fa8] px-2 py-1">
              {product.brand}
            </span>
          )}

          {soldOut ? (
            <span className="absolute bottom-3 right-3 font-mono text-[10px] uppercase tracking-widest bg-paper/90 dark:bg-[#0e0f12]/90 text-danger px-2 py-1">
              Sold out
            </span>
          ) : (
            // Always visible on touch screens; hover-reveal only where a pointer can hover.
            <button
              type="button"
              onClick={handleAdd}
              className="absolute bottom-3 right-3 grid h-9 w-9 place-items-center bg-ink dark:bg-[#f0efe8] text-paper dark:text-[#0e0f12] transition-all duration-300 pointer-fine:opacity-0 pointer-fine:group-hover:opacity-100 focus-visible:opacity-100 hover:bg-signal dark:hover:bg-signal dark:hover:text-paper"
              aria-label={`Add ${product.name} to cart`}
            >
              <ShoppingCart size={16} />
            </button>
          )}
        </div>

        <div className="p-4">
          <h3 className="font-display text-[15px] font-semibold leading-tight line-clamp-1 text-ink dark:text-[#f0efe8]">
            {product.name}
          </h3>
          <p className="mt-1 eyebrow dark:text-[#8b8fa8]">{product.category}</p>
          <div className="mt-3 flex items-baseline justify-between gap-2 border-t border-hairline dark:border-[#262932] pt-3">
            <span className="font-mono text-base font-medium text-ink dark:text-[#f0efe8]">
              {formatNPR(product.price)}
            </span>
            {stock && (
              <span className={`font-mono text-[11px] ${stock.tone}`}>
                {inCart > 0 ? `${inCart} in cart · ` : ""}
                {stock.text}
              </span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default ProductCard;
