"use client";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
}: PaginationProps) {
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  // Generate page numbers to display - mobile responsive
  const getPageNumbers = (isMobile: boolean = false) => {
    const pages: (number | string)[] = [];
    const maxVisible = isMobile ? 3 : 7; // Show fewer pages on mobile

    if (totalPages <= maxVisible) {
      // Show all pages if total is less than max
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (isMobile) {
        // Mobile: Show only current page and neighbors
        if (currentPage > 1) {
          pages.push(1);
          if (currentPage > 2) pages.push("...");
        }
        pages.push(currentPage);
        if (currentPage < totalPages) {
          if (currentPage < totalPages - 1) pages.push("...");
          pages.push(totalPages);
        }
      } else {
        // Desktop: Show more pages
        pages.push(1);

        if (currentPage > 3) {
          pages.push("...");
        }

        const start = Math.max(2, currentPage - 1);
        const end = Math.min(totalPages - 1, currentPage + 1);

        for (let i = start; i <= end; i++) {
          pages.push(i);
        }

        if (currentPage < totalPages - 2) {
          pages.push("...");
        }

        pages.push(totalPages);
      }
    }

    return pages;
  };

  const desktopPages = getPageNumbers(false);
  const mobilePages = getPageNumbers(true);

  return (
    <div className="flex flex-col items-center gap-4 w-full px-4">
      {/* Results Info */}
      <div className="text-xs sm:text-sm text-slate-600 text-center">
        Showing <span className="font-semibold text-slate-900">{startItem}</span> to{" "}
        <span className="font-semibold text-slate-900">{endItem}</span> of{" "}
        <span className="font-semibold text-slate-900">{totalItems}</span> exercises
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center justify-center gap-1 sm:gap-2 w-full max-w-full overflow-x-auto">
        {/* Previous Button */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="flex h-9 sm:h-10 items-center gap-1 rounded-lg border-2 border-slate-200 bg-white px-2 sm:px-4 text-xs sm:text-sm font-semibold text-slate-700 transition-all duration-200 hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-slate-200 disabled:hover:bg-white flex-shrink-0"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span className="hidden sm:inline">Previous</span>
        </button>

        {/* Page Numbers - Desktop */}
        <div className="hidden sm:flex items-center gap-1">
          {desktopPages.map((page, index) => {
            if (page === "...") {
              return (
                <span key={`ellipsis-${index}`} className="px-2 text-slate-400">
                  ⋯
                </span>
              );
            }

            const pageNum = page as number;
            const isActive = pageNum === currentPage;

            return (
              <button
                key={pageNum}
                onClick={() => onPageChange(pageNum)}
                className={`flex h-10 w-10 items-center justify-center rounded-lg text-sm font-semibold transition-all duration-200 ${
                  isActive
                    ? "bg-blue-500 text-white shadow-md hover:bg-blue-600"
                    : "border-2 border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                }`}
              >
                {pageNum}
              </button>
            );
          })}
        </div>

        {/* Page Numbers - Mobile */}
        <div className="flex sm:hidden items-center gap-1">
          {mobilePages.map((page, index) => {
            if (page === "...") {
              return (
                <span key={`ellipsis-mobile-${index}`} className="px-1 text-slate-400 text-xs">
                  ⋯
                </span>
              );
            }

            const pageNum = page as number;
            const isActive = pageNum === currentPage;

            return (
              <button
                key={`mobile-${pageNum}`}
                onClick={() => onPageChange(pageNum)}
                className={`flex h-9 w-9 items-center justify-center rounded-lg text-xs font-semibold transition-all duration-200 ${
                  isActive
                    ? "bg-blue-500 text-white shadow-md"
                    : "border-2 border-slate-200 bg-white text-slate-700"
                }`}
              >
                {pageNum}
              </button>
            );
          })}
        </div>

        {/* Next Button */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="flex h-9 sm:h-10 items-center gap-1 rounded-lg border-2 border-slate-200 bg-white px-2 sm:px-4 text-xs sm:text-sm font-semibold text-slate-700 transition-all duration-200 hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-slate-200 disabled:hover:bg-white flex-shrink-0"
        >
          <span className="hidden sm:inline">Next</span>
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Quick Jump - Desktop only */}
      {totalPages > 5 && (
        <div className="hidden sm:flex items-center gap-2 text-sm">
          <span className="text-slate-600">Jump to page:</span>
          <input
            type="number"
            min="1"
            max={totalPages}
            placeholder={String(currentPage)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                const value = parseInt(e.currentTarget.value);
                if (value >= 1 && value <= totalPages) {
                  onPageChange(value);
                  e.currentTarget.value = "";
                }
              }
            }}
            className="w-16 rounded-lg border border-slate-300 px-2 py-1 text-center text-slate-900 transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
          <span className="text-slate-500">of {totalPages}</span>
        </div>
      )}
    </div>
  );
}

