// components/Academy/Player/PlayerDetailsPage.jsx
import React, { useState, useEffect } from "react";
import { User, Edit, Plus, ArrowLeft } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import PlayerFormModal from "./PlayerFormModal";
import { fetchPlayer, updatePlayer } from "../../../redux/Slices/PlayerSlices";

const PlayerDetailsPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { id } = useParams();
  
  const { currentPlayer, loading } = useSelector((state) => state.player);
  const [showPlayerForm, setShowPlayerForm] = useState(false);
  const [playerForm, setPlayerForm] = useState({
    fullName: "",
    tnbaId: "",
    dob: "",
    academy: "",
    place: "",
    district: "",
  });

  // Load player data
  useEffect(() => {
        if (id) {
      dispatch(fetchPlayer(id));
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
    setPlayerForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmitPlayer = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!playerForm.fullName.trim() || !playerForm.dob || !playerForm.academy.trim() || !playerForm.place.trim() || !playerForm.district.trim()) {
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
    toast.success(`Redirecting to entry page`);
  };

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
                <h1 className="text-3xl font-bold text-white">{currentPlayer?.fullName}</h1>
                <p className="text-cyan-300 font-semibold mt-1">
                  {currentPlayer?.tnbaId || 'No TNBA ID'}
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
                    <label className="text-sm text-gray-400 mb-1 block">Full Name</label>
                    <p className="text-white font-semibold text-lg">{currentPlayer?.fullName}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-400 mb-1 block">Date of Birth</label>
                    <p className="text-white font-semibold">
                      {currentPlayer?.dob ? new Date(currentPlayer.dob).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      }) : 'N/A'}
                    </p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-gray-400 mb-1 block">TNBA ID</label>
                    <p className={`font-semibold text-lg ${
                      currentPlayer?.tnbaId ? 'text-cyan-300' : 'text-gray-500'
                    }`}>
                      {currentPlayer?.tnbaId || 'Not provided'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-400 mb-1 block">Age</label>
                    <p className="text-white font-semibold">
                      {currentPlayer?.dob ? Math.floor((new Date() - new Date(currentPlayer.dob)) / (365.25 * 24 * 60 * 60 * 1000)) : 'N/A'} years
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
                  <label className="text-sm text-gray-400 mb-1 block">Academy</label>
                  <p className="text-white font-semibold text-lg">{currentPlayer?.academy}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-400 mb-1 block">Place</label>
                  <p className="text-white font-semibold">{currentPlayer?.place}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-400 mb-1 block">District</label>
                  <p className="text-white font-semibold">{currentPlayer?.district}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Quick Actions */}
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