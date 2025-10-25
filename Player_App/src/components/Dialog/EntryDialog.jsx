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

const EntryDialog = ({ onClose }) => {
  const [step, setStep] = useState(1);
  const [selectedEvents, setSelectedEvents] = useState([]);
  const [playersData, setPlayersData] = useState({ player: {}, partners: {} });

  // Construct ordered step 2 forms list: first main player, then partner forms for doubles/mixed doubles
  const doublesEvents = selectedEvents.filter(
    (ev) => ev.type === "doubles" || ev.type === "mixed doubles"
  );
  const step2Forms = [
    { key: "player", label: "Your Details", category: null, type: "player" },
  ].concat(
    doublesEvents.map((ev) => ({
      key: ev.category,
      label: `${ev.category.replace("Boys & Girls", "").trim()} Partner Details (${ev.type.replace(/^\w/, (c) =>
        c.toUpperCase()
      )})`,
      category: ev.category,
      type: "partner",
    }))
  );

  // Step 2 local step to track which form is currently being shown
  const [step2Index, setStep2Index] = useState(0);

  // Update form data helpers
  const updateMainPlayer = (key, value) => {
    setPlayersData((prev) => ({
      ...prev,
      player: { ...prev.player, [key]: value },
    }));
  };
  const updatePartner = (category,key, value) => {
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

  // Navigate through step 2 forms
  const goNextStep2Form = () => {
    console.log("----------------------------------------------------------");
    
    console.log("Current Form : ",currentForm);
    console.log("----------------------------------------------------------");
    console.log("Current Form Data : ",currentFormData);
    console.log("----------------------------------------------------------");
    console.log("Player Data : ",playersData);
    
    console.log("----------------------------------------------------------");
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
  // Determine current form data
  const currentFormData =
    currentForm.type === "player"
      ? playersData.player
      : playersData.partners[currentForm.category] || {};

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex flex-wrap items-center justify-center overflow-y-auto px-2 py-4">
      <div className="w-[96%] sm:w-[80%] items-center md:[60%] px-4 md:px-8 py-4 max-h-max rounded-3xl bg-gradient-to-br from-[#17203a]/90 via-[#1e3358]/80 to-[#0c182a]/92 border border-cyan-600/30 shadow-2xl backdrop-blur-xl flex flex-col">
      <div className="flex items-center justify-between w-full mb-6 relative">
        <h2 className="flex-1 text-center text-2xl sm:text-3xl md:text-4xl font-bold text-cyan-100 drop-shadow">
          Tournament Entry
        </h2>
        <div
          onClick={onClose}
          className="absolute right-0 text-white bg-red-500 hover:text-red-400 hover:bg-red-100 rounded-xl p-2 transition cursor-pointer"
        >
          <X className="w-4 h-4 sm:w-6 sm:h-6" />
        </div>
      </div>


        <Stepper
          currentStep={step}
          steps={["Select Events", "Player Details", "Payment"]}
        />

        {step === 1 && (
          <>
            <StepOneEventSelection
              categories={tournamentData.categories}
              selectedEvents={selectedEvents}
              setSelectedEvents={setSelectedEvents}
              onTypeClick={() => {}}
            />
            <div className="flex justify-end w-full mt-6">
              <button
                disabled={!selectedEvents.length}
                className="btn btn-primary "
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
          <div className="w-full md:w-6/12 ">
            <PlayerForm
              label={currentForm.label}
              form={currentFormData}
              setForm={(key, value) => onFormChange(key, value)}
            />
            <div className="flex justify-between mt-6">
              <button onClick={goBackStep2Form} className="btn btn-secondary">
                Back
              </button>
              <button onClick={goNextStep2Form} className="btn btn-primary">
                {step2Index === step2Forms.length - 1 ? "Next" : "Next Player"}
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <>
            <PaymentStep
              selectedEvents={selectedEvents}
              player={playersData.player}
              partner={playersData.partners}
              upi={tournamentData.upi}
              setStep={() => setStep(2)}
            />
          </>
        )}

      </div>
    </div>
  );
};

export default EntryDialog;
