"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Minus, Plus, Trash2, ArrowRight, X, Wallet, CreditCard, Banknote } from "lucide-react";
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
import CheckoutSteps from "@/components/CheckoutSteps";
import { RollingValue } from "@/components/CartDrawer";
import { config } from "@/config/config";
import { EASE_OUT, fadeUp } from "@/utils/motion";

const STEP_BTN =
  "grid h-9 w-9 place-items-center rounded-full text-ink transition-colors hover:bg-mist";

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
    <div className="container-page min-h-screen pb-16 pt-6 lg:pt-10">
      <motion.header {...fadeUp()} className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <CheckoutSteps current={0} className="mb-5" />
          <h1 className="font-display text-4xl font-bold tracking-tight text-ink sm:text-5xl">
            Your <span className="marker">bag</span>
          </h1>
          <p className="mt-2 text-sm text-slate">
            <RollingValue value={totalItems} className="font-semibold text-ink" />{" "}
            {totalItems === 1 ? "item" : "items"}, ready when you are.
          </p>
        </div>
        <Link href={PRODUCTS_ROUTE} className="btn-ghost -mr-2 text-slate">
          Keep browsing <ArrowRight size={14} />
        </Link>
      </motion.header>

      <div className="grid items-start gap-6 lg:grid-cols-[1fr_360px] lg:gap-10">
        <section aria-label="Cart items">
          <ul className="space-y-3">
            <AnimatePresence initial={false}>
              {items.map((item, i) => {
                const limit = stockLimit(item);
                const atLimit = item.quantity >= limit;
                return (
                  <motion.li
                    key={item.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0, transition: { duration: 0.45, delay: i * 0.05, ease: EASE_OUT } }}
                    exit={{ opacity: 0, x: -60, transition: { duration: 0.25 } }}
                    className="group flex gap-4 rounded-3xl border border-hairline bg-panel p-3 transition-shadow hover:shadow-soft sm:p-4"
                  >
                    <Link
                      href={`${PRODUCTS_ROUTE}/${item.id}`}
                      className="relative h-24 w-24 shrink-0 overflow-hidden rounded-2xl bg-mist sm:h-28 sm:w-28"
                    >
                      <Image
                        src={productImage(item)}
                        alt={item.name}
                        fill
                        sizes="112px"
                        className="object-cover transition-transform duration-700 ease-out-expo group-hover:scale-110"
                      />
                    </Link>

                    <div className="flex min-w-0 flex-1 flex-col justify-between gap-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          {item.brand && <p className="eyebrow mb-1">{item.brand}</p>}
                          <Link
                            href={`${PRODUCTS_ROUTE}/${item.id}`}
                            className="link-underline line-clamp-2 font-display text-base font-semibold leading-snug text-ink sm:text-lg"
                          >
                            {item.name}
                          </Link>
                          <p className="mt-1 font-mono text-[11px] text-slate">
                            {formatNPR(item.price)} each
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => dispatch(removeFromCart(item.id))}
                          className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-slate transition-all hover:rotate-90 hover:bg-danger/10 hover:text-danger"
                          aria-label={`Remove ${item.name}`}
                        >
                          <X size={15} />
                        </button>
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <div className="inline-flex items-center rounded-full border border-hairline bg-paper p-0.5">
                            <motion.button
                              type="button"
                              whileTap={{ scale: 0.85 }}
                              onClick={() => dispatch(decreaseQuantity(item.id))}
                              className={STEP_BTN}
                              aria-label={
                                item.quantity === 1
                                  ? `Remove ${item.name}`
                                  : `Decrease quantity of ${item.name}`
                              }
                            >
                              {item.quantity === 1 ? (
                                <Trash2 size={13} className="text-danger" />
                              ) : (
                                <Minus size={13} />
                              )}
                            </motion.button>
                            <span aria-live="polite" className="w-8 text-center">
                              <RollingValue
                                value={item.quantity}
                                className="justify-center font-mono text-sm font-medium text-ink"
                              />
                            </span>
                            <motion.button
                              type="button"
                              whileTap={atLimit ? undefined : { scale: 0.85 }}
                              onClick={() => handleIncrease(item)}
                              aria-disabled={atLimit}
                              className={`${STEP_BTN} ${atLimit ? "cursor-not-allowed opacity-30" : ""}`}
                              aria-label={`Increase quantity of ${item.name}`}
                            >
                              <Plus size={13} />
                            </motion.button>
                          </div>
                          {atLimit && Number.isFinite(limit) && (
                            <span className="rounded-full bg-marigold-tint px-2 py-0.5 font-mono text-[10px] font-medium text-marigold-dim">
                              Max in stock
                            </span>
                          )}
                        </div>

                        <RollingValue
                          value={formatNPR(item.price * item.quantity)}
                          className="font-mono text-base font-semibold text-ink"
                        />
                      </div>
                    </div>
                  </motion.li>
                );
              })}
            </AnimatePresence>
          </ul>

          <div className="mt-4 flex min-h-10 flex-wrap items-center gap-3 px-1">
            <AnimatePresence mode="wait" initial={false}>
              {confirmClear ? (
                <motion.div
                  key="confirm"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className="flex flex-wrap items-center gap-2 rounded-full bg-danger/10 py-1 pl-4 pr-1"
                >
                  <span className="text-sm text-ink">
                    Remove all {totalItems} items?
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      dispatch(clearCart());
                      setConfirmClear(false);
                    }}
                    className="rounded-full bg-danger px-3 py-1.5 text-xs font-semibold text-paper transition-opacity hover:opacity-90"
                  >
                    Yes, clear cart
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmClear(false)}
                    className="rounded-full bg-panel px-3 py-1.5 text-xs font-semibold text-ink transition-colors hover:bg-mist"
                    autoFocus
                  >
                    Keep items
                  </button>
                </motion.div>
              ) : (
                <motion.button
                  key="clear"
                  type="button"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setConfirmClear(true)}
                  className="btn-ghost px-3 text-xs text-slate hover:text-danger"
                >
                  <Trash2 size={13} /> Clear cart
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        </section>

        <motion.aside
          {...fadeUp(0.15)}
          aria-label="Order summary"
          className="relative overflow-hidden rounded-4xl bg-night p-6 text-on-night shadow-lift lg:sticky lg:top-24 dark:border dark:border-hairline"
        >
          <span
            aria-hidden
            className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 animate-drift rounded-full bg-signal/40 blur-3xl"
          />
          <div className="relative">
            <p className="eyebrow mb-5 text-on-night/60">Order summary</p>

            <dl className="space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-on-night/70">Items ({totalItems})</dt>
                <dd className="font-mono">{formatNPR(totalPrice)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-on-night/70">Delivery</dt>
                <dd className="font-mono">{formatNPR(delivery)}</dd>
              </div>
            </dl>

            <div className="my-5 border-t border-dashed border-on-night/20" />

            <div className="mb-6 flex items-baseline justify-between">
              <span className="text-sm font-medium">Estimated total</span>
              <RollingValue
                value={formatNPR(totalPrice + delivery)}
                className="font-display text-3xl font-bold tracking-tight"
              />
            </div>

            <button
              type="button"
              onClick={goToCheckout}
              className="btn-accent group w-full py-3.5 text-base"
            >
              {user ? "Checkout" : "Sign in to checkout"}
              <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
            </button>

            <div className="mt-5 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-[11px] text-on-night/60">
              <span className="inline-flex items-center gap-1.5"><Wallet size={12} aria-hidden /> Khalti</span>
              <span className="inline-flex items-center gap-1.5"><CreditCard size={12} aria-hidden /> Card</span>
              <span className="inline-flex items-center gap-1.5"><Banknote size={12} aria-hidden /> Cash on delivery</span>
            </div>
          </div>
        </motion.aside>
      </div>
    </div>
  );
};

export default CartPage;
