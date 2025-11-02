import React, { useState, useMemo, useEffect } from "react";
import {
  Filter,
  Search,
  ChevronDown,
  ChevronUp,
  Layers,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  Clock,
  XCircle,
  Eye,
  ArrowLeft,
  Download,
  RefreshCw,
  Users, // Icon for Doubles/Mixed
  User, // Icon for Singles
} from "lucide-react";
import toast from "react-hot-toast";

// --- Sample API Response Data ---
const SampleApiResponse = {
  "success": true,
  "data": [
    {
      "_id": "6906546b34b5f04352569391",
      "player": {
        "_id": "68fd04e2525b72f59724542a",
        "name": "Alex Johnson",
        "TnBaId": "TNBA9584",
        "academyName": "City Smashers Academy",
        "district": "North District",
        "place": "Metropolis"
      },
      "events": [
        {
          "category": "Under 15",
          "type": "doubles",
          "status": "approved",
          "RegistrationDate": "2025-11-01T18:41:47.915Z",
          "partner": {
            "fullname": "Player15D (Partner A)", "dob": "2004-03-02", "TnBaId": "TNBA9515D", "academyName": "Play 15D", "place": "Play 15D", "district": "Play !5D", "_id": "690654b334b5f0435256939d"
          },
          "payment": {
            "metadata": { "paymentApp": "PhonePe", "paymentAmount": "200.00" }, "_id": "690667158032770352929423", "paymentProof": "data:image/jpeg;base64,/9j/4AAQSkZJRgA....", "status": "Paid", "createdAt": "2025-11-01T20:01:25.683Z",
          },
          "_id": "6906546b34b5f04352569392", "createdAt": "2025-11-01T18:41:47.930Z", "updatedAt": "2025-11-01T20:27:19.571Z", "ApproverdBy": "68fd000c391bf13c0088eb1e"
        },
        {
          "category": "Under 17",
          "type": "doubles",
          "status": "pending",
          "RegistrationDate": "2025-11-01T18:41:47.916Z",
          "partner": {
            "fullname": "Player17D (Partner B)", "dob": "2004-04-03", "TnBaId": "TNBA9517D", "academyName": "Play 17D", "place": "Play 17fhj", "district": "jkfhkdj", "_id": "690654ec34b5f043525693a4"
          },
          "payment": {
            "metadata": { "paymentApp": "PhonePe", "paymentAmount": "200.00" }, "_id": "690667158032770352929423", "paymentProof": "data:image/jpeg;base64,/9j/4AAQSkZJRgA........", "status": "Paid", "createdAt": "2025-11-01T20:01:25.683Z",
          },
          "_id": "6906546b34b5f04352569393", "createdAt": "2025-11-01T18:41:47.931Z", "updatedAt": "2025-11-01T18:41:47.931Z"
        },
        {
          "category": "Under 17",
          "type": "mixed doubles",
          "status": "pending",
          "_id": "690667d58032770352929476",
          "RegistrationDate": "2025-11-01T20:04:37.641Z",
          "partner": {
            "fullname": "Player17MD (Partner C)", "dob": "2003-02-03", "TnBaId": "TNBA9517MD", "academyName": "jhkjh", "place": "jhkjhj", "district": "jhjkhkh", "_id": "6906680a8032770352929498"
          }
          // Missing Payment -> status should implicitly be 'unpaid'
        }
      ],
    },
    {
      "_id": "6906ec3400d693daee2cba04",
      "player": {
        "_id": "6906e4967d9806ae19fb8b66",
        "name": "Chris Evans",
        "TnBaId": "TNBA9585",
        "academyName": "Phoenix Training Center",
        "district": "South District",
        "place": "The Valley"
      },
      "events": [
        {
          "category": "Under 19",
          "type": "singles",
          "status": "pending",
          "RegistrationDate": "2025-11-02T05:59:21.857Z",
          "_id": "6906f33917e1844427c66ba0",
          // No partner, No payment -> status should implicitly be 'unpaid'
        },
        {
          "category": "Under 19",
          "type": "doubles",
          "status": "pending",
          "RegistrationDate": "2025-11-02T05:59:21.857Z",
          "partner": {
            "fullname": "Doubles Partner U19", "dob": "2004-09-03", "TnBaId": "klfjdkjlk", "academyName": "jkfhdjkj", "place": "jkhkjjkhjk", "district": "fkjdljk", "_id": "6906f6cc5910ad755b96ae29"
          },
          "_id": "6906f33917e1844427c66ba1",
          // No payment -> status should implicitly be 'unpaid'
        }
      ],
    }
  ]
};

