import Link from "next/link";
import React from "react";

const Footer = () => {
  return (
    <footer className="border-t border-hairline mt-24">
      <div className="container-page py-12 grid gap-10 md:grid-cols-[1.2fr_1fr_1fr_1fr]">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="grid h-7 w-7 place-items-center bg-ink font-mono text-xs text-signal">
              N
            </span>
            <span className="font-display text-base font-semibold">NEXORA</span>
          </div>
          <p className="text-sm text-slate max-w-xs">
            A spec-first electronics catalog built in Kathmandu. Every listing
            ships with the numbers that matter — price, stock, and a brand you
            can verify.
          </p>
        </div>

        <div>
          <p className="eyebrow mb-3">Shop</p>
          <ul className="space-y-2 text-sm">
            <li>
              <Link href="/products?category=Tech&Gadgets" className="hover:text-signal">
                Tech & Gadgets
              </Link>
            </li>
            <li>
              <Link
                href="/products?category=Smartphones"
                className="hover:text-signal"
              >
                Smartphones
              </Link>
            </li>
            <li>
              <Link href="/cart" className="hover:text-signal">
                Cart
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <p className="eyebrow mb-3">Account</p>
          <ul className="space-y-2 text-sm">
            <li>
              <Link href="/orders" className="hover:text-signal">
                Order history
              </Link>
            </li>
            <li>
              <Link href="/profile" className="hover:text-signal">
                Profile
              </Link>
            </li>
            <li>
              <Link href="/login" className="hover:text-signal">
                Sign in
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <p className="eyebrow mb-3">Pay with</p>
          <ul className="space-y-2 text-sm text-slate">
            <li>Khalti digital wallet</li>
            <li>Cash on delivery</li>
            <li>Stripe</li>
          </ul>
        </div>
      </div>
      <div className="container-page py-5 border-t border-hairline flex flex-col sm:flex-row justify-between gap-2 text-xs text-slate font-mono">
        <span>
          © {new Date().getFullYear()} NEXORA — built on the Nexora Express API
        </span>
        <span>Bhaktapur, Nepal</span>
      </div>
    </footer>
  );
};

export default Footer;
