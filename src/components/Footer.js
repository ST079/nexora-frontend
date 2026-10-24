import Link from "next/link";
import React from "react";
import Logo from "./Logo";
import {
  ABOUT_ROUTE,
  ACCOUNT_SETTING_ROUTE,
  CART_ROUTE,
  CONTACT_ROUTE,
  ORDERS_ROUTE,
  PRODUCTS_ROUTE,
} from "@/constants/routes";

const categoryHref = (category) =>
  `${PRODUCTS_ROUTE}?category=${encodeURIComponent(category)}`;

const linkClass = "hover:text-signal dark:hover:text-signal transition-colors";

const Footer = () => {
  return (
    <footer className="border-t border-hairline dark:border-[#262932] bg-paper dark:bg-[#0e0f12] transition-colors duration-300">
      <div className="container-page py-12 grid gap-10 sm:grid-cols-2 md:grid-cols-[1.2fr_1fr_1fr_1fr]">

        {/* Brand */}
        <div className="space-y-4">
          <Logo />
          <p className="text-sm text-slate dark:text-[#8b8fa8] max-w-xs">
            A spec-first catalog built in Kathmandu. Every listing ships with
            the numbers that matter — price, stock, and a brand you can verify.
          </p>
        </div>

        {/* Shop */}
        <div>
          <p className="eyebrow dark:text-[#8b8fa8] mb-3">Shop</p>
          <ul className="space-y-2 text-sm text-ink dark:text-[#f0efe8]">
            <li>
              <Link href={categoryHref("Tech & Electronics")} className={linkClass}>
                Tech &amp; Electronics
              </Link>
            </li>
            <li>
              <Link href={categoryHref("Smartphones")} className={linkClass}>
                Smartphones
              </Link>
            </li>
            <li>
              <Link href={PRODUCTS_ROUTE} className={linkClass}>
                All products
              </Link>
            </li>
            <li>
              <Link href={CART_ROUTE} className={linkClass}>
                Cart
              </Link>
            </li>
          </ul>
        </div>

        {/* Account */}
        <div>
          <p className="eyebrow dark:text-[#8b8fa8] mb-3">Account</p>
          <ul className="space-y-2 text-sm text-ink dark:text-[#f0efe8]">
            <li>
              <Link href={ORDERS_ROUTE} className={linkClass}>
                Order history
              </Link>
            </li>
            <li>
              <Link href={ACCOUNT_SETTING_ROUTE} className={linkClass}>
                Account settings
              </Link>
            </li>
            <li>
              <Link href={ABOUT_ROUTE} className={linkClass}>
                About
              </Link>
            </li>
            <li>
              <Link href={CONTACT_ROUTE} className={linkClass}>
                Contact
              </Link>
            </li>
          </ul>
        </div>

        {/* Pay with */}
        <div>
          <p className="eyebrow dark:text-[#8b8fa8] mb-3">Pay with</p>
          <ul className="space-y-2 text-sm text-slate dark:text-[#8b8fa8]">
            <li>Khalti digital wallet</li>
            <li>Card · Stripe</li>
            <li>Cash on delivery</li>
          </ul>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="container-page py-5 border-t border-hairline dark:border-[#262932] flex flex-col sm:flex-row justify-between gap-2 text-xs text-slate dark:text-[#8b8fa8] font-mono">
        <span>© {new Date().getFullYear()} NEXORA — built on the Nexora Express API</span>
        <span>Kathmandu, Nepal</span>
      </div>
    </footer>
  );
};

export default Footer;
