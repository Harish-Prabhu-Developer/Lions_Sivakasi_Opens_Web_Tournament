// components/Academy/DashboardStats.jsx
import React from "react";
import { Users, UserCheck, Award } from "lucide-react";

const DashboardStats = ({ stats }) => {
  if (!stats) {
    return (
      <div className="max-w-7xl mx-auto mb-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
        {/* Loading skeletons */}
        {[1, 2].map((item) => (
          <div key={item} className="bg-[#192339]/80 rounded-2xl p-6 border border-cyan-400/10 animate-pulse">
            <div className="h-6 bg-gray-700 rounded w-1/2 mb-4"></div>
            <div className="h-8 bg-gray-700 rounded w-1/4"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto mb-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
      {/* Total Players */}
      <div className="bg-[#192339]/80 rounded-2xl p-6 border border-cyan-400/10 hover:border-cyan-400/30 transition-all group">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-400 text-sm font-medium mb-2">Total Players</p>
            <p className="text-3xl font-bold text-cyan-300">{stats.totalPlayers}</p>
          </div>
          <div className="p-3 bg-cyan-500/10 rounded-xl group-hover:bg-cyan-500/20 transition-colors">
            <Users className="w-6 h-6 text-cyan-400" />
          </div>
        </div>
      </div>

      {/* Players with TNBA ID */}
      <div className="bg-[#192339]/80 rounded-2xl p-6 border border-green-400/10 hover:border-green-400/30 transition-all group">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-400 text-sm font-medium mb-2">Players with TNBA ID</p>
            <p className="text-3xl font-bold text-green-300">{stats.playersWithTNBAId}</p>
          </div>
          <div className="p-3 bg-green-500/10 rounded-xl group-hover:bg-green-500/20 transition-colors">
            <UserCheck className="w-6 h-6 text-green-400" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardStats;