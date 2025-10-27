import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, Edit, CheckCircle, CreditCard, Shield,User, Hash, Calendar, School, MapPin, LocateIcon } from "lucide-react";
import { toast } from "react-hot-toast";
const EntryDetailsPage = () => {
// Icons mapping per label
const iconMap = {
  "Full Name": <User className="w-5 h-5 text-cyan-300" />,
  "TNBA ID": <Hash className="w-5 h-5 text-cyan-300" />,
  "Date of Birth": <Calendar className="w-5 h-5 text-cyan-300" />,
  "Academy Name": <School className="w-5 h-5 text-cyan-300" />,
  "Place": <MapPin className="w-5 h-5 text-cyan-300" />,
  "District": <LocateIcon className="w-5 h-5 text-cyan-300" />,
};

  const location = useLocation();
  const navigate = useNavigate();
  const entry = location.state?.entry;

  const [isEditing, setIsEditing] = useState(false);
  const [partnerData, setPartnerData] = useState(entry?.Partner || {});

  if (!entry) {
    return (
      <div className="flex flex-col items-center justify-center h-screen text-gray-300">
        <p className="text-lg mb-4">No Entry Data Found</p>
        <button
          onClick={() => navigate("/dashboard")}
          className="px-6 py-2 bg-cyan-500 hover:bg-cyan-400 text-white font-semibold rounded-lg"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  const handleEditToggle = () => {
    console.log("Entry Details:", partnerData);
    
    setIsEditing(!isEditing);
  };

  const handleInputChange = (field, value) => {
    setPartnerData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    // Normally would call API to request admin permission
    setIsEditing(false);
    toast.success("Request sent to admin for approval.",{ duration: 4000 });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a192f] to-[#0f223f] text-gray-100 px-4 sm:px-6 md:px-10 pt-8 pb-24">
      {/* Header */}
      <div className="flex items-center justify-start gap-8 mb-8">
        <button
          onClick={() => navigate("/dashboard")}
          className="flex items-center gap-2 btn btn-secondary transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">Back</span>
        </button>

        <h3 className="text-2xl md:text-3xl text-center font-bold text-white">
          Entry Details
        </h3>
      </div>

      {/* Category Banner */}
      <div className="bg-gradient-to-r from-cyan-500/30 to-blue-500/30 border border-cyan-400/20 rounded-xl px-6 py-4 mb-8 shadow-lg">
        <h2 className="text-xl md:text-2xl font-semibold text-white mb-1">
          {entry.category} – {entry.type}
        </h2>
        <p className="text-sm text-gray-300">
          Registered on{" "}
          {new Date(entry.RegistrationDate).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })}
        </p>
      </div>

      {/* Partner Details */}
      <div className="bg-[#192339]/80 border border-cyan-400/10 rounded-xl shadow-md p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg md:text-xl font-semibold text-white flex items-center gap-2">
            <User className="w-5 h-5 text-cyan-400" /> Partner Details
          </h3>
          <button
            onClick={handleEditToggle}
            className="flex items-center gap-2 btn btn-primary transition-all"
          >
            <Edit className="w-4 h-4" />
            <span>{isEditing ? "Cancel" : "Edit"}</span>
          </button>
        </div>

        {/* 🔹 Map labels to actual partnerData keys */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {[
            { label: "Full Name", key: "fullName" },
            { label: "TNBA ID", key: "TNBAID" },
            { label: "Date of Birth", key: "dob" },
            { label: "Academy Name", key: "academy" },
            { label: "Place", key: "place" },
            { label: "District", key: "district" },
          ].map(({ label, key }) => (
            <div key={key} className="flex flex-col">
              <label className="text-sm text-gray-400 flex items-center gap-2 py-4 ">
                {iconMap[label]} <span>{label}</span>
              </label>
              {isEditing ? (
                <input
                  type={label === "Date of Birth" ? "date" : "text"}
                  value={partnerData[key] || ""}
                  onChange={(e) => handleInputChange(key, e.target.value)}
                  className="p-2 rounded-md bg-[#141C2F] border border-gray-600 text-gray-200 py-4 focus:outline-none focus:ring-1 focus:ring-cyan-400 placeholder-gray-500"
                  placeholder={`Enter ${label}`}
                />
              ) : (
                <p className="mt-1 text-gray-200">{partnerData[key] || "-"}</p>
              )}
            </div>
          ))}
        </div>

        {isEditing && (
          <div className="mt-6 flex justify-end">
            <button
              onClick={handleSave}
              className="px-6 py-2 btn btn-primary rounded-lg text-white font-semibold shadow-md transition-all"
            >
              Send Request to Admin
            </button>
          </div>
        )}
      </div>


      {/* Admin Approval Details */}
      <div className="bg-[#192339]/80 border border-cyan-400/10 rounded-xl shadow-md p-6">
        <h3 className="text-lg md:text-xl font-semibold text-white flex items-center gap-2 mb-4">
          <Shield className="w-5 h-5 text-cyan-400" /> Admin Approval
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-gray-200">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-400" />
            <p>
              Approved By:{" "}
              <span className="font-medium">
                {entry.adminApproval?.approvedBy?.name}
              </span>
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-cyan-400" />
            <p>
              Approved Date:{" "}
              {new Date(entry.adminApproval?.approvedDate).toLocaleDateString(
                "en-GB",
                { day: "2-digit", month: "short", year: "numeric" }
              )}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-teal-400" />
            <p>
              Payment:{" "}
              <span className="font-medium">
                ₹{entry.adminApproval?.paymentAmount} ({entry.adminApproval?.paymentApp})
              </span>
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-cyan-400" />
            <p>
              Payment Date:{" "}
              {new Date(entry.adminApproval?.paymentDate).toLocaleDateString(
                "en-GB",
                { day: "2-digit", month: "short", year: "numeric" }
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EntryDetailsPage;
