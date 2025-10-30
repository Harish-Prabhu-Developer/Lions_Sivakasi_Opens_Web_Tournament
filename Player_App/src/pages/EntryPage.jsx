// EntryPage.jsx
import React, { useState } from "react";
import Stepper from "../components/Steppers/Stepper";
import StepOneEventSelection from "../components/Steppers/StepOneEventSelection";
import PlayerForm, { fieldsObject } from "../components/PlayerForm";
import PaymentStep from "../components/Steppers/PaymentStep";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useContext } from "react";
import AuthContext from "../components/Auth/AuthContext";
import { formatDate } from "../utils/dateUtils";
import { useDispatch, useSelector } from "react-redux";
import {
  addToEvents,
  clearMessages,
  getPlayerEntries,
} from "../redux/Slices/EntriesSlice";
import toast from "react-hot-toast";
import { useEffect } from "react";
import { updatePlayerForm } from "../redux/Slices/PlayerSlice";
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
  const dispatch = useDispatch();
  const { loading, error, successMessage } = useSelector(
    (state) => state.entries
  );

  const [step, setStep] = useState(1);
  const [selectedEvents, setSelectedEvents] = useState([]);

  const [step2Index, setStep2Index] = useState(0);
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  // State
  const [playersData, setPlayersData] = useState({ player: {}, partners: {} });

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
        .trim()} Partner Details (${ev.type.replace(/^\w/, (c) =>
        c.toUpperCase()
      )})`,
      category: ev.category,
      type: "partner",
    }))
  );

  // 🧩 Determine current form dynamically
  const currentForm = step2Forms[step2Index];
  const currentFormData =
    currentForm.type === "player"
      ? playersData.player
      : playersData.partners[currentForm.category] || {};

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await dispatch(getPlayerEntries()).unwrap();
        const playerEntries = response.data;

        if (Array.isArray(playerEntries) && playerEntries.length > 0) {
          // Flatten and clean up the events
          const mappedEvents = playerEntries.flatMap((entry) =>
            entry.events.map((ev) => ({
              category: ev.category
                .replace(/\s*Boys\s*&\s*Girls\s*/gi, "")
                .trim(),
              type: ev.type.toLowerCase(),
            }))
          );

          console.log("Mapped Events:", mappedEvents);

          // ✅ Set mapped events as default selectedEvents
          setSelectedEvents(mappedEvents);
        } else {
          setSelectedEvents([]); // no entries yet
        }
      } catch (error) {
        console.error("Error fetching player entries:", error);
      }
    };

    fetchEvents();
  }, [dispatch]);

  // Update functions
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
        [category]: {
          ...(prev.partners[category] || {}),
          [key]: value,
        },
      },
    }));
  };

  // Handle form input changes
  const onFormChange = (key, value) => {
    const currentForm = step2Forms[step2Index];
    if (currentForm.type === "player") {
      updateMainPlayer(key, value);
    } else {
      updatePartner(currentForm.category, key, value);
    }
  };

  // Go Next button handler
  const goNextStep2Form = async () => {
    const currentForm = step2Forms[step2Index];
    const currentType = currentForm.type;
    const currentKey = currentForm.label;

    const currentData =
      currentType === "player"
        ? playersData.player
        : playersData.partners[currentForm.category] || {};

    if (currentType === "player") {
      console.log("🧍 Main Player Data:", currentData);

      const formData = {
        name: currentData["Full Name"] || "",
        TNBAID: currentData["TNBA ID"] || "",
        dob: currentData["Date of Birth"] || "",
        academyName: currentData["Academy Name"] || "",
        place: currentData["Place"] || "",
        district: currentData["District"] || "",
      };

      try {
        const resultAction = await dispatch(updatePlayerForm(formData));

        if (updatePlayerForm.fulfilled.match(resultAction)) {
          const updatedUser = resultAction.payload.data.user;

          // ✅ Parse the stored user correctly
          const storedUser = JSON.parse(localStorage.getItem("user") || "{}");

          // ✅ Merge updated fields
          const newUserData = {
            ...storedUser,
            name: updatedUser.name,
            dob: formatDate(updatedUser.dob),
            TNBAID: updatedUser.TnBaId,
            academy: updatedUser.academyName,
            place: updatedUser.place,
            district: updatedUser.district,
          };

          // ✅ Save the merged user object
          localStorage.setItem("user", JSON.stringify(newUserData));
          toast.success("Player details updated successfully!");
        } else {
          throw new Error(resultAction.payload || "Update failed");
        }
      } catch (err) {
        console.log("Error : ", err);
        toast.error(err.message || "Failed to update player details");
      }
      console.log("🧾 FormData (For Backend):", formData);
    } else {
      // 🧩 Build final payload structure
      const finalPayload = {
        playerId: user.id,
        events: selectedEvents.map((event) => {
          const partnerData = playersData.partners[event.category]; // Match category partner
          let eventObj = {
            category: event.category,
            type: event.type,
          };

          // Only attach partner if available
          if (
            partnerData &&
            (event.type === "doubles" || event.type === "mixed doubles")
          ) {
            eventObj.partner = {
              fullname: partnerData["Full Name"] || "",
              dob: partnerData["Date of Birth"] || "",
              TnBaId: partnerData["TNBA ID"] || "",
              academyName: partnerData["Academy Name"] || "",
              place: partnerData["Place"] || "",
              district: partnerData["District"] || "",
            };
          }

          return eventObj;
        }),
      };

      // 🧾 Debug log
      console.log("🎯 Final Payload for Backend:", finalPayload);

      // console.log(`🤝 Partner Data (${currentKey}):`, currentData);
    }

    // ✅ After last form → show all data together
    if (step2Index === step2Forms.length - 1) {
      console.log("🎯 All Selected Events:", selectedEvents);
      console.log("🧍 Final Main Player Data:", playersData.player);

      console.log("🤝 Final Partner Data:", playersData.partners);
      setStep(3);
    } else {
      setStep2Index(step2Index + 1);
    }
  };

  const goBackStep2Form = () => {
    if (step2Index > 0) {
      setStep2Index(step2Index - 1);
    } else {
      setStep(1);
    }
  };

  const handleStepOneSubmit = async () => {
    if (selectedEvents.length === 0) {
      toast.error("Please select at least one event.");
      return;
    }

    // Clean category names
    const cleanedEvents = selectedEvents.map((event) => ({
      ...event,
      category: event.category.replace(/\s*Boys\s*&\s*Girls\s*/gi, "").trim(),
    }));

    // console.log(`
    // playerId: ${user.id},
    // events: ${JSON.stringify(cleanedEvents)}`);

    const payload = {
      playerId: user.id,
      events: cleanedEvents,
    };

    console.log("Payload : ", payload);

    try {
      const resultAction = await dispatch(addToEvents(payload));

      if (addToEvents.fulfilled.match(resultAction)) {
        const message =
          resultAction.payload?.msg || "Events added successfully!";
        toast.success(message);
        setStep(2);
        setStep2Index(0);
      } else if (addToEvents.rejected.match(resultAction)) {
        const errorMsg =
          resultAction.payload ||
          resultAction.error?.message ||
          "Failed to add events.";
        toast.error(errorMsg);
      }
    } catch (err) {
      console.error("Error dispatching addToEvents:", err);
      toast.error("Something went wrong. Please try again.");
    } finally {
      // Optional: clear redux messages after showing toast
      setTimeout(() => dispatch(clearMessages()), 2000);
    }
  };

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
                // disabled={loading || !selectedEvents.length}
                onClick={handleStepOneSubmit}
                className={`px-8 py-2 font-semibold rounded-lg transition-all duration-200 shadow-md ${
                  !selectedEvents.length || loading
                    ? "bg-gray-600 cursor-not-allowed"
                    : "bg-gradient-to-r from-cyan-500 to-cyan-400 hover:scale-105"
                }`}
              >
                {loading ? "Processing..." : "Next →"}
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
