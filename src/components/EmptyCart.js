"use client";

import { PRODUCTS_ROUTE } from "@/constants/routes";
import { closeCart } from "@/redux/cart/cartSlice";
import { ShoppingBag } from "lucide-react";
import Link from "next/link";
import React from "react";
import { useDispatch } from "react-redux";

const EmptyCart = () => {
  const dispatch = useDispatch();

  return (
    <div className="flex flex-col items-center justify-center h-full gap-4 py-20 text-center">
      <div className="grid h-14 w-14 place-items-center border border-hairline dark:border-[#262932]">
        <ShoppingBag size={22} className="text-slate dark:text-[#8b8fa8]" />
      </div>
      <p className="font-display text-lg font-semibold text-ink dark:text-[#f0efe8]">
        Your cart is empty
      </p>
      <p className="text-sm text-slate dark:text-[#8b8fa8]">
        Add a product to see it here.
      </p>
      <Link
        href={PRODUCTS_ROUTE}
        onClick={() => dispatch(closeCart())}
        className="btn-primary mt-2"
      >
        Browse products
      </Link>
    </div>
  );
};

export default EmptyCart;
