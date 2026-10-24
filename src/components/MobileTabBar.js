"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  Home,
  Info,
  LayoutDashboard,
  ListOrdered,
  LogOut,
  Mail,
  Search,
  Settings,
  ShoppingBag,
  Store,
  User,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { isStaff } from "@/constants/navLinks";
import {
  ABOUT_ROUTE,
  ACCOUNT_SETTING_ROUTE,
  CART_ROUTE,
  CONTACT_ROUTE,
  DASHBOARD_ROUTE,
  HOME_ROUTE,
  LOGIN_ROUTE,
  ORDERS_ROUTE,
  PRODUCTS_ROUTE,
  REGISTER_ROUTE,
} from "@/constants/routes";
import { logout } from "@/redux/auth/authSlice";
import { openCart } from "@/redux/cart/cartSlice";
import { CART_TARGET_ATTR } from "@/utils/flyToCart";
import { initials } from "@/utils/format";
import { backdrop, softSpring, spring } from "@/utils/motion";
import CartCount from "./CartCount";
import { openSearch } from "./SearchPalette";
import ThemeToggler from "./ThemeToggler";

const Tab = ({ active, icon: Icon, label, children, ...props }) => {
  const Tag = props.href ? Link : "button";
  return (
    <Tag
      {...props}
      aria-current={active && props.href ? "page" : undefined}
      className={`relative flex flex-1 flex-col items-center gap-0.5 rounded-full py-2 text-[10px] font-semibold transition-colors ${
        active ? "text-paper" : "text-slate"
      }`}
    >
      {active && (
        <motion.span
          layoutId="tab-active"
          transition={spring}
          className="absolute inset-0 -z-10 rounded-full bg-ink"
        />
      )}
      <motion.span whileTap={{ scale: 0.8 }} className="relative">
        <Icon size={19} strokeWidth={active ? 2.4 : 2} />
        {children}
      </motion.span>
      {label}
    </Tag>
  );
};

const SheetLink = ({ href, icon: Icon, label, hint }) => (
  <Link
    href={href}
    className="flex flex-col gap-2 rounded-2xl border border-hairline bg-paper p-3.5 transition-transform active:scale-[0.97]"
  >
    <Icon size={18} className="text-signal" />
    <span>
      <span className="block text-sm font-semibold text-ink">{label}</span>
      {hint && <span className="block text-[11px] text-slate">{hint}</span>}
    </span>
  </Link>
);

