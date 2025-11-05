// DashboardPage.jsx
import React, { useContext, useState, useEffect } from "react";
import {
  LogOut,
  FileText,
  Clock,
  CheckCircle,
  CreditCard,
  Trophy,
  Plus,
  User,
  Edit,
  CalendarDays,
  Award,
  MapPin,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { API_URL } from "../constants";
import axios from "axios";

import EntryCard from "../components/EntryCard";
import { formatDate, formatDateMonth,toDateInputValue } from "../utils/dateUtils";
import {useDispatch, useSelector} from "react-redux";
import { clearPlayerState, updatePlayerForm } from "../redux/Slices/PlayerSlice";
import { getUser, IsLoggedIn, Logout } from "../utils/authHelpers";
import { getPlayerEntries } from "../redux/Slices/EntriesSlice";
const DashboardPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  // ✅ Local auth state
  const [user, setUser] = useState(getUser());
  const [isLoggedIn, setIsLoggedIn] = useState(IsLoggedIn());
  
  // 🔹 Redux state
  const { loading, error, success } = useSelector((state) => state.player);
  const [isEditing, setIsEditing] = useState(false);
  const [playerData, setPlayerData] = useState({
    fullName: "",
    TNBAID: "",
    dob: "",
    academy: "",
    place: "",
    district: "",
  });

  useEffect(() => {
    if (!isLoggedIn) {
      navigate("/login");
      return;
    }

    const storedUser = getUser();
    if (storedUser) {
      setPlayerData({
        fullName: storedUser.name || "",
        TNBAID: storedUser.TNBAID || "",
        dob: formatDate(storedUser.dob) || "",
        academy: storedUser.academyName || "",
        place: storedUser.place || "",
        district: storedUser.district || "",
      });
      setUser(storedUser);
    }
  }, [isLoggedIn, navigate]);

  // ✅ Update on storage or focus change
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === "user" || e.key === "token") {
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
  // Icon mapping for labels
  const iconMap = {
    "Full Name": <User className="w-4 h-4 text-cyan-400" />,
    "TNBA ID": <Award className="w-4 h-4 text-cyan-400" />,
    "Date of Birth": <CalendarDays className="w-4 h-4 text-cyan-400" />,
    "Academy Name": <Award className="w-4 h-4 text-cyan-400" />,
    Place: <MapPin className="w-4 h-4 text-cyan-400" />,
    District: <MapPin className="w-4 h-4 text-teal-300" />,
  };

  const handleEditToggle = () => setIsEditing(!isEditing);

  const handleInputChange = (key, value) => {
    setPlayerData((prev) => ({ ...prev, [key]: value }));
  };

  // 🔹 Save player updates
  const handleSave = async () => {
    const formData = {
      name: playerData.fullName,
      dob: playerData.dob,
      TnBaId: playerData.TNBAID,
      academyName: playerData.academy,
      place: playerData.place,
      district: playerData.district,
    };

    try {
      const resultAction = await dispatch(updatePlayerForm(formData));

      if (updatePlayerForm.fulfilled.match(resultAction)) {
        const updatedUser = resultAction.payload.data.user;

        const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
        const newUserData = {
          ...storedUser,
          name: updatedUser.name,
          dob: formatDate(updatedUser.dob),
          TNBAID: updatedUser.TnBaId,
          academy: updatedUser.academyName,
          place: updatedUser.place,
          district: updatedUser.district,
        };

        localStorage.setItem("user", JSON.stringify(newUserData));
        setUser(newUserData);
        setPlayerData({
          fullName: updatedUser.name,
          TNBAID: updatedUser.TnBaId,
          dob: formatDate(updatedUser.dob),
          academy: updatedUser.academyName,
          place: updatedUser.place,
          district: updatedUser.district,
        });

        setIsEditing(false);
        toast.success("Player details updated successfully!");
      } else {
    // ✅ Extract backend message properly
    const errorMessage =
      resultAction.payload?.message ||
      resultAction.error?.message ||
      "Update failed";
    throw new Error(errorMessage);
  }
} catch (err) {
  console.error("Error:", err);
  toast.error(err.message || "Failed to update player details");
}
  };

  useEffect(() => {
    if (success) dispatch(clearPlayerState());
    if (error) {
      toast.error(error);
      dispatch(clearPlayerState());
    }
  }, [success, error, dispatch]);
  // 🏸 Dummy Data (simulate MongoDB response)
  // 🏸 Dummy Data (simulate MongoDB response)
  const [entries, setEntries] = useState([]);

  useEffect(() => {
    const fetchEntries = async () => {
      try {
        const res = await dispatch(getPlayerEntries()).unwrap();
        console.log("Events fetch Data  res :",res?.data?.events || res?.events );
        
        const events = res?.data?.events || res?.events || [];
        
        setEntries(events);
      } catch (err) {
        toast.error("Server Down",{duration: 7000});
        console.error("Error fetchEntries:",err.message);
      }
    };
    fetchEntries();
  },[])

  // 🧮 Stats (computed dynamically)
  const stats = [
    {
      name: "Total Entries",
      value: entries.length,
      icon: FileText,
      color: "text-cyan-400",
    },
    {
      name: "Pending Review",
      value: entries.filter((e) => e.status === "Pending Review").length,
      icon: Clock,
      color: "text-yellow-300",
    },
    {
      name: "Approved",
      value: entries.filter((e) => e.status === "Approved").length,
      icon: CheckCircle,
      color: "text-green-400",
    },
    {
      name: "Paid",
      value: entries.filter((e) => e.paymentStatus === "Paid").length,
      icon: CreditCard,
      color: "text-teal-300",
    },
  ];

  // 📩 Entry Restrictions Logic
  const totalEntries = entries.length;
  const singlesOrDoublesCount = entries.filter(
    (e) =>
      e.type.toLowerCase() === "singles" || e.type.toLowerCase() === "doubles"
  ).length;
  const mixedDoublesCount = entries.filter(
    (e) => e.type.toLowerCase() === "mixed doubles"
  ).length;

//   console.log("🔎 Debug Entry Counts:");
// console.log("Total Entries:", totalEntries);
// console.log("Singles/Doubles Count:", singlesOrDoublesCount);
// console.log("Mixed Doubles Count:", mixedDoublesCount);

// const canAddNewEntry =
//   totalEntries < 4 && singlesOrDoublesCount < 3 && mixedDoublesCount < 1;
const canAddNewEntry =
  totalEntries < 4 &&
  (singlesOrDoublesCount < 3 || mixedDoublesCount < 1);

// console.log("✅ Can Add New Entry:", canAddNewEntry);

  // 📩 Handlers
const handleEntry = () => {
  if (!canAddNewEntry) {
    let reason = "";
    if (totalEntries >= 4)
      reason = "You have reached the maximum of 4 total entries.";
    else if (singlesOrDoublesCount >= 3)
      reason = "You can only register for up to 3 Singles or Doubles events.";
    else if (mixedDoublesCount >= 1)
      reason = "You can register for only one Mixed Doubles event.";

    toast.error(reason, { duration: 4000 });
    return;
  }
    navigate("/entry"); // ✅ Fixed: use absolute path
  };

const handleLogout = async () => {
    try {
      const token = localStorage.getItem("token");
      if (token) {
        await axios.post(
          `${API_URL}/api/v1/auth/logout`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
      toast.success("Logout successful!");
      Logout(); // ✅ centralized logout
    } catch (error) {
      console.error("Logout Error:", error);
      toast.error("Logout failed. Please try again.");
    }
  };
  return (
    <div className="h-full px-4 sm:px-2 md:px-1 pt-28 sm:pt-32 bg-gradient-to-br from-[#141C2F] to-[#16213C] text-white transition-all duration-300 relative">
      {/* Top Section */}
      <div className="flex flex-row items-center justify-between gap-3 sm:gap-5 mb-8 max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-3 min-w-0">
          <Trophy className="w-7 h-7 sm:w-8 sm:h-8 text-cyan-400 flex-shrink-0" />
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white max-w-full">
            Player Dashboard
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

      {/* Player Details */}
      {/* Player Details */}
      {!isEditing ? (
        <div className="bg-gradient-to-br from-[#1e2533] to-[#16213C] rounded-2xl shadow-xl border border-cyan-400/20 px-7 py-7 mb-10 max-w-7xl mx-auto flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6 sm:gap-14 transition-all duration-300">
          {/* Profile Icon and Info */}
          <div className="flex items-center w-full sm:w-auto gap-5">
            <div className="flex items-center justify-center w-16 h-16 px-4 rounded-full bg-cyan-950/90 text-cyan-400 shadow-md border-2 border-cyan-400/20">
              <User className="w-9 h-9" />
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-2xl font-extrabold tracking-tight text-white">
                {playerData.fullName}
              </span>
              {playerData.TNBAID && (
                <span className="text-xs font-bold rounded px-2 py-1 bg-cyan-900 text-cyan-300 shadow border border-cyan-800 w-fit">
                  {playerData.TNBAID}
                </span>
              )}
              <div className="flex flex-wrap gap-2 mt-1">
                {playerData.academy && (
                  <span className="px-2 py-0.5 rounded-full text-xs bg-cyan-700/70 text-white font-semibold tracking-wide shadow">
                    {playerData.academy}
                  </span>
                )}
                {playerData.place && (
                  <span className="px-2 py-0.5 rounded-full text-xs bg-cyan-800/80 text-cyan-200 font-semibold tracking-wide">
                    {playerData.place}
                  </span>
                )}
                {playerData.district && (
                  <span className="px-2 py-0.5 rounded-full text-xs bg-cyan-900/70 text-cyan-300 font-semibold tracking-wide">
                    {playerData.district}
                  </span>
                )}
              </div>
              <span className="text-sm text-gray-400 mt-2">
                DOB:{" "}
                {playerData.dob ? (
                  <span className="text-gray-200 font-semibold">
                    {formatDateMonth(playerData.dob)}
                  </span>
                ) : (
                  <span className="italic text-gray-500">Not set</span>
                )}
              </span>
            </div>
          </div>
          <button
            onClick={handleEditToggle}
            className="flex items-center gap-2 px-6 py-2 rounded-lg bg-gradient-to-tr from-cyan-500 to-cyan-400 text-white font-bold shadow hover:scale-105 transition-transform"
          >
            <Edit className="w-5 h-5" />
            <span>Edit</span>
          </button>
        </div>
      ) : (
        <div className="bg-gradient-to-br from-[#1e2533] to-[#16213C] border border-cyan-400/20 rounded-2xl shadow-xl p-7 max-w-7xl mx-auto mb-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-3">
            <h3 className="text-xl font-bold text-white flex items-center gap-2 mb-2 sm:mb-0">
              <User className="w-5 h-5 text-cyan-400" /> Edit Player Details
            </h3>
            <button
              onClick={handleEditToggle}
              className="flex items-center gap-2 px-5 py-2 rounded-lg border border-cyan-200 text-cyan-300 font-bold shadow bg-[#1E2533] hover:bg-cyan-900 transition-all"
            >
              <Edit className="w-4 h-4" />
              <span>Cancel</span>
            </button>
          </div>
          <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 gap-7">
            {[
              { label: "Full Name", key: "fullName" },
              { label: "TNBA ID", key: "TNBAID" },
              { label: "Date of Birth", key: "dob" },
              { label: "Academy Name", key: "academy" },
              { label: "Place", key: "place" },
              { label: "District", key: "district" },
            ].map(({ label, key }) => (
              <div key={key} className="flex flex-col">
                <label className="text-sm text-cyan-300 font-semibold flex items-center gap-2 pb-2">
                  {iconMap[label]} <span>{label}</span>
                </label>
                <input
                type={label === "Date of Birth" ? "date" : "text"}
                value={
                  label === "Date of Birth"
                    ? toDateInputValue(playerData[key])
                    : playerData[key] || ""
                }
                onChange={(e) => handleInputChange(key,
                  label === "Date of Birth"
                    ? e.target.value // store as ISO, or convert to DD-MM-YYYY on save
                    : e.target.value
                )}
                className="px-3 py-3 rounded-lg bg-[#141C2F] border border-cyan-800 text-gray-200 font-medium focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-all"
                placeholder={`Enter ${label}`}
              />

              </div>
            ))}
          </div>
          <div className="mt-10 flex justify-end">
            <button
              onClick={handleSave}
              disabled={loading}
              className={`px-8 py-3 rounded-lg font-bold shadow-lg transition-transform ${
                loading
                  ? "bg-gray-600 cursor-not-allowed"
                  : "bg-gradient-to-r from-cyan-500 to-cyan-400 hover:scale-105 text-white"
              }`}
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>

          </div>
        </div>
      )}
      {/* Stats Cards */}
      <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 max-w-7xl mx-auto mb-10 px-1">
        {stats.map((stat) => (
          <div
            key={stat.name}
            className="flex flex-col items-start gap-2 px-5 py-6 rounded-xl bg-[#192339]/80 shadow-lg border border-cyan-400/10 min-h-[110px] hover:scale-[1.03] transition-all duration-300"
          >
            <stat.icon className={`w-7 h-7 mb-2 ${stat.color}`} />
            <span className="text-2xl font-bold">{stat.value}</span>
            <span className="text-base text-gray-400">{stat.name}</span>
          </div>
        ))}
      </div>

      {/* Entries Section */}
      <div className="bg-[#192339]/80 rounded-xl shadow-lg border border-cyan-400/10 px-4 md:px-7 pt-8 pb-16 mb-10 max-w-7xl mx-auto transition-all duration-300">
        <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4 md:gap-5 px-1">
          <h2 className="text-lg md:text-xl font-semibold">My Entries</h2>

          <button
            className={`flex items-center justify-center gap-2 px-6 py-2 rounded-md shadow text-white font-semibold transition duration-200 text-sm sm:text-base ${
              canAddNewEntry
                ? "bg-gradient-to-r from-cyan-500 to-cyan-400 hover:scale-105"
                : "bg-gray-600 cursor-not-allowed"
            }`}
            onClick={handleEntry}
            disabled={!canAddNewEntry}
          >
            <Plus className="w-5 h-5" />
            <span className="hidden xs:inline">New Entry</span>
          </button>

        </div>

        {/* Entries List */}
        {entries.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 gap-4">
            <Trophy className="w-12 h-12 text-gray-400 mb-3" />
            <p className="text-center text-gray-400 font-medium mb-6 text-sm sm:text-base">
              No entries yet
            </p>
            <button
              className="px-8 py-3 bg-gradient-to-r from-cyan-500 to-cyan-400 text-white rounded-full font-semibold shadow-md hover:scale-105 transition-all text-base sm:text-lg"
              disabled={!canAddNewEntry}onClick={handleEntry}
            >
              Register for Tournament
            </button>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {entries.map((entry) => (
              <EntryCard key={entry._id} entry={entry} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
