"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Minus, Plus, Trash2, X } from "lucide-react";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import {
  removeFromCart,
  increaseQuantity,
  decreaseQuantity,
  closeCart,
  stockLimit,
} from "@/redux/cart/cartSlice";
import Image from "next/image";
import { formatNPR, productImage } from "@/utils/format";
import { CART_ROUTE, CHECKOUT_ROUTE, PRODUCTS_ROUTE } from "@/constants/routes";
import { backdrop, softSpring, spring } from "@/utils/motion";
import EmptyCart from "./EmptyCart";

// A rolling number for quantities and totals.
export const RollingValue = ({ value, className = "" }) => (
  <span className={`relative inline-flex overflow-hidden ${className}`}>
    <AnimatePresence mode="popLayout" initial={false}>
      <motion.span
        key={value}
        initial={{ y: "-100%", opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: "100%", opacity: 0 }}
        transition={spring}
      >
        {value}
      </motion.span>
    </AnimatePresence>
  </span>
);

export const QtyStepper = ({ item, compact = false }) => {
  const dispatch = useDispatch();
  const atLimit = item.quantity >= stockLimit(item);
  const size = compact ? "h-8 w-8" : "h-9 w-9";
  return (
    <div className="inline-flex items-center rounded-full border border-hairline bg-panel p-0.5">
      <motion.button
        whileTap={{ scale: 0.85 }}
        onClick={() => dispatch(decreaseQuantity(item.id))}
        className={`grid ${size} place-items-center rounded-full text-ink transition-colors hover:bg-mist`}
        aria-label={
          item.quantity <= 1 ? `Remove ${item.name}` : `Decrease quantity of ${item.name}`
        }
      >
        {item.quantity <= 1 ? <Trash2 size={13} className="text-danger" /> : <Minus size={13} />}
      </motion.button>
      <RollingValue
        value={item.quantity}
        className="w-7 justify-center font-mono text-sm font-medium text-ink"
      />
      <motion.button
        whileTap={{ scale: 0.85 }}
        onClick={() => dispatch(increaseQuantity(item.id))}
        disabled={atLimit}
        title={atLimit ? "No more in stock" : undefined}
        className={`grid ${size} place-items-center rounded-full text-ink transition-colors hover:bg-mist disabled:cursor-not-allowed disabled:opacity-30`}
        aria-label={`Increase quantity of ${item.name}`}
      >
        <Plus size={13} />
      </motion.button>
    </div>
  );
};

const CartDrawer = () => {
  const dispatch = useDispatch();
  const pathname = usePathname();
  const { items, isOpen, totalItems, totalPrice } = useSelector(
    (state) => state.cart,
  );

  // Close on navigation and on Escape; lock page scroll while open.
  useEffect(() => {
    dispatch(closeCart());
  }, [pathname, dispatch]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => e.key === "Escape" && dispatch(closeCart());
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKey);
    };
  }, [isOpen, dispatch]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            {...backdrop}
            className="fixed inset-0 z-50 bg-night/50 backdrop-blur-sm"
            onClick={() => dispatch(closeCart())}
          />

          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-label="Shopping cart"
            initial={{ x: "105%" }}
            animate={{ x: 0, transition: softSpring }}
            exit={{ x: "105%", transition: { duration: 0.25, ease: [0.4, 0, 1, 1] } }}
            className="fixed bottom-2 right-2 top-2 z-50 flex w-[calc(100%-1rem)] max-w-md flex-col overflow-hidden rounded-[1.75rem] border border-hairline bg-panel shadow-lift"
          >
            <div className="flex items-center justify-between px-5 pb-3 pt-5">
              <div>
                <p className="eyebrow">Your bag</p>
                <p className="font-display text-2xl font-bold text-ink">
                  <RollingValue value={totalItems} /> item{totalItems === 1 ? "" : "s"}
                </p>
              </div>
              <button
                onClick={() => dispatch(closeCart())}
                className="icon-btn"
                aria-label="Close cart"
                autoFocus
              >
                <X size={16} />
              </button>
            </div>

            <div className="custom-scrollbar flex-1 overflow-y-auto px-3">
              {items.length === 0 ? (
                <EmptyCart />
              ) : (
                <ul className="space-y-2 pb-3">
                  <AnimatePresence initial={false}>
                    {items.map((item, i) => {
                      const atLimit = item.quantity >= stockLimit(item);
                      return (
                        <motion.li
                          key={item.id}
                          layout
                          initial={{ opacity: 0, x: 30 }}
                          animate={{ opacity: 1, x: 0, transition: { delay: i * 0.04 } }}
                          exit={{ opacity: 0, x: -40, height: 0, marginTop: 0, transition: { duration: 0.25 } }}
                          className="flex gap-3 rounded-2xl bg-paper p-2.5"
                        >
                          <Link
                            href={`${PRODUCTS_ROUTE}/${item.id}`}
                            className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-mist"
                          >
                            <Image
                              src={productImage(item)}
                              alt={item.name}
                              fill
                              sizes="80px"
                              className="object-cover transition-transform duration-500 hover:scale-110"
                            />
                          </Link>

                          <div className="flex min-w-0 flex-1 flex-col justify-between">
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0">
                                <p className="line-clamp-1 text-sm font-semibold text-ink">
                                  {item.name}
                                </p>
                                <p className="font-mono text-xs text-slate">
                                  {formatNPR(item.price)}
                                </p>
                              </div>
                              <button
                                onClick={() => dispatch(removeFromCart(item.id))}
                                className="grid h-7 w-7 shrink-0 place-items-center rounded-full text-slate transition-colors hover:bg-danger/10 hover:text-danger"
                                aria-label={`Remove ${item.name}`}
                              >
                                <X size={13} />
                              </button>
                            </div>
                            <div className="flex items-end justify-between gap-2">
                              <QtyStepper item={item} compact />
                              <p className="font-mono text-sm font-medium text-ink">
                                {formatNPR(item.price * item.quantity)}
                              </p>
                            </div>
                            {atLimit && Number.isFinite(stockLimit(item)) && (
                              <p className="mt-1 font-mono text-[10px] text-signal-dim">
                                Only {item.stock} in stock
                              </p>
                            )}
                          </div>
                        </motion.li>
                      );
                    })}
                  </AnimatePresence>
                </ul>
              )}
            </div>

            {items.length > 0 && (
              <div className="space-y-3 border-t border-hairline bg-panel p-5">
                <div className="flex items-baseline justify-between">
                  <span className="text-sm text-slate">Subtotal</span>
                  <motion.span
                    key={totalPrice}
                    initial={{ scale: 1.08 }}
                    animate={{ scale: 1 }}
                    className="font-mono text-lg font-semibold text-ink"
                  >
                    {formatNPR(totalPrice)}
                  </motion.span>
                </div>
                <p className="text-xs text-slate">Delivery is added at checkout.</p>
                <Link href={CHECKOUT_ROUTE} className="btn-primary group w-full py-3.5">
                  Checkout
                  <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                </Link>
                <div className="grid grid-cols-2 gap-2">
                  <Link href={CART_ROUTE} className="btn-secondary py-2.5">
                    View bag
                  </Link>
                  <button
                    onClick={() => dispatch(closeCart())}
                    className="btn-ghost justify-center text-slate"
                  >
                    Keep shopping
                  </button>
                </div>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
};

export default CartDrawer;
