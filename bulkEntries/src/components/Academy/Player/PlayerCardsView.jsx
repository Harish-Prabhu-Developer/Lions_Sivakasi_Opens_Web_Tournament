// components/Academy/PlayerCardsView.jsx
import React from "react";
import { Edit, Trash2, Eye, Plus, CalendarDays, Award, MapPin } from "lucide-react";
import { eventTypeBadges, getEventTypeCounts } from "../../../utils/playerUtils";

const PlayerCardsView = ({ players, onEditPlayer, onDeletePlayer, onViewPlayer, onAddEntry }) => {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {players.map((player) => {
        const eventCounts = getEventTypeCounts(player);
        return (
          <div
            key={player.id}
            className="bg-linear-to-br from-[#1e2533] to-[#16213C] rounded-xl border border-cyan-400/10 p-5 hover:border-cyan-400/30 transition-all duration-300 group"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h4 className="text-lg font-semibold text-white mb-1 group-hover:text-cyan-300 transition-colors">
                  {player.fullName}
                </h4>
                {player.tnbaId && (
                  <p className="text-sm text-cyan-300 bg-cyan-900/30 px-2 py-1 rounded inline-block">
                    {player.tnbaId}
                  </p>
                )}
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
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
                  onClick={() => onDeletePlayer(player.id)}
                  className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                  title="Delete player"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="space-y-2 text-sm text-gray-300 mb-4">
              <div className="flex items-center gap-2">
                <CalendarDays className="w-4 h-4 text-gray-400" />
                <span>DOB: {new Date(player.dob).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-gray-400" />
                <span>{player.academy}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-gray-400" />
                <span>{player.place}, {player.district}</span>
              </div>
            </div>

            {/* Event Type Counts */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-400">Events Registered:</span>
                <span className="text-sm font-bold text-cyan-300">{eventCounts.total}</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {eventCounts.singles > 0 && (
                  <span className={`text-xs px-2 py-1 rounded border ${eventTypeBadges.singles.color}`}>
                    {eventCounts.singles} Singles
                  </span>
                )}
                {eventCounts.doubles > 0 && (
                  <span className={`text-xs px-2 py-1 rounded border ${eventTypeBadges.doubles.color}`}>
                    {eventCounts.doubles} Doubles
                  </span>
                )}
                {eventCounts.mixedDoubles > 0 && (
                  <span className={`text-xs px-2 py-1 rounded border ${eventTypeBadges.mixedDoubles.color}`}>
                    {eventCounts.mixedDoubles} Mixed
                  </span>
                )}
                {eventCounts.total === 0 && (
                  <span className="text-xs text-gray-500 italic">No events registered</span>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-gray-700">
              <button
                onClick={() => onViewPlayer(player)}
                className="text-cyan-400 hover:text-cyan-300 text-sm font-medium flex items-center gap-1 transition-colors"
              >
                <Eye className="w-4 h-4" />
                View Details
              </button>
              <button
                onClick={() => onAddEntry(player.id)}
                className="px-3 py-1 bg-cyan-600 hover:bg-cyan-500 text-white text-sm rounded-md transition-colors"
              >
                Add Entry
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default PlayerCardsView;