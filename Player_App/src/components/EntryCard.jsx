// EntryCard.jsx
import React from "react";
import { CheckCircle, Clock, XCircle, CreditCard, User } from "lucide-react";
import { useNavigate } from "react-router-dom";

const EntryCard = ({ entry }) => {
    console.log("Entry Card : ",entry);
    
    const Navigate = useNavigate();
    const getStatusColor = (status) => {
    switch (status) {
      case "approved":
        return "text-green-400";
      case "pending":
        return "text-yellow-400";
      case "rejected":
        return "text-red-400";
      default:
        return "text-gray-400";
    }
  };

  const getStatusBg = (status) => {
    switch (status) {
      case "approved":
        return "bg-green-400/10 border-green-400/20";
      case "pending":
        return "bg-yellow-400/10 border-yellow-400/20";
      case "rejected":
        return "bg-red-400/10 border-red-400/20";
      default:
        return "bg-gray-400/10 border-gray-400/20";
    }
  };

  const getPaymentColor = (paymentStatus) => {
    switch (paymentStatus) {
      case "Paid":
        return "text-green-400";
      case "Pending":
        return "text-yellow-400";
      case "Failed":
        return "text-red-400";
      default:
        return "text-teal-400";
    }
  };

  const StatusIcon =
    entry.status === "approved"
      ? CheckCircle
      : entry.status === "pending"
      ? Clock
      : XCircle;

  const PaymentIcon = CreditCard;


  return (
    <div className="bg-gradient-to-b from-[#1b2436] to-[#141C2F] border border-cyan-400/10 hover:border-cyan-400/40 rounded-2xl shadow-md p-6 transition-all duration-300 hover:shadow-cyan-500/20 hover:scale-[1.02]">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg sm:text-xl font-semibold text-white">
            {entry.category} - {entry.type}
          </h3>
          <p className="text-xs text-gray-400 mt-1">
            Registered on{" "}
            {new Date(entry.RegistrationDate).toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })}
          </p>
        </div>

        {/* Status Badge */}
        <div
          className={`flex items-center gap-1 px-3 py-1 rounded-full border ${getStatusBg(
            entry.status
          )}`}
        >
          <StatusIcon className={`w-4 h-4 ${getStatusColor(entry.status)}`} />
          <span
            className={`text-xs font-medium ${getStatusColor(entry.status)}`}
          >
            {entry.status}
          </span>
        </div>
      </div>

      {/* Partner Name (if available) */}
      {entry.Partner?.name && (
        <div className="flex items-center gap-2 mb-3 text-gray-300 text-sm">
          <User className="w-4 h-4 text-cyan-400" />
          <p>
            Partner:{" "}
            <span className="text-white font-medium">
              {entry.Partner.name}
            </span>
          </p>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-700/50">
        <div className="flex items-center gap-2">
          <PaymentIcon
            className={`w-5 h-5 ${getPaymentColor(entry.payment?.status)}`}
          />
          <span
            className={`text-sm font-medium ${getPaymentColor(
              entry.payment?.status
            )}`}
          >
            {entry.payment?.status}
          </span>
        </div>

        <button
          className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-cyan-400 rounded-md text-white text-sm font-semibold hover:scale-105 active:scale-95 transition-all duration-300 shadow-md"
          onClick={() => Navigate(`/entrydetails/${entry._id}`, { state: { entry } })}

        >
          View Details
        </button>
      </div>
    </div>
  );
};

export default EntryCard;
