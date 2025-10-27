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
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import AuthContext from "../components/Auth/AuthContext";
import { API_URL } from "../constants";
import axios from "axios";
import EntryCard from "../components/EntryCard";

const DashboardPage = () => {

  const navigate = useNavigate();
  const { logout } = useContext(AuthContext);

  // 🏸 Dummy Data (simulate MongoDB response)
// 🏸 Dummy Data (simulate MongoDB response)
const [entries, setEntries] = useState([
  {
    _id: "671a23f7b12d4e001a5e93ab",
    category: "Under 17 Boys",
    type: "Doubles",
    status: "Approved",
    paymentStatus: "Paid",
    RegistrationDate: "2025-10-01T08:00:00Z",
    Partner: {
      fullName: "John Doe",
      TNBAID: "TNBA456",
      dob: "2008-05-21",
      academy: "Elite Sports Academy",
      place: "Chennai",
      district: "Chengalpattu",
    },
    adminApproval: {
      approvedBy: {
        name: "Admin Rajesh Kumar",
        phone: "+91 9876543210",
        email: "rajesh.admin@example.com",
      },
      approvedDate: "2025-10-05T12:00:00Z",
      paymentApp: "Google Pay",
      paymentAmount: 800,
      paymentDate: "2025-10-06T09:00:00Z",
    },
  },
  // {
  //   _id: "671a24b0b12d4e001a5e93ad",
  //   category: "Under 19 Boys",
  //   type: "Singles",
  //   status: "Pending Review",
  //   paymentStatus: "Unpaid",
  //   RegistrationDate: "2025-10-10T10:00:00Z",
  // },
  // {
  //   _id: "671a24d0b12d4e001a5e93ae",
  //   category: "Under 17 Boys",
  //   type: "Mixed Doubles",
  //   status: "Approved",
  //   paymentStatus: "Paid",
  //   RegistrationDate: "2025-10-12T12:00:00Z",
  // },
  // {
  //   _id: "671a250fb12d4e001a5e93b1",
  //   category: "Under 19 Boys",
  //   type: "Singles",
  //   status: "Approved",
  //   paymentStatus: "Paid",
  //   RegistrationDate: "2025-10-20T09:30:00Z",
  //   adminApproval: {
  //     approvedBy: {
  //       name: "Admin Priya Sharma",
  //       phone: "+91 9012345678",
  //       email: "priya.admin@example.com",
  //     },
  //     approvedDate: "2025-10-22T15:00:00Z",
  //     paymentApp: "PhonePe",
  //     paymentAmount: 700,
  //     paymentDate: "2025-10-23T08:30:00Z",
  //   },
  // },
]);

  // 🧮 Stats (computed dynamically)
  const stats = [
    { name: "Total Entries", value: entries.length, icon: FileText, color: "text-cyan-400" },
    { name: "Pending Review", value: entries.filter(e => e.status === "Pending Review").length, icon: Clock, color: "text-yellow-300" },
    { name: "Approved", value: entries.filter(e => e.status === "Approved").length, icon: CheckCircle, color: "text-green-400" },
    { name: "Paid", value: entries.filter(e => e.paymentStatus === "Paid").length, icon: CreditCard, color: "text-teal-300" },
  ];

  // 📩 Entry Restrictions Logic
  const totalEntries = entries.length;
  const singlesOrDoublesCount = entries.filter(
    (e) => e.type.toLowerCase() === "singles" || e.type.toLowerCase() === "doubles"
  ).length;
  const mixedDoublesCount = entries.filter(
    (e) => e.type.toLowerCase() === "mixed doubles"
  ).length;

  const canAddNewEntry =
    totalEntries < 4 &&
    singlesOrDoublesCount < 3 &&
    mixedDoublesCount < 1;

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
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
      }
      toast.success("Logout Successful", { duration: 2000 });
      logout();
      navigate("/login");
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

      <h2 className="text-sm sm:text-base md:text-lg text-gray-300 mb-8 max-w-7xl mx-auto px-1">
        Welcome back,
      </h2>

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
              onClick={handleEntry}
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
