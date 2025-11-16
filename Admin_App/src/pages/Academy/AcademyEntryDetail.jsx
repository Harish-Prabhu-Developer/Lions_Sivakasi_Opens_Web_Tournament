import { useState, useEffect } from "react";
import { useParams, useNavigate} from "react-router-dom";
import { 
  ArrowLeft, 
  Mail, 
  Phone, 
  Calendar, 
  Clock, 
  Download, 
  ExternalLink,
  User,
  Building,
  MapPin,
  CreditCard,
  CheckCircle,
  XCircle,
  Clock4
} from "lucide-react";
import { toast } from "react-hot-toast";
import axios from "axios";
import { API_URL } from "../../config";

const AcademyEntryDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [entry, setEntry] = useState(null);
  const [loading, setLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("");
    // Debug: Check what useParams returns    
  // Fetch entry details
  const fetchEntryDetails = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${API_URL}/api/v2/academy/entry/details/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      if (response.data.success) {
        setEntry(response.data.data);
      } else {
        toast.error("Failed to fetch entry details");
        navigate(-1);
      }
    } catch (error) {
      console.error("Error fetching entry details:", error);
      toast.error("Error loading entry details");
      navigate(-1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchEntryDetails();
    }
  }, [id]);

  const getPaymentProofUrl = () => {
    if (!entry?.payment?.paymentProof) return null;
    const proof = entry.payment.paymentProof;

    if (typeof proof === 'string') {
      if (proof.startsWith("data:image/") || proof.startsWith("http")) {
        return proof;
      }
      return `${window.location.origin}${proof.startsWith("/") ? "" : "/"}${proof}`;
    } else if (proof.paymentProof) {
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
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const getPaymentDate = () => {
    return entry?.payment?.createdAt || entry?.payment?.paymentProof?.createdAt;
  };

  const downloadProof = () => {
    const proofUrl = getPaymentProofUrl();
    if (proofUrl) {
      const link = document.createElement('a');
      link.href = proofUrl;
      link.download = `payment-proof-${id}.jpg`;
      link.click();
      toast.success("Payment proof downloaded");
    }
  };

  const handleUpdateStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `${API_URL}/api/v2/academy/entry/${id}/events/${selectedEntry.eventId}`,
        { status: selectedStatus },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.data.success) {
        toast.success("Status updated successfully!");
 
        fetchEntryDetails(); // Refresh data
      } else {
        toast.error(response.data.msg || "Failed to update status");
      }
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Failed to update status");
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "rejected":
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock4 className="w-5 h-5 text-yellow-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "approved":
        return "text-green-600 bg-green-50 border-green-200";
      case "rejected":
        return "text-red-600 bg-red-50 border-red-200";
      default:
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!entry) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Entry not found</p>
          <div 
            onClick={() => navigate(-1)}
            className="mt-4 bg-indigo-600 hover:bg-indigo-800"
          >
            Back to Entries
          </div>
        </div>
      </div>
    );
  }

  const paymentProofUrl = getPaymentProofUrl();

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Entries
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Entry Details</h1>
          <p className="text-gray-600 mt-1">Entry ID: {id}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column - Player & Payment Info */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Player Information Card */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Player Information</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Full Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <div className="flex items-center p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <User className="w-4 h-4 text-gray-400 mr-2" />
                    <span className="text-gray-900">{entry.player?.fullName || "N/A"}</span>
                  </div>
                </div>

                {/* Academy */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Academy</label>
                  <div className="flex items-center p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <Building className="w-4 h-4 text-gray-400 mr-2" />
                    <span className="text-gray-900">{entry.Academy?.academyName || "N/A"}</span>
                  </div>
                </div>

                {/* TNBA ID */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">TNBA ID</label>
                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <span className="text-gray-900">{entry.player?.tnbaId || "N/A"}</span>
                  </div>
                </div>

                {/* Place */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Place</label>
                  <div className="flex items-center p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <MapPin className="w-4 h-4 text-gray-400 mr-2" />
                    <span className="text-gray-900">{entry.player?.place || "N/A"}</span>
                  </div>
                </div>

                {/* Gender */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <span className="text-gray-900 capitalize">{entry.player?.gender || "N/A"}</span>
                  </div>
                </div>

                {/* District */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">District</label>
                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <span className="text-gray-900">{entry.player?.district || "N/A"}</span>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center text-gray-600">
                    <Calendar className="w-4 h-4 mr-2" />
                    <span>DOB: {entry.player?.dob ? new Date(entry.player.dob).toLocaleDateString() : "N/A"}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Phone className="w-4 h-4 mr-2" />
                    <span>{entry.Academy?.phone || "N/A"}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Mail className="w-4 h-4 mr-2" />
                    <span>{entry.Academy?.email || "N/A"}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Event Details Card */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Event Details</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Event Category</label>
                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <span className="text-gray-900 font-medium">{entry.eventCategory || "N/A"}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Event Type</label>
                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <span className="text-gray-900 font-medium capitalize">{entry.eventType || "N/A"}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Registration Date</label>
                  <div className="flex items-center p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                    <span className="text-gray-900">{formatDate(entry.registrationDate)}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Registration Time</label>
                  <div className="flex items-center p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <Clock className="w-4 h-4 text-gray-400 mr-2" />
                    <span className="text-gray-900">{formatTime(entry.registrationDate)}</span>
                  </div>
                </div>
              </div>

              {/* Partner Information */}
              {entry.partner?.fullName && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h3 className="text-md font-semibold text-gray-900 mb-3">Partner Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Partner Name</label>
                      <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <span className="text-gray-900">{entry.partner.fullName}</span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Partner TNBA ID</label>
                      <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <span className="text-gray-900">{entry.partner.TnBaId || "N/A"}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Payment & Actions */}
          <div className="space-y-6">
            
            {/* Payment Details Card */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Payment Details</h2>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">Payment Status</span>
                  <div className={`flex items-center px-3 py-1 rounded-full border ${getStatusColor(entry.payment?.status)}`}>
                    {getStatusIcon(entry.payment?.status)}
                    <span className="ml-1 font-medium capitalize">{entry.payment?.status || "Pending"}</span>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">Total Amount</span>
                  <span className="text-lg font-bold text-green-600">
                    {formatCurrency(entry.payment?.paymentAmount || 0)}
                  </span>
                </div>

                {entry.payment?.paymentProof?.metadata?.paymentApp && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">Payment App</span>
                    <span className="text-gray-900">{entry.payment.paymentProof.metadata.paymentApp}</span>
                  </div>
                )}

                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">Payment Date</span>
                  <span className="text-gray-900">
                    {getPaymentDate() ? new Date(getPaymentDate()).toLocaleDateString() : "N/A"}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">Payment Time</span>
                  <span className="text-gray-900">
                    {getPaymentDate() ? new Date(getPaymentDate()).toLocaleTimeString() : "N/A"}
                  </span>
                </div>
              </div>
            </div>

            {/* Payment Proof Card */}
            {paymentProofUrl && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Payment Proof</h2>
                
                <div className="text-center mb-4">
                  {!imageError ? (
                    <div className="relative">
                      <img
                        src={paymentProofUrl}
                        alt="Payment Proof"
                        className="rounded-lg border border-gray-200 shadow-sm max-h-48 mx-auto cursor-pointer hover:opacity-90 transition"
                        onClick={() => setIsFullscreen(true)}
                        onError={handleImageError}
                      />
                      <button
                        onClick={() => setIsFullscreen(true)}
                        className="mt-2 text-sm text-indigo-600 hover:text-indigo-800 flex items-center justify-center mx-auto"
                      >
                        <ExternalLink className="w-4 h-4 mr-1" />
                        View Full Image
                      </button>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <CreditCard className="w-12 h-12 mx-auto mb-2 opacity-60" />
                      <p>Preview not available</p>
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">Total Payment Amount</span>
                    <span className="text-lg font-bold text-green-600">
                      {formatCurrency(entry.payment?.paymentAmount || 0)}
                    </span>
                  </div>

                  <button
                    onClick={downloadProof}
                    className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download Proof
                  </button>
                </div>

                {/* Verification Status */}
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-center">
                    <Clock4 className="w-4 h-4 text-yellow-600 mr-2" />
                    <span className="text-sm text-yellow-800">
                      Payment proof is {entry.payment?.status === "Paid" ? "verified" : "pending verification"}.
                    </span>
                  </div>
                </div>
              </div>
            )}


            {/* Application Details Card */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Application Details</h2>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Approved By</label>
                  <div className="p-2 bg-gray-50 rounded border border-gray-200">
                    <span className="text-gray-900">admin</span>
                  </div>
                </div>

                <div className="flex items-center text-gray-600">
                  <Mail className="w-4 h-4 mr-2" />
                  <span className="text-sm">admin@lionssportfoundation.org</span>
                </div>

                <div className="flex items-center text-gray-600">
                  <Phone className="w-4 h-4 mr-2" />
                  <span className="text-sm">9078566890</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Fullscreen Image Modal */}
      {isFullscreen && paymentProofUrl && (
        <div
          className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4"
          onClick={() => setIsFullscreen(false)}
        >
          <div className="relative max-w-4xl w-full">
            <button
              className="absolute top-4 right-4 bg-white bg-opacity-20 text-white p-2 rounded-full hover:bg-opacity-30 transition z-10"
              onClick={(e) => {
                e.stopPropagation();
                setIsFullscreen(false);
              }}
            >
              <XCircle className="w-6 h-6" />
            </button>
            <img
              src={paymentProofUrl}
              alt="Full Payment Proof"
              className="rounded-lg max-h-[90vh] w-full object-contain"
            />
          </div>
        </div>
      )}


    </div>
  );
};

export default AcademyEntryDetail;