"use client";

import CartDrawer from "@/components/CartDrawer";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import Loader from "@/components/Loader";
import { canAccessRoute, isStaff } from "@/constants/navLinks";
import { DASHBOARD_ROUTE, HOME_ROUTE, LOGIN_ROUTE } from "@/constants/routes";
import MainLayout from "@/layouts/MainLayout";
import { usePathname, useRouter } from "next/navigation";
import React, { useEffect } from "react";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";
import AdminSidebar from "./(admin)/_components/AdminSidebar";

// Single guard for everything under (client): signed-in check plus the
// per-route role rules from constants/navLinks.
const ClientLayout = ({ children }) => {
  const { user } = useSelector((state) => state.auth);
  const router = useRouter();
  const pathname = usePathname();
  const allowed = Boolean(user) && canAccessRoute(user, pathname);
  const staff = isStaff(user);

  useEffect(() => {
    if (!user) {
      // No toast: this also runs right after a voluntary sign-out.
      router.replace(`${LOGIN_ROUTE}?next=${encodeURIComponent(pathname)}`);
      return;
    }
    if (!canAccessRoute(user, pathname)) {
      toast.error("You don't have access to that page.", { id: "no-access" });
      router.replace(staff ? DASHBOARD_ROUTE : HOME_ROUTE);
    }
  }, [user, pathname, router, staff]);

  if (!allowed) return <Loader label="Checking access" />;

  // Shoppers only reach /account here; give them the storefront chrome
  // instead of an admin sidebar with nothing in it.
  if (!staff) {
    return (
      <MainLayout>
        <Header />
        <CartDrawer />
        <main className="flex-1">{children}</main>
        <Footer />
      </MainLayout>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-paper dark:bg-[#0e0f12] lg:h-screen lg:flex-row lg:overflow-hidden">
      <AdminSidebar />
      <main className="flex-1 min-w-0 lg:overflow-y-auto">{children}</main>
    </div>
  );
};

export default ClientLayout;
