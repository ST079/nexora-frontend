"use client";
import React, { useEffect, useState } from "react";
import { Search, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import ProductsMenu from "@/components/ProductsMenu";
import Logo from "./Logo";
import UserProfile from "./UserProfile";
import CartCount from "./CartCount";
import MobileTabBar from "./MobileTabBar";
import SearchPalette, { openSearch } from "./SearchPalette";
import { navLinks } from "@/constants/navLinks";
import { openCart } from "@/redux/cart/cartSlice";
import { PRODUCTS_ROUTE } from "@/constants/routes";
import { CART_TARGET_ATTR } from "@/utils/flyToCart";
import { spring } from "@/utils/motion";

export const isActiveRoute = (pathname, route) =>
  pathname === route || (route !== "/" && pathname.startsWith(route));

const NavPill = ({ href, label, active }) => (
  <Link
    href={href}
    aria-current={active ? "page" : undefined}
    className={`relative rounded-full px-4 py-2 text-sm font-medium transition-colors ${
      active ? "text-ink" : "text-slate hover:text-ink"
    }`}
  >
    {active && (
      <motion.span
        layoutId="nav-active"
        transition={spring}
        className="absolute inset-0 -z-10 rounded-full bg-panel shadow-soft"
      />
    )}
    {label}
  </Link>
);

const Header = () => {
  const pathname = usePathname();
  const dispatch = useDispatch();
  const { totalItems } = useSelector((state) => state.cart);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const [home, ...rest] = navLinks;

  return (
    <>
      <header
        style={{ viewTransitionName: "site-header" }}
        className="sticky top-0 z-40 pt-2 sm:pt-3"
      >
        <div className="container-page">
          <div
            className={`glass flex h-14 items-center gap-2 rounded-full pl-2.5 pr-2 transition-shadow duration-500 sm:h-16 sm:pl-3 ${
              scrolled ? "shadow-lift" : "shadow-soft"
            }`}
          >
            <Logo />

            {/* ── Desktop nav: the active page sits on a sliding pill ── */}
            <nav
              className="isolate mx-auto hidden items-center rounded-full bg-mist/80 p-1 lg:flex"
              aria-label="Main"
            >
              <NavPill href={home.route} label={home.label} active={isActiveRoute(pathname, home.route)} />
              <ProductsMenu active={isActiveRoute(pathname, PRODUCTS_ROUTE)} />
              {rest.map((l) => (
                <NavPill
                  key={l.label}
                  href={l.route}
                  label={l.label}
                  active={isActiveRoute(pathname, l.route)}
                />
              ))}
            </nav>

            <div className="ml-auto flex items-center gap-1.5">
              <button
                onClick={openSearch}
                className="hidden h-10 w-56 items-center gap-2 rounded-full border border-hairline bg-panel pl-3.5 pr-1.5 text-sm text-slate transition-all hover:border-ink/30 hover:shadow-soft md:flex xl:w-64"
                aria-label="Search products"
                aria-keyshortcuts="Meta+K Control+K"
              >
                <Search size={15} className="text-ink" />
                <span className="flex-1 text-left">Search products</span>
                <kbd className="rounded-full bg-mist px-2 py-0.5 font-mono text-[10px] text-slate">
                  ⌘K
                </kbd>
              </button>

              <button
                onClick={() => dispatch(openCart())}
                {...{ [CART_TARGET_ATTR]: "" }}
                className="relative hidden h-10 items-center gap-2 rounded-full bg-ink pl-3.5 pr-4 text-sm font-semibold text-paper transition-transform active:scale-95 lg:flex"
                aria-label={`Open cart, ${totalItems} item${totalItems === 1 ? "" : "s"}`}
              >
                <ShoppingBag size={16} />
                Cart
                <CartCount count={totalItems} className="-right-1.5 -top-1.5" />
              </button>

              <div className="hidden lg:block">
                <UserProfile />
              </div>
            </div>
          </div>
        </div>
      </header>

      <MobileTabBar />
      <SearchPalette />
    </>
  );
};

export default Header;
