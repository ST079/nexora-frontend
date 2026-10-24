"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import {
  Wallet,
  Banknote,
  Loader2,
  CreditCard,
  ChevronLeft,
  MapPin,
  Phone,
  Lock,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { useForm } from "react-hook-form";
import AnimatedField from "@/components/AnimatedField";
import EmptyCart from "@/components/EmptyCart";
import Loader from "@/components/Loader";
import CheckoutSteps from "@/components/CheckoutSteps";
import { Avatar } from "@/components/UserProfile";
import { apiErrorMessage, formatNPR, productImage } from "@/utils/format";
import { createOrder } from "@/api/order";
import { clearCart } from "@/redux/cart/cartSlice";
import {
  CART_ROUTE,
  CHECKOUT_ROUTE,
  LOGIN_ROUTE,
  ORDERS_ROUTE,
} from "@/constants/routes";
import { NEPAL_PROVINCES } from "@/constants/user";
import { config } from "@/config/config";
import { fadeUp } from "@/utils/motion";

const PAY_METHODS = [
  { icon: Wallet, label: "Khalti", note: "Wallet", tone: "bg-signal-tint text-signal-dim" },
  { icon: CreditCard, label: "Card", note: "Stripe", tone: "bg-blueprint-tint text-blueprint-dim" },
  { icon: Banknote, label: "Cash", note: "On delivery", tone: "bg-marigold-tint text-marigold-dim" },
];

const Checkout = () => {
  const { items, totalPrice, totalItems } = useSelector((state) => state.cart);
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const router = useRouter();
  const [placed, setPlaced] = useState(false);

  // Checkout sits outside the (client) guard, so it signs visitors in itself.
  useEffect(() => {
    if (!user)
      router.replace(`${LOGIN_ROUTE}?next=${encodeURIComponent(CHECKOUT_ROUTE)}`);
  }, [user, router]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    values: {
      province: user?.address?.province ?? "",
      city: user?.address?.city ?? "",
      street: user?.address?.street ?? "",
    },
    resetOptions: { keepDirtyValues: true },
  });

  if (!user) return null;
  // Clearing the cart re-renders before the redirect lands; don't flash
  // "your cart is empty" at someone who just placed an order.
  if (items.length === 0)
    return placed ? <Loader label="Opening your order" /> : <EmptyCart />;

  const delivery = config.deliveryCharge;
  const estimatedTotal = totalPrice + delivery;

  const placeOrder = async (data) => {
    try {
      // Prices and the delivery charge are set by the server.
      const order = await createOrder({
        orderItems: items.map((item) => ({
          product: item.id,
          quantity: item.quantity,
        })),
        shippingAddress: {
          country: "Nepal",
          province: data.province || undefined,
          city: data.city.trim(),
          street: data.street.trim(),
        },
      });

      setPlaced(true);
      dispatch(clearCart());
      toast.success("Order placed. Choose how you'd like to pay.");
      router.push(order?._id ? `${ORDERS_ROUTE}/${order._id}` : ORDERS_ROUTE);
    } catch (error) {
      toast.error(apiErrorMessage(error, "Couldn't place your order. Please try again."));
    }
  };

  return (
    <div className="container-page min-h-screen pb-16 pt-6 lg:pt-10">
      <motion.header {...fadeUp()} className="mb-8">
        <Link href={CART_ROUTE} className="btn-ghost -ml-3 mb-4 px-3 text-slate">
          <ChevronLeft size={15} /> Back to bag
        </Link>
        <CheckoutSteps current={1} className="mb-5" />
        <h1 className="font-display text-4xl font-bold tracking-tight text-ink sm:text-5xl">
          Where should it <span className="marker">go?</span>
        </h1>
      </motion.header>

      <form
        onSubmit={handleSubmit(placeOrder)}
        noValidate
        className="grid items-start gap-6 lg:grid-cols-[1fr_380px] lg:gap-10"
      >
        <div className="space-y-6">
          <motion.section
            {...fadeUp(0.05)}
            aria-labelledby="shipping-heading"
            className="rounded-4xl border border-hairline bg-panel p-5 sm:p-7"
          >
            <div className="mb-6 flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-2xl bg-signal-tint text-signal-dim">
                <MapPin size={20} aria-hidden />
              </span>
              <div>
                <h2 id="shipping-heading" className="font-display text-xl font-bold text-ink">
                  Shipping address
                </h2>
                <p className="text-xs text-slate">Where the courier brings this order.</p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="checkout-province"
                  className="mb-1.5 block text-xs font-semibold text-slate-dim"
                >
                  Province
                </label>
                <select
                  id="checkout-province"
                  autoComplete="address-level1"
                  className="field cursor-pointer"
                  {...register("province")}
                >
                  <option value="">Select a province</option>
                  {NEPAL_PROVINCES.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>
              <AnimatedField
                label="City"
                autoComplete="address-level2"
                placeholder="e.g. Bhaktapur"
                required
                {...register("city", {
                  required: "City is required",
                  validate: (v) => v.trim().length > 0 || "City is required",
                })}
                error={errors.city?.message}
              />
              <AnimatedField
                label="Street"
                autoComplete="street-address"
                placeholder="e.g. Nagarkot Road"
                required
                className="sm:col-span-2"
                {...register("street", {
                  required: "Street is required",
                  validate: (v) => v.trim().length > 0 || "Street is required",
                })}
                error={errors.street?.message}
              />
            </div>

            <div className="mt-6 flex items-center gap-3 rounded-2xl bg-mist p-3">
              <Avatar user={user} size="h-10 w-10 shrink-0 text-sm" />
              <div className="min-w-0 text-xs">
                <p className="truncate font-semibold text-ink">Delivering to {user.name}</p>
                <p className="flex items-center gap-1 text-slate">
                  {user.phone ? (
                    <>
                      <Phone size={11} aria-hidden /> {user.phone} · the courier calls this
                      number on arrival.
                    </>
                  ) : (
                    "The courier calls the number on your account on arrival."
                  )}
                </p>
              </div>
            </div>
          </motion.section>

          <motion.section
            {...fadeUp(0.1)}
            aria-labelledby="payment-heading"
            className="rounded-4xl border border-hairline bg-panel p-5 sm:p-7"
          >
            <h2 id="payment-heading" className="font-display text-xl font-bold text-ink">
              Payment comes next
            </h2>
            <p className="mt-1 text-sm text-slate">
              Place the order and pick how to pay on the next screen. Your items are held for
              you as soon as the order is placed.
            </p>
            <ul className="mt-5 grid grid-cols-3 gap-2 sm:gap-3">
              {PAY_METHODS.map(({ icon: Icon, label, note, tone }) => (
                <li
                  key={label}
                  className="flex flex-col items-center gap-2 rounded-2xl border border-hairline p-3 text-center sm:p-4"
                >
                  <span className={`grid h-10 w-10 place-items-center rounded-xl ${tone}`}>
                    <Icon size={18} aria-hidden />
                  </span>
                  <span className="text-sm font-semibold text-ink">{label}</span>
                  <span className="-mt-1.5 text-[11px] text-slate">{note}</span>
                </li>
              ))}
            </ul>
          </motion.section>
        </div>

        <motion.aside
          {...fadeUp(0.15)}
          aria-label="Order summary"
          className="relative overflow-hidden rounded-4xl bg-night p-6 text-on-night shadow-lift lg:sticky lg:top-24 dark:border dark:border-hairline"
        >
          <span
            aria-hidden
            className="pointer-events-none absolute -left-16 -top-20 h-52 w-52 animate-drift rounded-full bg-marigold/30 blur-3xl"
          />
          <div className="relative">
            <p className="eyebrow mb-4 text-on-night/60">Order summary</p>
            <ul className="custom-scrollbar -mr-2 mb-5 max-h-60 space-y-3 overflow-y-auto pr-2">
              {items.map((i) => (
                <li key={i.id} className="flex items-center gap-3">
                  <span className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-on-night/10">
                    <Image src={productImage(i)} alt="" fill sizes="48px" className="object-cover" />
                    <span className="absolute right-0 top-0 grid h-5 min-w-5 place-items-center rounded-bl-lg bg-marigold px-1 font-mono text-[10px] font-semibold text-on-marigold">
                      {i.quantity}
                    </span>
                  </span>
                  <span className="min-w-0 flex-1 truncate text-sm">{i.name}</span>
                  <span className="shrink-0 font-mono text-xs text-on-night/80">
                    {formatNPR(i.price * i.quantity)}
                  </span>
                </li>
              ))}
            </ul>
            <dl className="space-y-2.5 border-t border-dashed border-on-night/20 pt-4 text-sm">
              <div className="flex justify-between">
                <dt className="text-on-night/70">Items ({totalItems})</dt>
                <dd className="font-mono">{formatNPR(totalPrice)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-on-night/70">Delivery</dt>
                <dd className="font-mono">{formatNPR(delivery)}</dd>
              </div>
            </dl>
            <div className="mb-6 mt-4 flex items-baseline justify-between border-t border-dashed border-on-night/20 pt-4">
              <span className="text-sm font-medium">Total</span>
              <span className="font-display text-3xl font-bold tracking-tight">
                {formatNPR(estimatedTotal)}
              </span>
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-accent w-full py-3.5 text-base disabled:opacity-60"
            >
              {isSubmitting && <Loader2 size={16} className="animate-spin" />}
              {isSubmitting ? "Placing order…" : `Place order · ${formatNPR(estimatedTotal)}`}
            </button>
            <p className="mt-3 flex items-center justify-center gap-1.5 text-center text-[11px] text-on-night/60">
              <Lock size={11} aria-hidden /> Prices are confirmed when the order is placed.
            </p>
          </div>
        </motion.aside>
      </form>
    </div>
  );
};

export default Checkout;
