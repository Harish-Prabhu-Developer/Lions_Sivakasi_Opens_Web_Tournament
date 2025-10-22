import React, { useState } from "react";
import {
  LogOut,
  FileText,
  Clock,
  CheckCircle,
  CreditCard,
  Trophy,
  Plus,
  X,
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
    <div className="max-h-screen px-2 mt-32 md:px-6 lg:px-12 bg-gradient-to-br from-[#141C2F] to-[#16213C] text-white transition-all duration-300 relative">
      {/* Top Section */}
      <div className="flex flex-col-reverse md:flex-row md:items-center justify-between gap-5 mb-8">
        <div className="flex items-center gap-3">
          <Trophy className="w-8 h-8 text-cyan-400" />
          <h6 className="text-2xl md:text-3xl font-bold">Player Dashboard</h6>
        </div>
        <button
          className="flex items-center gap-2 sm:px-4 sm:py-2 rounded-lg bg-red-600 hover:bg-red-950 transition-colors duration-300"
          onClick={handleLogout}
        >
          <LogOut className="w-5 h-5" />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>

      <h2 className="text-base md:text-lg text-gray-300 mb-8">Welcome back,</h2>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {stats.map((stat) => (
          <div
            key={stat.name}
            className="flex flex-col items-start gap-2 px-6 py-6 rounded-xl bg-[#192339]/80 shadow-lg border border-cyan-400/10 min-h-[110px] hover:scale-[1.03] hover:shadow-lg transition-all duration-300"
          >
            <stat.icon className={`w-7 h-7 mb-2 ${stat.color}`} />
            <span className="text-2xl font-bold">{stat.value}</span>
            <span className="text-base text-gray-400">{stat.name}</span>
          </div>
        ))}
      </div>

      {/* Entries Section */}
      <div className="bg-[#192339]/80 rounded-xl shadow-lg border border-cyan-400/10 px-4 md:px-7 pt-8 pb-14 mb-10 transition-all duration-300">
        <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-5">
          <h2 className="text-lg md:text-xl font-semibold">My Entries</h2>
          <button
            className="flex flex-row items-center justify-center gap-2 px-10 py-2 bg-gradient-to-r from-cyan-500 to-cyan-400 text-white font-semibold rounded-md shadow hover:scale-105 transition-all duration-200"
            onClick={handleEntry}
          >
            <Plus className="w-5 h-5" />
            <span className="hidden xs:inline">New Entry</span>
          </button>
        </div>

        {/* No Entries State */}
        <div className="flex flex-col items-center justify-center py-8 md:py-12">
          <Trophy className="w-12 h-12 text-gray-400 mb-3" />
          <p className="text-center text-gray-400 font-medium mb-6">No entries yet</p>
          <button
            className="px-8 py-3 bg-gradient-to-r from-cyan-500 to-cyan-400 text-white rounded-full font-semibold shadow-md hover:bg-cyan-600 hover:to-cyan-500 active:scale-95 transition-all text-lg"
            onClick={handleEntry}
          >
            Register for Tournament
          </button>
        </div>
      </div>

      {/* Full Screen Dialog */}
      {isDialogOpen && (
        <EntryDialog onClose={handleCloseDialog} />
      )}
    </div>
  );
};

export default DashboardPage;
