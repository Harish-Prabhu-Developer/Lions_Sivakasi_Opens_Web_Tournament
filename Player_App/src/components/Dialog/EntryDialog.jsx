import { Check, X, User, Users2 } from "lucide-react";
import React, { useState } from "react";

// Modern Stepper with glass, shadow, gradient
const Stepper = ({ currentStep, steps }) => (
  <div className="w-full flex flex-col items-center mb-3 select-none">
    <div className="flex w-full justify-between items-center pt-7 pb-6 px-1">
      {steps.map((step, idx) => (
        <React.Fragment key={step}>
          {idx > 0 && (
            <div
              className={`
                flex-1 h-1 mx-1 md:mx-2 rounded-full transition-all duration-500 
                ${idx < currentStep ? "bg-gradient-to-r from-cyan-400 to-cyan-500 shadow-cyan-400/40 shadow-sm" : "bg-gray-300/50"}
              `}
              style={{
                minWidth: '28px'
              }}
            />
          )}
          <div className="flex flex-col items-center flex-none group">
            <div
              className={`flex items-center justify-center w-11 h-11 rounded-full border-[3px] font-bold text-lg transition duration-300 ring-2 ring-transparent
                ${
                  idx + 1 < currentStep
                    ? "bg-gradient-to-br from-cyan-500 to-cyan-400 border-cyan-400 text-white shadow-lg group-hover:ring-cyan-500"
                    : idx + 1 === currentStep
                    ? "bg-[#151d29]/90 border-cyan-400 text-cyan-500 shadow-2xl shadow-cyan-400/30 scale-110 ring-cyan-400 ring-offset-2"
                    : "bg-white/70 border-gray-300 text-gray-400 group-hover:ring-cyan-300"
                }
              `}
            >
              {idx + 1 < currentStep ? <Check className="w-5 h-5" /> : idx + 1}
            </div>
            <span className={`mt-2 text-xs md:text-sm font-semibold transition-colors duration-300 tracking-wide
              ${idx + 1 === currentStep
                ? "text-cyan-400"
                : idx + 1 < currentStep
                  ? "text-cyan-300"
                  : "text-gray-400"
            }`}>
              {step}
            </span>
          </div>
        </React.Fragment>
      ))}
    </div>
  </div>
);

function PlayerDialog({ open, onClose, type }) {
  return !open ? null : (
    <div className="fixed z-50 inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-[#213051]/95 rounded-2xl border border-cyan-400/10 shadow-2xl p-7 w-full max-w-xl relative animate-fadeIn">
        <button onClick={onClose} className="absolute right-5 top-5 text-gray-300 hover:text-cyan-400 transition">
          <X className="w-6 h-6" />
        </button>
        <div className="flex items-center gap-2 mb-5">
          {type === "singles" && <User className="w-7 h-7 text-cyan-400" />}
          {(type === "doubles" || type === "mixed doubles") && <Users2 className="w-7 h-7 text-cyan-400" />}
          <h3 className="text-lg font-bold text-cyan-300">{type.replace(/^./, c=>c.toUpperCase())} Entry Details</h3>
        </div>
        <form className="flex flex-col gap-4">
          <input placeholder="TNBA ID" className="modern-input" />
          <input type="date" placeholder="Date of Birth" className="modern-input" />
          <input placeholder="State" className="modern-input" />
          <input placeholder="District" className="modern-input" />
          <input placeholder="City Name" className="modern-input" />
          {type !== "singles" && <input placeholder="Partner TNBA ID" className="modern-input" />}
        </form>
        <div className="flex justify-end mt-6">
          <button type="button" onClick={onClose} className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-cyan-400 rounded-lg text-white font-bold shadow hover:scale-105 transition">Save</button>
        </div>
      </div>
      <style>{`
        .modern-input {
          width: 100%;
          background: rgba(27,38,61,0.87);
          border: 2px solid #22d3ee22;
          color: white;
          padding: 0.8rem 1.1rem;
          border-radius: 0.7rem;
          font-size: 1rem;
          outline: none;
          box-shadow: 0 2px 18px -1px rgba(38,240,254,0.08);
          transition: border-color 0.18s, box-shadow 0.18s, background 0.14s;
        }
        .modern-input:focus {
          border-color: #22d3ee; background: rgba(16,44,63,1);
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px);}
          to   { opacity: 1; transform: none;}
        }
        .animate-fadeIn { animation: fadeIn 0.35s cubic-bezier(.57,1.05,.58,1) both;}
      `}</style>
    </div>
  );
}

