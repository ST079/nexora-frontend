"use client";

import { Minus, Plus, Trash2, ArrowRight } from "lucide-react";
import EmptyState from "@/components/EmptyState";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import Image from "next/image";
import { formatNPR } from "@/utils/format";
import {
  clearCart,
  decreaseQuantity,
  increaseQuantity,
} from "@/redux/cart/cartSlice";
import Link from "next/link";
import { PRODUCTS_ROUTE } from "@/constants/routes";
import EmptyCart from "@/components/EmptyCart";

const CartPage = () => {
  const dispatch = useDispatch();

  const { items, totalPrice, totalItems } = useSelector((state) => state.cart);
  const { user } = useSelector((state) => state.auth);

  const router = useRouter();

  const goToCheckout = () => {
    if (!user) {
      router.push("/login");
      return;
    }
    router.push("/checkout");
  };

  return (
    <>
      {items.length == 0 ? (
        <EmptyCart />
      ) : (
        <div className="container-page py-10">
          <p className="eyebrow mb-2">Checkout · step 1 of 2</p>
          <h1 className="font-display text-3xl font-semibold mb-8">
            Your cart
          </h1>

          <div className="grid lg:grid-cols-[1fr_340px] gap-10">
            <div className="card-frame divide-y divide-hairline">
              {console.log(items)}
              {items.map((item) => (
                <div key={item.id} className="flex gap-4 p-5">
                  <div className="h-20 w-20 shrink-0 border border-hairline bg-paper">
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
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-display font-semibold leading-tight">
                          {item.name}
                        </p>
                        <p className="eyebrow mt-1">{item.brand}</p>
                      </div>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-slate hover:text-danger shrink-0"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex items-center border border-hairline">
                        <button
                          onClick={() => {
                            dispatch(decreaseQuantity(item.id));
                          }}
                          className="grid h-8 w-8 place-items-center hover:bg-hairline/40"
                          aria-label="Decrease quantity"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="w-8 text-center font-mono text-sm">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => {
                            dispatch(increaseQuantity(item.id));
                          }}
                          className="grid h-8 w-8 place-items-center hover:bg-hairline/40"
                          aria-label="Increase quantity"
                        >
                          <Plus size={12} />
                        </button>
                      </div>
                      <span className="font-mono text-sm">
                        {formatNPR(item.price * item.quantity)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
              <div className="p-5">
                <button
                  onClick={clearCart}
                  className="font-mono text-xs text-slate hover:text-danger underline"
                >
                  clear cart
                </button>
              </div>
            </div>

            <div className="card-frame p-6 h-fit lg:sticky lg:top-24">
              <p className="eyebrow mb-4">Order summary</p>
              <div className="space-y-2 font-mono text-sm mb-4">
                <div className="flex justify-between">
                  <span className="text-slate">Items ({totalItems})</span>
                  <span>{formatNPR(totalPrice)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate">Shipping</span>
                  <span>Calculated at delivery</span>
                </div>
              </div>
              <div className="flex justify-between border-t border-hairline pt-4 mb-6 font-mono">
                <span className="font-medium">Total</span>
                <span className="text-lg font-medium">
                  {formatNPR(totalPrice)}
                </span>
              </div>
              <button onClick={goToCheckout} className="btn-primary w-full">
                Checkout <ArrowRight size={15} />
              </button>
              <Link
                href={PRODUCTS_ROUTE}
                className="btn-ghost w-full justify-center mt-2"
              >
                Keep browsing
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CartPage;
