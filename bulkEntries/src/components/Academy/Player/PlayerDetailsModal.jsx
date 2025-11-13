// components/Academy/PlayerDetailsModal.jsx
import React from "react";
import { User, X, Edit, Plus } from "lucide-react";
import { getEventTypeCounts } from "../../../utils/playerUtils";

const PlayerDetailsModal = ({ player, onClose, onEditPlayer, onAddEntry }) => {
  const eventCounts = getEventTypeCounts(player);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-linear-to-br from-[#1e293b] to-[#0f172a] border border-cyan-400/20 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-cyan-300 flex items-center gap-2">
              <User className="w-5 h-5" />
              Player Details
            </h3>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div className="space-y-4">
              <div>
                <label className="text-sm text-cyan-300 font-semibold mb-2 block">Personal Information</label>
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b border-gray-700">
                    <span className="text-gray-400">Full Name:</span>
                    <span className="font-semibold text-white">{player.fullName}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-700">
                    <span className="text-gray-400">TNBA ID:</span>
                    <span className="font-semibold text-cyan-300">
                      {player.tnbaId || <span className="text-gray-500">Not provided</span>}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-700">
                    <span className="text-gray-400">Date of Birth:</span>
                    <span className="font-semibold text-white">
                      {new Date(player.dob).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm text-cyan-300 font-semibold mb-2 block">Academy Information</label>
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b border-gray-700">
                    <span className="text-gray-400">Academy:</span>
                    <span className="font-semibold text-white">{player.academy}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-700">
                    <span className="text-gray-400">Place:</span>
                    <span className="font-semibold text-white">{player.place}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-700">
                    <span className="text-gray-400">District:</span>
                    <span className="font-semibold text-white">{player.district}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Events Summary */}
          <div className="mb-6">
            <label className="text-sm text-cyan-300 font-semibold mb-4 block">Events Summary</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-blue-300">{eventCounts.singles}</div>
                <div className="text-sm text-blue-400">Singles</div>
              </div>
              <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-green-300">{eventCounts.doubles}</div>
                <div className="text-sm text-green-400">Doubles</div>
              </div>
              <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-purple-300">{eventCounts.mixedDoubles}</div>
                <div className="text-sm text-purple-400">Mixed Doubles</div>
              </div>
              <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-cyan-300">{eventCounts.total}</div>
                <div className="text-sm text-cyan-400">Total Events</div>
              </div>
            </div>
          </div>

          {/* Detailed Events List */}
          {player.entries && player.entries.length > 0 && (
            <div>
              <label className="text-sm text-cyan-300 font-semibold mb-4 block">Event Details</label>
              <div className="space-y-2">
                {player.entries.map((entry, index) => (
                  <div key={index} className="flex items-center justify-between py-3 px-4 bg-gray-800/50 rounded-lg">
                    <div>
                      <div className="font-semibold text-white">{entry.category} - {entry.type}</div>
                      <div className="text-sm text-gray-400">
                        Status: <span className={`${
                          entry.status === 'approved' ? 'text-green-400' : 
                          entry.status === 'pending' ? 'text-yellow-400' : 'text-red-400'
                        }`}>
                          {entry.status}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-sm ${
                        entry.paymentStatus === 'Paid' ? 'text-green-400' : 'text-yellow-400'
                      }`}>
                        {entry.paymentStatus}
                      </div>
                      {entry.partner && (
                        <div className="text-xs text-gray-400">Partner: {entry.partner.name}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-6 border-t border-gray-700">
            <button
              onClick={() => onEditPlayer(player)}
              className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <Edit className="w-4 h-4" />
              Edit Player
            </button>
            <button
              onClick={() => onAddEntry(player.id)}
              className="flex-1 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Entry
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlayerDetailsModal;