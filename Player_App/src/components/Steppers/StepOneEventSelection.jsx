import { Check } from "lucide-react";
import React from "react";
import { tournamentData } from '../Dialog/EntryDialog'; // Import entry fees here

function StepOneEventSelection({ categories, selectedEvents, setSelectedEvents, onTypeClick }) {

  const singlesDoublesCount = selectedEvents.filter(e => ["singles", "doubles"].includes(e.type)).length;
  const mixedDoublesCount = selectedEvents.filter(e => e.type === "mixed doubles").length;

  const isChipDisabled = (cat, type) => {
    if (type === "mixed doubles" && mixedDoublesCount >= 1 && !selectedEvents.some(e => e.category === cat && e.type === "mixed doubles")) return true;
    if (["singles", "doubles"].includes(type) && singlesDoublesCount >= 2 && !selectedEvents.some(e => e.category === cat && e.type === type)) return true;
    if (selectedEvents.length >= 3 && !selectedEvents.some(e => e.category === cat && e.type === type)) return true;
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
    if (e.type === "singles") {
      return sum + tournamentData.entryFees.singles;
    }
    return sum + tournamentData.entryFees.doubles;
  }, 0);

  return (
    <div className="w-full flex flex-col gap-4 p-4">
      {/* Rules and Total Price Section */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-3 gap-4 px-4">
        <div className="text-cyan-300 text-xs sm:text-sm font-semibold flex flex-wrap gap-2 justify-center">
           <span>Rules : </span>
          <span className="bg-cyan-900/40 px-2 py-1 rounded-full border border-cyan-600/40">Max 3 Events</span>
          <span className="bg-cyan-900/40 px-2 py-1 rounded-full border border-cyan-600/40">Max 2 Singles/Doubles</span>
          <span className="bg-cyan-900/40 px-2 py-1 rounded-full border border-cyan-600/40">1 Mixed Doubles</span>
        </div>
        {totalPrice > 0 && (
        <div className="text-white text-lg font-bold select-none">
          Total Price: ₹{totalPrice}
        </div>
        )}
      </div>

      {/* Event Categories & Types */}
      <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 gap-4">
        {categories.map((category) => (
          <div
            key={category.name}
            className="bg-gradient-to-br from-[#204060]/80 to-[#121a2f]/90 border border-cyan-700/30 rounded-2xl p-4 shadow-md hover:shadow-xl transition duration-300"
          >
            <div className="flex justify-between items-center mb-2">
              <h4 className="text-white font-semibold">{category.name}</h4>
              {category.afterBorn && (
                <span className="px-2 py-0.5 rounded-full bg-cyan-400/20 text-[10px] text-cyan-300 font-semibold">
                  After {category.afterBorn}
                </span>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {category.events.map((type) => (
                <button
                  key={type}
                  onClick={() => toggle(category.name, type.toLowerCase())}
                  disabled={isChipDisabled(category.name, type.toLowerCase())}
                  className={`px-3 py-1.5 rounded-full text-sm font-semibold border transition-all ${
                    isSelected(category.name, type.toLowerCase())
                      ? "bg-gradient-to-r from-cyan-500 to-sky-400 border-cyan-400 text-white"
                      : "bg-cyan-400/10 border-cyan-600 text-cyan-200 hover:border-cyan-400 hover:bg-cyan-900/30"
                    } ${isChipDisabled(category.name, type.toLowerCase()) ? "opacity-50 cursor-not-allowed" : "hover:scale-105 focus:ring-2 focus:ring-cyan-400"}`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default StepOneEventSelection;
