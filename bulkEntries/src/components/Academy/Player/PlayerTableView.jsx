// components/Academy/PlayerTableView.jsx
import React from "react";
import { Edit, Trash2, Eye, Plus } from "lucide-react";
import { eventTypeBadges, getEventTypeCounts } from "../../../utils/playerUtils";

const PlayerTableView = ({ players, onEditPlayer, onDeletePlayer, onViewPlayer, onAddEntry }) => {
  console.log("Player : ",players);
  
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-700">
            <th className="text-left py-3 px-4 text-cyan-300 font-semibold">Player</th>
            <th className="text-left py-3 px-4 text-cyan-300 font-semibold">TNBA ID</th>
            <th className="text-left py-3 px-4 text-cyan-300 font-semibold">Academy</th>
            <th className="text-left py-3 px-4 text-cyan-300 font-semibold">Events</th>
            <th className="text-left py-3 px-4 text-cyan-300 font-semibold">Status</th>
            <th className="text-left py-3 px-4 text-cyan-300 font-semibold">Actions</th>
          </tr>
        </thead>
        <tbody>
          {players.map((player) => {
            const eventCounts = getEventTypeCounts(player);
            return (
              <tr key={player.id} className="border-b border-gray-800 hover:bg-cyan-400/5 transition-colors">
                <td className="py-3 px-4">
                  <div>
                    <div className="font-semibold text-white">{player.fullName}</div>
                    <div className="text-sm text-gray-400">
                      {new Date(player.dob).toLocaleDateString()}
                    </div>
                  </div>
                </td>
                <td className="py-3 px-4">
                  {player.tnbaId ? (
                    <span className="text-cyan-300 bg-cyan-900/30 px-2 py-1 rounded text-sm">
                      {player.tnbaId}
                    </span>
                  ) : (
                    <span className="text-gray-500 text-sm">-</span>
                  )}
                </td>
                <td className="py-3 px-4">
                  <div className="text-sm">
                    <div>{player.academy}</div>
                    <div className="text-gray-400">{player.place}, {player.district}</div>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <div className="flex flex-wrap gap-1">
                    {eventCounts.singles > 0 && (
                      <span className={`text-xs px-2 py-1 rounded border ${eventTypeBadges.singles.color}`}>
                        {eventCounts.singles}S
                      </span>
                    )}
                    {eventCounts.doubles > 0 && (
                      <span className={`text-xs px-2 py-1 rounded border ${eventTypeBadges.doubles.color}`}>
                        {eventCounts.doubles}D
                      </span>
                    )}
                    {eventCounts.mixedDoubles > 0 && (
                      <span className={`text-xs px-2 py-1 rounded border ${eventTypeBadges.mixedDoubles.color}`}>
                        {eventCounts.mixedDoubles}M
                      </span>
                    )}
                    {eventCounts.total === 0 && (
                      <span className="text-xs text-gray-500">No events</span>
                    )}
                  </div>
                </td>
                <td className="py-3 px-4">
                  <div className="text-sm">
                    <div className="text-cyan-300 font-medium">{eventCounts.total} total</div>
                    <div className="text-gray-400 text-xs">
                      {player.entries?.filter(e => e.paymentStatus === 'Paid').length || 0} paid
                    </div>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onViewPlayer(player)}
                      className="p-2 text-cyan-400 hover:bg-cyan-400/10 rounded-lg transition-colors"
                      title="View details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onEditPlayer(player)}
                      className="p-2 text-blue-400 hover:bg-blue-400/10 rounded-lg transition-colors"
                      title="Edit player"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onAddEntry(player.id)}
                      className="p-2 text-green-400 hover:bg-green-400/10 rounded-lg transition-colors"
                      title="Add entry"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDeletePlayer(player.id)}
                      className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                      title="Delete player"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default PlayerTableView;