import { HOME_ROUTE } from "@/constants/routes";
import Link from "next/link";
import React from "react";

const Logo = () => {
  return (
    <div>
      <Link href={HOME_ROUTE} className="flex items-center gap-2 shrink-0">
        <span className="grid h-8 w-8 place-items-center bg-ink font-mono text-sm text-signal">
          N
        </span>
        <span className="font-display text-lg font-semibold tracking-tight">
          NEXORA
        </span>
      </Link>
    </div>
  );
};

export default Logo;
