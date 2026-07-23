"use client";

import Loader from "@/components/Loader";
import { LOGIN_ROUTE } from "@/constants/routes";
import { useRouter } from "next/navigation";
import React, { useEffect } from "react";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";
import AdminSidebar from "./(admin)/_components/AdminSidebar";

const ClientLayout = ({ children }) => {
  const { user } = useSelector((state) => state.auth);
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push(LOGIN_ROUTE);
      toast.error("You are not authenticated!");
    }
  }, [user]);

  if (!user) return <Loader label="Checking access" />;

  return (
    <div className="flex h-screen bg-paper dark:bg-[#0e0f12] overflow-hidden">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
};

export default ClientLayout;
