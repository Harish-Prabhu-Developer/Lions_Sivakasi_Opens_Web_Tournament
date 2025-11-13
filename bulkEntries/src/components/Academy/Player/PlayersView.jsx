// components/Academy/PlayersView.jsx
import React from "react";
import { Users } from "lucide-react";
import PlayerCardsView from "./PlayerCardsView";
import PlayerTableView from "./PlayerTableView";

const PlayersView = ({
  players,
  viewMode,
  searchTerm,
  onEditPlayer,
  onDeletePlayer,
  onViewPlayer,
  onAddEntry
}) => {
  if (players.length === 0) {
    return (
      <div className="max-w-7xl mx-auto bg-[#192339]/80 rounded-2xl shadow-lg border border-cyan-400/10 p-6">
        <div className="text-center py-12">
          <Users className="w-16 h-16 text-gray-500 mx-auto mb-4" />
          <p className="text-gray-400 text-lg mb-4">
            {searchTerm ? "No players found matching your search" : "No players added yet"}
          </p>
          {!searchTerm && (
            <p className="text-gray-500 text-sm">Click the + button to add your first player</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto bg-[#192339]/80 rounded-2xl shadow-lg border border-cyan-400/10 p-2">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-cyan-300">Managed Players</h3>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-400">
            {players.length} player{players.length !== 1 ? 's' : ''} found
          </span>
        </div>
      </div>

      {viewMode === "card" ? (
        <PlayerCardsView
          players={players}
          onEditPlayer={onEditPlayer}
          onDeletePlayer={onDeletePlayer}
          onViewPlayer={onViewPlayer}
          onAddEntry={onAddEntry}
        />
      ) : (
        <PlayerTableView
          players={players}
          onEditPlayer={onEditPlayer}
          onDeletePlayer={onDeletePlayer}
          onViewPlayer={onViewPlayer}
          onAddEntry={onAddEntry}
        />
      )}
    </div>
  );
};

export default PlayersView;