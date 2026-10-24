"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import {
  Wallet,
  Banknote,
  Loader2,
  CreditCard,
  ChevronLeft,
  MapPin,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { useForm } from "react-hook-form";
import AnimatedField from "@/components/AnimatedField";
import EmptyCart from "@/components/EmptyCart";
import Loader from "@/components/Loader";
import { apiErrorMessage, formatNPR } from "@/utils/format";
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
    <div className="container-page py-10 bg-paper dark:bg-[#0e0f12] min-h-screen transition-colors duration-300">
      <Link href={CART_ROUTE} className="btn-ghost mb-4 -ml-4 inline-flex">
        <ChevronLeft size={15} /> Back to cart
      </Link>
      <p className="eyebrow dark:text-[#8b8fa8] mb-2">Checkout · step 2 of 2</p>
      <h1 className="font-display text-3xl font-semibold mb-8 text-ink dark:text-[#f0efe8]">
        Shipping &amp; payment
      </h1>

      <form
        onSubmit={handleSubmit(placeOrder)}
        noValidate
        className="grid lg:grid-cols-[1fr_340px] gap-10"
      >
        <div className="space-y-8">
          <section
            aria-labelledby="shipping-heading"
            className="card-frame p-6 dark:border-[#262932]"
          >
            <div className="flex items-center gap-2 mb-4">
              <MapPin size={14} className="text-signal" />
              <h2 id="shipping-heading" className="eyebrow dark:text-[#8b8fa8]">
                Shipping address
              </h2>
            </div>
            <div className="grid sm:grid-cols-3 gap-4">
              <div>
                <label
                  htmlFor="checkout-province"
                  className="font-mono text-xs text-slate dark:text-[#8b8fa8] mb-1 block"
                >
                  Province
                </label>
                <select
                  id="checkout-province"
                  autoComplete="address-level1"
                  className="w-full border border-hairline dark:border-[#262932] bg-paper dark:bg-[#16181f] text-ink dark:text-[#f0efe8] px-4 py-3 text-sm outline-none focus:border-signal"
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
                {...register("street", {
                  required: "Street is required",
                  validate: (v) => v.trim().length > 0 || "Street is required",
                })}
                error={errors.street?.message}
              />
            </div>
            <p className="mt-4 font-mono text-[11px] text-slate dark:text-[#8b8fa8]">
              Delivering to {user.name}
              {user.phone ? ` · ${user.phone}` : ""}. The courier calls this
              number on arrival.
            </p>
          </section>

          <section
            aria-labelledby="payment-heading"
            className="card-frame p-6 dark:border-[#262932]"
          >
            <h2 id="payment-heading" className="eyebrow dark:text-[#8b8fa8] mb-1">
              Payment
            </h2>
            <p className="text-sm text-ink dark:text-[#f0efe8]">
              You&apos;ll choose how to pay on the next screen.
            </p>
            <p className="text-xs text-slate dark:text-[#8b8fa8] mt-1">
              Your items are held for you as soon as the order is placed.
            </p>
            <div className="flex flex-wrap items-center gap-4 mt-3 text-xs font-medium">
              <span className="flex items-center gap-1.5 text-slate dark:text-[#8b8fa8]">
                <Wallet size={14} /> Khalti
              </span>
              <span className="flex items-center gap-1.5 text-slate dark:text-[#8b8fa8]">
                <CreditCard size={14} /> Card
              </span>
              <span className="flex items-center gap-1.5 text-slate dark:text-[#8b8fa8]">
                <Banknote size={14} /> Cash on delivery
              </span>
            </div>
          </section>
        </div>

        <aside
          aria-label="Order summary"
          className="card-frame p-6 h-fit lg:sticky lg:top-24 dark:border-[#262932]"
        >
          <p className="eyebrow dark:text-[#8b8fa8] mb-4">Order summary</p>
          <ul className="space-y-2 mb-4 max-h-48 overflow-y-auto">
            {items.map((i) => (
              <li
                key={i.id}
                className="flex justify-between gap-2 font-mono text-xs text-ink dark:text-[#f0efe8]"
              >
                <span className="truncate">
                  {i.quantity} × {i.name}
                </span>
                <span className="shrink-0">{formatNPR(i.price * i.quantity)}</span>
              </li>
            ))}
          </ul>
          <dl className="space-y-1.5 font-mono text-sm border-t border-hairline dark:border-[#262932] pt-4">
            <div className="flex justify-between">
              <dt className="text-slate dark:text-[#8b8fa8]">Items ({totalItems})</dt>
              <dd className="text-ink dark:text-[#f0efe8]">{formatNPR(totalPrice)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate dark:text-[#8b8fa8]">Delivery</dt>
              <dd className="text-ink dark:text-[#f0efe8]">{formatNPR(delivery)}</dd>
            </div>
          </dl>
          <div className="flex justify-between border-t border-hairline dark:border-[#262932] pt-4 mt-4 mb-6 font-mono">
            <span className="font-medium text-ink dark:text-[#f0efe8]">Total</span>
            <span className="text-lg font-medium text-ink dark:text-[#f0efe8]">
              {formatNPR(estimatedTotal)}
            </span>
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary w-full disabled:opacity-60"
          >
            {isSubmitting && <Loader2 size={15} className="animate-spin" />}
            {isSubmitting ? "Placing order…" : `Place order · ${formatNPR(estimatedTotal)}`}
          </button>
          <p className="mt-3 text-center font-mono text-[11px] text-slate dark:text-[#8b8fa8]">
            Prices are confirmed when the order is placed.
          </p>
        </aside>
      </form>
    </div>
  );
};

export default Checkout;
