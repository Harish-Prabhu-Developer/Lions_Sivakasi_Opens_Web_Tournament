import React, { useEffect, useState } from "react";
import {
  User,
  Clock,
  MessageSquare,
  RefreshCcw,
  UserPlus,
  Loader2,
  Edit3,
} from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";
import { API_URL } from "../config";

// 🔐 Auth Headers
const getHeaders = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem("token")}`,
    "Content-Type": "application/json",
  },
});

const PartnerChangeRequestPage = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [adminMsg, setAdminMsg] = useState("");
  const [statusValue, setStatusValue] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // ✅ Fetch All Requests
  const fetchRequests = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`${API_URL}/api/v1/partner/all`, getHeaders());
      setRequests(data.data || []);
    } catch (error) {
      console.error("Fetch Error:", error);
      toast.error("Failed to fetch requests.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  // ✅ Handle Edit Action
  const handleEdit = (req) => {
    setSelectedRequest(req);
    setAdminMsg(req.AdminMsg || "");
    setStatusValue(req.status || "");
    setIsModalOpen(true);
  };

  // ✅ Submit Update Action
  const handleSubmitAction = async () => {
    if (!selectedRequest || !statusValue) return;

    setSubmitting(true);
    try {
      const payload = {
        status: statusValue,
        AdminMsg: adminMsg || "",
      };

      await axios.put(
        `${API_URL}/api/v1/partner/${selectedRequest._id}/change`,
        payload,
        getHeaders()
      );

      toast.success("Request updated successfully!");
      setIsModalOpen(false);
      fetchRequests();
    } catch (error) {
      console.error(error);
      toast.error("Failed to update request!");
    } finally {
      setSubmitting(false);
    }
  };

  // ✅ Refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchRequests();
    setRefreshing(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 px-2 py-2 ">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
            Partner Change Requests
          </h1>
          <p className="text-gray-500 text-sm md:text-base">
            Review and update partner change requests.
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center gap-2 px-3 py-2 text-sm bg-white border rounded-xl shadow-sm hover:bg-gray-100 transition disabled:opacity-50"
        >
          <RefreshCcw
            className={`w-4 h-4 ${
              refreshing ? "animate-spin text-blue-500" : "text-gray-600"
            }`}
          />
          Refresh
        </button>
      </div>

      {/* Loading / Empty */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="animate-spin text-blue-500 w-10 h-10" />
        </div>
      ) : requests.length === 0 ? (
        <div className="text-center py-20">
          <UserPlus className="w-12 h-12 mx-auto text-gray-400" />
          <p className="mt-4 text-gray-600 font-medium">
            No Partner Change Requests Found
          </p>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {requests.map((req) => (
            <div
              key={req._id}
              className="bg-white p-5 rounded-2xl shadow-sm hover:shadow-md transition-all border border-gray-100 flex flex-col justify-between"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <User className="w-5 h-5 text-blue-500" />
                  <h3 className="font-semibold text-gray-800">
                    {req?.player?.name || "Unknown Player"}
                  </h3>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${
                    req.status === "approved"
                      ? "bg-green-100 text-green-700"
                      : req.status === "rejected"
                      ? "bg-red-100 text-red-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {req.status}
                </span>
              </div>

              {/* Details */}
              <div className="space-y-3 text-sm">
                <div>
                  <p className="font-semibold text-gray-700">Old Partner</p>
                  <p className="text-gray-600">
                    {req.form?.fullname} ({req.form?.TnBaId})
                  </p>
                  <p className="text-gray-500 text-xs">{req.form?.academyName}</p>
                </div>

                <div>
                  <p className="font-semibold text-gray-700">New Partner</p>
                  <p className="text-gray-600">
                    {req.To?.fullname} ({req.To?.TnBaId})
                  </p>
                  <p className="text-gray-500 text-xs">{req.To?.academyName}</p>
                </div>

                <div className="flex items-start gap-2">
                  <MessageSquare className="w-4 h-4 text-gray-500 mt-1" />
                  <div>
                    <p className="font-semibold text-gray-700">Reason</p>
                    <p className="text-gray-600 text-sm">{req.Reason}</p>
                  </div>
                </div>

                {req.AdminMsg && (
                  <div className="flex items-start gap-2">
                    <MessageSquare className={`w-4 h-4 ${req.status === "approved" ? "text-green-500" : "text-red-500"} mt-1`} />
                    <div>
                      <p className="font-semibold text-gray-700">Admin Message</p>
                      <p className={`${req.status === "approved" ? "text-green-500" : "text-red-500"} text-sm`}>{req.AdminMsg}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Clock className="w-4 h-4" />
                  <span>{new Date(req.createdAt).toLocaleString()}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-5 flex gap-2">
                <button
                  onClick={() => handleEdit(req)}
                  className="w-full flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white text-sm py-2 rounded-xl transition"
                >
                  <Edit3 className="w-4 h-4" /> Edit
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-lg w-[90%] sm:w-[420px] p-6 relative">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Edit Partner Change Request
            </h2>

            {/* Status Select */}
            <div className="mb-4">
              <label className="text-sm text-gray-600 font-medium">Status</label>
              <select
                value={statusValue}
                onChange={(e) => setStatusValue(e.target.value)}
                className="w-full mt-1 border border-gray-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400 outline-none"
              >
                <option value="">Select Status</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            {/* Admin Message */}
            <label className="text-sm text-gray-600 font-medium">
              Admin Message
            </label>
            <textarea
              className="w-full border border-gray-300 rounded-xl mt-2 p-2 text-sm focus:ring-2 focus:ring-blue-400 outline-none"
              placeholder="Enter admin message..."
              value={adminMsg}
              onChange={(e) => setAdminMsg(e.target.value)}
              rows="4"
            ></textarea>

            {/* Buttons */}
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setIsModalOpen(false)}
                disabled={submitting}
                className="px-4 py-2 text-sm rounded-xl bg-gray-200 hover:bg-gray-300 text-gray-700 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitAction}
                disabled={submitting || !statusValue}
                className={`px-4 py-2 text-sm rounded-xl text-white flex items-center gap-2 ${
                  statusValue === "approved"
                    ? "bg-green-500 hover:bg-green-600"
                    : "bg-red-500 hover:bg-red-600"
                } disabled:opacity-50`}
              >
                {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                Update
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PartnerChangeRequestPage;
