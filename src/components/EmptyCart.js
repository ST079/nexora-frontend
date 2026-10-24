"use client";

import { PRODUCTS_ROUTE } from "@/constants/routes";
import { closeCart } from "@/redux/cart/cartSlice";
import { motion } from "framer-motion";
import { ShoppingBag, Sparkles } from "lucide-react";
import Link from "next/link";
import React from "react";
import { useDispatch } from "react-redux";
import { bouncy } from "@/utils/motion";

const EmptyCart = () => {
  const dispatch = useDispatch();

  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 px-6 py-16 text-center">
      <motion.div
        initial={{ scale: 0.6, rotate: -12, opacity: 0 }}
        animate={{ scale: 1, rotate: 0, opacity: 1 }}
        transition={bouncy}
        className="relative mb-2"
      >
        <span className="grid h-24 w-24 place-items-center rounded-4xl bg-signal-tint text-signal">
          <ShoppingBag size={38} strokeWidth={1.6} />
        </span>
        <motion.span
          animate={{ y: [0, -6, 0], rotate: [0, 12, 0] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -right-2 -top-2 grid h-9 w-9 place-items-center rounded-full bg-marigold text-on-marigold shadow-soft"
        >
          <Sparkles size={16} />
        </motion.span>
      </motion.div>
      <p className="font-display text-2xl font-bold text-ink">Your bag is feeling light</p>
      <p className="max-w-xs text-sm text-slate">
        Find something you love and it will wait for you right here.
      </p>
      <Link
        href={PRODUCTS_ROUTE}
        onClick={() => dispatch(closeCart())}
        className="btn-primary mt-3"
      >
        Start shopping
      </Link>
    </div>
  );
};

export default EmptyCart;
