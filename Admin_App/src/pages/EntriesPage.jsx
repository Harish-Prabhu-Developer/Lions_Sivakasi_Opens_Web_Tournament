import React, { useState, useEffect, useCallback } from "react";
import { Filter, Loader2, Download, Eye } from "lucide-react";
import toast from "react-hot-toast";
import axios from "axios";

import Pagination from "../components/Pagination";
import { API_URL } from "../config";

import FilterModel from "../components/Entries/FilterModel";
import SearchBar from "../components/SearchBar";
import { useNavigate } from "react-router-dom";
import { getHeaders } from "../redux/Slices/EntriesSlice";

const EntriesPage = () => {
  const [entries, setEntries] = useState([]);
  const [allEntries, setAllEntries] = useState([]); // Store all fetched entries
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    statusFilter: [],
    categoryFilter: [],
    typeFilter: [],
    genderFilter: [],
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilter, setShowFilter] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]);
  const navigate = useNavigate();
  const [pagination, setPagination] = useState({
    currentPage: 1,
    limit: 10,
    totalPages: 1,
    total: 0,
  });

  const availableFilters = {
    statusFilter: ["pending", "approved", "rejected"],
    categoryFilter: [
      "Under 09",
      "Under 11",
      "Under 13",
      "Under 15",
      "Under 17",
      "Under 19",
    ],
    typeFilter: ["singles", "doubles", "mixed doubles"],
    genderFilter: ["boys", "girls"],
  };


  // Calculate if all rows are selected
  const isAllSelected = selectedRows.length > 0 && selectedRows.length === entries.length;

  // Toggle select all rows
  const toggleSelectAll = (entryIds) => {
    if (isAllSelected) {
      setSelectedRows([]);
    } else {
      setSelectedRows([...entryIds]);
    }
  };

  // Toggle individual row selection
  const toggleRowSelection = (entryId) => {
    if (selectedRows.includes(entryId)) {
      setSelectedRows(selectedRows.filter(id => id !== entryId));
    } else {
      setSelectedRows([...selectedRows, entryId]);
    }
  };

  // Handle view details
  const onViewDetails = (entryId) => {
    console.log("View details for entry:", entryId);
  };

  // Apply filters to entries
  const applyFilters = useCallback((entriesData) => {
    if (!entriesData || !Array.isArray(entriesData)) return [];

    let filteredData = entriesData;

    // Apply search filter first
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filteredData = filteredData.filter(entry => {
        const playerName = entry.player?.name?.toLowerCase() || '';
        const tnbaId = entry.player?.TnBaId?.toLowerCase() || '';
        const eventCategory = entry.eventCategory?.toLowerCase() || '';
        const eventType = entry.eventType?.toLowerCase() || '';
        const partnerName = entry.partner?.fullname?.toLowerCase() || '';
        
        return playerName.includes(query) || 
               tnbaId.includes(query) || 
               eventCategory.includes(query) || 
               eventType.includes(query) || 
               partnerName.includes(query);
      });
    }

    // Apply other filters
    filteredData = filteredData.filter(entry => {
      // Status filter
      if (filters.statusFilter.length > 0 && !filters.statusFilter.includes(entry.eventStatus)) {
        return false;
      }

      // Category filter
      if (filters.categoryFilter.length > 0 && !filters.categoryFilter.includes(entry.eventCategory)) {
        return false;
      }

      // Type filter
      if (filters.typeFilter.length > 0 && !filters.typeFilter.includes(entry.eventType)) {
        return false;
      }

      // Gender filter
      if (filters.genderFilter.length > 0) {
        const entryGender = entry.player?.gender?.toLowerCase();
        let genderMatch = false;
        
        if (entryGender === 'male' && filters.genderFilter.includes('boys')) {
          genderMatch = true;
        } else if (entryGender === 'female' && filters.genderFilter.includes('girls')) {
          genderMatch = true;
        }
        
        if (!genderMatch) return false;
      }

      return true;
    });

    return filteredData;
  }, [filters, searchQuery]);

  // ✅ Fetch Entries from Backend
  const fetchEntries = useCallback(async () => {
    try {
      setLoading(true);

      const { data } = await axios.get(
        `${API_URL}/api/v1/entry/admin/entries?page=${pagination.currentPage}&limit=${pagination.limit}`,
        getHeaders()
      );

      if (data.success) {
        // Handle both possible response structures
        const entriesData = Array.isArray(data.data) ? data.data : (data.data.entries || data.data || []);
        
        // Store all entries for client-side filtering
        setAllEntries(entriesData);
        
        // Apply filters to the fetched data
        const filteredEntries = applyFilters(entriesData);
        setEntries(filteredEntries);
        
        // Calculate pagination based on filtered data
        const totalFiltered = filteredEntries.length;
        const totalPages = Math.ceil(totalFiltered / pagination.limit);
        
        setPagination((prev) => ({
          ...prev,
          totalPages: totalPages,
          total: totalFiltered,
        }));
      } else {
        toast.error("Failed to fetch entries");
      }
    } catch (err) {
      console.error("❌ Error fetching entries:", err);
      toast.error(err.response?.data?.msg || "Error fetching entries");
    } finally {
      setLoading(false);
    }
  }, [pagination.currentPage, pagination.limit, applyFilters]);

  // Apply filters when filters or search query change
  useEffect(() => {
    if (allEntries.length > 0) {
      const filteredEntries = applyFilters(allEntries);
      
      // Calculate pagination for filtered data
      const totalFiltered = filteredEntries.length;
      const totalPages = Math.ceil(totalFiltered / pagination.limit);
      
      // Ensure current page is valid after filtering
      const validCurrentPage = Math.min(pagination.currentPage, Math.max(1, totalPages));
      
      // Get paginated data for current page
      const startIndex = (validCurrentPage - 1) * pagination.limit;
      const endIndex = startIndex + pagination.limit;
      const paginatedEntries = filteredEntries.slice(startIndex, endIndex);
      
      setEntries(paginatedEntries);
      setPagination(prev => ({
        ...prev,
        currentPage: validCurrentPage,
        totalPages: totalPages,
        total: totalFiltered,
      }));
    }
  }, [filters, searchQuery, allEntries, applyFilters, pagination.limit]);

  // Initial data fetch
  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  // Handle filter apply from FilterModel
  const handleApplyFilters = (newFilters) => {
    setFilters(newFilters);
    // Reset to first page when filters change
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  // Clear all filters
  const clearAllFilters = () => {
    setFilters({
      statusFilter: [],
      categoryFilter: [],
      typeFilter: [],
      genderFilter: [],
    });
    setSearchQuery("");
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  // ✅ Export CSV
  const exportCSV = () => {
    // Export all filtered entries, not just current page
    const filteredEntries = applyFilters(allEntries);
    
    if (filteredEntries.length === 0) {
      toast.error("No data to export");
      return;
    }

    const headers = [
      "Player Name",
      "TNBA ID",
      "Gender",
      "Event Type",
      "Category",
      "Status",
      "Partner Name",
      "Payment Status",
      "Payment App",
      "Registered On",
    ];

    const rows = filteredEntries.map((e) => [
      e.player?.name || "-",
      e.player?.TnBaId || "-",
      e.player?.gender === 'male' ? 'boys' : e.player?.gender === 'female' ? 'girls' : '-',
      e.eventType || "-",
      e.eventCategory || "-",
      e.eventStatus || "-",
      e.partner?.fullname || "-",
      e.payment?.status || "-",
      e.payment?.app || "-",
      new Date(e.registrationDate).toLocaleDateString(),
    ]);

    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "entries.csv";
    link.click();
    window.URL.revokeObjectURL(url);
  };

  // ✅ Pagination handlers
  const handlePageChange = (newPage) => {
    setPagination((prev) => ({ ...prev, currentPage: newPage }));
    
    // Apply pagination to filtered data
    if (allEntries.length > 0) {
      const filteredEntries = applyFilters(allEntries);
      const startIndex = (newPage - 1) * pagination.limit;
      const endIndex = startIndex + pagination.limit;
      const paginatedEntries = filteredEntries.slice(startIndex, endIndex);
      setEntries(paginatedEntries);
    }
  };

  // ✅ Handle limit change
  const handleLimitChange = (newLimit) => {
    const newLimitValue = parseInt(newLimit);
    setPagination(prev => ({ 
      ...prev, 
      limit: newLimitValue,
      currentPage: 1 // Reset to first page when changing limit
    }));
  };

  // Get entry IDs for current page
  const paginatedDataIds = entries.map(entry => entry.eventId || entry.id);

  // Get gender display text
  const getGenderDisplay = (gender) => {
    if (gender === 'male') return 'boys';
    if (gender === 'female') return 'girls';
    return '-';
  };

  // Check if any filters are active
  const hasActiveFilters = 
    filters.statusFilter.length > 0 ||
    filters.categoryFilter.length > 0 ||
    filters.typeFilter.length > 0 ||
    filters.genderFilter.length > 0 ||
    searchQuery.trim() !== '';

  // Get total filtered count for display
  const totalFilteredCount = allEntries.length > 0 ? applyFilters(allEntries).length : 0;

  // ✅ UI: Loading or Empty
  if (loading && entries.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        <Loader2 className="w-6 h-6 animate-spin mr-2" />
        Loading entries...
      </div>
    );
  }

  if (!loading && entries.length === 0) {
    return (
      <div className="p-5 space-y-5">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h1 className="text-xl font-semibold text-gray-800">Entries</h1>

          <div className="flex items-center gap-2">
            {/* Search Bar */}
            <SearchBar searchTerm={searchQuery} setSearchTerm={setSearchQuery} />

            <button
              onClick={() => setShowFilter(true)}
              className="flex items-center gap-1 px-3 py-2 text-sm border rounded-lg hover:bg-gray-50 transition"
            >
              <Filter className="w-4 h-4" /> Filters
              {hasActiveFilters && (
                <span className="ml-1 w-2 h-2 bg-indigo-600 rounded-full"></span>
              )}
            </button>

            <button
              onClick={exportCSV}
              className="flex items-center gap-1 px-3 py-2 text-sm border rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition"
            >
              <Download className="w-4 h-4" /> Export
            </button>
          </div>
        </div>

        {/* Records Count and Show Limit */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-sm text-gray-600">
          <div>
            Showing <span className="font-semibold">0</span> of{" "}
            <span className="font-semibold">0</span> records
            {hasActiveFilters && " (filtered)"}
          </div>
          
          <div className="flex items-center gap-2">
            <span>Show:</span>
            <select 
              value={pagination.limit}
              onChange={(e) => handleLimitChange(e.target.value)}
              className="border rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
          </div>
        </div>

        {/* Active Filters Indicator */}
        {hasActiveFilters && (
          <div className="flex flex-wrap gap-2 text-sm">
            {filters.statusFilter.length > 0 && (
              <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded">
                Status: {filters.statusFilter.join(", ")}
              </span>
            )}
            {filters.categoryFilter.length > 0 && (
              <span className="px-2 py-1 bg-green-100 text-green-800 rounded">
                Category: {filters.categoryFilter.join(", ")}
              </span>
            )}
            {filters.typeFilter.length > 0 && (
              <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded">
                Type: {filters.typeFilter.join(", ")}
              </span>
            )}
            {filters.genderFilter.length > 0 && (
              <span className="px-2 py-1 bg-pink-100 text-pink-800 rounded">
                Gender: {filters.genderFilter.join(", ")}
              </span>
            )}
            {searchQuery && (
              <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded">
                Search: "{searchQuery}"
              </span>
            )}
            <button
              onClick={clearAllFilters}
              className="px-2 py-1 text-gray-600 hover:text-gray-800 underline"
            >
              Clear all
            </button>
          </div>
        )}

        {/* Empty State Table */}
        <div className="overflow-x-auto border rounded-lg p-10 shadow-sm bg-white">
                  <div className="flex flex-col items-center justify-center text-gray-500">
                    <Filter className="w-12 h-12 mb-4 text-gray-400" strokeWidth={1.5} />
                    <p className="text-lg font-medium text-gray-900 mb-2">
                      No entries found matching your criteria.
                    </p>
                    <p className="text-sm text-gray-600 mb-4">
                      Try adjusting your filters or search terms.
                    </p>
                    {hasActiveFilters && (
                      <button
                        onClick={clearAllFilters}
                        className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                      >
                        Clear all filters
                      </button>
                    )}
                  </div>
          
        </div>
      </div>
    );
  }

  return (
    <div className="p-5 space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h1 className="text-xl font-semibold text-gray-800">Entries</h1>

        <div className="flex items-center gap-2">
          {/* Search Bar */}
          <SearchBar searchTerm={searchQuery} setSearchTerm={setSearchQuery} />

          <button
            onClick={() => setShowFilter(true)}
            className="flex items-center gap-1 px-3 py-2 text-sm border rounded-lg hover:bg-gray-50 transition"
          >
            <Filter className="w-4 h-4" /> Filters
            {hasActiveFilters && (
              <span className="ml-1 w-2 h-2 bg-indigo-600 rounded-full"></span>
            )}
          </button>

          <button
            onClick={exportCSV}
            className="flex items-center gap-1 px-3 py-2 text-sm border rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition"
          >
            <Download className="w-4 h-4" /> Export
          </button>
        </div>
      </div>

      {/* Records Count and Show Limit */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-sm text-gray-600">
        <div>
          Showing{" "}
          <span className="font-semibold">
            {Math.min((pagination.currentPage - 1) * pagination.limit + 1, totalFilteredCount)}-
            {Math.min(pagination.currentPage * pagination.limit, totalFilteredCount)}
          </span>{" "}
          of <span className="font-semibold">{totalFilteredCount}</span> entries
          {hasActiveFilters && " (filtered)"}
        </div>
        
        <div className="flex items-center gap-2">
          <span>Show:</span>
          <select 
            value={pagination.limit}
            onChange={(e) => handleLimitChange(e.target.value)}
            className="border rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="10">10</option>
            <option value="20">20</option>
            <option value="50">50</option>
            <option value="100">100</option>
          </select>
        </div>
      </div>

      {/* Active Filters Indicator */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 text-sm">
          {filters.statusFilter.length > 0 && (
            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded">
              Status: {filters.statusFilter.join(", ")}
            </span>
          )}
          {filters.categoryFilter.length > 0 && (
            <span className="px-2 py-1 bg-green-100 text-green-800 rounded">
              Category: {filters.categoryFilter.join(", ")}
            </span>
          )}
          {filters.typeFilter.length > 0 && (
            <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded">
              Type: {filters.typeFilter.join(", ")}
            </span>
          )}
          {filters.genderFilter.length > 0 && (
            <span className="px-2 py-1 bg-pink-100 text-pink-800 rounded">
              Gender: {filters.genderFilter.join(", ")}
            </span>
          )}
          {searchQuery && (
            <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded">
              Search: "{searchQuery}"
            </span>
          )}
          <button
            onClick={clearAllFilters}
            className="px-2 py-1 text-gray-600 hover:text-gray-800 underline"
          >
            Clear all
          </button>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto border rounded-lg shadow-sm bg-white">
        <table className="min-w-full text-sm text-left">
          <thead className="bg-gray-100 text-gray-700 uppercase text-xs">
            <tr>
              {/* Select All Checkbox */}
              <th className="px-3 py-3 text-center w-12">
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  onChange={() => toggleSelectAll(paginatedDataIds)}
                  className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 cursor-pointer"
                />
              </th>

              {/* View Details Icon Column */}
              <th className="px-3 py-3 text-center text-xs font-bold text-gray-600 uppercase tracking-wider w-12">
                View
              </th>
              
              {/* S.No */}
              <th className="px-2 py-2 text-left text-xs font-bold text-gray-600 uppercase tracking-wider hidden sm:table-cell">
                S.No
              </th>
              
              <th className="p-3">Player</th>
              <th className="p-3">Gender</th>
              <th className="p-3">Category</th>
              <th className="p-3">Type</th>
              <th className="p-3">Partner</th>
              <th className="p-3">Status</th>
              <th className="p-3">Date</th>
              <th className="p-3">Payment</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry, index) => (
              <tr
                key={entry.eventId || entry.id}
                className="border-b hover:bg-gray-50 transition-colors"
              >
                {/* Select Checkbox */}
                <td className="px-3 py-4 whitespace-nowrap text-center w-12">
                  <input
                    type="checkbox"
                    checked={selectedRows.includes(entry.eventId || entry.id)}
                    onChange={(e) => {
                      e.stopPropagation();
                      toggleRowSelection(entry.eventId || entry.id);
                    }}
                    className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 cursor-pointer"
                  />
                </td>
                
                {/* View Details Icon */}
                <td className="px-3 py-4 whitespace-nowrap text-center text-sm font-medium w-12">
                  <button
                    className="p-1 rounded-full text-green-600 hover:bg-green-100 transition duration-150"
                    aria-label={`View details for entry ${entry.eventId || entry.id}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onViewDetails(entry.eventId || entry.id);
                      navigate(`/entryDetail/${entry.eventId || entry.id} `, { state: { entry } });
                    }}
                  >
                    <Eye className="w-5 h-5" />
                  </button>
                </td>
                
                {/* S.No */}
                <td className="px-2 py-2 whitespace-nowrap text-sm text-indigo-600 font-medium hidden sm:table-cell">
                  {(pagination.currentPage - 1) * pagination.limit + index + 1}
                </td>

                <td className="p-3">{entry.player?.name || "-"}</td>
                <td className="p-3 capitalize">{getGenderDisplay(entry.player?.gender)}</td>
                <td className="p-3">{entry.eventCategory}</td>
                <td className="p-3 capitalize">{entry.eventType}</td>
                <td className="p-3">{entry.partner?.fullname || "-"}</td>
                <td
                  className={`p-3 font-medium capitalize ${
                    entry.eventStatus === "approved"
                      ? "text-green-600"
                      : entry.eventStatus === "rejected"
                      ? "text-red-600"
                      : "text-yellow-600"
                  }`}
                >
                  {entry.eventStatus}
                </td>
                <td className="p-3">
                  {new Date(entry.registrationDate).toLocaleDateString()}
                </td>
                <td className="p-3">{entry.payment?.status || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <Pagination
        currentPage={pagination.currentPage}
        totalPages={pagination.totalPages}
        totalFilteredCount={totalFilteredCount}
        entriesPerPage={pagination.limit}
        onPageChange={handlePageChange}
      />

      {/* Filter Modal */}
      {showFilter && (
        <FilterModel
          filters={filters}
          setFilters={handleApplyFilters}
          availableFilters={availableFilters}
          onClose={() => setShowFilter(false)}
        />
      )}
    </div>
  );
};

export default EntriesPage;