// components/Academy/DashboardStats.jsx
import React from "react";
import {
  CheckCircle,
  Clock,
  CreditCard,
  FileText,
  Users,
} from "lucide-react";

const DashboardStats = ({ players }) => {
  const stats = [
    {
      name: "Total Players",
      value: players.length,
      icon: Users,
      color: "text-blue-400",
    },
    {
      name: "Total Entries",
      value: players.reduce((total, player) => total + (player.entries?.length || 0), 0),
      icon: FileText,
      color: "text-cyan-400",
    },
    {
      name: "Pending Review",
      value: players.reduce((total, player) => total + (player.entries?.filter(entry => entry.status === 'pending').length || 0), 0),
      icon: Clock,
      color: "text-yellow-300",
    },
    {
      name: "Approved",
      value: players.reduce((total, player) => total + (player.entries?.filter(entry => entry.status === 'approved').length || 0), 0),
      icon: CheckCircle,
      color: "text-green-400",
    },
    {
      name: "Paid",
      value: players.reduce((total, player) => total + (player.entries?.filter(entry => entry.paymentStatus === 'Paid').length || 0), 0),
      icon: CreditCard,
      color: "text-teal-300",
    },
  ];

  return (
    <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 mb-10">
      {stats.map((stat) => (
        <div
          key={stat.name}
          className="flex flex-col items-start justify-center gap-2 px-5 py-6 rounded-2xl bg-[#192339]/80 shadow-lg border border-cyan-400/10 hover:scale-[1.03] transition-all duration-300"
        >
          <stat.icon className={`w-7 h-7 mb-1 ${stat.color}`} />
          <span className="text-3xl font-bold">{stat.value}</span>
          <span className="text-sm text-gray-400">{stat.name}</span>
        </div>
      ))}
    </div>
  );
};

export default DashboardStats;