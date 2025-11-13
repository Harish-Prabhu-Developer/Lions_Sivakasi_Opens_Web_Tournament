// components/Academy/Player/PlayerDetailsPage.jsx
import React, { useState, useEffect } from "react";
import { User, Edit, Plus, ArrowLeft } from "lucide-react";
import { getEventTypeCounts } from "../../../utils/playerUtils";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-hot-toast";
import PlayerFormModal from "./PlayerFormModal";

const PlayerDetailsPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [player, setPlayer] = useState(null);
  const [players, setPlayers] = useState([]);
  const [showPlayerForm, setShowPlayerForm] = useState(false);
  const [playerForm, setPlayerForm] = useState({
    fullName: "",
    tnbaId: "",
    dob: "",
    academy: "",
    place: "",
    district: "",
  });

  // Load players from localStorage
  useEffect(() => {
    const savedPlayers = localStorage.getItem('academyPlayers');
    if (savedPlayers) {
      const playersData = JSON.parse(savedPlayers);
      setPlayers(playersData);
      
      // Find the specific player
      const foundPlayer = playersData.find(p => p.id === id);
      if (foundPlayer) {
        setPlayer(foundPlayer);
      } else {
        toast.error("Player not found");
        navigate("/");
      }
    } else {
      toast.error("No players data found");
      navigate("/");
    }
  }, [id, navigate]);

  const handleBack = () => {
    navigate("/");
  };

  const handleEditPlayer = () => {
    if (player) {
      setPlayerForm({
        fullName: player.fullName,
        tnbaId: player.tnbaId || "",
        dob: player.dob,
        academy: player.academy,
        place: player.place,
        district: player.district,
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

  const handleSubmitPlayer = (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!playerForm.fullName.trim() || !playerForm.dob || !playerForm.academy.trim() || !playerForm.place.trim() || !playerForm.district.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }

    // Update player
    const updatedPlayers = players.map(p => 
      p.id === id 
        ? { ...p, ...playerForm, updatedAt: new Date().toISOString() }
        : p
    );
    
    setPlayers(updatedPlayers);
    localStorage.setItem('academyPlayers', JSON.stringify(updatedPlayers));
    
    // Update current player state
    setPlayer(prev => ({ ...prev, ...playerForm }));
    
    toast.success("Player updated successfully!");
    setShowPlayerForm(false);
  };

// In PlayerDetailsPage.jsx - update the handleAddEntry function
const handleAddEntry = (playerId) => {
  navigate(`/entry/${playerId}`);
  toast.success(`Redirecting to entry page`);
};

  if (!player) {
    return (
      <div className="min-h-screen bg-linear-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-white text-lg">Loading player details...</div>
      </div>
    );
  }

  const eventCounts = getEventTypeCounts(player);

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
                <h1 className="text-3xl font-bold text-white">{player.fullName}</h1>
                <p className="text-cyan-300 font-semibold mt-1">
                  {player.tnbaId || 'No TNBA ID'}
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
                onClick={() => handleAddEntry(player.id)}
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
                    <p className="text-white font-semibold text-lg">{player.fullName}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-400 mb-1 block">Date of Birth</label>
                    <p className="text-white font-semibold">
                      {new Date(player.dob).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-gray-400 mb-1 block">TNBA ID</label>
                    <p className={`font-semibold text-lg ${
                      player.tnbaId ? 'text-cyan-300' : 'text-gray-500'
                    }`}>
                      {player.tnbaId || 'Not provided'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-400 mb-1 block">Age</label>
                    <p className="text-white font-semibold">
                      {Math.floor((new Date() - new Date(player.dob)) / (365.25 * 24 * 60 * 60 * 1000))} years
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
                  <p className="text-white font-semibold text-lg">{player.academy}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-400 mb-1 block">Place</label>
                  <p className="text-white font-semibold">{player.place}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-400 mb-1 block">District</label>
                  <p className="text-white font-semibold">{player.district}</p>
                </div>
              </div>
            </div>

            {/* Event Details Card */}
            {player.entries && player.entries.length > 0 && (
              <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-600/30 rounded-2xl p-6">
                <h2 className="text-xl font-semibold text-cyan-300 mb-6 flex items-center gap-2">
                  <div className="w-2 h-2 bg-cyan-300 rounded-full"></div>
                  Event Details
                </h2>
                <div className="space-y-4">
                  {player.entries.map((entry, index) => (
                    <div 
                      key={index} 
                      className="p-4 bg-slate-700/30 rounded-xl border border-slate-600/20 hover:border-slate-500/30 transition-colors"
                    >
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="font-bold text-white text-lg">
                              {entry.category} - {entry.type}
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                              entry.status === 'approved' 
                                ? 'bg-green-500/20 text-green-300 border border-green-500/30' 
                                : entry.status === 'pending'
                                ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
                                : 'bg-red-500/20 text-red-300 border border-red-500/30'
                            }`}>
                              {entry.status}
                            </span>
                          </div>
                          {entry.partner && (
                            <div className="text-sm text-gray-300">
                              Partner: <span className="text-cyan-300">{entry.partner.name}</span>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-4">
                          <div className={`px-3 py-1 rounded-full text-sm font-semibold ${
                            entry.paymentStatus === 'Paid'
                              ? 'bg-green-500/20 text-green-300 border border-green-500/30'
                              : 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
                          }`}>
                            {entry.paymentStatus}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Events Summary */}
          <div className="space-y-8">
            {/* Events Summary Card */}
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-600/30 rounded-2xl p-6">
              <h2 className="text-xl font-semibold text-cyan-300 mb-6 flex items-center gap-2">
                <div className="w-2 h-2 bg-cyan-300 rounded-full"></div>
                Events Summary
              </h2>
              <div className="space-y-4">
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-5 hover:border-blue-500/30 transition-colors">
                  <div className="text-3xl font-bold text-blue-300 mb-1">{eventCounts.singles}</div>
                  <div className="text-blue-400 font-semibold">Singles Events</div>
                </div>
                <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-5 hover:border-green-500/30 transition-colors">
                  <div className="text-3xl font-bold text-green-300 mb-1">{eventCounts.doubles}</div>
                  <div className="text-green-400 font-semibold">Doubles Events</div>
                </div>
                <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-5 hover:border-purple-500/30 transition-colors">
                  <div className="text-3xl font-bold text-purple-300 mb-1">{eventCounts.mixedDoubles}</div>
                  <div className="text-purple-400 font-semibold">Mixed Doubles</div>
                </div>
                <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-xl p-5 hover:border-cyan-500/30 transition-colors">
                  <div className="text-3xl font-bold text-cyan-300 mb-1">{eventCounts.total}</div>
                  <div className="text-cyan-400 font-semibold">Total Events</div>
                </div>
              </div>
            </div>

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
                  onClick={() => handleAddEntry(player.id)}
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
          editingPlayer={player}
          playerForm={playerForm}
          onInputChange={handleInputChange}
          onSubmit={handleSubmitPlayer}
          onClose={() => setShowPlayerForm(false)}
        />
      )}
    </div>
  );
};

export default PlayerDetailsPage;