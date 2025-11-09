//UserPage.jsx
import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Loader2,
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  FileText,
  CheckCircle,
  XCircle,
  Trash2,
  ArrowDownToLine,
  Users,
  Building,
  ShieldCheck,
  Mail,
  ClipboardList,
} from "lucide-react";
import Pagination from "../components/Pagination";
import FilterModel from "../components/Entries/FilterModel";
import { API_URL } from "../config";
import axios from "axios";
import toast from "react-hot-toast";

import SearchBar from "../components/SearchBar";
import { getHeaders } from "../redux/Slices/EntriesSlice";
import ConfirmDeleteModel from "../components/ConfirmDeleteModel";

// --- HELPER COMPONENTS ---

// 1. Status Badge
const StatusBadge = ({ status }) => {
  const statusClasses = useMemo(() => {
    switch (status?.toLowerCase()) {
      case "approved":
        return "bg-green-100 text-green-700 ring-green-600/20";
      case "rejected":
        return "bg-red-100 text-red-700 ring-red-600/20";
      case "paid":
        return "bg-blue-100 text-blue-700 ring-blue-600/20";
      case "failed":
        return "bg-orange-100 text-orange-700 ring-orange-600/20";
      case "pending":
      default:
        return "bg-yellow-100 text-yellow-700 ring-yellow-600/20";
    }
  }, [status]);

  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${statusClasses} capitalize`}
    >
      {status}
    </span>
  );
};

// 2. CSV Export
const CSVExport = ({ data, columns, fileName }) => {
  const toCSV = (data) => {
    // Determine headers from columns (using a subset for clarity)
    const headerLabels = columns.map((col) => col.header).join(",");
    const headerKeys = columns.map((col) => col.accessor);

    // Map data to CSV rows
    const csvRows = data.map((row) => {
      return headerKeys
        .map((key) => {
          let value = row[key];
          // Handle complex objects for expansion row (if needed, simplified here)
          if (key === "detailedEvents") {
            value = JSON.stringify(value);
          }
          // Basic escaping
          if (typeof value === "string" && value.includes(",")) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value;
        })
        .join(",");
    });

    return [headerLabels, ...csvRows].join("\n");
  };

  const handleExport = () => {
    const csvString = toCSV(data);
    const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `${fileName}_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <button
      onClick={handleExport}
      className="flex items-center gap-2 px-3 py-2 bg-indigo-500 text-white rounded-xl shadow-lg hover:bg-indigo-600 transition duration-150 text-sm font-medium"
      title="Export all visible data to CSV"
    >
      <ArrowDownToLine className="w-5 h-5" />
      CSV Export
    </button>
  );
};

// 3. DetailCard for Expanded Row
const DetailCard = ({ event }) => {
  // Use status function for icon/color
  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case "approved":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "rejected":
        return <XCircle className="w-5 h-5 text-red-500" />;
      case "pending":
      default:
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
    }
  };

  return (
    <div className="bg-white p-4 rounded-xl shadow-inner border border-gray-100 flex flex-col md:flex-row gap-4">
      {/* Event Summary */}
      <div className="flex-1 space-y-2 border-b md:border-b-0 md:border-r border-gray-200 pr-4 pb-4 md:pb-0">
        <h3 className="text-lg font-semibold flex items-center gap-2 text-indigo-700">
          <ClipboardList className="w-5 h-5" />
          {event.category} - {event.type?.toUpperCase() || 'N/A'}
        </h3>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <DetailItem
            label="Status"
            value={<StatusBadge status={event.status} />}
          />
          <DetailItem
            label="Reg Date"
            value={event.RegistrationDate ? new Date(event.RegistrationDate).toLocaleDateString() : 'N/A'}
          />
        </div>
      </div>

      {/* Partner Details */}
      <div className="flex-1 space-y-2 border-b md:border-b-0 md:border-r border-gray-200 pr-4 pb-4 md:pb-0">
        <h4 className="text-base font-medium text-gray-800 flex items-center gap-2">
          <Users className="w-5 h-5 text-purple-500" />
          Partner Details
        </h4>
        {event.partner ? (
          <div className="text-xs text-gray-600 space-y-1">
            <DetailItem label="Name" value={event.partner.fullname || "N/A"} />
            <DetailItem label="TNBA ID" value={event.partner.TnBaId || "N/A"} />
            <DetailItem label="Academy" value={event.partner.academyName || "N/A"} />
          </div>
        ) : (
          <p className="text-xs text-gray-500 italic">N/A (Singles Event)</p>
        )}
      </div>

      {/* Payment & Approval */}
      <div className="flex-1 space-y-2">
        <h4 className="text-base font-medium text-gray-800 flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-teal-500" />
          Transaction Status
        </h4>
        <div className="text-xs text-gray-600 space-y-1">
          <DetailItem
            label="Pay Status"
            value={<StatusBadge status={event.payment?.status || "Pending"} />}
          />
          <DetailItem
            label="Amount"
            value={`₹ ${event.payment?.metadata?.paymentAmount || "N/A"}`}
          />
          <DetailItem
            label="Approved By"
            value={event.ApproverdBy?.name || "N/A"}
          />
          <DetailItem
            label="Admin Email"
            value={event.ApproverdBy?.email || "N/A"}
          />
        </div>
      </div>
    </div>
  );
};