// --- Utility Functions ---

/** Flattens the nested entries data into a single array of events for the table. */
const flattenEntriesData = (data) => {
  const flatData = [];
  data.forEach(entry => {
    const player = entry.player;
    entry.events.forEach(event => {
      // Determine the true status, defaulting to 'unpaid' if payment object is missing
      const finalStatus = event.payment ? event.status.toLowerCase() : (event.status ? event.status.toLowerCase() : 'unpaid');
      
      flatData.push({
        // Primary Key for the table
        id: event._id,
        // Core Event Details
        category: event.category,
        type: event.type,
        status: finalStatus,
        RegistrationDate: event.RegistrationDate,
        // Player Details
        playerName: player.name,
        playerTnBaId: player.TnBaId,
        playerAcademy: player.academyName,
        // Partner Details (if available)
        partner: event.partner,
        // Payment Details (if available)
        payment: event.payment,
        // Original Entry ID (for potential lookup)
        entryId: entry._id
      });
    });
  });
  return flatData;
};

/** Formats a UTC date string into a readable local date. */
const formatDate = (utcDateString) => {
  if (!utcDateString) return 'N/A';
  try {
    const date = new Date(utcDateString);
    return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  } catch (e) {
    return 'Invalid Date';
  }
};

/** Extracts unique options for filtering. */
const getUniqueOptions = (data) => {
    const options = { category: new Set(), type: new Set(), status: new Set() };
    data.forEach(item => {
        options.category.add(item.category);
        options.type.add(item.type);
        options.status.add(item.status);
    });
    return {
        category: Array.from(options.category).sort(),
        type: Array.from(options.type).sort(),
        status: Array.from(options.status).sort(),
    };
};

const INITIAL_DATA = flattenEntriesData(SampleApiResponse.data);

// Define column headers
const COLUMNS = [
  { key: "playerName", label: "Player Name", sortable: true },
  { key: "playerAcademy", label: "Academy", sortable: true },
  { key: "category", label: "Category", sortable: true },
  { key: "type", label: "Entry Type", sortable: true },
  { key: "RegistrationDate", label: "Reg. Date", sortable: true },
  { key: "status", label: "Status", sortable: true },
];

// --- Utility Functions (Updated for Entry Statuses) ---

const getStatusColor = (status) => {
  switch (status.toLowerCase()) {
    case "approved":
      return "bg-green-100 text-green-700 ring-green-600/20";
    case "pending":
      return "bg-yellow-100 text-yellow-700 ring-yellow-600/20";
    case "rejected":
    case "unpaid": // Unpaid status for entries missing payment proof
      return "bg-red-100 text-red-700 ring-red-600/20";
    default:
      return "bg-gray-100 text-gray-700 ring-gray-600/20";
  }
};

const getStatusIcon = (status) => {
  const iconClass = "w-4 h-4 mr-1";
  switch (status.toLowerCase()) {
    case "approved":
      return <CheckCircle className={`${iconClass} text-green-600`} />;
    case "pending":
      return <Clock className={`${iconClass} text-yellow-600`} />;
    case "rejected":
    case "unpaid":
      return <XCircle className={`${iconClass} text-red-600`} />;
    default:
      return <Layers className={`${iconClass} text-blue-600`} />;
  }
};

// --- Reusable Components ---

/**
 * Professional Stats Card Component (Modified titles/values)
 */
