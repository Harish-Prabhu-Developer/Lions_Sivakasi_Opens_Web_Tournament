// components/Academy/PlayerTableView.jsx
import React from "react";
import { Edit, Trash2, Eye, Plus, CheckCircle, XCircle } from "lucide-react";
import { eventTypeBadges } from "../../../utils/playerUtils";

const PlayerTableView = ({ players, onEditPlayer, onDeletePlayer, onViewPlayer, onAddEntry }) => {
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
            const eventCounts = player.states?.entries.events.counts || { 
              singles: 0, 
              doubles: 0, 
              mixedDoubles: 0, 
              total: 0 
            };
            const totalEvents = player.states?.entries.events.total || 0;
            const paidEvents = player.states?.entries.events.paid || 0;
            const pendingEvents = player.states?.entries.events.pending || 0;
            const playerId = player.id || player._id;

            return (
              <tr key={playerId} className="border-b border-gray-800 hover:bg-cyan-400/5 transition-colors">
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
                    {totalEvents === 0 && (
                      <span className="text-xs text-gray-500">No events</span>
                    )}
                  </div>
                </td>
                <td className="py-3 px-4">
                  <div className="text-sm">
                    <div className="text-cyan-300 font-medium">{totalEvents} total</div>
                    <div className="flex items-center gap-1 text-xs">
                      {paidEvents > 0 ? (
                        <div className="flex items-center gap-1 text-green-400">
                          <CheckCircle className="w-3 h-3" />
                          <span>{paidEvents} paid</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-red-400">
                          <XCircle className="w-3 h-3" />
                          <span>0 paid</span>
                        </div>
                      )}
                      {pendingEvents > 0 && (
                        <div className="text-yellow-400 text-xs">
                          ({pendingEvents} pending)
                        </div>
                      )}
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
                      onClick={() => onAddEntry(playerId)}
                      className="p-2 text-green-400 hover:bg-green-400/10 rounded-lg transition-colors"
                      title="Add entry"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDeletePlayer(playerId)}
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