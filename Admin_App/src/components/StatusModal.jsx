import { X, CreditCard } from "lucide-react";
import React, { useState } from "react";

const StatusModal = ({
  selectedStatus,
  setSelectedStatus,
  handleCloseUpdateModal,
  handleUpdateStatus,
  entry,
}) => {
  const [imageError, setImageError] = useState(false);

  // Get payment proof URL for display
  const getPaymentProofUrl = () => {
    if (!entry.payment?.paymentProof) return null;

    const paymentProof = entry.payment.paymentProof;

    if (
      paymentProof.startsWith("data:image/") ||
      paymentProof.startsWith("http://") ||
      paymentProof.startsWith("https://")
    ) {
      return paymentProof;
    } else {
      return `${window.location.origin}${
        paymentProof.startsWith("/") ? "" : "/"
      }${paymentProof}`;
    }
  };
  
  // Payment ProofUrl
  const paymentProofUrl = getPaymentProofUrl();

  const handleImageError = () => {
    setImageError(true);
  };

  return (
    <div className="fixed inset-0 bg-black/40 bg-opacity-50 flex items-center justify-center z-50 px-8 py-4">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white">
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
        <div className="p-6 space-y-6">
          {/* Status Selection */}
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
          
          {/* Payment Proof Section */}
          {paymentProofUrl && (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-700 mb-3 text-center">
                Payment Proof
              </h4>
              
              {/* Image Preview */}
              <div className="mb-4 flex ">
                {!imageError ? (
                  <div className="relative">
                    <img
                      src={paymentProofUrl}
                      alt="Payment Proof"
                      className="h-96 w-96 object-contain rounded-lg border border-gray-200"
                      onError={handleImageError}
                    />

                  </div>
                ) : (
                  <div className="text-gray-400 text-center py-8">
                    <CreditCard className="w-16 h-16 mx-auto mb-3" />
                    <p className="text-sm">Image preview not available</p>
                    <a
                      href={paymentProofUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-600 text-xs hover:text-indigo-700 mt-2 inline-block"
                    >
                      Open in new tab
                    </a>
                  </div>
                )}
              </div>

              {/* Payment Amounts */}
              <div className="space-y-3">
                <div className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded">
                  <span className="text-sm font-medium text-gray-600">
                    Payment Amount:
                  </span>
                  <span className="text-md font-semibold text-gray-900">
                    {entry.payment?.ActualAmount || 'N/A'} 
                  </span>
                </div>
               {entry?.payment?.amount && (
                                <div className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded">
                  <span className="text-sm font-medium text-gray-600">
                    Expected Amount:
                  </span>
                  <span className="text-md font-semibold text-gray-900">
                    {entry.payment?.amount || 'N/A'} 
                  </span>
                </div>
               )}
              </div>
            </div>
          )}

          {/* Entry Information */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-gray-700 mb-3">
              Entry Information
            </h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 font-medium">Player:</span>
                <span className="text-sm text-gray-900">{entry.player?.name || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 font-medium">Current Status:</span>
                <span className={`text-sm font-medium ${
                  entry.eventStatus === 'approved' ? 'text-green-600' :
                  entry.eventStatus === 'rejected' ? 'text-red-600' :
                  'text-yellow-600'
                }`}>
                  {entry.eventStatus?.charAt(0).toUpperCase() + entry.eventStatus?.slice(1) || 'N/A'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-gray-200 sticky bottom-0 bg-white">
          <button
            onClick={handleCloseUpdateModal}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleUpdateStatus}
            disabled={!selectedStatus}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition font-medium"
          >
            Update Status
          </button>
        </div>
      </div>
    </div>
  );
};

export default StatusModal;