function EventTypeChip({ type, selected, onClick, disabled }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`min-w-[90px] py-2 px-4 outline-none rounded-full font-semibold shadow text-[1rem] transition-all duration-150 border-2 group relative
        ${
          selected
            ? "bg-gradient-to-r from-cyan-500 to-cyan-400 border-cyan-400 text-white ring-2 ring-cyan-300"
            : "bg-white/10 border-cyan-700 text-cyan-200 hover:border-cyan-300 hover:bg-cyan-900/20"
        }
        ${disabled ? "opacity-30 cursor-not-allowed" : "hover:scale-[1.08] focus:ring-2 focus:ring-cyan-400"}
      `}
    >
      <span className="capitalize">{type.replace("mixed ", "Mixed ")}</span>
      {selected && (
        <span className="absolute -top-2 -right-2 rounded-full bg-cyan-400 text-white w-5 h-5 flex items-center justify-center shadow ring-2 ring-white">
          <Check className="w-4 h-4" />
        </span>
      )}
    </button>
  );
}

function StepOneEventSelection({ data, selectedEvents, setSelectedEvents, onTypeClick }) {
  const singlesAndDoublesCount = selectedEvents.filter(e => e.type === "singles" || e.type === "doubles").length;
  const mixedCount = selectedEvents.filter(e => e.type === "mixed doubles").length;
  const isChipDisabled = (cat, type) => {
    if (type === "mixed doubles" && mixedCount >= 1 && !selectedEvents.some(e => e.category === cat && e.type === "mixed doubles")) return true;
    if ((type === "singles" || type === "doubles") && singlesAndDoublesCount >= 2 && !selectedEvents.some(e => e.category === cat && e.type === type)) return true;
    if (
      selectedEvents.length >= 3 &&
      !selectedEvents.some(e => e.category === cat && e.type === type)
    ) return true;
    return false;
  };
  const isSelected = (cat, type) => selectedEvents.some(e => e.category === cat && e.type === type);
  const handleChip = (category, type) => {
    if (isSelected(category, type)) {
      setSelectedEvents(ev => ev.filter(e => !(e.category === category && e.type === type)));
    } else {
      setSelectedEvents(ev => [...ev, { category, type }]);
    }
  };

  return (
    <div className="w-full flex flex-col">
      <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 gap-6">
        {data.map((category) => (
          <div
            key={category.Category}
            className="bg-gradient-to-b from-[#244572]/80 to-[#181f3288] border border-cyan-800/50 rounded-2xl p-5 flex flex-col shadow-lg hover:shadow-2xl transition duration-300 group relative"
            tabIndex={0}
          >
            <div className="mb-2 flex items-center justify-between">
              <span className="font-bold text-lg text-white tracking-wider">{category.Category}</span>
              {category.AfterBorn && (
                <span className="px-3 py-1 rounded-full bg-cyan-400/20 text-xs text-cyan-300 font-semibold ml-1">
                  Born after {category.AfterBorn}
                </span>
              )}
            </div>
            <div className="flex flex-wrap gap-2 items-center justify-start mt-3">
              {category.types.map((type) => (
                <EventTypeChip
                  key={type}
                  type={type}
                  selected={isSelected(category.Category, type)}
                  onClick={() => {
                    handleChip(category.Category, type);
                    setTimeout(() => { if (!isChipDisabled(category.Category, type)) onTypeClick(type, category.Category); }, 90);
                  }}
                  disabled={isChipDisabled(category.Category, type)}
                />
              ))}
            </div>

            {/* Highlight border if any chip selected */}
            {(category.types.some(type => isSelected(category.Category, type))) && (
              <div className="absolute inset-0 rounded-2xl border-4 border-cyan-400/60 pointer-events-none animate-pulse-fast" />
            )}
          </div>
        ))}
      </div>
      <div className="mt-5 text-cyan-300 text-xs flex items-center gap-3">
        <span className="font-semibold bg-cyan-800/30 px-3 py-1 rounded-full">
          Max 3 Events
        </span>
        <span className="font-semibold bg-cyan-800/30 px-3 py-1 rounded-full">
          Max 2 Singles/Doubles
        </span>
        <span className="font-semibold bg-cyan-800/30 px-3 py-1 rounded-full">
          1 Mixed Doubles
        </span>
      </div>
      <style>{`
        .animate-pulse-fast { animation: pulse-fast 1s cubic-bezier(.4,0,.6,1) infinite; }
        @keyframes pulse-fast {
          0%, 100% { border-color: #8bdfff44; }
          50% { border-color: #22d3ee88; }
        }
      `}</style>
    </div>
  );
}

