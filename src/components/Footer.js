import Link from "next/link";
import React from "react";
import { ArrowUpRight } from "lucide-react";
import { LogoMark } from "./Logo";
import { categories } from "@/constants/categories";
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

const linkClass =
  "link-underline text-on-night/75 transition-colors hover:text-on-night";

const Column = ({ title, children }) => (
  <div>
    <p className="mb-4 font-mono text-[11px] uppercase tracking-[0.18em] text-marigold">
      {title}
    </p>
    <ul className="space-y-2.5 text-sm">{children}</ul>
  </div>
);

const Footer = () => {
  return (
    <footer className="px-2 pb-2 sm:px-3 sm:pb-3">
      <div className="relative overflow-hidden rounded-4xl bg-night text-on-night">
        {/* Soft colour glows */}
        <span
          aria-hidden
          className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-signal/40 blur-[90px]"
        />
        <span
          aria-hidden
          className="pointer-events-none absolute -bottom-32 right-0 h-72 w-72 rounded-full bg-marigold/25 blur-[100px]"
        />

        <div className="container-page relative pt-14">
          {/* Call to action */}
          <div className="flex flex-col gap-6 border-b border-on-night/10 pb-12 md:flex-row md:items-end md:justify-between">
            <h2 className="max-w-xl font-display text-4xl font-bold leading-[1.05] tracking-tight sm:text-5xl">
              Good things, delivered across Nepal.
            </h2>
            <div className="flex flex-wrap gap-2">
              <Link href={PRODUCTS_ROUTE} className="btn-accent group">
                Start shopping
                <ArrowUpRight size={16} className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </Link>
              <Link
                href={CONTACT_ROUTE}
                className="inline-flex items-center justify-center rounded-full border border-on-night/20 px-6 py-3 text-sm font-semibold transition-colors hover:bg-on-night/10"
              >
                Talk to us
              </Link>
            </div>
          </div>

          <div className="grid gap-10 py-12 sm:grid-cols-2 md:grid-cols-[1.3fr_1fr_1fr_1fr]">
            <div className="space-y-4">
              <Link href="/" className="group inline-flex items-center gap-2.5" aria-label="Nexora home">
                <LogoMark />
                <span className="font-display text-xl font-bold tracking-tight">nexora</span>
              </Link>
              <p className="max-w-xs text-sm text-on-night/70">
                A friendly marketplace built in Kathmandu. Clear prices, live stock
                and merchants you can trust.
              </p>
            </div>

            <Column title="Shop">
              {categories.slice(0, 5).map((c) => (
                <li key={c.label}>
                  <Link href={categoryHref(c.label)} className={linkClass}>
                    {c.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link href={PRODUCTS_ROUTE} className={linkClass}>
                  All products
                </Link>
              </li>
            </Column>

            <Column title="Help">
              <li>
                <Link href={ORDERS_ROUTE} className={linkClass}>
                  Track an order
                </Link>
              </li>
              <li>
                <Link href={CART_ROUTE} className={linkClass}>
                  Your bag
                </Link>
              </li>
              <li>
                <Link href={ACCOUNT_SETTING_ROUTE} className={linkClass}>
                  Account settings
                </Link>
              </li>
              <li>
                <Link href={ABOUT_ROUTE} className={linkClass}>
                  About us
                </Link>
              </li>
              <li>
                <Link href={CONTACT_ROUTE} className={linkClass}>
                  Contact
                </Link>
              </li>
            </Column>

            <Column title="Pay with">
              {["Khalti wallet", "Card · Stripe", "Cash on delivery"].map((m) => (
                <li key={m}>
                  <span className="inline-flex rounded-full border border-on-night/15 px-3 py-1 text-xs text-on-night/85">
                    {m}
                  </span>
                </li>
              ))}
            </Column>
          </div>
        </div>

        {/* Oversized wordmark, cropped by the card edge */}
        <p
          aria-hidden
          className="pointer-events-none relative -mb-[0.22em] select-none text-center font-display text-[24vw] font-extrabold leading-none tracking-[-0.06em] text-on-night/[0.06] lg:text-[19rem]"
        >
          nexora
        </p>

        <div className="container-page relative flex flex-col justify-between gap-2 border-t border-on-night/10 py-5 font-mono text-[11px] text-on-night/60 sm:flex-row">
          <span>© {new Date().getFullYear()} Nexora · Made with care in Kathmandu</span>
          <span>Press ⌘K anywhere to search</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
