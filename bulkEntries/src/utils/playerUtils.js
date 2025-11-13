// utils/playerUtils.js
export const getEventTypeCounts = (player) => {
  const entries = player.entries || [];
  return {
    singles: entries.filter(entry => entry.type === 'singles').length,
    doubles: entries.filter(entry => entry.type === 'doubles').length,
    mixedDoubles: entries.filter(entry => entry.type === 'mixed doubles').length,
    total: entries.length
  };
};

export const eventTypeBadges = {
  singles: { label: "Singles", color: "bg-blue-500/20 text-blue-300 border-blue-500/30" },
  doubles: { label: "Doubles", color: "bg-green-500/20 text-green-300 border-green-500/30" },
  mixedDoubles: { label: "Mixed Doubles", color: "bg-purple-500/20 text-purple-300 border-purple-500/30" }
};