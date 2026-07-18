import Link from "next/link";
import React from "react";
import Logo from "./Logo";

const Footer = () => {
  return (
    <footer className="border-t border-hairline dark:border-[#262932] bg-paper dark:bg-[#0e0f12] transition-colors duration-300">
      <div className="container-page py-12 grid gap-10 md:grid-cols-[1.2fr_1fr_1fr_1fr]">

        {/* Brand */}
        <div>
         <Logo/>
          <p className="text-sm text-slate dark:text-[#8b8fa8] max-w-xs">
            A spec-first electronics catalog built in Kathmandu. Every listing
            ships with the numbers that matter — price, stock, and a brand you
            can verify.
          </p>
        </div>

        {/* Shop */}
        <div>
          <p className="eyebrow dark:text-[#8b8fa8] mb-3">Shop</p>
          <ul className="space-y-2 text-sm text-ink dark:text-[#f0efe8]">
            <li>
              <Link href="/products?category=Tech&Gadgets" className="hover:text-signal dark:hover:text-signal transition-colors">
                Tech & Gadgets
              </Link>
            </li>
            <li>
              <Link href="/products?category=Smartphones" className="hover:text-signal dark:hover:text-signal transition-colors">
                Smartphones
              </Link>
            </li>
            <li>
              <Link href="/cart" className="hover:text-signal dark:hover:text-signal transition-colors">
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
              <Link href="/orders" className="hover:text-signal dark:hover:text-signal transition-colors">
                Order history
              </Link>
            </li>
            <li>
              <Link href="/profile" className="hover:text-signal dark:hover:text-signal transition-colors">
                Profile
              </Link>
            </li>
            <li>
              <Link href="/login" className="hover:text-signal dark:hover:text-signal transition-colors">
                Sign in
              </Link>
            </li>
          </ul>
        </div>

        {/* Pay with */}
        <div>
          <p className="eyebrow dark:text-[#8b8fa8] mb-3">Pay with</p>
          <ul className="space-y-2 text-sm text-slate dark:text-[#8b8fa8]">
            <li>Khalti digital wallet</li>
            <li>Cash on delivery</li>
            <li>Stripe</li>
          </ul>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="container-page py-5 border-t border-hairline dark:border-[#262932] flex flex-col sm:flex-row justify-between gap-2 text-xs text-slate dark:text-[#8b8fa8] font-mono">
        <span>© {new Date().getFullYear()} NEXORA — built on the Nexora Express API</span>
        <span>Bhaktapur, Nepal</span>
      </div>
    </footer>
  );
};

export default Footer;