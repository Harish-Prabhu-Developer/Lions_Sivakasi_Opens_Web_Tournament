import { X, CreditCard, Loader2, IndianRupee, User, Calendar, Building, MapPin } from "lucide-react";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { API_URL } from "../../config";

const AcademyStatusModal = ({
  selectedStatus,
  setSelectedStatus,
  handleCloseUpdateModal,
  handleUpdateStatus,
  entry,
}) => {
  const [imageError, setImageError] = useState(false);
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [paidEvents, setPaidEvents] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Fetch payment events details
  const fetchPaymentEvents = async () => {
    if (!entry.payment?._id) {
      // If no payment ID, create mock data from current entry
      setPaidEvents([
        {
          category: entry.eventCategory,
          type: entry.eventType,
          calculatedAmount: entry.payment?.paymentAmount || 1100,
          status: entry.eventStatus,
          isCurrent: true
        },
      ]);
      setTotalAmount(entry.payment?.paymentAmount || 1100);
      return;
    }

    try {
      setLoadingEvents(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${API_URL}/api/v2/academy/entry/payment-events/${entry.payment._id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.data.success) {
        const data = response.data.data;
        setPaidEvents(data.paidEvents || []);
        setTotalAmount(data.totalAmount || entry.payment?.paymentAmount || 0);
      }
    } catch (error) {
      console.error("Error fetching payment events:", error);
      // Fallback to current entry data
      setPaidEvents([
        {
          category: entry.eventCategory,
          type: entry.eventType,
          calculatedAmount: entry.payment?.paymentAmount || 1100,
          status: entry.eventStatus,
          isCurrent: true
        },
      ]);
      setTotalAmount(entry.payment?.paymentAmount || 1100);
    } finally {
      setLoadingEvents(false);
    }
  };

  useEffect(() => {
    fetchPaymentEvents();
  }, [entry]);

  const getPaymentProofUrl = () => {
    if (!entry.payment?.paymentProof) return null;
    const proof = entry.payment.paymentProof;

    // Handle different proof formats
    if (typeof proof === 'string') {
      if (proof.startsWith("data:image/") || proof.startsWith("http")) {
        return proof;
      }
      return `${window.location.origin}${proof.startsWith("/") ? "" : "/"}${proof}`;
    } else if (proof.paymentProof) {
      // If proof is an object with paymentProof field
      const proofUrl = proof.paymentProof;
      if (proofUrl.startsWith("data:image/") || proofUrl.startsWith("http")) {
        return proofUrl;
      }
      return `${window.location.origin}${proofUrl.startsWith("/") ? "" : "/"}${proofUrl}`;
    }
    
    return null;
  };

  const handleImageError = () => setImageError(true);

  const formatCurrency = (amount) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const getPaymentDetails = () => {
    const proof = entry.payment?.paymentProof;
    if (!proof) return null;

    if (typeof proof === 'object') {
      return {
        amount: proof.ActualAmount,
        expectedData: proof.expertedData,
        metadata: proof.metadata,
        paymentBy: proof.paymentBy
      };
    }
    
    return {
      amount: entry.payment?.paymentAmount,
      expectedData: entry.payment?.paymentProof?.expertedData,
      metadata: entry.payment?.paymentProof?.metadata
    };
  };

  const paymentDetails = getPaymentDetails();

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-xl flex items-center justify-center z-50 px-4 py-8">
      <div className="bg-[#0f0f16]/90 backdrop-blur-2xl border border-white/10 rounded-3xl 
                      shadow-[0_0_40px_rgba(99,102,241,0.25)] w-full max-w-2xl max-h-[92vh] 
                      overflow-y-auto animate-[fadeIn_0.25s_ease]">

        {/* ===== Header ===== */}
        <div className="p-6 border-b border-white/10 bg-linear-to-r from-[#1a1a27] to-[#1c1c2e] rounded-t-3xl flex justify-between items-center">
          <h2 className="text-[1.4rem] font-semibold text-white tracking-tight">
            Update Entry Status
          </h2>
          <button
            onClick={handleCloseUpdateModal}
            className="p-2 rounded-full hover:bg-white/10 transition"
          >
            <X className="w-5 h-5 text-gray-300" />
          </button>
        </div>

        {/* ===== Body ===== */}
        <div className="p-6 space-y-8 text-gray-200">

          {/* Status Dropdown */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">
              Select Status
            </label>

            <div className="relative">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full p-3 pl-4 pr-10 bg-[#1b1b28] rounded-xl shadow-sm border border-white/10
                           text-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500
                           appearance-none"
              >
                <option value="">Choose status</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="pending">Pending</option>
              </select>

              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                ▼
              </div>
            </div>
          </div>

          {/* ===== Payment Proof ===== */}
          {getPaymentProofUrl() && (
            <div className="bg-[#161622] rounded-2xl p-5 border border-white/10 shadow-xl">
              <h4 className="text-center text-sm font-semibold text-gray-300 mb-4 tracking-wide">
                Payment Proof
              </h4>

              <div className="flex justify-center w-full mb-5">
                {!imageError ? (
                  <>
                    {/* Thumbnail (click to fullscreen) */}
                    <img
                      src={getPaymentProofUrl()}
                      alt="Payment Proof"
                      className="rounded-xl border w-full h-96 border-white/10 shadow-lg 
                                 object-contain cursor-pointer hover:opacity-80 transition"
                      onClick={() => setIsFullscreen(true)}
                      onError={handleImageError}
                    />

                    {/* Fullscreen Viewer */}
                    {isFullscreen && (
                      <div
                        className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center 
                                   justify-center z-9999 p-4 animate-fadeIn"
                        onClick={() => setIsFullscreen(false)}
                      >
                        <div className="relative max-w-4xl w-full">
                          
                          {/* Close Button */}
                          <button
                            className="absolute top-3 right-3 bg-white/20 backdrop-blur-md 
                                       text-white p-2 rounded-full hover:bg-white/30 transition"
                            onClick={(e) => {
                              e.stopPropagation();
                              setIsFullscreen(false);
                            }}
                          >
                            <X className="w-5 h-5" />
                          </button>

                          {/* Fullscreen Image */}
                          <img
                            src={getPaymentProofUrl()}
                            alt="Full Image"
                            className="rounded-xl max-h-[92vh] w-full object-contain 
                                       shadow-[0_0_25px_rgba(0,0,0,0.7)] animate-zoomIn"
                          />
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-10 text-gray-500">
                    <CreditCard className="w-14 h-14 mx-auto mb-3 opacity-70" />
                    <p>Preview not available</p>
                  </div>
                )}
              </div>

              {/* Total Payment */}
              <div className="p-4 rounded-xl bg-linear-to-r from-indigo-900/40 to-purple-900/40 
                              border border-indigo-500/20 shadow-lg">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <IndianRupee className="text-indigo-300 w-5 h-5" />
                    <span className="text-sm font-medium text-gray-300">
                      Total Payment
                    </span>
                  </div>
                  <p className="text-xl font-bold text-indigo-300">
                    {formatCurrency(totalAmount)}
                  </p>
                </div>
              </div>

              {/* Payment Transaction Details */}
              {paymentDetails?.metadata && (
                <div className="mt-6 bg-[#1a1a27] rounded-xl p-4 border border-white/10">
                  <h5 className="text-sm font-semibold text-gray-300 mb-3">
                    Transaction Details
                  </h5>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Payment App</span>
                      <span className="text-gray-200">{paymentDetails.metadata.paymentApp}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Amount</span>
                      <span className="text-gray-200">{formatCurrency(paymentDetails.metadata.paymentAmount)}</span>
                    </div>
                    {paymentDetails.metadata.receiverUpiId && (
                      <div className="flex justify-between">
                        <span className="text-gray-400">Receiver UPI</span>
                        <span className="text-gray-200">{paymentDetails.metadata.receiverUpiId}</span>
                      </div>
                    )}
                    {paymentDetails.expectedData?.receiverUpiId && (
                      <div className="flex justify-between">
                        <span className="text-gray-400">Expected Receiver</span>
                        <span className="text-gray-200">{paymentDetails.expectedData.receiverUpiId}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Paid Events */}
              <div className="mt-6">
                <div className="flex justify-between items-center mb-3">
                  <h5 className="text-sm font-semibold text-gray-300">
                    Paid Events
                  </h5>
                  <span className="text-xs text-gray-500">
                    {paidEvents.length} event{paidEvents.length !== 1 && "s"}
                  </span>
                </div>

                {loadingEvents ? (
                  <div className="flex justify-center py-10">
                    <Loader2 className="w-7 h-7 animate-spin text-indigo-400" />
                  </div>
                ) : (
                  <div className="space-y-4 max-h-60 overflow-y-auto pr-1">
                    {paidEvents.map((event, i) => {
                      const isCurrent = 
                        entry.eventCategory === event.category && 
                        entry.eventType === event.type;

                      return (
                        <div
                          key={i}
                          className={`rounded-xl p-4 shadow-md border transition 
                            ${
                              isCurrent
                                ? "bg-indigo-900/30 border-indigo-500/40 shadow-[0_0_12px_rgba(99,102,241,0.3)]"
                                : "bg-[#1a1a27] border-white/10"
                            }
                          `}
                        >
                          <div className="flex justify-between">
                            <p className="font-semibold text-gray-200">
                              {event.category} - {event.type}
                            </p>
                            <p className="font-semibold text-indigo-300">
                              {formatCurrency(event.calculatedAmount || 1100)}
                            </p>
                          </div>

                          {isCurrent && (
                            <span className="inline-flex items-center mt-2 px-3 py-1 text-xs
                                    bg-indigo-700/20 text-indigo-300 rounded-full border border-indigo-500/30">
                              <User className="w-3 h-3 mr-1" /> Current Entry
                            </span>
                          )}

                          <div className="mt-2">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-medium 
                                ${
                                  event.status === "approved"
                                    ? "bg-green-900/30 text-green-300 border border-green-600/30"
                                    : event.status === "rejected"
                                    ? "bg-red-900/30 text-red-300 border border-red-600/30"
                                    : "bg-yellow-900/30 text-yellow-300 border border-yellow-600/30"
                                }
                              `}
                            >
                              {event.status || "Pending"}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Current Entry Card */}
          <div className="bg-linear-to-br from-[#1a1a27] to-[#11111a] p-5 rounded-2xl 
                          border border-white/10 shadow-xl">
            <h4 className="text-sm font-semibold text-gray-300 mb-3">
              Current Entry Information
            </h4>

            <div className="space-y-4 text-sm text-gray-300">
              {/* Player Info */}
              <div className="flex items-start gap-3">
                <User className="w-4 h-4 text-indigo-400 mt-1 shrink-0" />
                <div className="flex-1">
                  <div className="font-medium text-gray-200">{entry.player?.fullName || "N/A"}</div>
                  {entry.player?.tnbaId && (
                    <div className="text-xs text-gray-400 mt-1">TNBA ID: {entry.player.tnbaId}</div>
                  )}
                </div>
              </div>

              {/* Academy Info */}
              <div className="flex items-start gap-3">
                <Building className="w-4 h-4 text-indigo-400 mt-1 shrink-0" />
                <div className="flex-1">
                  <div className="font-medium text-gray-200">{entry.Academy?.academyName || "N/A"}</div>
                  <div className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {entry.Academy?.place && `${entry.Academy.place}, `}{entry.Academy?.district}
                  </div>
                </div>
              </div>

              {/* Event Info */}
              <div className="flex items-start gap-3">
                <Calendar className="w-4 h-4 text-indigo-400 mt-1 shrink-0" />
                <div className="flex-1">
                  <div className="font-medium text-gray-200">{entry.eventCategory} - {entry.eventType}</div>
                  <div className="text-xs text-gray-400 mt-1">
                    Registered: {formatDate(entry.registrationDate)}
                  </div>
                </div>
              </div>

              {/* Partner Info */}
              {entry.partner?.fullName && (
                <div className="flex items-start gap-3">
                  <User className="w-4 h-4 text-indigo-400 mt-1 shrink-0" />
                  <div className="flex-1">
                    <div className="font-medium text-gray-200">Partner: {entry.partner.fullName}</div>
                    {entry.partner.TnBaId && (
                      <div className="text-xs text-gray-400 mt-1">Partner TNBA ID: {entry.partner.TnBaId}</div>
                    )}
                  </div>
                </div>
              )}

              {/* Current Status */}
              <div className="flex justify-between items-center pt-2 border-t border-white/10">
                <span className="text-gray-400">Current Status</span>
                <span
                  className={`font-medium px-3 py-1 rounded-full text-xs
                    ${
                      entry.eventStatus === "approved"
                        ? "text-green-400 bg-green-900/30 border border-green-600/30"
                        : entry.eventStatus === "rejected"
                        ? "text-red-400 bg-red-900/30 border border-red-600/30"
                        : "text-yellow-400 bg-yellow-900/30 border border-yellow-600/30"
                    }
                  `}
                >
                  {entry.eventStatus || "Pending"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ===== Footer ===== */}
        <div className="p-6 border-t border-white/10 bg-[#13131d] rounded-b-3xl flex justify-end gap-3">
          <button
            onClick={handleCloseUpdateModal}
            className="px-4 py-2 rounded-xl border border-white/10 bg-[#1a1a27] text-gray-300 
                       hover:bg-white/10 transition font-medium"
          >
            Cancel
          </button>

          <button
            onClick={handleUpdateStatus}
            disabled={!selectedStatus}
            className="px-4 py-2 rounded-xl bg-indigo-600/90 text-white font-medium shadow 
                       hover:bg-indigo-700 disabled:bg-gray-600 disabled:cursor-not-allowed"
          >
            Update Status
          </button>
        </div>
      </div>
      
      {/* CSS Animations */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes zoomIn {
          from { transform: scale(0.85); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }

        .animate-fadeIn {
          animation: fadeIn 0.25s ease-out;
        }

        .animate-zoomIn {
          animation: zoomIn 0.25s ease-out;
        }
      `}</style>
    </div>
  );
};

export default AcademyStatusModal;