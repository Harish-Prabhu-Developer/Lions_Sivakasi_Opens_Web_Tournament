import { X } from "lucide-react";
import React, { useState } from "react";
import Stepper from "../Steppers/Stepper";
import StepOneEventSelection from "../Steppers/StepOneEventSelection";
import PlayerForm from "../PlayerForm";
import PaymentStep from "../Steppers/PaymentStep";

export const tournamentData = {
  entryFees: { singles: 800, doubles: 1400 },
  categories: [
    { name: "Under 09 Boys & Girls", afterBorn: 2017, events: ["Singles"] },
    { name: "Under 11 Boys & Girls", afterBorn: 2015, events: ["Singles"] },
    { name: "Under 13 Boys & Girls", afterBorn: 2013, events: ["Singles", "Doubles"] },
    { name: "Under 15 Boys & Girls", afterBorn: 2011, events: ["Singles", "Doubles", "Mixed Doubles"] },
    { name: "Under 17 Boys & Girls", afterBorn: 2009, events: ["Singles", "Doubles", "Mixed Doubles"] },
    { name: "Under 19 Boys & Girls", afterBorn: 2007, events: ["Singles", "Doubles", "Mixed Doubles"] },
  ],
  upi: "lionssivakasiopen@okicici",
};

const EntryDialog = ({ onClose }) => {
  const [step, setStep] = useState(1);
  const [selectedEvents, setSelectedEvents] = useState([]);
  const [playersData, setPlayersData] = useState({ main: {}, partners: {} });

  // Construct ordered step 2 forms list: first main player, then partner forms for doubles/mixed doubles
  const doublesEvents = selectedEvents.filter(ev => ev.type === "doubles" || ev.type === "mixed doubles");
  const step2Forms = [{ key: "main", label: "Main Player", category: null, type: "main" }]
    .concat(doublesEvents.map(ev => ({ key: ev.category, label: `${ev.category} Partner (${ev.type.replace(/^\w/, c=>c.toUpperCase())})`, category: ev.category, type: "partner" })));

  // Step 2 local step to track which form is currently being shown
  const [step2Index, setStep2Index] = useState(0);

  // Update form data helpers
  const updateMainPlayer = (key, value) => {
    setPlayersData(prev => ({ ...prev, main: { ...prev.main, [key]: value } }));
  };
  const updatePartner = (category, key, value) => {
    setPlayersData(prev => ({
      ...prev,
      partners: {
        ...prev.partners,
        [category]: { ...(prev.partners[category] || {}), [key]: value },
      },
    }));
  };

  const onFormChange = (key, value) => {
    if (step2Forms[step2Index].type === "main") {
      updateMainPlayer(key, value);
    } else {
      updatePartner(step2Forms[step2Index].category, key, value);
    }
  };

  // Navigate through step 2 forms
  const goNextStep2Form = () => {
    if (step2Index < step2Forms.length - 1) {
      setStep2Index(step2Index + 1);
    } else {
      setStep(3);
    }
  };

  const goBackStep2Form = () => {
    if (step2Index > 0) {
      setStep2Index(step2Index - 1);
    } else {
      setStep(1);
    }
  };

  // Current form data for step 2
  const currentForm = step2Forms[step2Index];
  const currentFormData = currentForm.type === "main" ? playersData.main : playersData.partners[currentForm.category] || {};

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center overflow-y-auto px-2 py-4">
      <div className="relative max-w-3xl w-full rounded-2xl  p-6 md:p-10 bg-gradient-to-br from-[#1f2c45]/95 to-[#182132]/95 border border-cyan-400/20 backdrop-blur-md shadow-2xl overflow-y-auto max-h-[90vh]">
        <button onClick={onClose} className="absolute top-5 right-5 text-cyan-400 hover:text-cyan-300 rounded-full p-1 transition">
          <X className="w-7 h-7" />
        </button>

        <h2 className="text-center text-3xl font-bold text-white mb-6">Tournament Entry</h2>

        <Stepper currentStep={step} steps={["Select Events", "Player Details", "Payment & Submit"]} />

        {step === 1 && (
          <>
            <StepOneEventSelection
              categories={tournamentData.categories}
              selectedEvents={selectedEvents}
              setSelectedEvents={setSelectedEvents}
              onTypeClick={() => {}}
            />
            <div className="flex justify-end mt-6">
              <button
                disabled={!selectedEvents.length}
                className="btn btn-primary"
                onClick={() => {
                  setStep(2);
                  setStep2Index(0);
                }}
              >
                Next
              </button>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <PlayerForm
              label={currentForm.label}
              form={currentFormData}
              setForm={updates => onFormChange(Object.keys(updates)[0], Object.values(updates)[0])}
            />
            <div className="flex justify-between mt-6">
              <button onClick={goBackStep2Form} className="btn btn-secondary">Back</button>
              <button onClick={goNextStep2Form} className="btn btn-primary">
                {step2Index === step2Forms.length - 1 ? "Next" : "Next Player"}
              </button>
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <PaymentStep
              selectedEvents={selectedEvents}
              player={playersData.main}
              partner={playersData.partners}
              upi={tournamentData.upi}
            />
            <div className="flex justify-between mt-6">
              <button onClick={() => setStep(2)} className="btn btn-secondary">Back</button>
              <button onClick={() => alert("[translate:Entry Submitted Successfully!]")} className="btn btn-primary">Submit</button>
            </div>
          </>
        )}

        <style>{`
          .btn-primary {
            background-image: linear-gradient(to right, #06b6d4, #0ea5e9);
            color: white;
            font-weight: 600;
            padding: 0.625rem 1.25rem;
            border-radius: 0.5rem;
            box-shadow: 0 2px 14px -1px rgba(14,165,233,0.45);
            transition: all 0.2s;
          }
          .btn-primary:hover {
            transform: scale(1.05);
            box-shadow: 0 8px 32px -2px rgba(14,165,233,0.7);
          }
          .btn-primary:disabled {
            opacity: 0.5;
            cursor: not-allowed;
            box-shadow: none;
            transform: none;
          }
          .btn-secondary {
            background-color: #374151;
            font-weight: 600;
            padding: 0.625rem 1.25rem;
            border-radius: 0.5rem;
            color: white;
            transition: background-color 0.2s ease;
          }
          .btn-secondary:hover {
            background-color: #4b5563;
          }
        `}</style>
      </div>
    </div>
  );
};

export default EntryDialog;
