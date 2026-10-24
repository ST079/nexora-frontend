"use client";
import { HOME_ROUTE } from "@/constants/routes";
import { ROLE_ADMIN, ROLE_MERCHANT } from "@/constants/user";
import Link from "next/link";
import React from "react";
import { useSelector } from "react-redux";

const roleTag = (user) => {
  if (user?.roles?.includes(ROLE_ADMIN)) return "Admin";
  if (user?.roles?.includes(ROLE_MERCHANT)) return "Merchant";
  return null;
};

const Logo = () => {
  const { user } = useSelector((state) => state.auth);
  const tag = roleTag(user);

  return (
    <Link
      href={HOME_ROUTE}
      className="flex items-center gap-2 shrink-0"
      aria-label="Nexora home"
    >
      <span className="grid h-8 w-8 place-items-center bg-ink dark:bg-[#f0efe8] font-mono text-sm font-bold text-signal dark:text-ink">
        N
      </span>
      <span className="font-display text-lg font-semibold tracking-tight text-ink dark:text-[#f0efe8]">
        NEXORA
        {tag && (
          <span className="ml-1.5 font-mono text-[10px] uppercase tracking-widest text-slate dark:text-[#8b8fa8]">
            {tag}
          </span>
        )}
      </span>
    </Link>
  );
};

export default Logo;
