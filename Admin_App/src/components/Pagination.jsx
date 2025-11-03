// Pagination.jsx
import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const Pagination = ({
  currentPage,
  totalPages,
  totalFilteredCount,
  entriesPerPage,
  onPageChange,
}) => {
  if (totalPages <= 1) return null; // Hide pagination if only one page

  const handlePrev = () => {
    if (currentPage > 1) onPageChange(currentPage - 1);
  };

  const handleNext = () => {
    if (currentPage < totalPages) onPageChange(currentPage + 1);
  };

  const handlePageClick = (pageNum) => {
    if (pageNum !== currentPage) onPageChange(pageNum);
  };

  // Generate visible page numbers (smart pagination)
  const generatePageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    let start = Math.max(1, currentPage - 2);
    let end = Math.min(totalPages, start + maxVisible - 1);

    if (end - start < maxVisible - 1) start = Math.max(1, end - maxVisible + 1);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    return pages;
  };

  const startItem = (currentPage - 1) * entriesPerPage + 1;
  const endItem = Math.min(startItem + entriesPerPage - 1, totalFilteredCount);

  return (
    <div className="flex flex-col md:flex-row justify-between items-center mt-6 gap-3 text-sm text-gray-600">
      {/* Info Section */}
      <div className="text-center md:text-left">
        Showing{" "}
        <span className="font-medium text-gray-800">
          {startItem}-{endItem}
        </span>{" "}
        of{" "}
        <span className="font-medium text-gray-800">{totalFilteredCount}</span>{" "}
        entries
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center gap-1">
        {/* Prev */}
        <button
          onClick={handlePrev}
          disabled={currentPage === 1}
          className={`flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 transition ${
            currentPage === 1 ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          <ChevronLeft className="w-4 h-4" /> Prev
        </button>

        {/* Page Numbers */}
        {generatePageNumbers().map((page) => (
          <button
            key={page}
            onClick={() => handlePageClick(page)}
            className={`px-3 py-1.5 rounded-lg border transition font-medium ${
              currentPage === page
                ? "bg-indigo-600 text-white border-indigo-600 shadow-md"
                : "bg-white text-gray-700 border-gray-300 hover:bg-indigo-50 hover:text-indigo-700"
            }`}
          >
            {page}
          </button>
        ))}

        {/* Next */}
        <button
          onClick={handleNext}
          disabled={currentPage === totalPages}
          className={`flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 transition ${
            currentPage === totalPages ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          Next <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default Pagination;
