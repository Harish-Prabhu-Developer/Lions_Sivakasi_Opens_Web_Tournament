import React, { useState, useEffect, useCallback } from "react";
import { Search, Filter, Loader2, Download } from "lucide-react";
import toast from "react-hot-toast";
import axios from "axios";

import Pagination from "../components/Pagination";
import { API_URL } from "../config";
import { getHeaders } from "../../../Player_App/src/redux/Slices/PlayerSlice";
import FilterModel from "../components/Entries/FilterModel";

const EntriesPage = () => {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    statusFilter: [],
    categoryFilter: [],
    typeFilter: [],
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilter, setShowFilter] = useState(false);

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
  };

  // ✅ Fetch Entries from Backend
  const fetchEntries = useCallback(async () => {
    try {
      setLoading(true);

      const params = {
        page: pagination.currentPage,
        limit: pagination.limit,
      };

      // Apply filters if selected
      if (filters.statusFilter.length > 0)
        params.status = filters.statusFilter.join(",");
      if (filters.categoryFilter.length > 0)
        params.category = filters.categoryFilter.join(",");
      if (filters.typeFilter.length > 0)
        params.type = filters.typeFilter.join(",");

      if (searchQuery.trim()) params.search = searchQuery.trim();

      const { data } = await axios.get(`${API_URL}/api/v1/entry/admin/entries?page=${pagination.currentPage}&limit=${pagination.limit}`,
       getHeaders(),
      );

      if (data.success) {
        setEntries(data.data);
        setPagination((prev) => ({
          ...prev,
          totalPages: data.pagination.totalPages,
          total: data.pagination.total,
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
  }, [pagination.currentPage, pagination.limit, filters, searchQuery]);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  // ✅ Export CSV
  const exportCSV = () => {
    if (entries.length === 0) {
      toast.error("No data to export");
      return;
    }

    const headers = [
      "Player Name",
      "TNBA ID",
      "Event Type",
      "Category",
      "Status",
      "Partner Name",
      "Payment Status",
      "Payment App",
      "Registered On",
    ];

    const rows = entries.map((e) => [
      e.player?.name || "-",
      e.player?.TnBaId || "-",
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
  };

  // ✅ UI: Loading or Empty
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        <Loader2 className="w-6 h-6 animate-spin mr-2" />
        Loading entries...
      </div>
    );
  }

  if (!loading && entries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-500">
        <Filter
          className="w-10 h-10 mb-2 text-gray-400"
          strokeWidth={1.5}
        />
        <p>No entries found.</p>
      </div>
    );
  }

  return (
    <div className="p-5 space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h1 className="text-xl font-semibold text-gray-800">Entries</h1>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search by player name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && fetchEntries()}
              className="pl-8 pr-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <button
            onClick={() => setShowFilter(true)}
            className="flex items-center gap-1 px-3 py-2 text-sm border rounded-lg hover:bg-gray-50 transition"
          >
            <Filter className="w-4 h-4" /> Filters
          </button>

          <button
            onClick={exportCSV}
            className="flex items-center gap-1 px-3 py-2 text-sm border rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition"
          >
            <Download className="w-4 h-4" /> Export
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto border rounded-lg shadow-sm bg-white">
        <table className="min-w-full text-sm text-left">
          <thead className="bg-gray-100 text-gray-700 uppercase text-xs">
            <tr>
              <th className="p-3">Player</th>
              <th className="p-3">Category</th>
              <th className="p-3">Type</th>
              <th className="p-3">Partner</th>
              <th className="p-3">Status</th>
              <th className="p-3">Payment</th>
              <th className="p-3">Date</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((e) => (
              <tr
                key={e.eventId}
                className="border-b hover:bg-gray-50 transition-colors"
              >
                <td className="p-3">{e.player?.name || "-"}</td>
                <td className="p-3">{e.eventCategory}</td>
                <td className="p-3 capitalize">{e.eventType}</td>
                <td className="p-3">{e.partner?.fullname || "-"}</td>
                <td
                  className={`p-3 font-medium capitalize ${
                    e.eventStatus === "approved"
                      ? "text-green-600"
                      : e.eventStatus === "rejected"
                      ? "text-red-600"
                      : "text-yellow-600"
                  }`}
                >
                  {e.eventStatus}
                </td>
                <td className="p-3">{e.payment?.status || "-"}</td>
                <td className="p-3">
                  {new Date(e.registrationDate).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <Pagination
        total={pagination.total}
        limit={pagination.limit}
        currentPage={pagination.currentPage}
        totalPages={pagination.totalPages}
        onPageChange={handlePageChange}
      />

      {/* Filter Modal */}
      {showFilter && (
        <FilterModel
          filters={filters}
          setFilters={setFilters}
          availableFilters={availableFilters}
          onClose={() => setShowFilter(false)}
        />
      )}
    </div>
  );
};

export default EntriesPage;