const DetailItem = ({ label, value }) => (
  <div className="flex justify-between items-center text-gray-700">
    <span className="font-light text-gray-500">{label}:</span>
    <span className="font-medium">{value}</span>
  </div>
);

// --- MAIN PAGE COMPONENT ---
const UserPage = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedRows, setExpandedRows] = useState({});
  const [selectedRows, setSelectedRows] = useState([]);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteCount, setDeleteCount] = useState(0);

  const [filters, setFilters] = useState({
    categoryFilter: [],
    statusFilter: [],
  });

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [isFilterModelOpen, setIsFilterModelOpen] = useState(false);
  const [pagination, setPagination] = useState({
    total: 0,
    totalPages: 0,
    currentPage: 1,
    limit: 10,
  });

  const handleOpenDeleteModal = () => {
    const selectedPlayerIds = data
      .filter((item) => selectedRows.includes(item.id))
      .map((item) => item.playerID);

    if (selectedPlayerIds.length === 0) {
      toast.error("No users selected for deletion.");
      return;
    }

    setDeleteCount(selectedPlayerIds.length);
    setIsDeleteModalOpen(true);
  };

  // --- Data Fetching from Backend ---
  const fetchEntries = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${API_URL}/api/v1/entry/admin/user-entries?page=${currentPage}&limit=${itemsPerPage}`,
        getHeaders()
      );
      if (res.data.success) {
        setData(res.data.data || []);
        setPagination(res.data.pagination || {
          total: 0,
          totalPages: 0,
          currentPage: 1,
          limit: itemsPerPage
        });
      } else {
        setError("Failed to load entries.");
        toast.error("Failed to load user data.");
      }
    } catch (err) {
      console.error("Error fetching entries:", err);
      setError("An error occurred while fetching entries.");
      toast.error("Error loading user data.");
    } finally {
      setLoading(false);
    }
  }, [currentPage, itemsPerPage]);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  // --- Filtering & Searching ---
  const availableFilters = useMemo(() => {
    const categories = [
      ...new Set(data.flatMap((e) => 
        e.detailedEvents?.map((d) => d.category) || []
      )),
    ].filter(Boolean);

    const statuses = [
      ...new Set(data.flatMap((e) => 
        e.detailedEvents?.map((d) => d.status) || []
      )),
    ].filter(Boolean);

    return {
      categoryFilter: categories,
      statusFilter: statuses,
    };
  }, [data]);

  const handleBulkDelete = useCallback(async () => {
    try {
      const selectedPlayerIds = data
        .filter((item) => selectedRows.includes(item.id))
        .map((item) => item.playerID);

      if (selectedPlayerIds.length === 0) {
        toast.error("No users selected for deletion.");
        return;
      }

      const response = await axios.post(
        `${API_URL}/api/v1/user/bulk-delete`,
        { userIds: selectedPlayerIds },
        getHeaders()
      );

      if (response.data.success) {
        toast.success(response.data.msg || "Bulk deletion completed!");
        fetchEntries();
        setSelectedRows([]);
        setIsDeleteModalOpen(false);
      } else {
        toast.error(response.data.msg || "Bulk delete failed.");
      }
    } catch (error) {
      console.error("Error in bulk delete:", error);
      toast.error("Failed to delete users!");
    }
  }, [data, selectedRows, fetchEntries]);

  const filteredData = useMemo(() => {
    let currentData = data;

    // 1. Apply Search Term
    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      currentData = currentData.filter(
        (item) =>
          item.playerName?.toLowerCase().includes(lowerSearch) ||
          item.playerTnBaId?.toLowerCase().includes(lowerSearch) ||
          item.academy?.toLowerCase().includes(lowerSearch) ||
          item.district?.toLowerCase().includes(lowerSearch) ||
          item.categories?.toLowerCase().includes(lowerSearch) ||
          item.email?.toLowerCase().includes(lowerSearch) ||
          item.phone?.toLowerCase().includes(lowerSearch) ||
          item.place?.toLowerCase().includes(lowerSearch)
      );
    }

    // 2. Apply Category Filter
    if (filters.categoryFilter && filters.categoryFilter.length > 0) {
      currentData = currentData.filter((item) =>
        item.detailedEvents?.some((event) =>
          filters.categoryFilter.includes(event.category)
        )
      );
    }

    // 3. Apply Status Filter
    if (filters.statusFilter && filters.statusFilter.length > 0) {
      currentData = currentData.filter((item) =>
        item.detailedEvents?.some((event) =>
          filters.statusFilter.includes(event.status)
        )
      );
    }

    return currentData;
  }, [data, searchTerm, filters]);

  const totalItems = filteredData.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  // --- Pagination Logic ---
  const currentTableData = useMemo(() => {
    const firstItemIndex = (currentPage - 1) * itemsPerPage;
    const lastItemIndex = currentPage * itemsPerPage;
    return filteredData.slice(firstItemIndex, lastItemIndex);
  }, [filteredData, currentPage, itemsPerPage]);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // --- Row Selection Logic ---
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const allIds = currentTableData.map((item) => item.id);
      setSelectedRows(allIds);
    } else {
      setSelectedRows([]);
    }
  };

  const handleSelectRow = (id) => {
    setSelectedRows((prev) =>
      prev.includes(id) ? prev.filter((rowId) => rowId !== id) : [...prev, id]
    );
  };

  const isAllSelected =
    currentTableData.length > 0 &&
    selectedRows.length === currentTableData.length;

  // --- Expanded Row Logic ---
  const toggleRowExpansion = (id) => {
    setExpandedRows((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // --- Data Table Columns Definition (Responsive) ---
  const columns = useMemo(
    () => [
      {
        header: "Select",
        accessor: "select",
        cell: (item) => (
          <input
            type="checkbox"
            checked={selectedRows.includes(item.id)}
            onChange={() => handleSelectRow(item.id)}
            className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
          />
        ),
        responsive: "always",
      },
      {
        header: "Details",
        accessor: "details",
        responsive: "always",
        cell: (item) => (
          <button
            onClick={() => toggleRowExpansion(item.id)}
            className="p-1 rounded-full text-indigo-600 hover:bg-indigo-50 transition"
            title="Toggle Details"
          >
            {expandedRows[item.id] ? (
              <ChevronUp className="w-5 h-5" />
            ) : (
              <ChevronDown className="w-5 h-5" />
            )}
          </button>
        ),
      },
      {
        header: "Player Name",
        accessor: "playerName",
        responsive: "always",
        cell: (item) => (
          <div>
            <p className="font-semibold text-gray-800">{item.playerName || 'N/A'}</p>
            <p className="text-xs text-gray-500 sm:hidden">{item.categories || 'No Events'}</p>
          </div>
        ),
      },
      { 
        header: "TNBA ID", 
        accessor: "playerTnBaId", 
        responsive: "md-up",
        cell: (item) => item.playerTnBaId || 'N/A'
      },
      { 
        header: "Email", 
        accessor: "email", 
        responsive: "lg-up",
        cell: (item) => item.email || 'N/A'
      },
      { 
        header: "Phone", 
        accessor: "phone", 
        responsive: "md-up",
        cell: (item) => item.phone || 'N/A'
      },
      {
        header: "Events",
        accessor: "eventCount",
        responsive: "sm-up",
        cell: (item) => <StatusBadge status={`${item.eventCount || 0} Events`} />,
      },
      { 
        header: "Categories", 
        accessor: "categories", 
        responsive: "lg-up",
        cell: (item) => item.categories || 'No Events'
      },
      {
        header: "Statuses",
        accessor: "statuses",
        responsive: "md-up",
        cell: (item) => {
          const firstStatus = item.statuses?.split(", ")[0] || 'No Events';
          return <StatusBadge status={firstStatus} />;
        },
      },
      { 
        header: "Place", 
        accessor: "place", 
        responsive: "md-up",
        cell: (item) => item.place || 'N/A'
      },
      { 
        header: "District", 
        accessor: "district", 
        responsive: "lg-up",
        cell: (item) => item.district || 'N/A'
      },
      {
        header: "Entry Date",
        accessor: "entryDate",
        responsive: "lg-up",
        cell: (item) => item.entryDate ? new Date(item.entryDate).toLocaleDateString() : 'N/A',
      },
    ],
    [selectedRows, expandedRows]
  );

  if (loading)
    return (
      <div className="flex justify-center items-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        <p className="ml-3 text-lg text-gray-600">Loading User Data...</p>
      </div>
    );

  if (error)
    return (
      <div className="p-6 bg-red-100 border border-red-400 text-red-700 rounded-xl">
        <h2 className="font-bold">Error:</h2>
        <p>{error}</p>
        <button 
          onClick={fetchEntries}
          className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
        >
          Retry
        </button>
      </div>
    );

  // --- Render Functions ---

  const renderBulkActions = () => (
    <div className="absolute top-0 left-16 right-0 bg-indigo-50 p-3 flex items-center justify-between shadow-md z-10">
      <span className="font-medium text-indigo-700 text-sm">
        {selectedRows.length} item{selectedRows.length !== 1 ? "s" : ""}{" "}
        selected
      </span>
      <div className="flex gap-3">
        <button
          onClick={handleOpenDeleteModal}
          className="flex items-center gap-1 text-sm text-red-700 hover:text-white hover:bg-red-600 px-3 py-1 rounded-lg transition bg-red-100"
        >
          <Trash2 className="w-4 h-4" /> Delete Bulk
        </button>
      </div>
    </div>
  );

  return (
    <div className="p-4 md:p-8 bg-white rounded-2xl shadow-xl min-h-[80vh]">
      {/* Toolbar */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center mb-6">
        {/* Search */}
        <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />

        {/* Actions */}
        <div className="flex flex-wrap gap-3 items-center justify-between relative w-full">
          {/* Left side - Record info */}
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span className="font-medium text-gray-700">
              Showing{" "}
              <span className="text-indigo-600">
                {data.length === 0
                  ? 0
                  : (currentPage - 1) * itemsPerPage + 1}
              </span>
              {"–"}
              <span className="text-indigo-600">
                {Math.min(
                  currentPage * itemsPerPage,
                  totalItems
                )}
              </span>{" "}
              of <span className="font-semibold">{totalItems}</span>{" "}
              Records
            </span>
          </div>

          {/* Right side - Controls */}
          <div className="flex flex-wrap gap-3 items-center">
            {/* Show Entries Dropdown */}
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <label
                htmlFor="entriesPerPage"
                className="font-medium text-gray-700"
              >
                Show:
              </label>
              <select
                id="entriesPerPage"
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1); // reset to first page
                }}
                className="border border-gray-300 rounded-xl px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition bg-white shadow-sm"
              >
                {[10, 25, 50, 100, 150].map((num) => (
                  <option key={num} value={num}>
                    {num}
                  </option>
                ))}
              </select>
            </div>

            {/* Filter Button */}
            <button
              onClick={() => setIsFilterModelOpen((prev) => !prev)}
              className={`flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-xl shadow-sm transition duration-150 text-sm font-medium ${
                isFilterModelOpen
                  ? "bg-indigo-100 text-indigo-700"
                  : "bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              <Filter className="w-5 h-5" />
              Filters
              {filters.categoryFilter.length > 0 ||
              filters.statusFilter.length > 0 ? (
                <span className="ml-1 px-2 py-0.5 text-xs font-semibold bg-red-500 text-white rounded-full">
                  {filters.categoryFilter.length + filters.statusFilter.length}
                </span>
              ) : null}
            </button>

            {/* CSV Export */}
            <CSVExport
              data={filteredData}
              columns={columns.filter(
                (c) => c.accessor !== "select" && c.accessor !== "details"
              )}
              fileName="user_entries"
            />
          </div>
        </div>
      </div>

      {/* DataTable */}
      <div className="relative overflow-x-auto rounded-xl border border-gray-200 shadow-lg">
        {selectedRows.length > 0 && renderBulkActions()}
        <table className="min-w-full divide-y divide-gray-200 relative">
          {/* Table Header */}
          <thead className="bg-gray-50 sticky top-0 z-0">
            <tr>
              <th
                scope="col"
                className="p-4 text-left text-xs font-medium text-gray-500 tracking-wider w-12"
              >
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  onChange={handleSelectAll}
                  className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
                />
              </th>
              {columns
                .filter((c) => c.accessor !== "select")
                .map((col) => (
                  <th
                    key={col.accessor}
                    scope="col"
                    className={`p-4 text-left text-xs font-medium text-gray-500 tracking-wider 
                             ${
                               col.responsive === "md-up"
                                 ? "hidden md:table-cell"
                                 : ""
                             }
                             ${
                               col.responsive === "sm-up"
                                 ? "hidden sm:table-cell"
                                 : ""
                             }
                             ${
                               col.responsive === "lg-up"
                                 ? "hidden lg:table-cell"
                                 : ""
                             }
                             ${
                               col.responsive === "always" ? "table-cell" : ""
                             }`}
                  >
                    {col.header}
                  </th>
                ))}
            </tr>
          </thead>

          {/* Table Body */}
          <tbody className="bg-white divide-y divide-gray-200">
            {currentTableData.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="py-10 text-center text-gray-500"
                >
                  No users found matching your criteria.
                </td>
              </tr>
            ) : (
              currentTableData.map((item) => (
                <React.Fragment key={item.id}>
                  {/* Main Data Row */}
                  <tr
                    className={`hover:bg-indigo-50 transition ${
                      selectedRows.includes(item.id) ? "bg-indigo-100" : ""
                    }`}
                  >
                    {columns.map((col) => (
                      <td
                        key={col.accessor}
                        className={`p-4 whitespace-nowrap text-sm text-gray-500 
                                     ${
                                       col.responsive === "md-up"
                                         ? "hidden md:table-cell"
                                         : ""
                                     }
                                     ${
                                       col.responsive === "sm-up"
                                         ? "hidden sm:table-cell"
                                         : ""
                                     }
                                     ${
                                       col.responsive === "lg-up"
                                         ? "hidden lg:table-cell"
                                         : ""
                                     }
                                     ${
                                       col.responsive === "always"
                                         ? "table-cell"
                                         : ""
                                     }`}
                      >
                        {col.cell ? col.cell(item) : item[col.accessor]}
                      </td>
                    ))}
                  </tr>

                  {/* Expanded Detail Row */}
                  {expandedRows[item.id] && item.detailedEvents && item.detailedEvents.length > 0 && (
                    <tr className="bg-gray-50">
                      <td
                        colSpan={columns.length}
                        className="p-4 border-t border-indigo-200"
                      >
                        <div className="space-y-4">
                          <h3 className="font-bold text-lg text-indigo-800 border-b pb-2 flex items-center gap-2">
                            <FileText className="w-5 h-5" /> Detailed Event
                            Submissions ({item.detailedEvents.length})
                          </h3>
                          {item.detailedEvents.map((event, index) => (
                            <DetailCard key={event._id || index} event={event} />
                          ))}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))
            )}
          </tbody>
        </table>
      </div>

      {isFilterModelOpen && (
        <FilterModel
          filters={filters}
          setFilters={setFilters}
          availableFilters={availableFilters}
          onClose={() => setIsFilterModelOpen(false)}
        />
      )}
      
      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalFilteredCount={totalItems}
        entriesPerPage={itemsPerPage}
        onPageChange={paginate}
      />

      {/* Confirm Delete Model */}
      <ConfirmDeleteModel
        isOpen={isDeleteModalOpen}
        count={deleteCount}
        onCancel={() => setIsDeleteModalOpen(false)}
        onConfirm={handleBulkDelete}
      />
    </div>
  );
};

export default UserPage;