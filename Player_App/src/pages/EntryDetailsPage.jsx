import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Edit,
  CreditCard,
  User,
  Phone,
  Hash,
  Calendar,
  School,
  MapPin,
  Landmark,
  BadgeCheck,
} from "lucide-react";
import { toast } from "react-hot-toast";

const EntryDetailsPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { state } = location || {};
  const entry = state?.entry || {};
  console.log("Entry : ",entry);
  
  const [isEditing, setIsEditing] = useState(false);
  const [partnerData, setPartnerData] = useState(entry?.partner || {});

  const player = entry?.player || {};
  const partner = entry?.partner;
  const payment = entry?.payment;
  const approvedBy = entry?.ApproverdBy;

  const iconMap = {
    "Full Name": <User className="w-4 h-4 text-cyan-400" />,
    "TNBA ID": <Hash className="w-4 h-4 text-cyan-400" />,
    "Date of Birth": <Calendar className="w-4 h-4 text-cyan-400" />,
    "Academy Name": <School className="w-4 h-4 text-cyan-400" />,
    Place: <MapPin className="w-4 h-4 text-cyan-400" />,
    District: <Landmark className="w-4 h-4 text-cyan-400" />,
  };

  const handleEditToggle = () => setIsEditing(!isEditing);

  const handleInputChange = (key, value) =>
    setPartnerData((prev) => ({ ...prev, [key]: value }));

  const handleSave = () => {
    toast.success("Request sent to admin for partner update!");
    setIsEditing(false);
  };

  return (
    <div className="min-h-screen bg-[#0f172a] flex flex-col text-gray-100">
      {/* Header */}
      <div className="flex items-center p-5 bg-[#1e293b] shadow-md border-b border-gray-700">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-full hover:bg-[#334155] transition"
        >
          <ArrowLeft size={20} className="text-cyan-400" />
        </button>
        <h1 className="text-xl font-semibold text-white ml-3 tracking-wide">
          Entry Details
        </h1>
      </div>

      {/* Content */}
      <div className="p-6 max-w-5xl mx-auto w-full space-y-8">

        {/* Entry Info */}
        <SectionCard title="Entry Information" icon={<BadgeCheck className="text-indigo-400" />}>
          <div className="grid md:grid-cols-2 gap-6">
            <InfoRow label="Category" value={entry.category} />
            <InfoRow label="Type" value={entry.type} />
            <div className="flex flex-col">
              <span className="text-gray-400 text-sm mb-1">Status</span>
              <StatusTag status={entry.status} />
            </div>
            <InfoRow
              label="Registration Date"
              value={
                entry.RegistrationDate
                  ? new Date(entry.RegistrationDate).toLocaleString()
                  : "—"
              }
            />
          </div>
        </SectionCard>

        {/* Partner Info */}
        {partner && (
          <div className="bg-gradient-to-br from-[#1e293b]/80 to-[#0f172a]/90 border border-cyan-400/20 rounded-2xl shadow-lg p-6 backdrop-blur-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-cyan-300 flex items-center gap-2">
                <User className="w-5 h-5 text-cyan-400" /> Partner Details
              </h3>
              <button
                onClick={handleEditToggle}
                className="flex items-center gap-2 px-3 py-1.5 bg-cyan-500 text-white rounded-md text-sm hover:bg-cyan-600 transition"
              >
                <Edit className="w-4 h-4" />
                {isEditing ? "Cancel" : "Edit"}
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {[
                { label: "Full Name", key: "fullname" },
                { label: "TNBA ID", key: "TnBaId" },
                { label: "Date of Birth", key: "dob" },
                { label: "Academy Name", key: "academyName" },
                { label: "Place", key: "place" },
                { label: "District", key: "district" },
              ].map(({ label, key }) => (
                <div key={key} className="flex flex-col">
                  <label className="text-sm text-gray-400 flex items-center gap-2 py-2">
                    {iconMap[label]} <span>{label}</span>
                  </label>
                  {isEditing ? (
                    <input
                      type={label === "Date of Birth" ? "date" : "text"}
                      value={partnerData[key] || ""}
                      onChange={(e) => handleInputChange(key, e.target.value)}
                      className="p-2 rounded-md bg-[#141C2F] border border-gray-600 text-gray-200 focus:outline-none focus:ring-1 focus:ring-cyan-400"
                    />
                  ) : (
                    <p className="mt-1 text-gray-300">{partnerData[key] || "-"}</p>
                  )}
                </div>
              ))}
            </div>

            {isEditing && (
              <div className="mt-6 flex justify-end">
                <button
                  onClick={handleSave}
                  className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 rounded-lg text-white font-semibold shadow-md transition-all"
                >
                  Send Request to Admin
                </button>
              </div>
            )}
          </div>
        )}

        {/* Payment Info */}
        {payment && (
          <SectionCard title="Payment Information" icon={<CreditCard className="text-purple-400" />}>
            <div className="grid md:grid-cols-2 gap-6">
              {payment.metadata?.paymentApp && (<InfoRow label="Payment App" value={payment.metadata?.paymentApp} />)}
              {payment.status && (<InfoRow label="Payment Status" value={payment.status} />)}
              {payment.metadata?.paymentAmount && (<InfoRow label="Amount" value={payment.metadata?.paymentAmount ?? "N/A"} />)}
              {payment.metadata?.senderUpiId && (<InfoRow label="UPI ID" value={payment.metadata?.senderUpiId ?? "N/A"} />)}
            </div>
            <div className="mt-4">
              <img
                src={payment.paymentProof}
                alt="Payment Proof"
                className="w-48 rounded-lg border border-gray-600 shadow-md"
              />
            </div>
          </SectionCard>
        )}

        {/* Approved By */}
        {approvedBy && (
          <SectionCard title="Approved By" icon={<User className="text-green-400" />}>
            <div className="grid md:grid-cols-2 gap-6">
              <InfoRow label="Name" value={approvedBy.name} />
              <InfoRow label="Email" value={approvedBy.email} />
              <InfoRow label="Phone" value={approvedBy.phone} />
              <InfoRow label="Role" value={approvedBy.role} />
            </div>
          </SectionCard>
        )}
      </div>
    </div>
  );
};

// ===== Sub Components =====
const SectionCard = ({ title, icon, children }) => (
  <div className="bg-gradient-to-br from-[#1e293b]/80 to-[#0f172a]/90 border border-gray-700 rounded-2xl p-6 shadow-md hover:shadow-cyan-500/10 transition-all duration-300">
    <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
      {icon} {title}
    </h2>
    {children}
  </div>
);

const InfoRow = ({ label, value }) => (
  <div className="flex flex-col">
    <span className="text-gray-400 text-sm font-medium">{label}</span>
    <span className="text-gray-100 font-semibold">{value || "—"}</span>
  </div>
);

const StatusTag = ({ status }) => {
  const colors = {
    approved: "bg-green-400/10 text-green-300 border-green-500/40",
    pending: "bg-yellow-400/10 text-yellow-300 border-yellow-500/40",
    rejected: "bg-red-400/10 text-red-300 border-red-500/40",
  };

  return (
    <span
      className={`min-w-[120px] inline-flex justify-center items-center px-4 py-1.5 text-sm font-semibold rounded-full border transition-all duration-300 tracking-wide backdrop-blur-sm ${
        colors[status] ||
        "bg-gray-700/30 text-gray-300 border-gray-500/40"
      }`}
    >
      {status ? status.toUpperCase() : "UNKNOWN"}
    </span>
  );
};


export default EntryDetailsPage;
