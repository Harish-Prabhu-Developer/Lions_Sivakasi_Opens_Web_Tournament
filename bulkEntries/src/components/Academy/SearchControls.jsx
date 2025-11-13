// components/Academy/SearchControls.jsx
import React from "react";
import { Search, X, Grid, Table } from "lucide-react";

const SearchControls = ({ searchTerm, setSearchTerm, viewMode, setViewMode }) => {
  return (
    <div className="max-w-7xl mx-auto mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <input
          type="text"
          placeholder="Search players by name, TNBA ID, academy..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-[#192339]/80 border border-cyan-400/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm("")}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-400 hidden sm:block">View:</span>
        <div className="flex bg-[#192339]/80 border border-cyan-400/20 rounded-lg p-1">
          <button
            onClick={() => setViewMode("card")}
            className={`p-2 rounded-md transition-all ${
              viewMode === "card" 
                ? "bg-cyan-500 text-white" 
                : "text-gray-400 hover:text-white"
            }`}
            title="Card View"
          >
            <Grid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode("table")}
            className={`p-2 rounded-md transition-all ${
              viewMode === "table" 
                ? "bg-cyan-500 text-white" 
                : "text-gray-400 hover:text-white"
            }`}
            title="Table View"
          >
            <Table className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default SearchControls;