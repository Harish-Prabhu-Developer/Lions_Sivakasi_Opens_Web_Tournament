// DashboardPage.jsx
import React, { useState, useEffect } from "react";
import { LogOut, Trophy } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import FloatingActionButton from "../components/Academy/Player/FloatingActionButton";
import PlayerFormModal from "../components/Academy/Player/PlayerFormModal";
import PlayersView from "../components/Academy/Player/PlayersView";
import SearchControls from "../components/Academy/SearchControls";
import DashboardStats from "../components/Academy/DashboardStats";
import { getUser, IsLoggedIn, Logout } from "../utils/authHelpers";
import axios from "axios";
import { API_URL } from "../constants";
import { 
  fetchPlayers, 
  createPlayer, 
  updatePlayer, 
  deletePlayer, 
  fetchPlayerStats 
} from "../redux/Slices/PlayerSlices";

const DashboardPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { players, stats, loading } = useSelector((state) => state.player);

  const [filteredPlayers, setFilteredPlayers] = useState([]);
  const [showPlayerForm, setShowPlayerForm] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState("card");

  const [playerForm, setPlayerForm] = useState({
    fullName: "",
    tnbaId: "",
    dob: "",
    academy: "",
    place: "",
    district: "",
  });

  // ✅ Local auth state
  const [user, setUser] = useState(getUser());
  const [isLoggedIn, setIsLoggedIn] = useState(IsLoggedIn());

  // ✅ Update on storage or focus change
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === "user_bulkapp_Data" || e.key === "bulkapp_token") {
        setUser(getUser());
        setIsLoggedIn(IsLoggedIn());
      }
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("focus", () => setIsLoggedIn(IsLoggedIn()));

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("focus", () => setIsLoggedIn(IsLoggedIn()));
    };
  }, []);

  // Load players from API on component mount
  useEffect(() => {
    dispatch(fetchPlayers());
    dispatch(fetchPlayerStats());
  }, [dispatch]);

  // Filter players based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredPlayers(players);
    } else {
      const filtered = players.filter(
        (player) =>
          player.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          player.tnbaId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          player.academy.toLowerCase().includes(searchTerm.toLowerCase()) ||
          player.place.toLowerCase().includes(searchTerm.toLowerCase()) ||
          player.district.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredPlayers(filtered);
    }
  }, [searchTerm, players]);

  const handleFloatingClick = () => {
    setEditingPlayer(null);
    setPlayerForm({
      fullName: "",
      tnbaId: "",
      dob: "",
      academy: "",
      place: "",
      district: "",
    });
    setShowPlayerForm(true);
  };

  // Logout
  const handleLogout = async () => {
    try {
      const token = localStorage.getItem("bulkapp_token");
      if (token) {
        await axios.post(
          `${API_URL}/api/v2/academy/auth/logout`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }

      toast.success("Logout successful!");

      setTimeout(() => {
        Logout(); // ✅ centralized logout
      }, 600);
    } catch (error) {
      console.error("Logout Error:", error.message);
      toast.error("Logout failed. Please try again.");
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
    if (editingPlayer) {
      // Update existing player - pass the complete playerForm object
      await dispatch(updatePlayer({ 
        id: editingPlayer.id, 
        playerData: playerForm // Make sure this is the complete form data
      })).unwrap();
    } else {
      // Add new player
      await dispatch(createPlayer(playerForm)).unwrap();
    }

    setShowPlayerForm(false);
    setPlayerForm({
      fullName: "",
      tnbaId: "",
      dob: "",
      academy: "",
      place: "",
      district: "",
    });
    setEditingPlayer(null);
    
    // Refresh players list
    dispatch(fetchPlayers());
  } catch (error) {
    // Error handled in the slice
    console.error("Submit player error:", error);
  }
};

  const handleEditPlayer = (player) => {
    setEditingPlayer(player);
    setPlayerForm({
      fullName: player.fullName,
      tnbaId: player.tnbaId || "",
      dob: player.dob,
      academy: player.academy,
      place: player.place,
      district: player.district,
    });
    setShowPlayerForm(true);
  };

  const handleDeletePlayer = async (playerId) => {
    if (window.confirm("Are you sure you want to delete this player?")) {
      try {
        await dispatch(deletePlayer(playerId)).unwrap();
        // Players list will be updated automatically via Redux
      } catch (error) {
        // Error handled in the slice
      }
    }
  };

  const handleAddEntry = (playerId) => {
    navigate(`/entry/${playerId}`);
  };

  const handleViewPlayer = (player) => {
    navigate(`/player/${player.id}`);
  };

  return (
    <div className="min-h-screen pt-8 px-4 bg-linear-to-br from-[#141C2F] to-[#16213C] text-white transition-all duration-300 relative overflow-hidden">
      {/* Top Section */}
      <div className="flex flex-row items-center justify-between gap-3 sm:gap-5 mb-8 max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-3 min-w-0">
          <Trophy className="w-7 h-7 sm:w-8 sm:h-8 text-cyan-400 shrink-0" />
          <h2 className="text-xl sm:text-3xl md:text-4xl font-extrabold text-white max-w-full">
            Academy Dashboard
          </h2>
        </div>

        <div
          className="inline-flex items-center sm:gap-2 px-4 py-2 rounded-lg bg-red-600 hover:border-white border hover:bg-red-100 hover:text-red-600 transition-all duration-300 shadow-md text-sm sm:text-base justify-center cursor-pointer"
          onClick={handleLogout}
        >
          <LogOut className="w-5 h-5 font-bold" />
          <span className="hidden font-bold sm:inline">Logout</span>
        </div>
      </div>

      {/* Stats Section */}
      <DashboardStats stats={stats} />

      {/* Search and Controls Section */}
      <SearchControls
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        viewMode={viewMode}
        setViewMode={setViewMode}
        onSearch={(term) => dispatch(fetchPlayers(term))}
        loading={loading}
      />

      {/* Players List Section */}
      <PlayersView
        players={filteredPlayers}
        viewMode={viewMode}
        searchTerm={searchTerm}
        onEditPlayer={handleEditPlayer}
        onDeletePlayer={handleDeletePlayer}
        onViewPlayer={handleViewPlayer}
        onAddEntry={handleAddEntry}
        loading={loading}
      />

      {/* Player Form Modal */}
      {showPlayerForm && (
        <PlayerFormModal
          editingPlayer={editingPlayer}
          playerForm={playerForm}
          onInputChange={handleInputChange}
          onSubmit={handleSubmitPlayer}
          onClose={() => setShowPlayerForm(false)}
          loading={loading}
        />
      )}

      {/* Floating Action Button */}
      <FloatingActionButton onClick={handleFloatingClick} />
    </div>
  );
};

export default DashboardPage;