const EntryDialog = ({ onClose }) => {
  const [step, setStep] = useState(1);
  const steps = ["Event", "Details", "Documents"];
  const [selectedEvents, setSelectedEvents] = useState([]);
  const [playerDialog, setPlayerDialog] = useState({ open: false, type: null, category: null });
  const data = [
    { id: 1, Category: "U9", types: ["singles"], gender: ["boys", "girls"], AfterBorn: 2015 },
    { id: 2, Category: "U11", types: ["singles"], gender: ["boys", "girls"] },
    { id: 3, Category: "U13", types: ["singles", "doubles"], AfterBorn: 2013 },
    { id: 4, Category: "U15", types: ["singles", "doubles", "mixed doubles"], gender: ["boys", "girls"], AfterBorn: 2011 },
    { id: 5, Category: "U17", types: ["singles", "doubles", "mixed doubles"], gender: ["boys", "girls"], AfterBorn: 2009 },
    { id: 6, Category: "U19", types: ["singles", "doubles", "mixed doubles"], gender: ["boys", "girls"], AfterBorn: 2007 },
  ];
  const goNext = () => setStep((cur) => Math.min(cur + 1, steps.length));
  const goBack = () => setStep((cur) => Math.max(cur - 1, 1));
  const handleTypeClick = (type, category) => {
    setPlayerDialog({ open: true, type, category });
  };
  const handleSubmit = () => { goNext(); alert("Entry submitted!"); };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center overflow-y-auto px-2 py-4">
      <div className="relative bg-gradient-to-br from-[#243356]/90 to-[#1b2336]/97 w-full max-w-2xl md:max-w-3xl rounded-2xl shadow-2xl p-5 md:p-8 ring-1 ring-white/10 ring-inset border border-cyan-400/10 backdrop-blur-sm overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-cyan-400 hover:text-cyan-300 rounded-full p-1 transition"
          aria-label="Close dialog"
        >
          <X className="w-7 h-7" />
        </button>
        <h2 className="text-2xl md:text-3xl font-bold mb-4 text-white tracking-wide drop-shadow">
          Tournament Entry
        </h2>
        <Stepper currentStep={step} steps={steps} />
        <div className="mb-3" />
        <div>
          {step === 1 && (
            <div>
              <StepOneEventSelection
                data={data}
                selectedEvents={selectedEvents}
                setSelectedEvents={setSelectedEvents}
                onTypeClick={handleTypeClick}
              />
              <div className="flex justify-end mt-4">
                <button
                  onClick={goNext}
                  className="px-7 py-2.5 bg-gradient-to-r from-cyan-500 to-cyan-400 rounded-xl text-white font-bold shadow-lg hover:scale-[1.06] active:scale-95 transition disabled:opacity-30 disabled:scale-100"
                  disabled={selectedEvents.length === 0}
                >
                  Next
                </button>
              </div>
              <PlayerDialog
                open={playerDialog.open}
                onClose={() => setPlayerDialog({ open: false, type: null, category: null })}
                type={playerDialog.type}
              />
            </div>
          )}
          {step === 2 && (
            <div>
              <p className="text-gray-300 mb-4 mt-4 text-base">
                Step 2: Player Details form goes here.
              </p>
              <div className="flex justify-between gap-3">
                <button
                  onClick={goBack}
                  className="px-6 py-2.5 bg-gray-700 rounded-lg text-white font-bold shadow hover:bg-gray-600 transition"
                >
                  Back
                </button>
                <button
                  onClick={goNext}
                  className="px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-cyan-400 rounded-lg text-white font-bold shadow hover:scale-[1.06] active:scale-95 transition"
                >
                  Next
                </button>
              </div>
            </div>
          )}
          {step === 3 && (
            <div>
              <p className="text-gray-300 mb-4 mt-4 text-base">
                Step 3: Documents & Payment form goes here.
              </p>
              <div className="flex justify-between gap-3">
                <button
                  onClick={goBack}
                  className="px-6 py-2.5 bg-gray-700 rounded-lg text-white font-bold shadow hover:bg-gray-600 transition"
                >
                  Back
                </button>
                <button
                  onClick={handleSubmit}
                  className="px-6 py-2.5 bg-gradient-to-r from-green-500 to-green-400 rounded-lg text-white font-bold shadow hover:scale-[1.06] active:scale-95 transition"
                >
                  Submit
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EntryDialog;
