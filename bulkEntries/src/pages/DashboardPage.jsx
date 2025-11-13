//DashboardPage.jsx
import React, { useState, useEffect } from "react";
import { LogOut, Trophy } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import FloatingActionButton from "../components/Academy/Player/FloatingActionButton";
import PlayerFormModal from "../components/Academy/Player/PlayerFormModal";
import PlayersView from "../components/Academy/Player/PlayersView";
import SearchControls from "../components/Academy/SearchControls";
import DashboardStats from "../components/Academy/DashboardStats";
import { getUser, IsLoggedIn, Logout } from "../utils/authHelpers";
import axios from "axios";
import { API_URL } from "../constants";

const DashboardPage = () => {
  const navigate = useNavigate();
  const [players, setPlayers] = useState([]);
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

  // Load players from localStorage on component mount
  useEffect(() => {
    const savedPlayers = localStorage.getItem("academyPlayers");
    if (savedPlayers) {
      const playersData = JSON.parse(savedPlayers);
      setPlayers(playersData);
      setFilteredPlayers(playersData);
    }
  }, []);

  // Save players to localStorage whenever players change
  useEffect(() => {
    localStorage.setItem("academyPlayers", JSON.stringify(players));
  }, [players]);

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

  const handleSubmitPlayer = (e) => {
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

    if (editingPlayer) {
      // Update existing player
      setPlayers((prev) =>
        prev.map((player) =>
          player.id === editingPlayer.id
            ? { ...player, ...playerForm, updatedAt: new Date().toISOString() }
            : player
        )
      );
      toast.success("Player updated successfully!");
    } else {
      // Add new player
      const newPlayer = {
        id: Date.now().toString(),
        ...playerForm,
        entries: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setPlayers((prev) => [...prev, newPlayer]);
      toast.success("Player added successfully!");
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

  const handleDeletePlayer = (playerId) => {
    if (window.confirm("Are you sure you want to delete this player?")) {
      setPlayers((prev) => prev.filter((player) => player.id !== playerId));
      toast.success("Player deleted successfully!");
    }
  };

  // In DashboardPage.jsx - update the handleAddEntry function
  const handleAddEntry = (playerId) => {
    navigate(`/entry/${playerId}`);
    toast.success(`Redirecting to entry page for player`);
  };

  // Also update the handleViewPlayer if needed
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
      <DashboardStats players={players} />

      {/* Search and Controls Section */}
      <SearchControls
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        viewMode={viewMode}
        setViewMode={setViewMode}
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
      />

      {/* Player Form Modal */}
      {showPlayerForm && (
        <PlayerFormModal
          editingPlayer={editingPlayer}
          playerForm={playerForm}
          onInputChange={handleInputChange}
          onSubmit={handleSubmitPlayer}
          onClose={() => setShowPlayerForm(false)}
        />
      )}

      {/* Floating Action Button */}
      <FloatingActionButton onClick={handleFloatingClick} />
    </div>
  );
};

export default DashboardPage;
