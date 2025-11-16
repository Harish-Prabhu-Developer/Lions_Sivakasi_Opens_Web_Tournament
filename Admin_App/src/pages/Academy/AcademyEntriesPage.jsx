// AcademyEntriesPage.jsx
import React, { useState, useEffect, useMemo } from "react";
import { toast } from "react-hot-toast";
import { Loader2, Filter, Eye, Download } from "lucide-react";
import axios from "axios";

import SearchBar from "../../components/SearchBar";
import StatusModal from "../../components/StatusModal";
import Pagination from "../../components/Pagination";
import { API_URL } from "../../config";
import AcademyStatusModal from "./AcademyStatusModal";
import { useNavigate } from "react-router-dom";
import AcademyFilterModel from "./AcademyFilterModel";

const AcademyEntriesPage = () => {
  // SEARCH
  const [searchQuery, setSearchQuery] = useState("");

  // FILTER MODAL
  const [showFilter, setShowFilter] = useState(false);

  // STATUS MODAL
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [showUpdateModal, setShowUpdateModal] = useState(false);

  // TABLE SELECTION
  const [selectedRows, setSelectedRows] = useState([]);

  // PAGINATION
  const [pagination, setPagination] = useState({
    currentPage: 1,
    limit: 10,
    totalEntries: 0,
    totalPages: 0
  });

  // FILTERS
  const [filters, setFilters] = useState({
    statusFilter: [],
    categoryFilter: [],
    typeFilter: [],
    academyFilter: [],
    partnerFilter: [],
    playerFilter: []
  });

  // LOADING
  const [loading, setLoading] = useState(false);
  const [entries, setEntries] = useState([]);
  const [allEntries, setAllEntries] = useState([]); // Store all entries for client-side filtering
  const navigate = useNavigate();

  // Extract available filters from all entries data
  const availableFilters = useMemo(() => {
    if (!allEntries.length) {
      return {
        categoryFilter: [],
        typeFilter: [],
        statusFilter: [],
        academyFilter: [],
        partnerFilter: [],
        playerFilter: []
      };
    }

    // Extract unique values for each filter category
    const categories = [...new Set(allEntries.map(entry => entry.eventCategory).filter(Boolean))];
    const types = [...new Set(allEntries.map(entry => entry.eventType).filter(Boolean))];
    const statuses = [...new Set(allEntries.map(entry => entry.eventStatus).filter(Boolean))];
    const academies = [...new Set(allEntries.map(entry => entry.Academy?.academyName).filter(Boolean))];
    const partners = [...new Set(allEntries.map(entry => entry.partner?.fullName).filter(Boolean))];
    const players = [...new Set(allEntries.map(entry => entry.player?.fullName).filter(Boolean))];

    return {
      categoryFilter: categories,
      typeFilter: types,
      statusFilter: statuses,
      academyFilter: academies,
      partnerFilter: partners,
      playerFilter: players
    };
  }, [allEntries]);

  // Apply client-side filtering
  const filteredEntries = useMemo(() => {
    if (!allEntries.length) return [];

    return allEntries.filter(entry => {
      // Search filter
      const matchesSearch = searchQuery.trim() === "" || 
        entry.player?.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entry.Academy?.academyName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entry.partner?.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entry.player?.tnbaId?.toLowerCase().includes(searchQuery.toLowerCase());

      // Status filter
      const matchesStatus = filters.statusFilter.length === 0 || 
        filters.statusFilter.includes(entry.eventStatus);

      // Category filter
      const matchesCategory = filters.categoryFilter.length === 0 || 
        filters.categoryFilter.includes(entry.eventCategory);

      // Type filter
      const matchesType = filters.typeFilter.length === 0 || 
        filters.typeFilter.includes(entry.eventType);

      // Academy filter
      const matchesAcademy = filters.academyFilter.length === 0 || 
        filters.academyFilter.includes(entry.Academy?.academyName);

      // Partner filter
      const matchesPartner = filters.partnerFilter.length === 0 || 
        filters.partnerFilter.includes(entry.partner?.fullName);

      // Player filter
      const matchesPlayer = filters.playerFilter.length === 0 || 
        filters.playerFilter.includes(entry.player?.fullName);

      return matchesSearch && matchesStatus && matchesCategory && 
             matchesType && matchesAcademy && matchesPartner && matchesPlayer;
    });
  }, [allEntries, searchQuery, filters]);

  // Paginate filtered entries
  const paginatedEntries = useMemo(() => {
    const startIndex = (pagination.currentPage - 1) * pagination.limit;
    const endIndex = startIndex + pagination.limit;
    return filteredEntries.slice(startIndex, endIndex);
  }, [filteredEntries, pagination.currentPage, pagination.limit]);

  // ----------------------------
  // API INTEGRATION - Fetch all data once
  // ----------------------------

  const fetchAllEntries = async () => {
    try {
      setLoading(true);
      
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${API_URL}/api/v2/academy/entry/admin/academy-entries`, 
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      console.log("API Response:", response.data);

      if (response.data.success) {
        const allData = response.data.data || [];
        setAllEntries(allData);
        setEntries(paginatedEntries); // Set initial paginated entries
        setPagination(prev => ({
          ...prev,
          totalEntries: allData.length,
          totalPages: Math.ceil(allData.length / prev.limit)
        }));
      } else {
        toast.error(response.data.msg || "Failed to fetch entries");
      }
    } catch (error) {
      console.error("Error fetching entries:", error);
      if (error.response?.data?.msg) {
        toast.error(error.response.data.msg);
      } else {
        toast.error("Error loading entries");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllEntries();
  }, []);

  // Update paginated entries when filters change
  useEffect(() => {
    setEntries(paginatedEntries);
    setPagination(prev => ({
      ...prev,
      totalEntries: filteredEntries.length,
      totalPages: Math.ceil(filteredEntries.length / prev.limit),
      currentPage: 1 // Reset to first page when filters change
    }));
  }, [paginatedEntries, filteredEntries]);

  // No need for local filtering since we handle it client-side
  const totalFilteredCount = filteredEntries.length;

  // ----------------------------
  // Event Handlers
  // ----------------------------

  const handleLimitChange = (limit) => {
    setPagination((prev) => ({
      ...prev,
      limit: Number(limit),
      currentPage: 1,
    }));
  };

  const handlePageChange = (page) => {
    setPagination((prev) => ({ ...prev, currentPage: page }));
  };

  const clearAllFilters = () => {
    setFilters({
      statusFilter: [],
      categoryFilter: [],
      typeFilter: [],
      academyFilter: [],
      partnerFilter: [],
      playerFilter: []
    });
    setSearchQuery("");
  };

  const toggleRowSelection = (id) => {
    setSelectedRows((prev) =>
      prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]
    );
  };

  const isAllSelected = entries.length > 0 && entries.every((entry) =>
    selectedRows.includes(entry.eventId)
  );

  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedRows([]);
    } else {
      setSelectedRows(entries.map(entry => entry.eventId));
    }
  };

  const onViewDetails = (entry) => {
    const eventDetails = `Category: ${entry.eventCategory}\nType: ${entry.eventType}\nStatus: ${entry.eventStatus}\nPlayer: ${entry.player?.fullName}\nAcademy: ${entry.Academy?.academyName}`;
    
    toast.success(eventDetails, { duration: 5000 });
  };

  const handleStatus = (entry) => {
    setSelectedEntry(entry);
    setSelectedStatus(entry.eventStatus);
    setShowUpdateModal(true);
  };

  const handleCloseUpdateModal = () => {
    setShowUpdateModal(false);
  };

  const handleUpdateStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await axios.put(
        `${API_URL}/api/v2/academy/entry/${selectedEntry.id}/events/${selectedEntry.eventId}`,
        { status: selectedStatus },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.data.success) {
        toast.success("Status updated successfully!");
        setShowUpdateModal(false);
        fetchAllEntries(); // Refresh all data
      } else {
        toast.error(response.data.msg || "Failed to update status");
      }
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Failed to update status");
    }
  };

  const exportCSV = () => {
    const headers = ['Player Name', 'TNBA ID', 'Academy', 'Category', 'Type', 'Partner', 'Status', 'Registration Date', 'Payment Status'];
    const csvData = filteredEntries.map(entry => [
      entry.player?.fullName || '',
      entry.player?.tnbaId || '',
      entry.Academy?.academyName || '',
      entry.eventCategory,
      entry.eventType,
      entry.partner?.fullName || '-',
      entry.eventStatus,
      new Date(entry.registrationDate).toLocaleDateString('en-IN'),
      entry.payment?.status || 'Pending'
    ]);

    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `academy-entries-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast.success("CSV exported successfully!");
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "approved": return "text-green-600 bg-green-50 px-2 py-1 rounded";
      case "rejected": return "text-red-600 bg-red-50 px-2 py-1 rounded";
      case "pending": return "text-yellow-600 bg-yellow-50 px-2 py-1 rounded";
      default: return "text-gray-600 bg-gray-50 px-2 py-1 rounded";
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-IN');
  };

  if (loading && allEntries.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        <span className="ml-2">Loading entries...</span>
      </div>
    );
  }

  return (
    <div className="p-4 w-full space-y-5">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h1 className="text-xl font-semibold text-gray-800">Academy Entries</h1>

        <div className="flex items-center gap-2">
          <SearchBar searchTerm={searchQuery} setSearchTerm={setSearchQuery} />

          <button
            onClick={() => setShowFilter(true)}
            className="flex items-center gap-1 px-3 py-2 text-sm border rounded-lg hover:bg-gray-50 transition"
          >
            <Filter className="w-4 h-4" /> Filters
          </button>

          <button
            onClick={exportCSV}
            className="flex items-center gap-1 px-3 py-2 text-sm border rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition"
            disabled={totalFilteredCount === 0}
          >
            <Download className="w-4 h-4" /> Export
          </button>
        </div>
      </div>

      {/* RECORDS COUNT */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-sm text-gray-600">
        <span>
          Showing{" "}
          <b>
            {totalFilteredCount === 0
              ? 0
              : (pagination.currentPage - 1) * pagination.limit + 1}
            -
            {Math.min(
              pagination.currentPage * pagination.limit,
              totalFilteredCount
            )}
          </b>{" "}
          of <b>{totalFilteredCount}</b> entries
          {allEntries.length !== totalFilteredCount && (
            <span className="text-indigo-600 ml-1">
              (filtered from {allEntries.length} total entries)
            </span>
          )}
        </span>

        <div className="flex items-center gap-2">
          <span>Show:</span>
          <select
            value={pagination.limit}
            onChange={(e) => handleLimitChange(e.target.value)}
            className="border rounded px-2 py-1"
          >
            <option value="10">10</option>
            <option value="20">20</option>
            <option value="50">50</option>
          </select>
        </div>
      </div>

      {/* EMPTY STATE */}
      {totalFilteredCount === 0 && (
        <div className="overflow-x-auto border rounded-lg p-10 shadow-sm bg-white">
          <div className="flex flex-col items-center justify-center text-gray-500">
            <Filter className="w-12 h-12 mb-4 text-gray-400" />
            <p className="text-lg font-medium text-gray-900 mb-2">
              {allEntries.length === 0 ? "No paid entries found." : "No entries found matching your criteria."}
            </p>
            {(searchQuery || filters.statusFilter.length || filters.categoryFilter.length || filters.typeFilter.length || filters.academyFilter.length || filters.partnerFilter.length || filters.playerFilter.length) && (
              <button
                onClick={clearAllFilters}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg mt-3"
              >
                Clear all filters
              </button>
            )}
          </div>
        </div>
      )}

      {/* TABLE */}
      {totalFilteredCount > 0 && (
        <div className="overflow-x-auto border rounded-lg shadow-sm bg-white">
          <table className="min-w-full text-sm text-left">
            <thead className="bg-gray-100 text-gray-700 uppercase text-xs">
              <tr>
                <th className="px-3 py-3 text-center w-12">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    onChange={toggleSelectAll}
                  />
                </th>

                <th className="px-3 py-3 text-center">View</th>
                <th className="px-3 py-3">Player</th>
                <th className="px-3 py-3">Academy</th>
                <th className="px-3 py-3">Partner</th>
                <th className="px-3 py-3">Date</th>
                <th className="px-3 py-3">Status</th>
                <th className="px-3 py-3">Category</th>
                <th className="px-3 py-3">Type</th>
              </tr>
            </thead>

            <tbody>
              {entries.map((entry) => (
                <tr key={entry.eventId} className="border-b hover:bg-gray-50">
                  <td className="px-3 py-3 text-center">
                    <input
                      type="checkbox"
                      checked={selectedRows.includes(entry.eventId)}
                      onChange={() => toggleRowSelection(entry.eventId)}
                    />
                  </td>

                  <td className="px-3 py-3 text-center">
                    <button 
                      onClick={() => navigate(`/academyEntryDetail/${entry.id}`)}
                      className="hover:text-green-700 transition"
                      title="View Details"
                    >
                      <Eye className="w-5 h-5 text-green-600" />
                    </button>
                  </td>

                  <td className="px-3 py-3">
                    <div>
                      <div className="font-medium">{entry.player?.fullName}</div>
                      {entry.player?.tnbaId && (
                        <div className="text-xs text-gray-500">ID: {entry.player.tnbaId}</div>
                      )}
                    </div>
                  </td>
                  
                  <td className="px-3 py-3">
                    <div>
                      <div className="font-medium">{entry.Academy?.academyName}</div>
                      <div className="text-xs text-gray-500">{entry.Academy?.place}</div>
                    </div>
                  </td>
                  
                  <td className="px-3 py-3">
                    {entry.partner?.fullName ? (
                      <div>
                        <div className="font-medium">{entry.partner.fullName}</div>
                        {entry.partner.TnBaId && (
                          <div className="text-xs text-gray-500">ID: {entry.partner.TnBaId}</div>
                        )}
                      </div>
                    ) : (
                      "-"
                    )}
                  </td>

                  <td className="px-3 py-3">
                    {formatDate(entry.registrationDate)}
                  </td>

                  <td 
                    className="px-3 py-3 cursor-pointer"
                    onClick={() => handleStatus(entry)}
                  >
                    <span className={getStatusColor(entry.eventStatus)}>
                      {entry.eventStatus}
                    </span>
                  </td>

                  <td className="px-3 py-3">{entry.eventCategory}</td>
                  
                  <td className="px-3 py-3">{entry.eventType}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* PAGINATION */}
      <Pagination
        currentPage={pagination.currentPage}
        totalPages={pagination.totalPages}
        entriesPerPage={pagination.limit}
        onPageChange={handlePageChange}
      />

      {/* STATUS MODAL */}
      {showUpdateModal && selectedEntry && (
        <AcademyStatusModal
          entry={selectedEntry}
          selectedStatus={selectedStatus}
          setSelectedStatus={setSelectedStatus}
          handleCloseUpdateModal={handleCloseUpdateModal}
          handleUpdateStatus={handleUpdateStatus}
        />
      )}

      {/* FILTER MODAL */}
      {showFilter && (
        <AcademyFilterModel
          filters={filters}
          setFilters={setFilters}
          availableFilters={availableFilters}
          onClose={() => setShowFilter(false)}
        />
      )}
    </div>
  );
};

export default AcademyEntriesPage;