const StatsCard = ({ title, value, change, icon: Icon, color }) => (
  <div className="bg-white p-5 rounded-xl shadow-lg border border-gray-100 transition-all duration-300 hover:shadow-xl hover:border-blue-200">
    <div className="flex items-center justify-between">
      <div className={`p-3 rounded-full ${color} bg-opacity-10`}>
        <Icon className={`w-6 h-6 ${color}`} />
      </div>
      <div className="text-right">
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <p className="text-sm font-medium text-gray-500">{title}</p>
      </div>
    </div>
    <div className="mt-3">
      <p className="flex items-center text-sm font-semibold">
        <TrendingUp className="w-4 h-4 mr-1 text-green-500" />
        <span className="text-green-600">{change}</span>
        <span className="ml-1 text-gray-500 font-normal">vs. last month</span>
      </p>
    </div>
  </div>
);

/**
 * Filter Modal Component - RETAINED MULTI-SELECT LOGIC
 */
const FilterModal = ({ isOpen, onClose, filters, setFilters, uniqueOptions }) => {
  if (!isOpen) return null;

  // New handleChange function for checkboxes (multi-select)
  const handleChange = (key, value) => {
    setFilters((prev) => {
      const currentValues = prev[key];
      let newValues;

      if (currentValues.includes(value)) {
        // Remove value
        newValues = currentValues.filter((v) => v !== value);
      } else {
        // Add value
        newValues = [...currentValues, value];
      }
      return {
        ...prev,
        [key]: newValues,
      };
    });
  };

  const handleClear = () => {
    // Reset to empty arrays for multi-select
    setFilters({ category: [], type: [], status: [] });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="bg-white w-full max-w-lg p-6 rounded-xl shadow-2xl transform transition-all duration-300 scale-100 opacity-100">
        <div className="flex justify-between items-center border-b pb-3 mb-4">
          <h3 className="text-xl font-bold text-gray-800 flex items-center">
            <Filter className="w-5 h-5 mr-2 text-blue-600" />
            Advanced Entry Filters
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition"
          >
            <XCircle className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-6 max-h-96 overflow-y-auto pr-2">
          {Object.keys(filters).map((key) => (
            <div key={key} className="bg-gray-50 p-4 rounded-xl border border-gray-200">
              <h4 className="block text-sm font-bold text-gray-800 capitalize mb-3 border-b border-gray-200 pb-2">
                {key.replace(/([A-Z])/g, " $1").trim()}
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {uniqueOptions[key] &&
                  uniqueOptions[key].map((option) => {
                    const isChecked = filters[key].includes(option);
                    return (
                      <label
                        key={option}
                        className={`flex items-center space-x-2 p-3 text-sm rounded-lg cursor-pointer transition duration-150 ease-in-out border ${
                          isChecked
                            ? "bg-blue-600 text-white border-blue-600 font-semibold shadow-md"
                            : "bg-white text-gray-700 hover:bg-blue-50 hover:border-blue-400 border-gray-300"
                        }`}
                      >
                        <input
                          type="checkbox"
                          name={key}
                          checked={isChecked}
                          onChange={() => handleChange(key, option)}
                          // Styling for the native checkbox
                          className={`h-4 w-4 ${
                            isChecked
                              ? "text-white bg-blue-500 border-white focus:ring-white"
                              : "text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500"
                          } rounded`}
                        />
                        <span className="truncate capitalize">{option}</span>
                      </label>
                    );
                  })}
              </div>
              {uniqueOptions[key].length === 0 && (
                <p className="text-sm text-gray-400 italic mt-2">No options available.</p>
              )}
            </div>
          ))}
        </div>

        <div className="mt-6 flex justify-end space-x-3">
          <button
            onClick={handleClear}
            className="px-4 py-2 text-sm font-semibold text-gray-700 bg-gray-100 rounded-lg shadow-sm hover:bg-gray-200 transition duration-150 ease-in-out"
          >
            Clear Filters
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg shadow-md hover:bg-blue-700 transition duration-150 ease-in-out"
          >
            Apply & Close
          </button>
        </div>
      </div>
    </div>
  );
};

/**
 * Pagination Component (No changes)
 */
