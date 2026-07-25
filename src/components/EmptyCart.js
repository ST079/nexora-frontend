import { PRODUCTS_ROUTE } from "@/constants/routes";
import { ShoppingBag } from "lucide-react";
import Link from "next/link";
import React from "react";

const EmptyCart = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-4 py-20 text-center">
      <ShoppingBag size={32} className="text-slate dark:text-[#8b8fa8]" />
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
