"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { Wallet, Banknote, Loader2 } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { useForm } from "react-hook-form";
import AnimatedField from "@/components/AnimatedField";
import { formatNPR } from "@/utils/format";
import { createOrder } from "@/api/order";
import { clearCart } from "@/redux/cart/cartSlice";
import { CART_ROUTE, ORDERS_ROUTE } from "@/constants/routes";

const Checkout = () => {
  const { items, totalPrice } = useSelector((state) => state.cart);
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const router = useRouter();
  const { register, handleSubmit } = useForm({
    values: {
      city: user.address.city ?? "",
      street: user.address.street ?? "",
    },
  });

  const [method, setMethod] = useState("khalti");
  const [submitting, setSubmitting] = useState(false);

  if (items.length === 0) {
    router.push(CART_ROUTE);
    return null;
  }

  const checkoutCredentials = async (data) => {
    const orderItems = items.map((item) => ({
      product: item.id,
      quantity: item.quantity,
    }));

    const shippingAddress = { city: data.city, street: data.street };

    try {
      setSubmitting(true);
      await createOrder({
        orderItems,
        shippingAddress,
        totalPrice: totalPrice + 200,
      });

      toast.success("Order placed successfully!");
      router.push(ORDERS_ROUTE);
      dispatch(clearCart());
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          "Failed to place order. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container-page py-10 bg-paper dark:bg-[#0e0f12] min-h-screen transition-colors duration-300">
      <p className="eyebrow dark:text-[#8b8fa8] mb-2">Checkout · step 2 of 2</p>
      <h1 className="font-display text-3xl font-semibold mb-8 text-ink dark:text-[#f0efe8]">
        Shipping &amp; payment
      </h1>

      <form
        onSubmit={handleSubmit(checkoutCredentials)}
        className="grid lg:grid-cols-[1fr_340px] gap-10"
      >
        <div className="space-y-8">
          <div className="card-frame p-6 dark:border-[#262932]">
            <p className="eyebrow dark:text-[#8b8fa8] mb-4">Shipping address</p>
            <div className="grid sm:grid-cols-2 gap-4">
              <AnimatedField
                label="City"
                type="text"
                autoComplete="city"
                placeholder="e.g Bhaktapur"
                {...register("city", { required: "City is Required" })}
              />

              <AnimatedField
                label="Street"
                type="text"
                autoComplete="city"
                placeholder="e.g nagarkot road"
                {...register("street", { required: "street is Required" })}
              />
            </div>
          </div>

          <div className="card-frame p-6 dark:border-[#262932]">
            <p className="eyebrow dark:text-[#8b8fa8] mb-4">Payment method</p>
            <div className="grid sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setMethod("khalti")}
                className={`flex items-center gap-3 border p-4 text-left transition-colors ${
                  method === "khalti"
                    ? "border-ink bg-ink text-paper dark:border-[#f0efe8] dark:bg-[#f0efe8] dark:text-[#0e0f12]"
                    : "border-hairline hover:border-ink dark:border-[#262932] dark:text-[#f0efe8] dark:hover:border-[#8b8fa8]"
                }`}
              >
                <Wallet size={18} />
                <div>
                  <p className="font-medium text-sm">Khalti</p>
                  <p className="text-xs opacity-70">
                    Pay digitally, redirected securely
                  </p>
                </div>
              </button>
              <button
                type="button"
                onClick={() => setMethod("cash")}
                className={`flex items-center gap-3 border p-4 text-left transition-colors ${
                  method === "cash"
                    ? "border-ink bg-ink text-paper dark:border-[#f0efe8] dark:bg-[#f0efe8] dark:text-[#0e0f12]"
                    : "border-hairline hover:border-ink dark:border-[#262932] dark:text-[#f0efe8] dark:hover:border-[#8b8fa8]"
                }`}
              >
                <Banknote size={18} />
                <div>
                  <p className="font-medium text-sm">Cash on delivery</p>
                  <p className="text-xs opacity-70">
                    Pay when the order arrives
                  </p>
                </div>
              </button>
            </div>
          </div>
        </div>

        <div className="card-frame p-6 h-fit lg:sticky lg:top-24 dark:border-[#262932]">
          <p className="eyebrow dark:text-[#8b8fa8] mb-4">Order summary</p>
          <ul className="space-y-2 mb-4 max-h-48 overflow-y-auto">
            {items.map((i) => (
              <li
                key={i.id}
                className="flex justify-between font-mono text-xs text-ink dark:text-[#f0efe8]"
              >
                <span className="truncate pr-2">
                  {i.quantity} × {i.name}
                </span>
                <span className="shrink-0">
                  {formatNPR(i.price * i.quantity)}
                </span>
              </li>
            ))}
          </ul>
          <p className="font-mono text-[11px] text-slate dark:text-[#8b8fa8]">
            Delivery Charge : Rs 200
          </p>
          <div className="flex justify-between border-t border-hairline dark:border-[#262932] pt-4 mb-6 font-mono">
            <span className="font-medium text-ink dark:text-[#f0efe8]">
              Total
            </span>
            <span className="text-lg font-medium text-ink dark:text-[#f0efe8]">
              {formatNPR(totalPrice + 200)}
            </span>
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="btn-primary w-full disabled:opacity-60"
          >
            {submitting ? <Loader2 size={15} className="animate-spin" /> : null}
            {submitting
              ? "Placing order…"
              : `Place order · ${formatNPR(totalPrice + 200)}`}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Checkout;
