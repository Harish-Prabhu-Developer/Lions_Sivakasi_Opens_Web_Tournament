import React from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  ArrowLeft,
  User,
  Calendar,
  Tag,
  CreditCard,
  CheckCircle,
  XCircle,
  Clock,
  Mail,
  Phone,
  MapPin,
  Users,
  Eye,
  Download,
  Shield,
  Building,
  Navigation,
} from "lucide-react";

const EntriesDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  // Get the entry data from route state
  const entry = location.state?.entry;

  // Status badge component
  const StatusBadge = ({ status }) => {
    const getStatusConfig = (status) => {
      const config = {
        approved: {
          color: "bg-green-100 text-green-800 border-green-200",
          icon: CheckCircle,
        },
        rejected: {
          color: "bg-red-100 text-red-800 border-red-200",
          icon: XCircle,
        },
        pending: {
          color: "bg-yellow-100 text-yellow-800 border-yellow-200",
          icon: Clock,
        },
      };
      return config[status] || config.pending;
    };

    const { color, icon: Icon } = getStatusConfig(status);

    return (
      <span
        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium border ${color}`}
      >
        <Icon className="w-4 h-4" />
        {status?.charAt(0).toUpperCase() + status?.slice(1)}
      </span>
    );
  };

  // Payment status badge
  const PaymentBadge = ({ status }) => {
    const getPaymentConfig = (status) => {
      const config = {
        Paid: {
          color: "bg-green-100 text-green-800 border-green-200",
          icon: CheckCircle,
        },
        Unpaid: {
          color: "bg-red-100 text-red-800 border-red-200",
          icon: XCircle,
        },
        Pending: {
          color: "bg-yellow-100 text-yellow-800 border-yellow-200",
          icon: Clock,
        },
      };
      return config[status] || config.Pending;
    };

    const { color, icon: Icon } = getPaymentConfig(status);

    return (
      <span
        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium border ${color}`}
      >
        <Icon className="w-4 h-4" />
        {status}
      </span>
    );
  };

  // Handle view payment proof
  const handleViewPaymentProof = () => {
    if (!entry.payment?.paymentProof) {
      alert("No payment proof available");
      return;
    }

    const paymentProof = entry.payment.paymentProof;

    // Check if it's a base64 string
    if (paymentProof.startsWith("data:image/")) {
      // For base64 images, open in new window
      const newWindow = window.open();
      if (newWindow) {
        newWindow.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>Payment Proof - ${entry.entryRefId}</title>
              <style>
                body { 
                  margin: 0; 
                  padding: 20px; 
                  display: flex; 
                  justify-content: center; 
                  align-items: center; 
                  min-height: 100vh; 
                  background: #f5f5f5; 
                }
                img { 
                  max-width: 100%; 
                  max-height: 90vh; 
                  border: 1px solid #ddd; 
                  border-radius: 8px; 
                  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                }
              </style>
            </head>
            <body>
              <img src="${paymentProof}" alt="Payment Proof" />
            </body>
          </html>
        `);
        newWindow.document.close();
      }
    }
    // Check if it's a URL (http/https)
    else if (
      paymentProof.startsWith("http://") ||
      paymentProof.startsWith("https://")
    ) {
      // For URLs, open directly in new tab
      window.open(paymentProof, "_blank");
    }
    // Check if it's a file path (assuming it's accessible via your API)
    else {
      // For file paths, construct the full URL
      const fullUrl = `${window.location.origin}${
        paymentProof.startsWith("/") ? "" : "/"
      }${paymentProof}`;
      window.open(fullUrl, "_blank");
    }
  };

  // Handle download payment proof
  const handleDownloadPaymentProof = () => {
    if (!entry.payment?.paymentProof) {
      alert("No payment proof available to download");
      return;
    }

    const paymentProof = entry.payment.paymentProof;
    const link = document.createElement("a");

    if (paymentProof.startsWith("data:image/")) {
      // For base64 images
      link.href = paymentProof;
      link.download = `payment-proof-${entry.entryRefId}.png`;
    } else if (
      paymentProof.startsWith("http://") ||
      paymentProof.startsWith("https://")
    ) {
      // For URLs
      link.href = paymentProof;
      link.download = `payment-proof-${entry.entryRefId}`;
    } else {
      // For file paths
      link.href = `${window.location.origin}${
        paymentProof.startsWith("/") ? "" : "/"
      }${paymentProof}`;
      link.download = `payment-proof-${entry.entryRefId}`;
    }

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Handle verify payment
  const handleVerifyPayment = () => {
    // Implement payment verification logic here
    console.log("Verify payment for:", entry.entryRefId);
    alert("Payment verification functionality would be implemented here");
  };

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

  // If no entry data is passed, show error
  if (!entry) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Entry Not Found
          </h2>
          <p className="text-gray-600 mb-4">
            The requested entry could not be found.
          </p>
          <button
            onClick={() => navigate("/entries")}
            className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition"
          >
            Back to Entries
          </button>
        </div>
      </div>
    );
  }

  const paymentProofUrl = getPaymentProofUrl();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 ">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate("/entries")}
            className="bg-indigo-600 flex flex-row item-center justify-center gap-4 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Entries
          </button>

          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Entry Details
              </h1>
              <p className="text-gray-600 mt-2">Entry ID: {entry.entryRefId}</p>
            </div>
            <div className="flex flex-wrap gap-3 mt-4 lg:mt-0">
              <StatusBadge status={entry.eventStatus} />
              <PaymentBadge status={entry.payment?.status} />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content - 2/3 width on large screens */}
          <div className="lg:col-span-2 space-y-6">
            {/* Player Information Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-indigo-100 rounded-lg">
                  <User className="w-6 h-6 text-indigo-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Player Information
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Full Name
                    </label>
                    <p className="text-lg text-gray-900 mt-1">
                      {entry.player?.name || "N/A"}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      TNBA ID
                    </label>
                    <p className="text-lg text-gray-900 mt-1">
                      {entry.player?.TnBaId || "N/A"}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Gender
                    </label>
                    <p className="text-lg text-gray-900 mt-1 capitalize">
                      {entry.player?.gender || "N/A"}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Date of Birth
                    </label>
                    <p className="text-lg text-gray-900 mt-1">
                      {entry.player?.dob
                        ? new Date(entry.player.dob).toLocaleDateString()
                        : "N/A"}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Phone
                    </label>
                    <p className="text-lg text-gray-900 mt-1">
                      {entry.player?.phone ? entry.player?.phone : "N/A"}
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Academy
                    </label>
                    <div className="flex items-center gap-2 text-gray-900 mt-1">
                      <Building className="w-4 h-4 text-gray-400" />
                      <span className="text-lg">
                        {entry.player?.academyName || "N/A"}
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Place
                    </label>
                    <div className="flex items-center gap-2 text-gray-900 mt-1">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span className="text-lg">
                        {entry.player?.place || "N/A"}
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      District
                    </label>
                    <div className="flex items-center gap-2 text-gray-900 mt-1">
                      <Navigation className="w-4 h-4 text-gray-400" />
                      <span className="text-lg">
                        {entry.player?.district || "N/A"}
                      </span>
                    </div>
                  </div>
                  {entry.player?.state && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        State
                      </label>
                      <p className="text-lg text-gray-900 mt-1">
                        {entry.player.state}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Event Details Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Calendar className="w-6 h-6 text-blue-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Event Details
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Event Category
                    </label>
                    <p className="text-lg text-gray-900 mt-1">
                      {entry.eventCategory}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Event Type
                    </label>
                    <div className="flex items-center gap-2 mt-1">
                      <Tag className="w-4 h-4 text-gray-400" />
                      <span className="text-lg text-gray-900 capitalize">
                        {entry.eventType}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Registration Date
                    </label>
                    <p className="text-lg text-gray-900 mt-1">
                      {new Date(entry.registrationDate).toLocaleDateString(
                        "en-US",
                        {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        }
                      )}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Registration Time
                    </label>
                    <p className="text-lg text-gray-900 mt-1">
                      {new Date(entry.registrationDate).toLocaleTimeString(
                        "en-US",
                        {
                          hour: "numeric",
                          minute: "numeric",
                        }
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Partner Information Card (if doubles) */}
            {entry.isDoubles && entry.partner && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Users className="w-6 h-6 text-green-600" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    Partner Information
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Full Name
                      </label>
                      <p className="text-lg text-gray-900 mt-1">
                        {entry.partner.fullname}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        TNBA ID
                      </label>
                      <p className="text-lg text-gray-900 mt-1">
                        {entry.partner.TnBaId}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Date of Birth
                      </label>
                      <p className="text-lg text-gray-900 mt-1">
                        {entry.partner.dob
                          ? new Date(entry.partner.dob).toLocaleDateString()
                          : "N/A"}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Academy
                      </label>
                      <div className="flex items-center gap-2 text-gray-900 mt-1">
                        <Building className="w-4 h-4 text-gray-400" />
                        <span className="text-lg">
                          {entry.partner.academyName || "N/A"}
                        </span>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Place
                      </label>
                      <div className="flex items-center gap-2 text-gray-900 mt-1">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        <span className="text-lg">
                          {entry.partner.place || "N/A"}
                        </span>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        District
                      </label>
                      <div className="flex items-center gap-2 text-gray-900 mt-1">
                        <Navigation className="w-4 h-4 text-gray-400" />
                        <span className="text-lg">
                          {entry.partner.district || "N/A"}
                        </span>
                      </div>
                    </div>
                    {entry.partner?.state && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">
                          State
                        </label>
                        <p className="text-lg text-gray-900 mt-1">
                          {entry.partner.state}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar - 1/3 width on large screens */}
          <div className="space-y-6">
            {/* Payment Information Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <CreditCard className="w-6 h-6 text-purple-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Payment Details
                </h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Payment Status
                  </label>
                  <div className="mt-2">
                    <PaymentBadge status={entry.payment?.status} />
                  </div>
                </div>

                    {entry.payment.amount && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">
                          Amount
                        </label>
                        <p className="text-lg text-gray-900 mt-1">
                          ${entry.payment.amount}
                        </p>
                      </div>
                    )}
                {entry.payment && (
                  <>
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Payment App
                      </label>
                      <p className="text-lg text-gray-900 mt-1">
                        {entry.payment.app || "N/A"}
                      </p>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Payment Date
                      </label>
                      <p className="text-lg text-gray-900 mt-1">
                        {entry.payment.createdAt
                          ? new Date(
                              entry.payment.createdAt
                            ).toLocaleDateString()
                          : "N/A"}
                      </p>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Payment Time
                      </label>
                      <p className="text-lg text-gray-900 mt-1">
                        {entry.payment.createdAt
                          ? new Date(
                              entry.payment.createdAt
                            ).toLocaleTimeString()
                          : "N/A"}
                      </p>
                    </div>

                  </>
                )}
              </div>
            </div>

            {/* Payment Proof Verification Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Shield className="w-6 h-6 text-orange-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Payment Proof
                </h2>
              </div>

              <div className="space-y-4">
                {paymentProofUrl ? (
                  <>
                    {/* Payment Proof Preview */}
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                      <div className="mb-3">
                        <img
                          src={paymentProofUrl}
                          alt="Payment Proof"
                          className="mx-auto max-h-32 object-contain rounded"
                          onError={(e) => {
                            e.target.style.display = "none";
                            e.target.nextSibling.style.display = "block";
                          }}
                        />
                        <div
                          style={{ display: "none" }}
                          className="text-gray-400"
                        >
                          <CreditCard className="w-12 h-12 mx-auto mb-2" />
                          <p className="text-sm">Preview not available</p>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">
                        Payment proof uploaded
                      </p>

                      {/* Action Buttons */}
                      <div className="flex flex-col gap-2">
                        <button
                          onClick={handleViewPaymentProof}
                          className="flex items-center justify-center gap-2 bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition text-sm font-medium"
                        >
                          <Eye className="w-4 h-4" />
                          View Full Image
                        </button>
                        <button
                          onClick={handleDownloadPaymentProof}
                          className="flex items-center justify-center gap-2 border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50 transition text-sm font-medium"
                        >
                          <Download className="w-4 h-4" />
                          Download Proof
                        </button>
                      </div>
                    </div>

                    {/* Verification Status */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Shield className="w-4 h-4 text-blue-600" />
                        <span className="text-sm font-medium text-blue-800">
                          Verification Status
                        </span>
                      </div>
                      <p className="text-sm text-blue-700">
                        {entry.payment?.verified
                          ? "Payment proof has been verified and approved."
                          : "Payment proof is pending verification."}
                      </p>
                    </div>

                    {/* Verify Button */}
                    {!entry.payment?.verified && (
                      <button
                        onClick={handleVerifyPayment}
                        className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition text-sm font-medium flex items-center justify-center gap-2"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Verify Payment
                      </button>
                    )}
                  </>
                ) : (
                  <div className="text-center py-8">
                    <div className="bg-gray-100 rounded-full p-3 inline-flex mb-3">
                      <XCircle className="w-6 h-6 text-gray-400" />
                    </div>
                    <p className="text-gray-500 text-sm">
                      No payment proof uploaded
                    </p>
                    <p className="text-gray-400 text-xs mt-1">
                      Player has not submitted payment proof
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Approval Information Card */}
            {entry?.approvedBy?._id && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    Approval Details
                  </h2>
                </div>

                <div className="space-y-4">
                  {entry.approvedBy?.name && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Approved By
                      </label>
                      <p className="text-lg text-gray-900 mt-1">
                        {entry.approvedBy?.name || "N/A"}
                      </p>
                    </div>
                  )}

                  {entry.approvedBy && (
                    <>
                      {entry?.approvedBy.email && (
                        <div>
                          <label className="text-sm font-medium text-gray-500">
                            Email
                          </label>
                          <div className="flex items-center gap-1 text-gray-900 mt-1">
                            <Mail className="w-4 h-4" />
                            <span>{entry.approvedBy.email}</span>
                          </div>
                        </div>
                      )}

                      {entry?.approvedBy.phone && (
                        <div>
                          <label className="text-sm font-medium text-gray-500">
                            Phone
                          </label>
                          <div className="flex items-center gap-1 text-gray-900 mt-1">
                            <Phone className="w-4 h-4" />
                            <span>{entry.approvedBy.phone}</span>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Quick Actions Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Quick Actions
              </h3>
              <div className="space-y-3">
                <button className="w-full border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50 transition text-sm font-medium">
                  Contact Player
                </button>
                <button className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition text-sm font-medium">
                  Update Status
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EntriesDetailPage;
