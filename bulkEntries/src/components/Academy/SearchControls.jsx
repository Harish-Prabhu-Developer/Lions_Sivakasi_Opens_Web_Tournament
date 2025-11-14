// components/Academy/SearchControls.jsx
import React from "react";
import { Search, Grid3X3, Table } from "lucide-react";

const SearchControls = ({ 
  searchTerm, 
  setSearchTerm, 
  viewMode, 
  setViewMode, 
  onSearch,
  loading 
}) => {
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    // Debounce search API call
    const timeoutId = setTimeout(() => {
      onSearch(value);
    }, 500);
    return () => clearTimeout(timeoutId);
  };

  return (
    <div className="max-w-7xl mx-auto mb-8">
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        {/* Search Input */}
        <div className="relative flex-1 w-full sm:max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search players by name, TNBA ID, academy, place..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="w-full pl-10 pr-4 py-2 bg-[#192339] border border-cyan-400/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all"
            disabled={loading}
          />
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-2 bg-[#192339] border border-cyan-400/20 rounded-lg p-1">
          <button
            onClick={() => setViewMode("card")}
            className={`p-2 rounded-md transition-all ${
              viewMode === "card"
                ? "bg-cyan-600 text-white"
                : "text-gray-400 hover:text-white"
            }`}
            disabled={loading}
          >
            <Grid3X3 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode("table")}
            className={`p-2 rounded-md transition-all ${
              viewMode === "table"
                ? "bg-cyan-600 text-white"
                : "text-gray-400 hover:text-white"
            }`}
            disabled={loading}
          >
            <Table className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default SearchControls;