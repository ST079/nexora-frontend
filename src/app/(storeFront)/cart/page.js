"use client";

import { useState } from "react";
import { Minus, Plus, Trash2, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import Image from "next/image";
import Link from "next/link";
import toast from "react-hot-toast";
import { formatNPR, productImage } from "@/utils/format";
import {
  clearCart,
  decreaseQuantity,
  increaseQuantity,
  removeFromCart,
  stockLimit,
} from "@/redux/cart/cartSlice";
import {
  CHECKOUT_ROUTE,
  LOGIN_ROUTE,
  PRODUCTS_ROUTE,
} from "@/constants/routes";
import EmptyCart from "@/components/EmptyCart";
import { config } from "@/config/config";

const CartPage = () => {
  const dispatch = useDispatch();
  const { items, totalPrice, totalItems } = useSelector((state) => state.cart);
  const { user } = useSelector((state) => state.auth);
  const router = useRouter();
  const [confirmClear, setConfirmClear] = useState(false);

  const goToCheckout = () => {
    router.push(
      user
        ? CHECKOUT_ROUTE
        : `${LOGIN_ROUTE}?next=${encodeURIComponent(CHECKOUT_ROUTE)}`
    );
  };

  const handleIncrease = (item) => {
    const limit = stockLimit(item);
    if (item.quantity >= limit) {
      toast.error(`Only ${limit} in stock`);
      return;
    }
    dispatch(increaseQuantity(item.id));
  };

  if (items.length === 0) return <EmptyCart />;

  const delivery = config.deliveryCharge;

  return (
    <div className="container-page py-10 bg-paper dark:bg-[#0e0f12] min-h-screen transition-colors duration-300">
      <p className="eyebrow dark:text-[#8b8fa8] mb-2">Checkout · step 1 of 2</p>
      <h1 className="font-display text-3xl font-semibold mb-8 text-ink dark:text-[#f0efe8]">
        Your cart
      </h1>

      <div className="grid lg:grid-cols-[1fr_340px] gap-10 items-start">
        <section
          aria-label="Cart items"
          className="card-frame divide-y divide-hairline dark:divide-[#262932] dark:border-[#262932]"
        >
          {items.map((item) => {
            const atLimit = item.quantity >= stockLimit(item);
            return (
              <div key={item.id} className="flex gap-4 p-5">
                <Link
                  href={`${PRODUCTS_ROUTE}/${item.id}`}
                  className="relative h-20 w-20 shrink-0 border border-hairline dark:border-[#262932] bg-paper dark:bg-[#16181f] overflow-hidden"
                >
                  <Image
                    src={productImage(item)}
                    alt={item.name}
                    fill
                    sizes="80px"
                    className="object-cover"
                  />
                </Link>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <Link
                        href={`${PRODUCTS_ROUTE}/${item.id}`}
                        className="font-display font-semibold leading-tight text-ink dark:text-[#f0efe8] hover:underline line-clamp-2"
                      >
                        {item.name}
                      </Link>
                      {item.brand && (
                        <p className="eyebrow dark:text-[#8b8fa8] mt-1">{item.brand}</p>
                      )}
                      <p className="font-mono text-[11px] text-slate dark:text-[#8b8fa8] mt-1">
                        {formatNPR(item.price)} each
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => dispatch(removeFromCart(item.id))}
                      className="grid h-8 w-8 place-items-center text-slate dark:text-[#8b8fa8] hover:text-danger dark:hover:text-danger transition-colors shrink-0"
                      aria-label={`Remove ${item.name}`}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <div className="mt-3 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center border border-hairline dark:border-[#262932]">
                        <button
                          type="button"
                          onClick={() => dispatch(decreaseQuantity(item.id))}
                          className="grid h-8 w-8 place-items-center text-slate dark:text-[#8b8fa8] hover:bg-hairline/40 dark:hover:bg-[#262932] hover:text-ink dark:hover:text-[#f0efe8] transition-colors"
                          aria-label={
                            item.quantity === 1
                              ? `Remove ${item.name}`
                              : `Decrease quantity of ${item.name}`
                          }
                        >
                          <Minus size={12} />
                        </button>
                        <span
                          aria-live="polite"
                          className="w-8 text-center font-mono text-sm text-ink dark:text-[#f0efe8]"
                        >
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleIncrease(item)}
                          aria-disabled={atLimit}
                          className={`grid h-8 w-8 place-items-center transition-colors ${
                            atLimit
                              ? "text-slate-light dark:text-[#5b5e72] cursor-not-allowed"
                              : "text-slate dark:text-[#8b8fa8] hover:bg-hairline/40 dark:hover:bg-[#262932] hover:text-ink dark:hover:text-[#f0efe8]"
                          }`}
                          aria-label={`Increase quantity of ${item.name}`}
                        >
                          <Plus size={12} />
                        </button>
                      </div>
                      {atLimit && Number.isFinite(stockLimit(item)) && (
                        <span className="font-mono text-[11px] text-signal-dim dark:text-signal">
                          Max in stock
                        </span>
                      )}
                    </div>

                    <span className="font-mono text-sm text-ink dark:text-[#f0efe8]">
                      {formatNPR(item.price * item.quantity)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}

          <div className="p-5 flex flex-wrap items-center gap-3">
            {confirmClear ? (
              <>
                <span className="text-sm text-ink dark:text-[#f0efe8]">
                  Remove all {totalItems} items?
                </span>
                <button
                  type="button"
                  onClick={() => {
                    dispatch(clearCart());
                    setConfirmClear(false);
                  }}
                  className="font-mono text-xs uppercase tracking-widest text-danger hover:underline"
                >
                  Yes, clear cart
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmClear(false)}
                  className="font-mono text-xs uppercase tracking-widest text-slate dark:text-[#8b8fa8] hover:text-ink dark:hover:text-[#f0efe8]"
                  autoFocus
                >
                  Keep items
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmClear(true)}
                className="font-mono text-xs text-slate dark:text-[#8b8fa8] hover:text-danger dark:hover:text-danger underline transition-colors"
              >
                Clear cart
              </button>
            )}
          </div>
        </section>

        <aside
          aria-label="Order summary"
          className="card-frame p-6 h-fit lg:sticky lg:top-24 dark:border-[#262932]"
        >
          <p className="eyebrow dark:text-[#8b8fa8] mb-4">Order summary</p>

          <dl className="space-y-2 font-mono text-sm mb-4">
            <div className="flex justify-between">
              <dt className="text-slate dark:text-[#8b8fa8]">Items ({totalItems})</dt>
              <dd className="text-ink dark:text-[#f0efe8]">{formatNPR(totalPrice)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate dark:text-[#8b8fa8]">Delivery</dt>
              <dd className="text-ink dark:text-[#f0efe8]">{formatNPR(delivery)}</dd>
            </div>
          </dl>

          <div className="flex justify-between border-t border-hairline dark:border-[#262932] pt-4 mb-6 font-mono">
            <span className="font-medium text-ink dark:text-[#f0efe8]">Estimated total</span>
            <span className="text-lg font-medium text-ink dark:text-[#f0efe8]">
              {formatNPR(totalPrice + delivery)}
            </span>
          </div>

          <button type="button" onClick={goToCheckout} className="btn-primary w-full">
            {user ? "Checkout" : "Sign in to checkout"} <ArrowRight size={15} />
          </button>
          <Link
            href={PRODUCTS_ROUTE}
            className="btn-ghost w-full justify-center mt-2 dark:text-[#8b8fa8] dark:hover:text-[#f0efe8]"
          >
            Keep browsing
          </Link>
        </aside>
      </div>
    </div>
  );
};

export default CartPage;
