import React from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  ChevronsLeft, 
  ChevronsRight,
  MoreHorizontal 
} from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange?: (itemsPerPage: number) => void;
  showItemsPerPage?: boolean;
  showPageInfo?: boolean;
  showTotalItems?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
  showItemsPerPage = true,
  showPageInfo = true,
  showTotalItems = true,
  className = '',
  size = 'md'
}) => {
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = size === 'sm' ? 5 : size === 'md' ? 7 : 9;
    const halfVisible = Math.floor(maxVisiblePages / 2);

    let startPage = Math.max(1, currentPage - halfVisible);
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    // Adjust if we're near the end
    if (endPage - startPage < maxVisiblePages - 1) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    // Add first page and ellipsis if needed
    if (startPage > 1) {
      pages.push(1);
      if (startPage > 2) {
        pages.push('ellipsis-start');
      }
    }

    // Add visible pages
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    // Add ellipsis and last page if needed
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pages.push('ellipsis-end');
      }
      pages.push(totalPages);
    }

    return pages;
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      onPageChange(page);
    }
  };

  const sizeClasses = {
    sm: {
      button: 'px-2 py-1 text-sm',
      text: 'text-sm',
      select: 'text-sm py-1'
    },
    md: {
      button: 'px-3 py-2 text-sm',
      text: 'text-sm',
      select: 'text-sm py-2'
    },
    lg: {
      button: 'px-4 py-2 text-base',
      text: 'text-base',
      select: 'text-base py-2'
    }
  };

  const buttonClass = `
    ${sizeClasses[size].button}
    border border-gray-300 bg-white hover:bg-gray-50 
    focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent
    transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed
    disabled:hover:bg-white
  `;

  const activeButtonClass = `
    ${sizeClasses[size].button}
    border border-purple-500 bg-purple-600 text-white hover:bg-purple-700
    focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2
    transition-colors duration-200
  `;

  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className={`flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0 ${className}`}>
      {/* Items per page selector */}
      {showItemsPerPage && onItemsPerPageChange && (
        <div className="flex items-center space-x-2">
          <span className={`text-gray-700 ${sizeClasses[size].text}`}>Show:</span>
          <select
            value={itemsPerPage}
            onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
            className={`border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent ${sizeClasses[size].select}`}
          >
            <option value={12}>12</option>
            <option value={24}>24</option>
            <option value={48}>48</option>
            <option value={96}>96</option>
          </select>
          <span className={`text-gray-700 ${sizeClasses[size].text}`}>per page</span>
        </div>
      )}

      {/* Page info */}
      {showPageInfo && (
        <div className={`text-gray-700 ${sizeClasses[size].text} order-first sm:order-none`}>
          {showTotalItems && (
            <span>
              Showing {startItem} to {endItem} of {totalItems.toLocaleString()} results
            </span>
          )}
          {!showTotalItems && (
            <span>
              Page {currentPage} of {totalPages}
            </span>
          )}
        </div>
      )}

      {/* Pagination controls */}
      <div className="flex items-center space-x-1">
        {/* First page */}
        <button
          onClick={() => handlePageChange(1)}
          disabled={currentPage === 1}
          className={`${buttonClass} rounded-l-md`}
          title="First page"
        >
          <ChevronsLeft className="w-4 h-4" />
        </button>

        {/* Previous page */}
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={buttonClass}
          title="Previous page"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Page numbers */}
        <div className="flex items-center space-x-1">
          {getPageNumbers().map((page, index) => {
            if (page === 'ellipsis-start' || page === 'ellipsis-end') {
              return (
                <span
                  key={`ellipsis-${index}`}
                  className={`${sizeClasses[size].button} border border-gray-300 bg-white text-gray-400`}
                >
                  <MoreHorizontal className="w-4 h-4" />
                </span>
              );
            }

            const pageNumber = page as number;
            const isActive = pageNumber === currentPage;

            return (
              <button
                key={pageNumber}
                onClick={() => handlePageChange(pageNumber)}
                className={isActive ? activeButtonClass : buttonClass}
                title={`Page ${pageNumber}`}
              >
                {pageNumber}
              </button>
            );
          })}
        </div>

        {/* Next page */}
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={buttonClass}
          title="Next page"
        >
          <ChevronRight className="w-4 h-4" />
        </button>

        {/* Last page */}
        <button
          onClick={() => handlePageChange(totalPages)}
          disabled={currentPage === totalPages}
          className={`${buttonClass} rounded-r-md`}
          title="Last page"
        >
          <ChevronsRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default Pagination;
