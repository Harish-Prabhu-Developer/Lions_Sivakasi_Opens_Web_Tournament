import React, { useState } from "react";
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
import EntryDialog from "../components/Dialog/EntryDialog";

const DashboardPage = () => {
  const [isDialogOpen, setDialogOpen] = useState(false);
  const stats = [
    { name: "Total Entries", value: 0, icon: FileText, color: "text-cyan-400" },
    { name: "Pending Review", value: 0, icon: Clock, color: "text-yellow-300" },
    { name: "Approved", value: 0, icon: CheckCircle, color: "text-green-400" },
    { name: "Paid", value: 0, icon: CreditCard, color: "text-teal-300" },
  ];
  const navigate = useNavigate();
  const handleEntry = () => setDialogOpen(true);
  const handleCloseDialog = () => setDialogOpen(false);

  const handleLogout = async () => {
    toast.success("Logout Successfully", { duration: 2000 });
    await localStorage.clear();
    navigate("/login");
  };

  return (
    <div className={`h-full px-4 sm:px-2 md:px-1 pt-28 sm:pt-32 md:pt-32 lg:pt-32 xl:pt-32 bg-gradient-to-br from-[#141C2F] to-[#16213C] text-white transition-all duration-300 relative`}>
      {/* Top Section */}
      <div className="flex flex-row items-center justify-between gap-3 sm:gap-5 mb-8 max-w-7xl mx-auto w-full">
        {/* Headline with icon */}
        <div className="flex items-center gap-3 min-w-0">
          <Trophy className="w-7 h-7 sm:w-8 sm:h-8 text-cyan-400 flex-shrink-0" />
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white  max-w-full">
            Player Dashboard
          </h2>
        </div>

        {/* Logout button */}
        <div
          className="inline-flex items-center sm:gap-2 px-4 py-2 rounded-lg bg-red-600 hover:border-white border hover:bg-red-100 hover:text-red-600 transition-all duration-300 shadow-md text-sm sm:text-base  justify-center"
          onClick={handleLogout}
        >
          <LogOut className="w-5 h-5 font-bold" />
          <span className="hidden font-bold sm:inline">Logout</span>
        </div>
      </div>

      <h2 className="text-sm sm:text-base md:text-lg text-gray-300 mb-8 max-w-7xl mx-auto px-1">
        Welcome back,
      </h2>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 max-w-7xl mx-auto mb-10 px-1">
        {stats.map((stat) => (
          <div
            key={stat.name}
            className="flex flex-col items-start gap-2 px-5 py-6 rounded-xl bg-[#192339]/80 shadow-lg border border-cyan-400/10 min-h-[110px] hover:scale-[1.03] hover:shadow-lg transition-all duration-300"
          >
            <stat.icon className={`w-7 h-7 mb-2 ${stat.color}`} />
            <span className="text-2xl font-bold">{stat.value}</span>
            <span className="text-base text-gray-400">{stat.name}</span>
          </div>
        ))}
      </div>

      {/* Entries Section */}
      <div className="bg-[#192339]/80 rounded-xl  shadow-lg border border-cyan-400/10 px-4 md:px-7 pt-8 pb-16 mb-10 max-w-7xl mx-auto transition-all duration-300">
        <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4 md:gap-5 px-1">
          <h2 className="text-lg md:text-xl font-semibold">My Entries</h2>
          <button
            className="flex items-center justify-center gap-2 px-6 py-2 bg-gradient-to-r from-cyan-500 to-cyan-400 text-white font-semibold rounded-md shadow hover:scale-105 transition duration-200 text-sm sm:text-base"
            onClick={handleEntry}
          >
            <Plus className="w-5 h-5" />
            <span className="hidden xs:inline">New Entry</span>
          </button>
        </div>

        {/* No Entries State */}
        <div className="flex flex-col items-center justify-center py-6 md:py-12 gap-4 px-1">
          <Trophy className="w-12 h-12 text-gray-400 mb-3" />
          <p className="text-center text-gray-400 font-medium mb-6 text-sm sm:text-base">
            No entries yet
          </p>
          <button
            className="px-8 py-3 bg-gradient-to-r from-cyan-500 to-cyan-400 text-white rounded-full font-semibold shadow-md hover:bg-cyan-600 hover:to-cyan-500 active:scale-95 transition-all text-base sm:text-lg"
            onClick={handleEntry}
          >
            Register for Tournament
          </button>
        </div>
      </div>

      {/* Full Screen Dialog */}
      {isDialogOpen && <EntryDialog onClose={handleCloseDialog} />}
    </div>
  );
};

export default DashboardPage;
