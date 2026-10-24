"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
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
    "grid h-8 w-8 place-items-center border border-hairline dark:border-[#262932] text-slate dark:text-[#8b8fa8] hover:border-ink dark:hover:border-[#f0efe8] hover:text-ink dark:hover:text-[#f0efe8] disabled:opacity-30 disabled:cursor-not-allowed transition-colors";

  return (
    <nav
      aria-label="Pagination"
      className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-3"
    >
      <p className="font-mono text-xs text-slate dark:text-[#8b8fa8]">
        Showing{" "}
        <span className="text-ink dark:text-[#f0efe8]">
          {startIndex}–{endIndex}
        </span>{" "}
        of <span className="text-ink dark:text-[#f0efe8]">{total}</span>{" "}
        {total === 1 ? "result" : "results"}
      </p>

      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => goToPage(1)}
          disabled={page === 1}
          className={btnBase}
          aria-label="First page"
        >
          <ChevronsLeft size={13} />
        </button>

        <button
          type="button"
          onClick={() => goToPage(page - 1)}
          disabled={page === 1}
          className={btnBase}
          aria-label="Previous page"
        >
          <ChevronLeft size={13} />
        </button>

        {pageRange().map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => goToPage(p)}
            aria-current={p === page ? "page" : undefined}
            aria-label={`Page ${p}`}
            className={`h-8 min-w-8 px-2 font-mono text-xs border transition-colors ${
              p === page
                ? "border-ink dark:border-[#f0efe8] bg-ink dark:bg-[#f0efe8] text-paper dark:text-[#0e0f12]"
                : "border-hairline dark:border-[#262932] text-slate dark:text-[#8b8fa8] hover:border-ink dark:hover:border-[#f0efe8] hover:text-ink dark:hover:text-[#f0efe8]"
            }`}
          >
            {p}
          </button>
        ))}

        <button
          type="button"
          onClick={() => goToPage(page + 1)}
          disabled={page === totalPages}
          className={btnBase}
          aria-label="Next page"
        >
          <ChevronRight size={13} />
        </button>

        <button
          type="button"
          onClick={() => goToPage(totalPages)}
          disabled={page === totalPages}
          className={btnBase}
          aria-label="Last page"
        >
          <ChevronsRight size={13} />
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