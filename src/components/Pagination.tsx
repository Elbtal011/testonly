import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  loading?: boolean;
  showPageSizeSelector?: boolean;
  showPageInfo?: boolean;
  showPageNumbers?: boolean;
  maxPageNumbers?: number;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  onPageSizeChange,
  loading = false,
  showPageSizeSelector = true,
  showPageInfo = true,
  showPageNumbers = true,
  maxPageNumbers = 7
}) => {
  // Calculate visible page numbers
  const getVisiblePages = () => {
    if (totalPages <= maxPageNumbers) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const half = Math.floor(maxPageNumbers / 2);
    let start = Math.max(1, currentPage - half);
    let end = Math.min(totalPages, start + maxPageNumbers - 1);

    // Adjust start if we're near the end
    if (end - start + 1 < maxPageNumbers) {
      start = Math.max(1, end - maxPageNumbers + 1);
    }

    const pages = [];
    
    // Add first page and ellipsis if needed
    if (start > 1) {
      pages.push(1);
      if (start > 2) {
        pages.push('...');
      }
    }

    // Add visible pages
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    // Add ellipsis and last page if needed
    if (end < totalPages) {
      if (end < totalPages - 1) {
        pages.push('...');
      }
      pages.push(totalPages);
    }

    return pages;
  };

  const visiblePages = getVisiblePages();
  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  const pageSizeOptions = [25, 50, 100, 200, 500];

  if (totalPages <= 1 && !showPageSizeSelector) {
    return null;
  }

  return (
    <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
      {/* Mobile pagination */}
      <div className="flex-1 flex justify-between sm:hidden">
        <button
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1 || loading}
          className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Vorherige
        </button>
        <button
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages || loading}
          className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Nächste
        </button>
      </div>

      {/* Desktop pagination */}
      <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
        <div className="flex items-center gap-6">
          {/* Page info */}
          {showPageInfo && (
            <div>
              <p className="text-sm text-gray-700">
                Zeige{' '}
                <span className="font-medium">{startItem}</span>
                {' '}bis{' '}
                <span className="font-medium">{endItem}</span>
                {' '}von{' '}
                <span className="font-medium">{totalItems}</span>
                {' '}Ergebnissen
              </p>
            </div>
          )}

          {/* Page size selector */}
          {showPageSizeSelector && (
            <div className="flex items-center gap-2">
              <label htmlFor="pageSize" className="text-sm text-gray-700">
                Pro Seite:
              </label>
              <select
                id="pageSize"
                value={pageSize}
                onChange={(e) => onPageSizeChange(Number(e.target.value))}
                disabled={loading}
                className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 disabled:opacity-50"
              >
                {pageSizeOptions.map(size => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Page navigation */}
        {totalPages > 1 && (
          <div className="flex items-center gap-1">
            {/* First page */}
            <button
              onClick={() => onPageChange(1)}
              disabled={currentPage === 1 || loading}
              className="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed rounded-md"
              title="Erste Seite"
            >
              <ChevronsLeft size={16} />
            </button>

            {/* Previous page */}
            <button
              onClick={() => onPageChange(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1 || loading}
              className="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed rounded-md ml-1"
              title="Vorherige Seite"
            >
              <ChevronLeft size={16} />
            </button>

            {/* Page numbers */}
            {showPageNumbers && (
              <div className="flex items-center mx-2">
                {visiblePages.map((page, index) => {
                  if (page === '...') {
                    return (
                      <span
                        key={`ellipsis-${index}`}
                        className="relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700"
                      >
                        ...
                      </span>
                    );
                  }

                  const pageNum = page as number;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => onPageChange(pageNum)}
                      disabled={loading}
                      className={`relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                        currentPage === pageNum
                          ? 'z-10 bg-red-50 border border-red-500 text-red-600 font-semibold'
                          : 'bg-white border border-gray-300 text-gray-500 hover:bg-gray-50 disabled:opacity-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Next page */}
            <button
              onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages || loading}
              className="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed rounded-md mr-1"
              title="Nächste Seite"
            >
              <ChevronRight size={16} />
            </button>

            {/* Last page */}
            <button
              onClick={() => onPageChange(totalPages)}
              disabled={currentPage === totalPages || loading}
              className="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed rounded-md"
              title="Letzte Seite"
            >
              <ChevronsRight size={16} />
            </button>

            {/* Page jump input */}
            <div className="flex items-center gap-2 ml-4">
              <span className="text-sm text-gray-700">Gehe zu:</span>
              <input
                type="number"
                min="1"
                max={totalPages}
                placeholder="Seite"
                className="w-16 px-2 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    const page = parseInt((e.target as HTMLInputElement).value);
                    if (page >= 1 && page <= totalPages) {
                      onPageChange(page);
                      (e.target as HTMLInputElement).value = '';
                    }
                  }
                }}
                disabled={loading}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Pagination;
