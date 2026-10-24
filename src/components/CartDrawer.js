"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { Minus, Plus, X } from "lucide-react";
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
import { CART_ROUTE, CHECKOUT_ROUTE } from "@/constants/routes";
import EmptyCart from "./EmptyCart";

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
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-ink/40 dark:bg-black/60"
            onClick={() => dispatch(closeCart())}
          />

          {/* Drawer */}
          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-label="Shopping cart"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{
              type: "tween",
              duration: 0.32,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col bg-paper dark:bg-[#0e0f12] border-l border-hairline dark:border-[#262932] shadow-lift"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-hairline dark:border-[#262932] px-5 py-4">
              <div>
                <p className="eyebrow dark:text-[#8b8fa8]">Your cart</p>
                <p className="font-display text-lg font-semibold text-ink dark:text-[#f0efe8]">
                  {totalItems} item{totalItems === 1 ? "" : "s"}
                </p>
              </div>
              <button
                onClick={() => dispatch(closeCart())}
                className="grid h-9 w-9 place-items-center text-slate dark:text-[#8b8fa8] hover:text-ink dark:hover:text-[#f0efe8] transition-colors"
                aria-label="Close cart"
                autoFocus
              >
                <X size={18} />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto px-5 custom-scrollbar">
              {items.length === 0 ? (
                <EmptyCart />
              ) : (
                <ul className="divide-y divide-hairline dark:divide-[#262932]">
                  {items.map((item) => {
                    const atLimit = item.quantity >= stockLimit(item);
                    return (
                      <li key={item.id} className="flex gap-4 py-4">
                        {/* Image */}
                        <Link
                          href={`/products/${item.id}`}
                          className="h-16 w-16 shrink-0 border border-hairline dark:border-[#262932] bg-panel dark:bg-[#16181f] overflow-hidden"
                        >
                          <Image
                            src={productImage(item)}
                            alt={item.name}
                            className="h-full w-full object-cover"
                            width={80}
                            height={80}
                          />
                        </Link>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-ink dark:text-[#f0efe8] line-clamp-1">
                            {item.name}
                          </p>
                          <p className="font-mono text-xs text-slate dark:text-[#8b8fa8] mt-0.5">
                            {formatNPR(item.price)}
                          </p>

                          {/* Qty controls */}
                          <div className="mt-2 flex items-center gap-3">
                            <div className="flex items-center border border-hairline dark:border-[#262932]">
                              <button
                                onClick={() => dispatch(decreaseQuantity(item.id))}
                                className="grid h-8 w-8 place-items-center text-slate dark:text-[#8b8fa8] hover:bg-hairline/40 dark:hover:bg-[#262932] hover:text-ink dark:hover:text-[#f0efe8] transition-colors"
                                aria-label={`Decrease quantity of ${item.name}`}
                              >
                                <Minus size={12} />
                              </button>
                              <span className="w-7 text-center font-mono text-xs text-ink dark:text-[#f0efe8]" aria-live="polite">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => dispatch(increaseQuantity(item.id))}
                                disabled={atLimit}
                                title={atLimit ? "No more in stock" : undefined}
                                className="grid h-8 w-8 place-items-center text-slate dark:text-[#8b8fa8] hover:bg-hairline/40 dark:hover:bg-[#262932] hover:text-ink dark:hover:text-[#f0efe8] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                aria-label={`Increase quantity of ${item.name}`}
                              >
                                <Plus size={12} />
                              </button>
                            </div>
                            <button
                              onClick={() => dispatch(removeFromCart(item.id))}
                              className="font-mono text-xs text-slate dark:text-[#8b8fa8] hover:text-danger dark:hover:text-danger transition-colors"
                            >
                              Remove
                            </button>
                          </div>
                          {atLimit && Number.isFinite(stockLimit(item)) && (
                            <p className="mt-1 font-mono text-[10px] text-signal-dim dark:text-signal">
                              Only {item.stock} in stock
                            </p>
                          )}
                        </div>

                        {/* Line total */}
                        <p className="font-mono text-sm text-ink dark:text-[#f0efe8] shrink-0 pt-0.5">
                          {formatNPR(item.price * item.quantity)}
                        </p>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="border-t border-hairline dark:border-[#262932] px-5 py-5 space-y-3">
                <div className="flex items-baseline justify-between font-mono text-sm">
                  <span className="text-slate dark:text-[#8b8fa8]">
                    Subtotal
                  </span>
                  <span className="text-base font-medium text-ink dark:text-[#f0efe8]">
                    {formatNPR(totalPrice)}
                  </span>
                </div>
                <p className="font-mono text-[11px] text-slate dark:text-[#8b8fa8]">
                  Delivery is added at checkout.
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <Link href={CART_ROUTE} className="btn-secondary">
                    View cart
                  </Link>
                  <Link href={CHECKOUT_ROUTE} className="btn-primary">
                    Checkout
                  </Link>
                </div>
                <button
                  onClick={() => dispatch(closeCart())}
                  className="btn-ghost w-full justify-center text-slate dark:text-[#8b8fa8]"
                >
                  Continue shopping
                </button>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
};

export default CartDrawer;
