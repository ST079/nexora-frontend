"use client";
import { HOME_ROUTE } from "@/constants/routes";
import { ROLE_ADMIN, ROLE_MERCHANT } from "@/constants/user";
import Link from "next/link";
import React from "react";
import { useSelector } from "react-redux";

const Logo = () => {
  const { user } = useSelector((state) => state.auth);

  return (
    <div>
      <Link href={HOME_ROUTE} className="flex items-center gap-2 shrink-0">
        <span className="grid h-8 w-8 place-items-center bg-ink font-mono text-sm text-signal">
          N
        </span>
        <span className="font-display text-lg font-semibold tracking-tight dark:text-white">
          NEXORA
          <span className="ml-1 font-mono text-[10px] uppercase tracking-widest text-slate dark:text-[#8b8fa8]">
            {user?.roles?.includes(ROLE_ADMIN)
              ? "Admin"
              : user?.roles?.includes(ROLE_MERCHANT)
                ? "Merchant"
                : "NEXORA"}
          </span>
        </span>
      </Link>
    </div>
  );
};

export default Logo;
