"use client";
import { isStaff } from "@/constants/navLinks";
import {
  DASHBOARD_ROUTE,
  HOME_ROUTE,
  RESET_PASSWORD_ROUTE,
} from "@/constants/routes";
import { safeNext } from "@/utils/navigation";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import React, { Suspense, useEffect } from "react";
import { useSelector } from "react-redux";

// Signed-in visitors don't need the auth pages: send them to `?next=` or to
// their usual landing page. A reset link still works while signed in.
const RedirectWhenSignedIn = () => {
  const { user } = useSelector((state) => state.auth);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const next = searchParams.get("next");

  useEffect(() => {
    if (!user || pathname === RESET_PASSWORD_ROUTE) return;
    router.replace(
      safeNext(next) ?? (isStaff(user) ? DASHBOARD_ROUTE : HOME_ROUTE),
    );
  }, [user, next, pathname, router]);

  return null;
};

const AuthLayout = ({ children }) => {
  return (
    <>
      <Suspense fallback={null}>
        <RedirectWhenSignedIn />
      </Suspense>
      {children}
    </>
  );
};

export default AuthLayout;
