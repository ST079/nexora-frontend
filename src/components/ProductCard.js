"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Check, Plus } from "lucide-react";
import { ViewTransition, useRef, useState } from "react";
import { formatNPR, productImage } from "@/utils/format";
import Image from "next/image";
import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
import { addToCart, cartItemFrom, stockLimit } from "@/redux/cart/cartSlice";
import { LOW_STOCK_THRESHOLD } from "@/constants/defaults";
import { PRODUCTS_ROUTE } from "@/constants/routes";
import { flyToCart } from "@/utils/flyToCart";
import { bouncy, EASE_OUT } from "@/utils/motion";
import toast from "react-hot-toast";

const stockLabel = (stock) => {
  if (!Number.isFinite(Number(stock))) return null;
  if (stock <= 0) return { text: "Sold out", tone: "bg-ink text-paper" };
  if (stock <= LOW_STOCK_THRESHOLD)
    return { text: `Only ${stock} left`, tone: "sticker" };
  return null;
};

// Shared with the detail page so the photo morphs between the two.
export const productTransitionName = (id) => `product-photo-${id}`;

const ProductCard = ({ product, index = 0 }) => {
  const id = product._id || product.id;
  const dispatch = useDispatch();
  const imageRef = useRef(null);
  const [justAdded, setJustAdded] = useState(false);
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
    flyToCart(imageRef.current, productImage(product));
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1200);
    toast.success(`${product.name} added to cart`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.55, delay: Math.min(index, 6) * 0.05, ease: EASE_OUT }}
      className="h-full"
    >
      {/* The title link stretches over the whole card (::before), so the card
          is one big tap target while the add button stays a separate control. */}
      <div className="group relative flex h-full flex-col rounded-card border border-hairline bg-panel p-2 transition-all duration-500 ease-out-expo hover:-translate-y-1.5 hover:border-ink/15 hover:shadow-lift has-[a:focus-visible]:ring-2 has-[a:focus-visible]:ring-signal">
        <div
          ref={imageRef}
          className="relative aspect-4/5 overflow-hidden rounded-[1.1rem] bg-mist"
        >
          <ViewTransition name={productTransitionName(id)} share="morph">
            <Image
              src={productImage(product)}
              alt=""
              fill
              sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
              className={`object-cover transition-transform duration-700 ease-out-expo group-hover:scale-[1.06] ${
                soldOut ? "opacity-60 grayscale" : ""
              }`}
            />
          </ViewTransition>

          {/* One wrapping row: on narrow two-up cards the stock pill drops
              below the brand instead of covering it. */}
          {(product.brand || stock) && (
            <div className="pointer-events-none absolute inset-x-2.5 top-2.5 flex flex-wrap items-start gap-1.5">
              {product.brand && (
                <span className="glass min-w-0 max-w-full truncate rounded-full px-2.5 py-1 font-mono text-[10px] font-medium uppercase tracking-wider text-ink">
                  {product.brand}
                </span>
              )}
              {stock && (
                <span
                  className={`ml-auto shrink-0 ${
                    stock.tone === "sticker" ? "sticker rotate-3" : `badge ${stock.tone} py-1`
                  }`}
                >
                  {stock.text}
                </span>
              )}
            </div>
          )}

          {!soldOut && (
            <motion.button
              type="button"
              onClick={handleAdd}
              whileTap={{ scale: 0.85 }}
              className={`absolute bottom-2.5 right-2.5 z-10 grid h-11 w-11 place-items-center rounded-full shadow-lift transition-colors duration-300 ${
                justAdded ? "bg-ok text-paper" : "bg-ink text-paper hover:bg-signal hover:text-on-signal"
              }`}
              aria-label={`Add ${product.name} to cart`}
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={justAdded ? "done" : "add"}
                  initial={{ scale: 0, rotate: -90 }}
                  animate={{ scale: 1, rotate: 0 }}
                  exit={{ scale: 0, rotate: 90 }}
                  transition={bouncy}
                >
                  {justAdded ? <Check size={18} strokeWidth={3} /> : <Plus size={18} strokeWidth={2.5} />}
                </motion.span>
              </AnimatePresence>
              {inCart > 0 && !justAdded && (
                <span className="absolute -left-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-marigold px-1 font-mono text-[10px] font-semibold text-on-marigold ring-2 ring-panel">
                  {inCart}
                </span>
              )}
            </motion.button>
          )}
        </div>

        <div className="flex flex-1 flex-col px-2 pb-2 pt-3">
          <p className="truncate text-[11px] font-medium uppercase tracking-wider text-slate">
            {product.category}
          </p>
          <h3 className="mt-0.5 line-clamp-2 font-display text-[15px] font-semibold leading-snug text-ink transition-colors group-hover:text-signal-dim sm:text-base">
            <Link
              href={`${PRODUCTS_ROUTE}/${id}`}
              className="outline-none before:absolute before:inset-0 before:rounded-card before:content-['']"
            >
              {product.name}
            </Link>
          </h3>
          <div className="mt-auto flex items-baseline justify-between gap-2 pt-3">
            <span className="font-mono text-base font-semibold text-ink">
              {formatNPR(product.price)}
            </span>
            {inCart > 0 && (
              <span className="font-mono text-[10px] text-signal-dim">{inCart} in bag</span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;
