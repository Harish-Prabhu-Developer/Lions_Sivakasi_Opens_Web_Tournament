import { X } from "lucide-react";
import React from "react";

const StatusModal = ({
  selectedStatus,
  setSelectedStatus,
  handleCloseUpdateModal,
  handleUpdateStatus,
  entry,
}) => {
  return (
    <div className="fixed inset-0 bg-black/40 bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-xl font-semibold text-gray-900">
            Update Entry Status
          </h3>
          <button
            onClick={handleCloseUpdateModal}
            className="p-1 rounded-full hover:bg-gray-100 transition"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Status
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">Choose a status</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            <option value="pending">Pending</option>
            </select>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-gray-700 mb-2">
              Entry Information:
            </h4>
            <p className="text-sm text-gray-600">
              <strong>Entry ID:</strong> {entry.entryRefId}
            </p>
            <p className="text-sm text-gray-600">
              <strong>Event ID:</strong> {entry.eventId}
            </p>
            <p className="text-sm text-gray-600">
              <strong>Player:</strong> {entry.player?.name}
            </p>
            <p className="text-sm text-gray-600">
              <strong>Current Status:</strong> {entry.eventStatus}
            </p>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
          <button
            onClick={handleCloseUpdateModal}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleUpdateStatus}
            disabled={!selectedStatus}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
          >
            Update Status
          </button>
        </div>
      </div>
    </div>
  );
};

export default StatusModal;
