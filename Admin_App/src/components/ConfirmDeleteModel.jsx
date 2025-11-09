import React from "react";
import { XCircle, Trash2, AlertTriangle } from "lucide-react";

const ConfirmDeleteModel = ({ isOpen, onConfirm, onCancel, count }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl p-6 w-[90%] sm:w-[420px] text-center relative">
        <div className="flex justify-center mb-3">
          <AlertTriangle className="w-12 h-12 text-red-500" />
        </div>

        <h2 className="text-xl font-semibold text-gray-800 mb-2">
          Confirm Bulk Deletion
        </h2>

        <p className="text-gray-600 mb-5 text-sm">
          Are you sure you want to delete{" "}
          <span className="font-bold text-red-600">{count}</span>{" "}
          user{count !== 1 ? "s" : ""}? <br />
          This action <span className="text-red-500 font-semibold">cannot be undone.</span>
        </p>

        <div className="flex justify-center gap-3">
          <button
            onClick={onCancel}
            className="flex items-center gap-1 px-4 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 transition text-sm font-medium"
          >
            <XCircle className="w-4 h-4" /> Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex items-center gap-1 px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition text-sm font-medium"
          >
            <Trash2 className="w-4 h-4" /> Confirm Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDeleteModel;
