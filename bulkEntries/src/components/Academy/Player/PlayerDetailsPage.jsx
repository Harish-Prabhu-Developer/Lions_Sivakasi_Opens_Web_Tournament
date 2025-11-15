// components/Academy/Player/PlayerDetailsPage.jsx
import React, { useState, useEffect } from "react";
import {
  User,
  Edit,
  Plus,
  ArrowLeft,
  Calendar,
  DollarSign,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import PlayerFormModal from "./PlayerFormModal";
import { fetchPlayer, updatePlayer } from "../../../redux/Slices/PlayerSlices";
import { getAcademyPlayerEntries } from "../../../redux/Slices/EntriesSlice";

const PlayerDetailsPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { id } = useParams();

  const { currentPlayer, loading } = useSelector((state) => state.player);
  const { currentPlayerEntries, loading: entriesLoading } = useSelector(
    (state) => state.entries
  );

  const [showPlayerForm, setShowPlayerForm] = useState(false);
  const [playerForm, setPlayerForm] = useState({
    fullName: "",
    tnbaId: "",
    dob: "",
    academy: "",
    place: "",
    district: "",
  });

  // Load player data and entries
  useEffect(() => {
    if (id) {
      dispatch(fetchPlayer(id));
      dispatch(getAcademyPlayerEntries(id));
    }
  }, [id, dispatch]);

  const handleBack = () => {
    navigate("/dashboard");
  };

  const handleEditPlayer = () => {
    if (currentPlayer) {
      setPlayerForm({
        fullName: currentPlayer.fullName,
        tnbaId: currentPlayer.tnbaId || "",
        dob: currentPlayer.dob,
        academy: currentPlayer.academy,
        place: currentPlayer.place,
        district: currentPlayer.district,
      });
      setShowPlayerForm(true);
    }
  };

  const handleInputChange = (field, value) => {
    setPlayerForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmitPlayer = async (e) => {
    e.preventDefault();

    // Basic validation
    if (
      !playerForm.fullName.trim() ||
      !playerForm.dob ||
      !playerForm.academy.trim() ||
      !playerForm.place.trim() ||
      !playerForm.district.trim()
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      await dispatch(updatePlayer({ id, playerForm })).unwrap();
      setShowPlayerForm(false);
    } catch (error) {
      // Error handled in slice
    }
  };

  const handleAddEntry = (playerId) => {
    navigate(`/entry/${playerId}`);
  };

  // Helper function to get event type badge color
  const getEventTypeColor = (type) => {
    switch (type) {
      case "singles":
        return "border-blue-400 text-blue-400 bg-blue-400/10";
      case "doubles":
        return "border-green-400 text-green-400 bg-green-400/10";
      case "mixed doubles":
        return "border-purple-400 text-purple-400 bg-purple-400/10";
      default:
        return "border-gray-400 text-gray-400 bg-gray-400/10";
    }
  };

  // Helper function to get payment status badge
  const getPaymentStatusBadge = (payment) => {
    if (payment?.status === "Paid") {
      return (
        <span className="flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-green-500/20 text-green-300 border border-green-400/30">
          <CheckCircle className="w-3 h-3" />
          Paid
        </span>
      );
    }
    return (
      <span className="flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-red-500/20 text-red-300 border border-red-400/30">
        <XCircle className="w-3 h-3" />
        Unpaid
      </span>
    );
  };

  // Extract all events from entries
  const allEvents = currentPlayerEntries.flatMap(
    (entry) =>
      entry.events?.map((event) => ({
        ...event,
        entryId: entry._id,
        createdAt: entry.createdAt,
      })) || []
  );

  // Total Calculation
  const entryFees = {
    singles: 900,
    doubles: 1300,
    "mixed doubles": 1300,
  };

  // 👇 Calculate total amount for ALL events (paid + unpaid)
  const totalEventAmount = allEvents.reduce((total, event) => {
    const fee = entryFees[event.type] || 0;
    return total + fee;
  }, 0);

  // Separate paid and unpaid events
  const paidEvents = allEvents.filter(
    (event) => event.payment?.status === "Paid"
  );
  const unpaidEvents = allEvents.filter(
    (event) => !event.payment || event.payment.status !== "Paid"
  );

  if (!currentPlayer && !loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-white text-lg">Player not found</div>
      </div>
    );
  }

  if (loading && !currentPlayer) {
    return (
      <div className="min-h-screen bg-linear-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-white text-lg">Loading player details...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-900 via-slate-800 to-slate-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="mb-8">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-cyan-300 hover:text-cyan-200 transition-colors mb-6 group"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            Back to Players
          </button>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-cyan-500/10 rounded-xl border border-cyan-400/20">
                <User className="w-8 h-8 text-cyan-300" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">
                  {currentPlayer?.fullName}
                </h1>
                <p className="text-cyan-300 font-semibold mt-1">
                  {currentPlayer?.tnbaId || "No TNBA ID"}
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleEditPlayer}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 hover:scale-105 active:scale-95"
              >
                <Edit className="w-4 h-4" />
                Edit Player
              </button>
              <button
                onClick={() => handleAddEntry(currentPlayer?.id)}
                className="px-6 py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 hover:scale-105 active:scale-95"
              >
                <Plus className="w-4 h-4" />
                Add Entry
              </button>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Personal & Academy Info */}
          <div className="lg:col-span-2 space-y-8">
            {/* Personal Information Card */}
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-600/30 rounded-2xl p-6">
              <h2 className="text-xl font-semibold text-cyan-300 mb-6 flex items-center gap-2">
                <div className="w-2 h-2 bg-cyan-300 rounded-full"></div>
                Personal Information
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-gray-400 mb-1 block">
                      Full Name
                    </label>
                    <p className="text-white font-semibold text-lg">
                      {currentPlayer?.fullName}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-400 mb-1 block">
                      Date of Birth
                    </label>
                    <p className="text-white font-semibold">
                      {currentPlayer?.dob
                        ? new Date(currentPlayer.dob).toLocaleDateString(
                            "en-US",
                            {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            }
                          )
                        : "N/A"}
                    </p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-gray-400 mb-1 block">
                      TNBA ID
                    </label>
                    <p
                      className={`font-semibold text-lg ${
                        currentPlayer?.tnbaId
                          ? "text-cyan-300"
                          : "text-gray-500"
                      }`}
                    >
                      {currentPlayer?.tnbaId || "Not provided"}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-400 mb-1 block">
                      Age
                    </label>
                    <p className="text-white font-semibold">
                      {currentPlayer?.dob
                        ? Math.floor(
                            (new Date() - new Date(currentPlayer.dob)) /
                              (365.25 * 24 * 60 * 60 * 1000)
                          )
                        : "N/A"}{" "}
                      years
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Academy Information Card */}
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-600/30 rounded-2xl p-6">
              <h2 className="text-xl font-semibold text-cyan-300 mb-6 flex items-center gap-2">
                <div className="w-2 h-2 bg-cyan-300 rounded-full"></div>
                Academy Information
              </h2>
              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <label className="text-sm text-gray-400 mb-1 block">
                    Academy
                  </label>
                  <p className="text-white font-semibold text-lg">
                    {currentPlayer?.academy}
                  </p>
                </div>
                <div>
                  <label className="text-sm text-gray-400 mb-1 block">
                    Place
                  </label>
                  <p className="text-white font-semibold">
                    {currentPlayer?.place}
                  </p>
                </div>
                <div>
                  <label className="text-sm text-gray-400 mb-1 block">
                    District
                  </label>
                  <p className="text-white font-semibold">
                    {currentPlayer?.district}
                  </p>
                </div>
              </div>
            </div>

            {/* Selected Events Section */}
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-600/30 rounded-2xl p-6">
              <h2 className="text-xl font-semibold text-cyan-300 mb-6 flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Selected Events
                <span className="ml-2 px-2 py-1 bg-cyan-500/20 text-cyan-300 text-sm rounded-full">
                  {allEvents.length} events
                </span>
              </h2>

              {entriesLoading ? (
                <div className="text-center py-8">
                  <div className="text-white">Loading events...</div>
                </div>
              ) : allEvents.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                  <p className="text-gray-400">No events registered yet</p>
                  <button
                    onClick={() => handleAddEntry(currentPlayer?.id)}
                    className="mt-4 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg transition-colors"
                  >
                    Add First Event
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {allEvents.map((event, index) => (
                    <div
                      key={event._id || index}
                      className="p-4 bg-slate-700/30 rounded-lg border border-slate-600/50 hover:border-slate-500/50 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <span
                            className={`px-3 py-1 rounded-full text-sm font-medium border ${getEventTypeColor(
                              event.type
                            )}`}
                          >
                            {event.type.charAt(0).toUpperCase() +
                              event.type.slice(1)}
                          </span>
                          <span className="text-white font-semibold">
                            {event.category}
                          </span>
                        </div>
                        {getPaymentStatusBadge(event.payment)}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-300">
                        <div>
                          <span className="text-gray-400">
                            Registration Date:
                          </span>{" "}
                          {new Date(
                            event.RegistrationDate
                          ).toLocaleDateString()}
                        </div>
                        <div>
                          <span className="text-gray-400">Status:</span>{" "}
                          <span
                            className={`capitalize ${
                              event.status === "pending"
                                ? "text-yellow-400"
                                : "text-green-400"
                            }`}
                          >
                            {event.status}
                          </span>
                        </div>

                        {event.partner && (
                          <div className="md:col-span-2">
                            <span className="text-gray-400">Partner:</span>{" "}
                            {event.partner.fullName}
                            {event.partner.TnBaId &&
                              ` (${event.partner.TnBaId})`}
                          </div>
                        )}

                        {event.payment?.status === "Paid" && (
                          <div className="md:col-span-2">
                            <span className="text-gray-400">
                              Payment Amount:
                            </span>{" "}
                            <span className="text-green-400 font-semibold">
                              ₹
                              {entryFees[event.type]}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Quick Actions & Payment Summary */}
          <div className="space-y-8">
            {/* Quick Actions Card */}
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-600/30 rounded-2xl p-6">
              <h2 className="text-xl font-semibold text-cyan-300 mb-6 flex items-center gap-2">
                <div className="w-2 h-2 bg-cyan-300 rounded-full"></div>
                Quick Actions
              </h2>
              <div className="space-y-3">
                <button
                  onClick={handleEditPlayer}
                  className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 hover:scale-105 active:scale-95"
                >
                  <Edit className="w-4 h-4" />
                  Edit Player Details
                </button>
                <button
                  onClick={() => handleAddEntry(currentPlayer?.id)}
                  className="w-full px-4 py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 hover:scale-105 active:scale-95"
                >
                  <Plus className="w-4 h-4" />
                  Add New Entry
                </button>
              </div>
            </div>

            {/* Payment Summary Card */}
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-600/30 rounded-2xl p-6">
              <h2 className="text-xl font-semibold text-cyan-300 mb-6 flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Payment Summary
              </h2>

              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-green-500/10 rounded-lg border border-green-400/20">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span className="text-white">Paid Events</span>
                  </div>
                  <span className="text-green-400 font-bold text-lg">
                    {paidEvents.length}
                  </span>
                </div>

                <div className="flex justify-between items-center p-3 bg-red-500/10 rounded-lg border border-red-400/20">
                  <div className="flex items-center gap-2">
                    <XCircle className="w-4 h-4 text-red-400" />
                    <span className="text-white">Unpaid Events</span>
                  </div>
                  <span className="text-red-400 font-bold text-lg">
                    {unpaidEvents.length}
                  </span>
                </div>

                <div className="flex justify-between items-center p-3 bg-cyan-500/10 rounded-lg border border-cyan-400/20">
                  <span className="text-white font-semibold">Total Events</span>
                  <span className="text-cyan-400 font-bold text-lg">
                    {allEvents.length}
                  </span>
                </div>

                {paidEvents.length > 0 && (
                  <div className="pt-4 border-t border-slate-600">
                    <div className="flex justify-between items-center p-3 bg-yellow-500/10 rounded-lg border border-yellow-400/20">
                      <span className="text-white font-semibold">
                        Total Paid Amount
                      </span>
                      <span className="text-yellow-400 font-bold text-lg">
                        ₹{totalEventAmount}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Player Form Modal */}
      {showPlayerForm && (
        <PlayerFormModal
          editingPlayer={currentPlayer}
          playerForm={playerForm}
          onInputChange={handleInputChange}
          onSubmit={handleSubmitPlayer}
          onClose={() => setShowPlayerForm(false)}
          loading={loading}
        />
      )}
    </div>
  );
};

export default PlayerDetailsPage;
