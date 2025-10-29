import React, { useState } from "react";
import Stepper from "../components/Steppers/Stepper";
import StepOneEventSelection from "../components/Steppers/StepOneEventSelection";
import PlayerForm from "../components/PlayerForm";
import PaymentStep from "../components/Steppers/PaymentStep";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export const tournamentData = {
  entryFees: { singles: 800, doubles: 1400 },
  categories: [
    { name: "Under 09 Boys & Girls", afterBorn: 2017, events: ["Singles"] },
    { name: "Under 11 Boys & Girls", afterBorn: 2015, events: ["Singles"] },
    {
      name: "Under 13 Boys & Girls",
      afterBorn: 2013,
      events: ["Singles", "Doubles"],
    },
    {
      name: "Under 15 Boys & Girls",
      afterBorn: 2011,
      events: ["Singles", "Doubles", "Mixed Doubles"],
    },
    {
      name: "Under 17 Boys & Girls",
      afterBorn: 2009,
      events: ["Singles", "Doubles", "Mixed Doubles"],
    },
    {
      name: "Under 19 Boys & Girls",
      afterBorn: 2007,
      events: ["Singles", "Doubles", "Mixed Doubles"],
    },
  ],
  upi: "test@oksbi",
};

const EntryPage = () => {
  const [step, setStep] = useState(1);
  const [selectedEvents, setSelectedEvents] = useState([]);
  const [playersData, setPlayersData] = useState({ player: {}, partners: {} });
  const navigate = useNavigate();

  // Handle doubles/mixed doubles partner forms
  const doublesEvents = selectedEvents.filter(
    (ev) => ev.type === "doubles" || ev.type === "mixed doubles"
  );

  const step2Forms = [
    { key: "player", label: "Your Details", category: null, type: "player" },
  ].concat(
    doublesEvents.map((ev) => ({
      key: ev.category,
      label: `${ev.category
        .replace("Boys & Girls", "")
        .trim()} Partner Details (${ev.type.replace(/^\w/, (c) => c.toUpperCase())})`,
      category: ev.category,
      type: "partner",
    }))
  );

  const [step2Index, setStep2Index] = useState(0);

  const updateMainPlayer = (key, value) => {
    setPlayersData((prev) => ({
      ...prev,
      player: { ...prev.player, [key]: value },
    }));
  };

  const updatePartner = (category, key, value) => {
    setPlayersData((prev) => ({
      ...prev,
      partners: {
        ...prev.partners,
        [category]: { ...(prev.partners[category] || {}), [key]: value },
      },
    }));
  };

  const onFormChange = (key, value) => {
    if (step2Forms[step2Index].type === "player") {
      updateMainPlayer(key, value);
    } else {
      updatePartner(step2Forms[step2Index].category, key, value);
    }
  };

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

  const currentForm = step2Forms[step2Index];
  const currentFormData =
    currentForm.type === "player"
      ? playersData.player
      : playersData.partners[currentForm.category] || {};

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#0a192f] to-[#0f223f] text-white flex flex-col items-center py-8 px-4 sm:px-6 md:px-10 transition-all duration-300">
      {/* Header */}
      <div className="w-full max-w-6xl bg-[#192339]/80 border border-cyan-400/10 rounded-2xl shadow-xl p-6 sm:p-8 backdrop-blur-md mb-10 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full sm:w-auto">
<button
          onClick={() => navigate("/dashboard")}
          className="flex items-center gap-2 btn btn-secondary transition-all"
        >
          <ArrowLeft className="w-3 h-3 sm:w-5 sm:h-5" />
          <span className="font-medium">Back</span>
        </button>
          <h2 className="text-xl md:text-3xl text-center font-bold text-cyan-300 tracking-wide w-full sm:w-auto">
            Tournament Entry
          </h2>
        </div>
      </div>

      {/* Stepper */}
      <div className="w-full max-w-4xl mb-10">
        <Stepper
          currentStep={step}
          steps={["Select Events", "Player Details", "Payment"]}
        />
      </div>

      {/* Step Content */}
      <div className="w-full max-w-4xl bg-[#192339]/80 border border-cyan-400/10 rounded-2xl shadow-xl p-6 sm:p-8 backdrop-blur-md">
        {step === 1 && (
          <>
            <StepOneEventSelection
              categories={tournamentData.categories}
              selectedEvents={selectedEvents}
              setSelectedEvents={setSelectedEvents}
              onTypeClick={() => {}}
            />
            <div className="flex justify-end w-full mt-8">
              <button
                disabled={!selectedEvents.length}
                className={`px-8 py-2 font-semibold rounded-lg transition-all duration-200 shadow-md ${
                  !selectedEvents.length
                    ? "bg-gray-600 cursor-not-allowed"
                    : "bg-gradient-to-r from-cyan-500 to-cyan-400 hover:scale-105"
                }`}
                onClick={() => {
                  setStep(2);
                  setStep2Index(0);
                }}
              >
                Next →
              </button>
            </div>
          </>
        )}

        {step === 2 && (
          <div className="w-full">
            <PlayerForm
              currentForm={currentForm}
              form={currentFormData}
              setForm={(key, value) => onFormChange(key, value)}
            />
            <div className="flex flex-col sm:flex-row justify-between mt-8 gap-4">
              <button
                onClick={goBackStep2Form}
                className="px-6 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg font-medium transition-all duration-200 w-full sm:w-auto"
              >
                ← Back
              </button>
              <button
                onClick={goNextStep2Form}
                className="px-8 py-2 bg-gradient-to-r from-cyan-500 to-cyan-400 hover:scale-105 text-white font-semibold rounded-lg transition-all duration-200 w-full sm:w-auto"
              >
                {step2Index === step2Forms.length - 1
                  ? "Next →"
                  : "Next Player →"}
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <PaymentStep
            selectedEvents={selectedEvents}
            player={playersData.player}
            partner={playersData.partners}
            upi={tournamentData.upi}
            setStep={() => setStep(2)}
          />
        )}
      </div>
    </div>
  );
};

export default EntryPage;
