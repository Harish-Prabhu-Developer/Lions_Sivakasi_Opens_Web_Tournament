import { tournamentData } from "../Dialog/EntryDialog";

function StepOneEventSelection({ categories, selectedEvents, setSelectedEvents, onTypeClick }) {
  const singlesDoublesCount = selectedEvents.filter(e => ["singles", "doubles"].includes(e.type)).length;
  const mixedDoublesCount = selectedEvents.filter(e => e.type === "mixed doubles").length;
  const DATA_LIMIT = {
    MAX_TOTAL: 4,
    MAX_EACH: 3,
    MAX_MIXED: 1,
  };

  const isChipDisabled = (cat, type) => {
    if (type === "mixed doubles" && mixedDoublesCount >= DATA_LIMIT.MAX_MIXED && !selectedEvents.some(e => e.category === cat && e.type === "mixed doubles")) return true;
    if (["singles", "doubles"].includes(type) && singlesDoublesCount >= DATA_LIMIT.MAX_EACH && !selectedEvents.some(e => e.category === cat && e.type === type)) return true;
    if (selectedEvents.length >= DATA_LIMIT.MAX_TOTAL && !selectedEvents.some(e => e.category === cat && e.type === type)) return true;
    return false;
  };

  const toggle = (cat, type) => {
    setSelectedEvents(prev =>
      prev.some(e => e.category === cat && e.type === type)
        ? prev.filter(e => !(e.category === cat && e.type === type))
        : [...prev, { category: cat, type }]
    );
    onTypeClick && onTypeClick(type, cat);
  };

  const isSelected = (cat, type) => selectedEvents.some(e => e.category === cat && e.type === type);

  const totalPrice = selectedEvents.reduce((sum, e) => {
    if (e.type === "singles") return sum + tournamentData.entryFees.singles;
    return sum + tournamentData.entryFees.doubles;
  }, 0);

  return (
<div className="w-full my-4 flex flex-col items-center justify-around ">
{/* Rules and Price Row */}
<div className="flex flex-col sm:flex-row justify-between w-full items-center gap-3 mb-5">
  <div className="flex flex-wrap items-center gap-2 sm:gap-4 justify-center my-2 sm:justify-start">
    <span className="text-cyan-200 font-medium">Rules:</span>
    <span className="bg-cyan-800/70 border border-cyan-400/25 text-cyan-200 px-3 py-1 rounded-full text-xs">Max 3 Events</span>
    <span className="bg-cyan-800/70 border border-cyan-400/25 text-cyan-200 px-3 py-1 rounded-full text-xs">Max 3 Singles/Doubles</span>
    <span className="bg-cyan-800/70 border border-cyan-400/25 text-cyan-200 px-3 py-1 rounded-full text-xs">1 Mixed Doubles</span>
  </div>
  {totalPrice > 0 &&
    <div className="text-lg font-bold text-cyan-50 self-center my-2 bg-gradient-to-r from-cyan-700/40 to-cyan-600/20 rounded-xl px-5 py-2 shadow">
      Total Price: ₹{totalPrice}
    </div>
  }
</div>
  {/* Event Categories & Types */}
  <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-6 w-full">
  {categories.map((category) => (
    <div
      key={category.name}
      className="rounded-2xl bg-gradient-to-br from-[#162a44]/90 via-[#143054]/80 to-[#0f1c35]/90 border border-cyan-700/30
        p-5 shadow-xl hover:shadow-cyan-400/20 transition-all duration-200 relative"
    >
      <div className="flex justify-between items-center gap-2 mb-3">
        <span className="text-cyan-100 font-bold text-base">{category.name}</span>
        {category.afterBorn && (
          <span className="bg-cyan-600/30 text-cyan-200 text-center text-xs font-medium rounded-full px-3 py-1">
            After {category.afterBorn}
          </span>
        )}
      </div>
      <div className="flex flex-wrap items-center justify-around gap-4 mt-2">
        {category.events.map((type) => {
          const selected = isSelected(category.name, type.toLowerCase());
          const disabled = isChipDisabled(category.name, type.toLowerCase());
          return (
            <button
              key={type}
              onClick={() => toggle(category.name, type.toLowerCase())}
              disabled={disabled}
              className={`
                px-5 py-1.5 rounded-full text-sm font-semibold border-2 my-1 transition-all
                ${
                  selected
                  ? "bg-gradient-to-r from-cyan-400 to-blue-500 border-cyan-200 text-white shadow-lg ring-2 ring-cyan-400"
                  : "bg-white/5 border-cyan-700 text-cyan-200 hover:border-cyan-400 hover:bg-cyan-900/25"
                }
                ${disabled ? "opacity-40 cursor-not-allowed" : "hover:scale-105 focus:ring-2 focus:ring-cyan-400"}
                `}
            >
              {type}
            </button>
          );
        })}
      </div>
    </div>
  ))}
</div>

</div>

  );
}

export default StepOneEventSelection;
