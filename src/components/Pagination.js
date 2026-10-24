"use client";

import { useId } from "react";
import { motion } from "framer-motion";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { spring } from "@/utils/motion";
import { PRODUCT_MANAGEMENT_PAGE_SIZE } from "@/constants/pagination";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

// Controlled view: the caller owns `page`. Use this for lists paged in memory.
export const PaginationControls = ({
  page: requestedPage,
  total,
  pageSize = PRODUCT_MANAGEMENT_PAGE_SIZE,
  onPageChange,
}) => {
  // Two paginated lists on one page each get their own sliding highlight.
  const layoutGroup = useId();
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  // A stale ?page=99 still shows the real last page's range.
  const page = Math.min(Math.max(1, requestedPage), totalPages);

  if (totalPages <= 1) return null;

  const startIndex = (page - 1) * pageSize + 1;
  const endIndex = Math.min(page * pageSize, total);
  const goToPage = (p) => {
    if (p !== page) onPageChange(p);
  };

  const pageRange = () => {
    const delta = 2;
    const range = [];
    for (
      let i = Math.max(1, page - delta);
      i <= Math.min(totalPages, page + delta);
      i++
    )
      range.push(i);
    return range;
  };

  const btnBase =
    "grid h-9 w-9 place-items-center rounded-full text-slate transition-all hover:bg-mist hover:text-ink active:scale-90 disabled:pointer-events-none disabled:opacity-30";

  return (
    <nav
      aria-label="Pagination"
      className="mt-8 flex flex-col items-center justify-between gap-3 sm:flex-row"
    >
      <p className="font-mono text-xs text-slate">
        Showing{" "}
        <span className="text-ink">
          {startIndex}–{endIndex}
        </span>{" "}
        of <span className="text-ink">{total}</span>{" "}
        {total === 1 ? "result" : "results"}
      </p>

      <div className="flex items-center gap-0.5 rounded-full border border-hairline bg-panel p-1 shadow-soft">
        <button
          type="button"
          onClick={() => goToPage(1)}
          disabled={page === 1}
          className={btnBase}
          aria-label="First page"
        >
          <ChevronsLeft size={15} />
        </button>

        <button
          type="button"
          onClick={() => goToPage(page - 1)}
          disabled={page === 1}
          className={btnBase}
          aria-label="Previous page"
        >
          <ChevronLeft size={15} />
        </button>

        {pageRange().map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => goToPage(p)}
            aria-current={p === page ? "page" : undefined}
            aria-label={`Page ${p}`}
            className={`relative h-9 min-w-9 rounded-full px-2 font-mono text-xs transition-colors ${
              p === page ? "font-semibold text-paper" : "text-slate hover:bg-mist hover:text-ink"
            }`}
          >
            {p === page && (
              <motion.span
                layoutId={`page-active-${layoutGroup}`}
                transition={spring}
                className="absolute inset-0 rounded-full bg-ink"
              />
            )}
            <span className="relative">{p}</span>
          </button>
        ))}

        <button
          type="button"
          onClick={() => goToPage(page + 1)}
          disabled={page === totalPages}
          className={btnBase}
          aria-label="Next page"
        >
          <ChevronRight size={15} />
        </button>

        <button
          type="button"
          onClick={() => goToPage(totalPages)}
          disabled={page === totalPages}
          className={btnBase}
          aria-label="Last page"
        >
          <ChevronsRight size={15} />
        </button>
      </div>
    </nav>
  );
};

// URL-driven: reads and writes ?page= so the page survives reloads and links.
const Pagination = ({ total, pageSize = PRODUCT_MANAGEMENT_PAGE_SIZE }) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const page = Math.max(1, Number(searchParams.get("page")) || 1);

  const goToPage = (p) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(p));
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <PaginationControls
      page={page}
      total={total}
      pageSize={pageSize}
      onPageChange={goToPage}
    />
  );
};

export default Pagination;