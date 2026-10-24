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

// The mark: a violet tile with a marigold "sun" that pops on hover.
export const LogoMark = ({ className = "h-9 w-9" }) => (
  <span
    aria-hidden
    className={`relative grid shrink-0 place-items-center rounded-[0.8rem] bg-signal text-on-signal transition-transform duration-500 ease-spring group-hover:-rotate-6 group-hover:scale-105 ${className}`}
  >
    <span className="font-display text-[1.05em] font-extrabold leading-none tracking-tighter">
      n
    </span>
    <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-marigold ring-2 ring-paper transition-transform duration-500 ease-spring group-hover:scale-125" />
  </span>
);

const Logo = ({ compact = false }) => {
  const { user } = useSelector((state) => state.auth);
  const tag = roleTag(user);

  return (
    <Link
      href={HOME_ROUTE}
      className="group flex shrink-0 items-center gap-2.5"
      aria-label="Nexora home"
    >
      <LogoMark />
      {!compact && (
        <span className="flex items-center gap-2">
          <span className="font-display text-xl font-bold tracking-tight text-ink">
            nexora
          </span>
          {tag && (
            <span className="rounded-full bg-marigold-tint px-2 py-0.5 font-mono text-[10px] font-medium uppercase tracking-widest text-marigold-dim">
              {tag}
            </span>
          )}
        </span>
      )}
    </Link>
  );
};

export default Logo;
