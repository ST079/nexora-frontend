"use client";
import { HOME_ROUTE } from "@/constants/routes";
import { useRouter } from "next/navigation";
import React, { useEffect } from "react";
import { useSelector } from "react-redux";

const AuthLayout = ({ children }) => {
  const { user } = useSelector((state) => state.auth);
  const router = useRouter();

  useEffect(() => {
    if (user) {
      router.replace(HOME_ROUTE);
    }
  }, [user, router]);

  return <div>{children}</div>;
};

export default AuthLayout;
