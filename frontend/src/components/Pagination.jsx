import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

export default function Pagination({
  currentPage = 1,
  totalItems = 0,
  pageSize = 25,
  onPageChange,
  onPageSizeChange,
}) {
  const isAll = pageSize === 'ALL' || pageSize >= totalItems;
  const effectivePageSize = isAll ? Math.max(1, totalItems) : Number(pageSize);
  const totalPages = isAll ? 1 : Math.ceil(totalItems / effectivePageSize);

  if (totalItems === 0) return null;

  const startItem = (currentPage - 1) * effectivePageSize + 1;
  const endItem = Math.min(totalItems, currentPage * effectivePageSize);

  // Generate array of visible page numbers
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    let start = Math.max(1, currentPage - 2);
    let end = Math.min(totalPages, start + maxVisible - 1);

    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };

  return (
    <div className="pagination-bar">
      <div className="pagination-info">
        <span>
          Showing <strong>{startItem}</strong> to <strong>{endItem}</strong> of{' '}
          <strong>{totalItems.toLocaleString()}</strong> records
        </span>
      </div>

      <div className="pagination-controls">
        <div className="page-size-selector">
          <label htmlFor="pageSizeSelect">Rows per page:</label>
          <select
            id="pageSizeSelect"
            value={pageSize}
            onChange={(e) => {
              const val = e.target.value === 'ALL' ? 'ALL' : Number(e.target.value);
              onPageSizeChange(val);
            }}
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
            <option value={250}>250</option>
            <option value="ALL">All ({totalItems.toLocaleString()})</option>
          </select>
        </div>

        {!isAll && totalPages > 1 && (
          <div className="pagination-buttons">
            <button
              className="page-btn"
              disabled={currentPage === 1}
              onClick={() => onPageChange(1)}
              title="First Page"
            >
              <ChevronsLeft size={16} />
            </button>
            <button
              className="page-btn"
              disabled={currentPage === 1}
              onClick={() => onPageChange(currentPage - 1)}
              title="Previous Page"
            >
              <ChevronLeft size={16} />
            </button>

            {getPageNumbers()[0] > 1 && (
              <>
                <button className="page-btn" onClick={() => onPageChange(1)}>
                  1
                </button>
                {getPageNumbers()[0] > 2 && <span className="page-ellipsis">...</span>}
              </>
            )}

            {getPageNumbers().map((p) => (
              <button
                key={p}
                className={`page-btn ${p === currentPage ? 'active' : ''}`}
                onClick={() => onPageChange(p)}
              >
                {p}
              </button>
            ))}

            {getPageNumbers()[getPageNumbers().length - 1] < totalPages && (
              <>
                {getPageNumbers()[getPageNumbers().length - 1] < totalPages - 1 && (
                  <span className="page-ellipsis">...</span>
                )}
                <button className="page-btn" onClick={() => onPageChange(totalPages)}>
                  {totalPages}
                </button>
              </>
            )}

            <button
              className="page-btn"
              disabled={currentPage === totalPages}
              onClick={() => onPageChange(currentPage + 1)}
              title="Next Page"
            >
              <ChevronRight size={16} />
            </button>
            <button
              className="page-btn"
              disabled={currentPage === totalPages}
              onClick={() => onPageChange(totalPages)}
              title="Last Page"
            >
              <ChevronsRight size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
