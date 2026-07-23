"use client";

import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

const Pagination = ({ page, totalPages, total, pageSize, onPageChange }) => {
  if (totalPages <= 1) return null;

  const startIndex = (page - 1) * pageSize + 1;
  const endIndex = Math.min(page * pageSize, total);

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
    <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-3">
      {/* Count */}
      <p className="font-mono text-xs text-slate dark:text-[#8b8fa8]">
        Showing{" "}
        <span className="text-ink dark:text-[#f0efe8]">
          {startIndex}–{endIndex}
        </span>{" "}
        of <span className="text-ink dark:text-[#f0efe8]">{total}</span>{" "}
        {total === 1 ? "result" : "results"}
      </p>

      {/* Controls */}
      <div className="flex items-center gap-1">
        {/* First */}
        <button
          onClick={() => onPageChange(1)}
          disabled={page === 1}
          className={btnBase}
          aria-label="First page"
        >
          <ChevronsLeft size={13} />
        </button>

        {/* Prev */}
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
          className={btnBase}
          aria-label="Previous page"
        >
          <ChevronLeft size={13} />
        </button>

        {/* Page numbers */}
        {pageRange().map((p) => (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            className={`h-8 min-w-[2rem] px-2 font-mono text-xs border transition-colors ${
              p === page
                ? "border-ink dark:border-[#f0efe8] bg-ink dark:bg-[#f0efe8] text-paper dark:text-[#0e0f12]"
                : "border-hairline dark:border-[#262932] text-slate dark:text-[#8b8fa8] hover:border-ink dark:hover:border-[#f0efe8] hover:text-ink dark:hover:text-[#f0efe8]"
            }`}
          >
            {p}
          </button>
        ))}

        {/* Next */}
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page === totalPages}
          className={btnBase}
          aria-label="Next page"
        >
          <ChevronRight size={13} />
        </button>

        {/* Last */}
        <button
          onClick={() => onPageChange(totalPages)}
          disabled={page === totalPages}
          className={btnBase}
          aria-label="Last page"
        >
          <ChevronsRight size={13} />
        </button>
      </div>
    </div>
  );
};

export default Pagination;