const Pagination = ({ currentPage, totalPages, totalFilteredCount, entriesPerPage, onPageChange }) => (
  <div className="flex flex-col sm:flex-row items-center justify-between mt-6 p-4 bg-white rounded-xl shadow-lg border border-gray-100">
    <div className="text-sm text-gray-600 mb-4 sm:mb-0">
      Showing entries {(currentPage - 1) * entriesPerPage + 1} to{" "}
      {Math.min(currentPage * entriesPerPage, totalFilteredCount)} of {totalFilteredCount} results
    </div>
    <div className="flex items-center space-x-2">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="p-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
        aria-label="Previous Page"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      <div className="flex space-x-1">
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition duration-150 ease-in-out ${
              page === currentPage
                ? "bg-blue-600 text-white shadow-md"
                : "bg-white text-gray-700 hover:bg-blue-50 hover:text-blue-600 border border-gray-300"
            }`}
          >
            {page}
          </button>
        ))}
      </div>
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages || totalPages === 0}
        className="p-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
        aria-label="Next Page"
      >
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  </div>
);

/**
 * Bulk Actions Component (Updated text)
 */
const BulkActions = ({ selectedCount, onAction }) => {
  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-blue-600 text-white py-3 px-6 shadow-2xl transition-all duration-300 transform translate-y-0">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <p className="text-base font-semibold">
          {selectedCount} {selectedCount > 1 ? "entries" : "entry"} selected
        </p>
        <div className="flex space-x-4">
          <button
            onClick={() => onAction("Approve")}
            className="flex items-center px-4 py-2 text-sm font-medium bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition shadow-md"
          >
            <CheckCircle className="w-4 h-4 mr-2" /> Approve
          </button>
          <button
            onClick={() => onAction("Reject")}
            className="flex items-center px-4 py-2 text-sm font-medium bg-white text-red-600 rounded-lg hover:bg-red-50 transition shadow-md"
          >
            <XCircle className="w-4 h-4 mr-2" /> Reject
          </button>
          <button
            onClick={() => onAction("Export")}
            className="flex items-center px-4 py-2 text-sm font-medium bg-white text-gray-700 rounded-lg hover:bg-gray-100 transition shadow-md"
          >
            <Download className="w-4 h-4 mr-2" /> Export CSV
          </button>
        </div>
      </div>
    </div>
  );
};

/**
 * Details View Component (Updated to show Entry details)
 */
const DetailsView = ({ entry, onBack }) => {
    // Helper to determine the payment status
    const paymentStatus = entry.payment ? entry.payment.status : 'Unpaid';
    const paymentAmount = entry.payment?.metadata?.paymentAmount || 'N/A';
    const paymentApp = entry.payment?.metadata?.paymentApp || 'N/A';

    // Helper for partner details
    const partnerName = entry.partner?.fullname || 'N/A (Singles)';

  return (
    <div className="bg-white p-8 rounded-xl shadow-2xl border border-gray-100 max-w-4xl mx-auto mt-8">
      <header className="flex items-center justify-between border-b pb-4 mb-6">
        <h2 className="text-3xl font-extrabold text-gray-900 flex items-center">
            <User className="w-7 h-7 mr-3 text-blue-600" /> Entry Details: {entry.playerName} ({entry.category})
        </h2>
        <button
          onClick={onBack}
          className="flex items-center px-4 py-2 text-sm font-semibold text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition shadow-sm"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Entries
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Player & Event Info Column */}
        <section className="space-y-4">
          <h3 className="text-xl font-bold text-blue-600 border-b pb-2 mb-3">Player & Event Information</h3>
          <DetailItem label="Player Name" value={entry.playerName} />
          <DetailItem label="TNBA ID" value={entry.playerTnBaId} />
          <DetailItem label="Academy" value={entry.playerAcademy} />
          <DetailItem label="Category" value={entry.category} />
          <DetailItem label="Entry Type" value={entry.type} isCapitalize={true} />
          <DetailItem label="Registration Date" value={formatDate(entry.RegistrationDate)} />
        </section>

        {/* Partner & Payment Column */}
        <section className="space-y-4">
          <h3 className="text-xl font-bold text-blue-600 border-b pb-2 mb-3">Partner & Payment</h3>
          
          <DetailItem label="Partner Name" value={partnerName} />
          {entry.partner && (
            <>
                <DetailItem label="Partner TNBA ID" value={entry.partner?.TnBaId || 'N/A'} />
                <DetailItem label="Partner DOB" value={formatDate(entry.partner?.dob)} />
            </>
          )}

          <div className="pt-4 border-t border-gray-200">
            <h4 className="text-lg font-semibold text-gray-800 mb-2">Payment Status</h4>
            <div className="flex justify-between items-center text-sm mb-1">
                <p className="text-gray-600">Payment Status</p>
                <div
                    className={`px-3 py-1 text-xs font-medium rounded-full ring-1 w-fit ${getStatusColor(
                        paymentStatus
                    )} flex items-center capitalize`}
                >
                    {getStatusIcon(paymentStatus)}
                    {paymentStatus}
                </div>
            </div>
            <DetailItem label="Amount" value={paymentAmount} />
            <DetailItem label="Payment App" value={paymentApp} />
            <DetailItem label="Payment Proof" value={entry.payment?.paymentProof ? 'Available' : 'Missing'} />
          </div>
        </section>
      </div>
    </div>
  );
};

const DetailItem = ({ label, value, isCapitalize = false }) => (
  <div className="flex justify-between items-start border-b border-gray-100 py-2">
    <p className="text-sm font-medium text-gray-500">{label}</p>
    <p className={`text-sm font-semibold text-gray-800 text-right max-w-xs ${isCapitalize ? 'capitalize' : ''}`}>{value}</p>
  </div>
);

/**
 * Data Table Row Component (Updated labels/data fields)
 */
const DataRow = ({
  entry, // renamed po to entry
  isExpanded,
  toggleRow,
  isSelected,
  toggleRowSelection,
  onViewDetails,
}) => {
  const statusColor = getStatusColor(entry.status);
  const isDoubles = entry.type.includes('doubles');
  const partnerName = entry.partner?.fullname || 'N/A';

  return (
    <>
      {/* Primary Row */}
      <tr className={`bg-white border-b hover:bg-blue-50 transition duration-150 ${isSelected ? "bg-blue-100" : ""}`}>
        {/* Checkbox */}
        <td className="p-3 text-center w-12">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => toggleRowSelection(entry.id)}
            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
          />
        </td>

        {/* Data Cells */}
        <td className="p-3 text-sm font-medium text-gray-900 whitespace-nowrap">{entry.playerName}</td>
        <td className="p-3 text-sm text-gray-500">{entry.playerAcademy}</td>
        <td className="p-3 text-sm text-gray-500">{entry.category}</td>
        <td className="p-3 text-sm text-gray-700 whitespace-nowrap capitalize flex items-center">
            {isDoubles ? <Users className="w-4 h-4 mr-1 text-blue-500" /> : <User className="w-4 h-4 mr-1 text-gray-500" />}
            {entry.type}
        </td>
        <td className="p-3 text-sm text-gray-500">{formatDate(entry.RegistrationDate)}</td>
        <td className="p-3 text-center">
          <div
            className={`inline-flex items-center px-3 py-1 text-xs font-medium rounded-full ring-1 ${statusColor} capitalize`}
          >
            {getStatusIcon(entry.status)}
            {entry.status}
          </div>
        </td>

        {/* Actions Cell */}
        <td className="p-3 text-center space-x-2 w-28">
          <button
            onClick={() => onViewDetails(entry)}
            title="View Details"
            className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded-full transition"
          >
            <Eye className="w-5 h-5" />
          </button>
          <button
            onClick={() => toggleRow(entry.id)}
            title={isExpanded ? "Collapse" : "Expand Details"}
            className="p-1.5 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-full transition"
          >
            {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
        </td>
      </tr>

      {/* Expanded Details Row */}
      {isExpanded && (
        <tr className="bg-gray-50 border-b">
          <td colSpan={COLUMNS.length + 2} className="p-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
              <div className="border-r border-gray-200 pr-4">
                <p className="font-semibold text-gray-700 mb-1">Player TNBA ID</p>
                <p className="text-gray-600">{entry.playerTnBaId}</p>
              </div>
              <div className="border-r border-gray-200 pr-4">
                <p className="font-semibold text-gray-700 mb-1">Partner</p>
                <p className="text-gray-600">{partnerName}</p>
              </div>
              <div>
                <p className="font-semibold text-gray-700 mb-1">Payment Status</p>
                <div
                  className={`flex items-center text-xs font-medium rounded-full ring-1 w-fit px-3 py-1 ${getStatusColor(
                    entry.status
                  )} capitalize`}
                >
                  {getStatusIcon(entry.status)}
                  {entry.status}
                </div>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
};

/**
 * Data Table Component (No functional changes)
 */
const DataTable = ({
  data,
  expandedRows,
  toggleRow,
  selectedRows,
  toggleRowSelection,
  toggleSelectAll,
  paginatedDataIds,
  onViewDetails,
  sortConfig,
  onSort,
}) => {
  const isAllSelected = paginatedDataIds.length > 0 && paginatedDataIds.every((id) => selectedRows.includes(id));

  return (
    <div className="mt-6 bg-white rounded-xl shadow-lg border border-gray-100 overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        {/* Table Header */}
        <thead className="bg-gray-50">
          <tr>
            {/* Select All Checkbox */}
            <th scope="col" className="p-3 text-center w-12">
              <input
                type="checkbox"
                checked={isAllSelected}
                onChange={toggleSelectAll}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
              />
            </th>

            {/* Data Columns */}
            {COLUMNS.map((col) => (
              <th
                key={col.key}
                scope="col"
                className={`px-3 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider ${
                  col.sortable ? "cursor-pointer hover:text-blue-600 transition" : ""
                }`}
                onClick={col.sortable ? () => onSort(col.key) : undefined}
              >
                <div className="flex items-center">
                  {col.label}
                  {col.sortable && (
                    <span className="ml-1">
                      {sortConfig.key === col.key ? (
                        sortConfig.direction === "ascending" ? (
                          <ChevronUp className="w-3 h-3 text-blue-500" />
                        ) : (
                          <ChevronDown className="w-3 h-3 text-blue-500" />
                        )
                      ) : (
                        <ChevronDown className="w-3 h-3 text-gray-300" />
                      )}
                    </span>
                  )}
                </div>
              </th>
            ))}

            {/* Actions Column */}
            <th scope="col" className="px-3 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>

        {/* Table Body */}
        <tbody className="divide-y divide-gray-200">
          {data.length > 0 ? (
            data.map((entry) => (
              <DataRow
                key={entry.id}
                entry={entry}
                isExpanded={expandedRows.includes(entry.id)}
                toggleRow={toggleRow}
                isSelected={selectedRows.includes(entry.id)}
                toggleRowSelection={toggleRowSelection}
                onViewDetails={onViewDetails}
              />
            ))
          ) : (
            <tr>
              <td colSpan={COLUMNS.length + 2} className="py-10 text-center text-lg text-gray-500">
                No entries match your current search or filters.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

// --- Main Application Component ---

const EntriesPage = () => {
  const [data, setData] = useState(INITIAL_DATA);
  const [searchQuery, setSearchQuery] = useState("");
  // Updated filter keys to match new data structure
  const [filters, setFilters] = useState({ category: [], type: [], status: [] });
  const [sortConfig, setSortConfig] = useState({ key: "id", direction: "ascending" });
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [expandedRows, setExpandedRows] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState(null); // State for Details View (renamed from selectedPo)

  const uniqueOptions = useMemo(() => getUniqueOptions(INITIAL_DATA), []);

  // --- Filtering & Searching Logic ---
  const filteredData = useMemo(() => {
    let result = data;

    // 1. Search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      // Search across relevant fields: playerName, playerAcademy, category, type, status
      result = result.filter((item) =>
        item.playerName.toLowerCase().includes(query) ||
        item.playerAcademy.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query) ||
        item.type.toLowerCase().includes(query) ||
        item.status.toLowerCase().includes(query)
      );
    }

    // 2. Filters - MULTI-SELECT LOGIC
    result = result.filter((item) => {
      // Check if item.category is IN the selected categories array
      if (filters.category.length > 0 && !filters.category.includes(item.category)) {
        return false;
      }

      // Check if item.type is IN the selected types array
      if (filters.type.length > 0 && !filters.type.includes(item.type)) {
        return false;
      }

      // Check if item.status is IN the selected statuses array
      if (filters.status.length > 0 && !filters.status.includes(item.status)) {
        return false;
      }

      return true;
    });

    return result;
  }, [data, searchQuery, filters]);

  const totalFilteredCount = filteredData.length;

  // --- Sorting Logic ---
  const sortedData = useMemo(() => {
    if (!sortConfig.key) return filteredData;

    const sortableData = [...filteredData];
    sortableData.sort((a, b) => {
      const keyA = a[sortConfig.key];
      const keyB = b[sortConfig.key];

      if (keyA < keyB) {
        return sortConfig.direction === "ascending" ? -1 : 1;
      }
      if (keyA > keyB) {
        return sortConfig.direction === "ascending" ? 1 : -1;
      }
      return 0;
    });
    return sortableData;
  }, [filteredData, sortConfig]);

  // Handle sorting action
  const handleSort = (key) => {
    let direction = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  // --- Pagination Logic ---
  const totalPages = Math.ceil(totalFilteredCount / entriesPerPage);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * entriesPerPage;
    const end = start + entriesPerPage;
    return sortedData.slice(start, end);
  }, [sortedData, currentPage, entriesPerPage]);

  const paginatedDataIds = paginatedData.map(item => item.id);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
    setSelectedRows([]); // Clear selection when data changes
  }, [searchQuery, filters, entriesPerPage]);

  // Handle page change
  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // --- Row Expansion Logic ---
  const toggleRow = (id) => {
    setExpandedRows((prev) =>
      prev.includes(id) ? prev.filter((rowId) => rowId !== id) : [...prev, id]
    );
  };

  // --- Selection Logic ---
  const toggleRowSelection = (id) => {
    setSelectedRows((prev) =>
      prev.includes(id) ? prev.filter((rowId) => rowId !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    const currentlySelectedOnPage = paginatedDataIds.every((id) => selectedRows.includes(id));

    if (currentlySelectedOnPage) {
      // Deselect all on current page
      setSelectedRows((prev) => prev.filter((id) => !paginatedDataIds.includes(id)));
    } else {
      // Select all on current page (only if not already selected)
      setSelectedRows((prev) => [...new Set([...prev, ...paginatedDataIds])]);
    }
  };

  // --- Action Handlers ---
  const handleEntriesPerPageChange = (e) => {
    setEntriesPerPage(Number(e.target.value));
  };

  const handleBulkAction = (action) => {
    toast.success(`${action} action triggered for ${selectedRows.length} entries. (Demo action)`);
    setSelectedRows([]);
  };

  const handleViewDetails = (entry) => {
    setSelectedEntry(entry);
  };

  const handleBackToDashboard = () => {
    setSelectedEntry(null);
  };

  // --- Dashboard Statistics (Updated for Entry Theme) ---
  const totalEntries = INITIAL_DATA.length;
  const approvedEntries = INITIAL_DATA.filter(e => e.status === 'approved').length;
  const pendingEntries = INITIAL_DATA.filter(e => e.status === 'pending').length;
  const unpaidEntries = INITIAL_DATA.filter(e => e.status === 'unpaid').length;
  const paidEntries = totalEntries - unpaidEntries; // Assuming anything not 'unpaid' is paid (if payment exists)

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-8 font-['Inter']">
      <header className="mb-8">
        <h1 className="text-4xl font-extrabold text-gray-900 flex items-center">
          <Layers className="w-8 h-8 mr-3 text-blue-600" /> Tournament Entries Dashboard
        </h1>
        <p className="text-gray-500 mt-2">Manage and review all player registrations and their entry details.</p>
      </header>

      {selectedEntry === null ? (
        <>
          {/* Stats Cards Row */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <StatsCard
              title="Total Entries"
              value={totalEntries}
              change="+12.5%"
              icon={Layers}
              color="text-blue-600"
            />
            <StatsCard
              title="Approved Entries"
              value={approvedEntries}
              change="+5.0%"
              icon={CheckCircle}
              color="text-green-600"
            />
            <StatsCard
              title="Pending Approval"
              value={pendingEntries}
              change="-3.2%"
              icon={Clock}
              color="text-yellow-600"
            />
            <StatsCard
              title="Paid Entries"
              value={paidEntries}
              change="+0.5%"
              icon={Download} // Using Download to represent a successful transaction/paid state
              color="text-purple-600"
            />
          </div>

          {/* Controls Bar */}
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center space-y-4 lg:space-y-0 p-4 bg-white rounded-xl shadow-lg border border-gray-100 mb-6">
            {/* Search and Filter Group */}
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-3 w-full lg:w-auto">
              {/* Search Input */}
              <div className="relative flex-grow">
                <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search player, academy, or category..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full py-2 pl-10 pr-4 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 shadow-sm transition"
                />
              </div>

              {/* Filter Button */}
              <button
                onClick={() => setIsModalOpen(true)}
                className="flex items-center justify-center sm:w-auto px-4 py-2 text-sm font-semibold text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition shadow-sm border border-gray-300"
              >
                <Filter className="w-4 h-4 mr-2" />
                {/* Calculate active filters by counting keys with non-empty arrays */}
                Filter ({Object.values(filters).filter(arr => arr.length > 0).length})
              </button>

              {/* Reset Button */}
              <button
                onClick={() => {
                  setSearchQuery("");
                  setFilters({ category: [], type: [], status: [] }); // Reset to empty arrays
                  setSortConfig({ key: "id", direction: "ascending" });
                  setSelectedRows([]);
                  setExpandedRows([]);
                }}
                title="Reset All"
                className="flex items-center justify-center sm:w-auto p-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition shadow-sm border border-gray-300"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
            </div>

            {/* Pagination Controls & Entries Per Page */}
            <div className="flex items-center space-x-4">
              <button
                className="flex items-center px-4 py-2 text-sm font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 transition shadow-md"
                onClick={() => toast.success("Exporting data... (Demo)")}
              >
                <Download className="w-4 h-4 mr-2" /> Export All
              </button>

              <div className="flex items-center space-x-2 text-gray-600">
                <label htmlFor="entriesPerPage" className="text-sm">
                  Show:
                </label>
                <div className="relative">
                  <select
                    id="entriesPerPage"
                    value={entriesPerPage}
                    onChange={handleEntriesPerPageChange}
                    className="block w-full py-2 pl-3 pr-8 text-sm border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 shadow-sm transition"
                  >
                    {[10, 20, 50, 100].map((num) => (
                      <option key={num} value={num}>
                        {num}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-gray-400 absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
            </div>
          </div>

          <BulkActions
            selectedCount={selectedRows.length}
            onAction={handleBulkAction}
          />

          <DataTable
            data={paginatedData}
            expandedRows={expandedRows}
            toggleRow={toggleRow}
            selectedRows={selectedRows}
            toggleRowSelection={toggleRowSelection}
            toggleSelectAll={toggleSelectAll}
            paginatedDataIds={paginatedDataIds}
            onViewDetails={handleViewDetails}
            sortConfig={sortConfig}
            onSort={handleSort}
          />

          {/* Renders the reusable, responsive Pagination component */}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalFilteredCount={totalFilteredCount}
            entriesPerPage={entriesPerPage}
            onPageChange={handlePageChange}
          />
        </>
      ) : (
        <DetailsView entry={selectedEntry} onBack={handleBackToDashboard} />
      )}


      <FilterModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        filters={filters}
        setFilters={setFilters}
        uniqueOptions={uniqueOptions}
      />
    </div>
  );
};

export default EntriesPage;
