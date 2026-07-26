"use client";

import { Minus, Plus, Trash2, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import Image from "next/image";
import { formatNPR } from "@/utils/format";
import {
  clearCart,
  decreaseQuantity,
  increaseQuantity,
  removeFromCart,
} from "@/redux/cart/cartSlice";
import Link from "next/link";
import {
  CHECKOUT_ROUTE,
  LOGIN_ROUTE,
  PRODUCTS_ROUTE,
} from "@/constants/routes";
import EmptyCart from "@/components/EmptyCart";
import toast from "react-hot-toast";

const CartPage = () => {
  const dispatch = useDispatch();
  const { items, totalPrice, totalItems } = useSelector((state) => state.cart);
  const { user } = useSelector((state) => state.auth);
  const router = useRouter();

  const goToCheckout = () => {
    if (!user) {
      router.push(LOGIN_ROUTE);
      return;
    }
    router.push(CHECKOUT_ROUTE);
  };

  const handleIncrease = (item) => {
    if (item.quantity >= item.stock) {
      toast.error(`Only ${item.stock} in stock`);
      return;
    }
    dispatch(increaseQuantity(item.id));
  };

  if (items.length === 0) return <EmptyCart />;

  return (
    <div className="container-page py-10 bg-paper dark:bg-[#0e0f12] min-h-screen transition-colors duration-300">
      <p className="eyebrow dark:text-[#8b8fa8] mb-2">Checkout · step 1 of 2</p>
      <h1 className="font-display text-3xl font-semibold mb-8 text-ink dark:text-[#f0efe8]">
        Your cart
      </h1>

      <div className="grid lg:grid-cols-[1fr_340px] gap-10 items-start">
        {/* ── Items ── */}
        <div className="card-frame divide-y divide-hairline dark:divide-[#262932]">
          {items.map((item) => (
            <div key={item.id} className="flex gap-4 p-5">
              {/* Image */}
              <div className="h-20 w-20 shrink-0 border border-hairline dark:border-[#262932] bg-paper dark:bg-[#16181f] overflow-hidden">
                {item.imageUrls && (
                  <Image
                    src={item.imageUrls}
                    alt={item.name}
                    className="h-full w-full object-cover"
                    width={80}
                    height={80}
                  />
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-display font-semibold leading-tight text-ink dark:text-[#f0efe8]">
                      {item.name}
                    </p>
                    <p className="eyebrow dark:text-[#8b8fa8] mt-1">
                      {item.brand}
                    </p>
                  </div>
                  <button
                    onClick={() => dispatch(removeFromCart(item.id))}
                    className="text-slate dark:text-[#8b8fa8] hover:text-danger dark:hover:text-danger transition-colors shrink-0"
                    aria-label="Remove item"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <div className="mt-3 flex items-center justify-between">
                  {/* Qty controls */}
                  <div className="flex items-center border border-hairline dark:border-[#262932]">
                    <button
                      onClick={() => dispatch(decreaseQuantity(item.id))}
                      className="grid h-8 w-8 place-items-center text-slate dark:text-[#8b8fa8] hover:bg-hairline/40 dark:hover:bg-[#262932] hover:text-ink dark:hover:text-[#f0efe8] transition-colors"
                      aria-label="Decrease quantity"
                    >
                      <Minus size={12} />
                    </button>
                    <span className="w-8 text-center font-mono text-sm text-ink dark:text-[#f0efe8]">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => handleIncrease(item)}
                      className="grid h-8 w-8 place-items-center text-slate dark:text-[#8b8fa8] hover:bg-hairline/40 dark:hover:bg-[#262932] hover:text-ink dark:hover:text-[#f0efe8] transition-colors"
                      aria-label="Increase quantity"
                    >
                      <Plus size={12} />
                    </button>
                  </div>

                  <span className="font-mono text-sm text-ink dark:text-[#f0efe8]">
                    {formatNPR(item.price * item.quantity)}
                  </span>
                </div>
              </div>
            </div>
          ))}

          {/* Clear cart */}
          <div className="p-5">
            <button
              onClick={() => dispatch(clearCart())}
              className="font-mono text-xs text-slate dark:text-[#8b8fa8] hover:text-danger dark:hover:text-danger underline transition-colors"
            >
              clear cart
            </button>
          </div>
        </div>

        {/* ── Order summary ── */}
        <div className="card-frame p-6 h-fit lg:sticky lg:top-24">
          <p className="eyebrow dark:text-[#8b8fa8] mb-4">Order summary</p>

          <div className="space-y-2 font-mono text-sm mb-4">
            <div className="flex justify-between">
              <span className="text-slate dark:text-[#8b8fa8]">
                Items ({totalItems})
              </span>
              <span className="text-ink dark:text-[#f0efe8]">
                {formatNPR(totalPrice)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate dark:text-[#8b8fa8]">Shipping</span>
              <span className="text-ink dark:text-[#f0efe8]">
                Calculated at delivery
              </span>
            </div>
          </div>

          <div className="flex justify-between border-t border-hairline dark:border-[#262932] pt-4 mb-6 font-mono">
            <span className="font-medium text-ink dark:text-[#f0efe8]">
              Total
            </span>
            <span className="text-lg font-medium text-ink dark:text-[#f0efe8]">
              {formatNPR(totalPrice)}
            </span>
          </div>

          <button onClick={goToCheckout} className="btn-primary w-full">
            Checkout <ArrowRight size={15} />
          </button>
          <Link
            href={PRODUCTS_ROUTE}
            className="btn-ghost w-full justify-center mt-2 dark:text-[#8b8fa8] dark:hover:text-[#f0efe8]"
          >
            Keep browsing
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
