"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { Minus, Plus, X, ShoppingBag } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import {
  removeFromCart,
  increaseQuantity,
  decreaseQuantity,
  closeCart,
} from "@/redux/cart/cartSlice";
import Image from "next/image";
import { formatNPR } from "@/utils/format";

const CartDrawer = () => {
  const dispatch = useDispatch();
  const { items, isOpen } = useSelector((state) => state.cart);
  console.log("cartdrawer isOpen: ", isOpen);

  const subtotal = items.reduce(
    (sum, item) => sum + Number(item.price ?? 0) * item.quantity,
    0,
  );
  const totalCount = items.reduce((sum, item) => sum + item.quantity, 0);

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
                  {items.length} {items.length > 1 ? "Products" : "Product"} |{" "}
                  {totalCount} item{totalCount === 1 ? "" : "s"}
                </p>
              </div>
              <button
                onClick={() => dispatch(closeCart())}
                className="grid h-8 w-8 place-items-center text-slate dark:text-[#8b8fa8] hover:text-ink dark:hover:text-[#f0efe8] transition-colors"
                aria-label="Close cart"
              >
                <X size={18} />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto px-5">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-4 py-20 text-center">
                  <ShoppingBag
                    size={32}
                    className="text-slate dark:text-[#8b8fa8]"
                  />
                  <p className="font-display text-lg font-semibold text-ink dark:text-[#f0efe8]">
                    Your cart is empty
                  </p>
                  <p className="text-sm text-slate dark:text-[#8b8fa8]">
                    Add a product to see it here.
                  </p>
                  <Link
                    href="/products"
                    onClick={() => dispatch(closeCart())}
                    className="btn-primary mt-2"
                  >
                    Browse products
                  </Link>
                </div>
              ) : (
                <ul className="divide-y divide-hairline dark:divide-[#262932]">
                  {items.map((item) => (
                    <li key={item.id} className="flex gap-4 py-4">
                      {/* Image */}
                      <div className="h-16 w-16 shrink-0 border border-hairline dark:border-[#262932] bg-panel dark:bg-[#16181f] overflow-hidden">
                        {item.imageUrls ? (
                          <Image
                            src={item.imageUrls}
                            alt={item.name}
                            className="h-full w-full object-cover"
                            width={80}
                            height={80}
                          />
                        ) : (
                          <div className="h-full w-full grid place-items-center">
                            <ShoppingBag
                              size={16}
                              className="text-slate dark:text-[#8b8fa8]"
                            />
                          </div>
                        )}
                      </div>

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
                              onClick={() =>
                                dispatch(decreaseQuantity(item.id))
                              }
                              className="grid h-7 w-7 place-items-center text-slate dark:text-[#8b8fa8] hover:bg-hairline/40 dark:hover:bg-[#262932] hover:text-ink dark:hover:text-[#f0efe8] transition-colors"
                              aria-label="Decrease quantity"
                            >
                              <Minus size={12} />
                            </button>
                            <span className="w-7 text-center font-mono text-xs text-ink dark:text-[#f0efe8]">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() =>
                                dispatch(increaseQuantity(item.id))
                              }
                              className="grid h-7 w-7 place-items-center text-slate dark:text-[#8b8fa8] hover:bg-hairline/40 dark:hover:bg-[#262932] hover:text-ink dark:hover:text-[#f0efe8] transition-colors"
                              aria-label="Increase quantity"
                            >
                              <Plus size={12} />
                            </button>
                          </div>
                          <button
                            onClick={() => dispatch(removeFromCart(item.id))}
                            className="font-mono text-xs text-slate dark:text-[#8b8fa8] hover:text-danger dark:hover:text-danger transition-colors"
                          >
                            remove
                          </button>
                        </div>
                      </div>

                      {/* Line total */}
                      <p className="font-mono text-sm text-ink dark:text-[#f0efe8] shrink-0 pt-0.5">
                        {formatNPR(item.price * item.quantity)}
                      </p>
                    </li>
                  ))}
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
                    {formatNPR(subtotal)}
                  </span>
                </div>
                <p className="font-mono text-[11px] text-slate dark:text-[#8b8fa8]">
                  Shipping calculated at checkout
                </p>
                <Link
                  href="/checkout"
                  onClick={() => dispatch(closeCart())}
                  className="btn-primary w-full"
                >
                  Review Cart
                </Link>
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
