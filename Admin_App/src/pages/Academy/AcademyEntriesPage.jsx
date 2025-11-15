// AcademyEntriesPage.jsx
import React, { useState, useEffect, useMemo } from "react";
import { toast } from "react-hot-toast";
import { 
  Loader2, Filter, Eye, Download 
} from "lucide-react";

import SearchBar from "../../components/SearchBar";
import StatusModal from "../../components/StatusModal";
import Pagination from "../../components/Pagination";

// --------------------
// MOCK DATA
// --------------------
const mockData = [
  {
    id: "E001",
    player: { name: "Harish", phone: "9876543210", gender: "M", TnBaId: "TN001" },
    eventCategory: "U19",
    eventType: "Singles",
    partner: null,
    eventStatus: "pending",
    registrationDate: "2024-12-01",
    payment: { status: "unpaid" },
  },
  {
    id: "E002",
    player: { name: "Prabu", phone: "9876500000", gender: "M", TnBaId: "TN002" },
    eventCategory: "U17",
    eventType: "Doubles",
    partner: { fullname: "Vishnu" },
    eventStatus: "approved",
    registrationDate: "2024-11-20",
    payment: { status: "paid" },
  }
];

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
  });

  // FILTERS
  const [filters, setFilters] = useState({
    statusFilter: [],
    categoryFilter: [],
    typeFilter: [],
    genderFilter: [],
  });

  // LOADING
  const [loading, setLoading] = useState(false);

  // ----------------------------
  // FILTER LOGIC
  // ----------------------------

  const hasActiveFilters =
    filters.statusFilter.length ||
    filters.categoryFilter.length ||
    filters.typeFilter.length ||
    filters.genderFilter.length ||
    searchQuery.trim();

  // Apply filters + search
  const filteredEntries = useMemo(() => {
    return mockData.filter((e) => {
      let match = true;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        match =
          e.player?.name?.toLowerCase().includes(q) ||
          e.player?.phone?.includes(q) ||
          e.player?.TnBaId?.toLowerCase().includes(q);
      }

      if (filters.statusFilter.length) {
        match = match && filters.statusFilter.includes(e.eventStatus);
      }
      if (filters.categoryFilter.length) {
        match = match && filters.categoryFilter.includes(e.eventCategory);
      }
      if (filters.typeFilter.length) {
        match = match && filters.typeFilter.includes(e.eventType);
      }
      if (filters.genderFilter.length) {
        match = match && filters.genderFilter.includes(e.player?.gender);
      }

      return match;
    });
  }, [filters, searchQuery]);

  const totalFilteredCount = filteredEntries.length;

  // PAGINATION DATA
  const paginatedData = useMemo(() => {
    const start = (pagination.currentPage - 1) * pagination.limit;
    return filteredEntries.slice(start, start + pagination.limit);
  }, [pagination, filteredEntries]);

  const paginatedDataIds = paginatedData.map((e) => e.id);

  // ----------------------------
  // Event Handlers
  // ----------------------------

  const handleLimitChange = (limit) => {
    setPagination((prev) => ({ ...prev, limit: Number(limit), currentPage: 1 }));
  };

  const handlePageChange = (page) => {
    setPagination((prev) => ({ ...prev, currentPage: page }));
  };

  const clearAllFilters = () => {
    setFilters({
      statusFilter: [],
      categoryFilter: [],
      typeFilter: [],
      genderFilter: [],
    });
    setSearchQuery("");
  };

  const toggleRowSelection = (id) => {
    setSelectedRows((prev) =>
      prev.includes(id)
        ? prev.filter((v) => v !== id)
        : [...prev, id]
    );
  };

  const isAllSelected = paginatedDataIds.every((id) =>
    selectedRows.includes(id)
  );

  const toggleSelectAll = () => {
    if (isAllSelected) {
      // remove all
      setSelectedRows((prev) =>
        prev.filter((id) => !paginatedDataIds.includes(id))
      );
    } else {
      // add all
      setSelectedRows((prev) => [...new Set([...prev, ...paginatedDataIds])]);
    }
  };

  const onViewDetails = (entry) => {
    toast("Showing details coming soon!");
  };

  const handleStatus = (entry) => {
    setSelectedEntry(entry);
    setSelectedStatus(entry.eventStatus);
    setShowUpdateModal(true);
  };

  const handleCloseUpdateModal = () => {
    setShowUpdateModal(false);
  };

  const handleUpdateStatus = () => {
    toast.success("Status updated!");
    setShowUpdateModal(false);
  };

  const exportCSV = () => {
    toast.success("Exported mock CSV!");
  };

  const getGenderDisplay = (g) =>
    g === "M" ? "Male" : g === "F" ? "Female" : "-";

  return (
    <div className="p-4 w-full space-y-5">

      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h1 className="text-xl font-semibold text-gray-800">Entries</h1>

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
              No entries found matching your criteria.
            </p>
            <button
              onClick={clearAllFilters}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg mt-3"
            >
              Clear all filters
            </button>
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
                <th className="px-3 py-3">Phone</th>
                <th className="px-3 py-3">Gender</th>
                <th className="px-3 py-3">Category</th>
                <th className="px-3 py-3">Type</th>
                <th className="px-3 py-3">Partner</th>
                <th className="px-3 py-3">Status</th>
                <th className="px-3 py-3">Date</th>
                <th className="px-3 py-3">Payment</th>
              </tr>
            </thead>

            <tbody>
              {paginatedData.map((entry) => (
                <tr key={entry.id} className="border-b hover:bg-gray-50">
                  <td className="px-3 py-3 text-center">
                    <input
                      type="checkbox"
                      checked={selectedRows.includes(entry.id)}
                      onChange={() => toggleRowSelection(entry.id)}
                    />
                  </td>

                  <td className="px-3 py-3 text-center">
                    <button onClick={() => onViewDetails(entry)}>
                      <Eye className="w-5 h-5 text-green-600" />
                    </button>
                  </td>

                  <td className="px-3 py-3">{entry.player?.name}</td>
                  <td className="px-3 py-3">{entry.player?.TnBaId}</td>
                  <td className="px-3 py-3">{entry.player?.phone}</td>
                  <td className="px-3 py-3">{getGenderDisplay(entry.player?.gender)}</td>
                  <td className="px-3 py-3">{entry.eventCategory}</td>
                  <td className="px-3 py-3">{entry.eventType}</td>
                  <td className="px-3 py-3">{entry.partner?.fullname || "-"}</td>

                  <td
                    className={`px-3 py-3 cursor-pointer ${
                      entry.eventStatus === "approved"
                        ? "text-green-600"
                        : entry.eventStatus === "rejected"
                        ? "text-red-600"
                        : "text-yellow-600"
                    }`}
                    onClick={() => handleStatus(entry)}
                  >
                    {entry.eventStatus}
                  </td>

                  <td className="px-3 py-3">
                    {new Date(entry.registrationDate).toLocaleDateString()}
                  </td>

                  <td className="px-3 py-3">{entry.payment?.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* PAGINATION */}
      <Pagination
        currentPage={pagination.currentPage}
        totalPages={Math.ceil(totalFilteredCount / pagination.limit)}
        entriesPerPage={pagination.limit}
        onPageChange={handlePageChange}
      />

      {/* STATUS MODAL */}
      {showUpdateModal && selectedEntry && (
        <StatusModal
          entry={selectedEntry}
          selectedStatus={selectedStatus}
          setSelectedStatus={setSelectedStatus}
          handleCloseUpdateModal={handleCloseUpdateModal}
          handleUpdateStatus={handleUpdateStatus}
        />
      )}
    </div>
  );
};

export default AcademyEntriesPage;
