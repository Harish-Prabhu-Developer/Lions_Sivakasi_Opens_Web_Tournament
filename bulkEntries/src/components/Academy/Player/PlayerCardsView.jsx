// components/Academy/PlayerCardsView.jsx
import React from "react";
import { Edit, Trash2, Eye, Plus, CalendarDays, Award, MapPin, CheckCircle, XCircle } from "lucide-react";
import { eventTypeBadges } from "../../../utils/playerUtils";

const PlayerCardsView = ({ players, onEditPlayer, onDeletePlayer, onViewPlayer, onAddEntry }) => {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {players.map((player) => {
        const eventCounts = player.eventCounts || { singles: 0, doubles: 0, mixedDoubles: 0, total: 0 };
        
        // Calculate paid events count
        const paidEventsCount = calculatePaidEventsCount(player.entries || []);

        return (
          <div
            key={player.id || player._id}
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
                  onClick={() => onDeletePlayer(player.id || player._id)}
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
    <span className="text-sm font-bold text-cyan-300">
      {player.states?.entries.events.total || 0}
    </span>
  </div>
  <div className="flex flex-wrap gap-1">
    {player.states?.entries.events.counts.singles > 0 && (
      <span className={`text-xs px-2 py-1 rounded border ${eventTypeBadges.singles.color}`}>
        {player.states.entries.events.counts.singles} Singles
      </span>
    )}
    {player.states?.entries.events.counts.doubles > 0 && (
      <span className={`text-xs px-2 py-1 rounded border ${eventTypeBadges.doubles.color}`}>
        {player.states.entries.events.counts.doubles} Doubles
      </span>
    )}
    {player.states?.entries.events.counts.mixedDoubles > 0 && (
      <span className={`text-xs px-2 py-1 rounded border ${eventTypeBadges.mixedDoubles.color}`}>
        {player.states.entries.events.counts.mixedDoubles} Mixed
      </span>
    )}
    {(player.states?.entries.events.total === 0 || !player.states) && (
      <span className="text-xs text-gray-500 italic">No events registered</span>
    )}
  </div>
</div>

{/* Payment Status */}
<div className="mb-4">
  <div className="flex items-center justify-between text-sm">
    <span className="text-gray-400">Status:</span>
    <div className="text-right">
      <div className="text-cyan-300 font-medium">
        {player.states?.entries.events.total || 0} total
      </div>
      <div className="text-gray-400 text-xs">
        {player.states?.entries.events.paid || 0} paid
      </div>
    </div>
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
                onClick={() => onAddEntry(player.id||player._id)}
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

// Helper function to calculate paid events count
const calculatePaidEventsCount = (entries) => {
  let paidCount = 0;
  
  entries.forEach(entry => {
    if (entry.events && Array.isArray(entry.events)) {
      entry.events.forEach(event => {
        if (event.payment?.status === 'Paid') {
          paidCount++;
        }
      });
    }
  });
  
  return paidCount;
};

export default PlayerCardsView;