// Phones and tablets: a floating tab bar replaces the hamburger menu, so the
// four things shoppers do most are one thumb-tap away.
const MobileTabBar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useDispatch();
  const { totalItems, isOpen: cartOpen } = useSelector((state) => state.cart);
  const { user } = useSelector((state) => state.auth);
  // Tracks the page the sheet was opened on, so following a link closes it.
  const [sheetOn, setSheetOn] = useState(null);
  const sheetOpen = sheetOn === pathname;
  const closeSheet = () => setSheetOn(null);

  useEffect(() => {
    if (!sheetOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e) => e.key === "Escape" && setSheetOn(null);
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKey);
    };
  }, [sheetOpen]);

  const handleLogout = () => {
    dispatch(logout());
    closeSheet();
    router.replace(LOGIN_ROUTE);
  };

  const accountActive =
    sheetOpen || [ORDERS_ROUTE, ACCOUNT_SETTING_ROUTE].some((r) => pathname.startsWith(r));
  const cartActive = !sheetOpen && (cartOpen || pathname === CART_ROUTE);
  const idle = sheetOpen || cartOpen;

  return (
    <>
      <nav
        aria-label="Quick"
        style={{ viewTransitionName: "mobile-tabbar" }}
        className="fixed inset-x-3 bottom-[calc(0.75rem+env(safe-area-inset-bottom))] z-40 lg:hidden"
      >
        {/* Denser than .glass: the bar always floats over text, and its labels are 10px. */}
        <div className="glass isolate mx-auto flex max-w-md items-center gap-1 rounded-full bg-paper/92 p-1.5 shadow-lift">
          <Tab href={HOME_ROUTE} icon={Home} label="Home" active={!idle && pathname === HOME_ROUTE} />
          <Tab
            href={PRODUCTS_ROUTE}
            icon={Store}
            label="Shop"
            active={!idle && pathname.startsWith(PRODUCTS_ROUTE)}
          />
          <Tab onClick={openSearch} icon={Search} label="Search" aria-label="Search products" />
          <Tab
            onClick={() => dispatch(openCart())}
            icon={ShoppingBag}
            label="Cart"
            active={cartActive}
            aria-label={`Open cart, ${totalItems} item${totalItems === 1 ? "" : "s"}`}
            {...{ [CART_TARGET_ATTR]: "" }}
          >
            <CartCount count={totalItems} className="-right-3 -top-2" />
          </Tab>
          <Tab
            onClick={() => setSheetOn(sheetOpen ? null : pathname)}
            icon={User}
            label={user ? "You" : "Account"}
            active={accountActive}
            aria-expanded={sheetOpen}
            aria-label="Account menu"
          />
        </div>
      </nav>

      <AnimatePresence>
        {sheetOpen && (
          <>
            <motion.div
              {...backdrop}
              onClick={closeSheet}
              className="fixed inset-0 z-55 bg-night/50 backdrop-blur-sm lg:hidden"
            />
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label="Account"
              drag="y"
              dragConstraints={{ top: 0, bottom: 0 }}
              dragElastic={{ top: 0, bottom: 0.5 }}
              onDragEnd={(_, info) => {
                if (info.offset.y > 90 || info.velocity.y > 500) closeSheet();
              }}
              initial={{ y: "100%" }}
              animate={{ y: 0, transition: softSpring }}
              exit={{ y: "100%", transition: { duration: 0.22 } }}
              className="fixed inset-x-0 bottom-0 z-[56] max-h-[88dvh] overflow-y-auto rounded-t-4xl border-t border-hairline bg-panel px-5 pb-[calc(1.5rem+env(safe-area-inset-bottom))] pt-3 shadow-lift lg:hidden"
            >
              <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-hairline" />

              {user ? (
                <div className="flex items-center gap-3 rounded-2xl bg-signal-tint p-3.5">
                  <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-signal font-display text-lg font-bold text-on-signal">
                    {initials(user.name) || "N"}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate font-display text-lg font-bold text-ink">
                      Hi, {user.name?.split(" ")[0]}
                    </span>
                    <span className="block truncate font-mono text-[11px] text-slate">
                      {user.email}
                    </span>
                  </span>
                </div>
              ) : (
                <div className="rounded-2xl bg-signal-tint p-4">
                  <p className="font-display text-xl font-bold text-ink">Welcome to Nexora</p>
                  <p className="mt-1 text-sm text-slate">
                    Sign in to track orders and check out faster.
                  </p>
                  <div className="mt-4 grid grid-cols-2 gap-2">
                    <Link href={LOGIN_ROUTE} className="btn-secondary py-2.5">
                      Sign in
                    </Link>
                    <Link href={REGISTER_ROUTE} className="btn-primary py-2.5">
                      Join free
                    </Link>
                  </div>
                </div>
              )}

              <div className="mt-4 grid grid-cols-2 gap-2">
                {user && isStaff(user) && (
                  <SheetLink href={DASHBOARD_ROUTE} icon={LayoutDashboard} label="Dashboard" hint="Your console" />
                )}
                {user && (
                  <>
                    <SheetLink href={ORDERS_ROUTE} icon={ListOrdered} label="My orders" hint="Track & pay" />
                    <SheetLink href={ACCOUNT_SETTING_ROUTE} icon={Settings} label="Account" hint="Profile & password" />
                  </>
                )}
                <SheetLink href={ABOUT_ROUTE} icon={Info} label="About" hint="Who we are" />
                <SheetLink href={CONTACT_ROUTE} icon={Mail} label="Contact" hint="We reply fast" />
              </div>

              <div className="mt-3 rounded-2xl border border-hairline p-1">
                <ThemeToggler />
              </div>

              {user && (
                <button
                  onClick={handleLogout}
                  className="mt-3 flex w-full items-center justify-center gap-2 rounded-full py-3 text-sm font-semibold text-danger transition-colors hover:bg-danger/10"
                >
                  <LogOut size={15} /> Sign out
                </button>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default MobileTabBar;
