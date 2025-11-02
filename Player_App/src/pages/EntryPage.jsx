import { ArrowLeft } from "lucide-react";
import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import Stepper from "../components/Steppers/Stepper";
import StepOneEventSelection from "../components/Steppers/StepOneEventSelection";
import PlayerForm from "../components/PlayerForm";
import PaymentStep from "../components/Steppers/PaymentStep";
import { mockUser, tournamentData } from "../constants";

import { useNavigate } from "react-router-dom";
import { addPartnerToEvent, addToEvents, getPlayerEntries } from "../redux/Slices/EntriesSlice";
import { useDispatch } from "react-redux";
import { getUser } from "../utils/authHelpers";
import { updatePlayerForm } from "../redux/Slices/PlayerSlice";
const EntryPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [selectedEvents, setSelectedEvents] = useState([]);
  const [step2Index, setStep2Index] = useState(0);
  const user = getUser();

  // Main state holding player and partner data
  const [playersData, setPlayersData] = useState({
    player: {
      fullName: user?.name || "",
      tnbaId: user?.TNBAID || "",
      dob: user?.dob || "",
      academyName: user?.academyName || "",
      place: user?.place || "",
      district: user?.district || "",
    },

    // Partners now keyed by a unique combination of category and event type
    partners: {}, // Keyed by: 'Category|EventType' (e.g., 'Under 15 Boys & Girls|Doubles')
  });

useEffect(() => {
  const fetchEvents = async () => {
    try {
      const res = await dispatch(getPlayerEntries()).unwrap();
      const events = res?.data?.events || res?.events || [];

      setSelectedEvents(events);

      // 🧠 Extract partner data from fetched events
      const partnersMap = {};
      events.forEach((ev) => {
        if (ev.partner) {
          const key = `${ev.category}|${ev.type}`;
          partnersMap[key] = {
            fullName: ev.partner.fullname || "",
            tnbaId: ev.partner.TnBaId || "",
            dob: ev.partner.dob || "",
            academyName: ev.partner.academyName || "",
            place: ev.partner.place || "",
            district: ev.partner.district || "",
          };
        }
      });

      // 👫 Initialize partners in playersData
      setPlayersData((prev) => ({
        ...prev,
        partners: partnersMap,
      }));

      console.log("✅ Initialized partnersData:", partnersMap);
    } catch (error) {
      console.error("❌ Error fetching player entries:", error);
    }
  };

  fetchEvents();
}, [dispatch]);

  // --- Step 2 Logic Configuration ---

  const doublesEvents = useMemo(
    () =>
      selectedEvents.filter(
        (ev) => ev.type === "doubles" || ev.type === "mixed doubles"
      ),
    [selectedEvents]
  );

  const step2Forms = useMemo(() => {
    // 1. Main Player Form
    let forms = [{ key: "player", label: "Your Details", type: "player" }];

    // 2. Partner Forms - Generate a unique form entry for each selected doubles event
    forms = forms.concat(
      doublesEvents.map((ev) => {
        // Create a unique key for the partner data state
        const partnerKey = `${ev.category}|${ev.type}`;

        // Clean up the label for display
        const categoryLabel = ev.category.replace("Boys & Girls", "").trim();
        const eventLabel = ev.type.replace(/\s/g, ""); // Doubles, MixedDoubles

        return {
          key: partnerKey,
          label: `${categoryLabel} Partner Details (${ev.type})`,
          category: ev.category,
          type: "partner",
          eventType: ev.type, // Store event type for clarity
        };
      })
    );

    // Add isLast flag for proper navigation title in PlayerForm
    if (forms.length > 0) {
      forms[forms.length - 1].isLast = true;
    }

    return forms;
  }, [doublesEvents]);

  // 🧩 Determine current form data and definition
  const currentFormDef = step2Forms[step2Index];

  const currentFormData = useMemo(() => {
    if (!currentFormDef) return {};

    if (currentFormDef.type === "player") {
      // Return the main player data
      return playersData.player;
    } else if (currentFormDef.type === "partner") {
      // Return the specific partner data based on the unique key
      return playersData.partners[currentFormDef.key] || {};
    }
    return {};
  }, [currentFormDef, playersData]);

  // --- State Update Handlers ---

const onFormChange = useCallback(
  (key, value) => {
    if (!currentFormDef) return;

    if (currentFormDef.type === "player") {
      // 🧍 Update main player details
      setPlayersData((prev) => ({
        ...prev,
        player: { ...prev.player, [key]: value },
      }));
    } else if (currentFormDef.type === "partner") {
      const partnerKey = currentFormDef.key;

      // 👫 Update partner details in playersData
      setPlayersData((prev) => ({
        ...prev,
        partners: {
          ...prev.partners,
          [partnerKey]: {
            ...(prev.partners[partnerKey] || {}),
            [key]: value,
          },
        },
      }));

      // 🆕 Also update partner info inside selectedEvents
      setSelectedEvents((prev) =>
        prev.map((event) => {
          const eventKey = `${event.category}|${event.type}`;
          if (eventKey === partnerKey) {
            return {
              ...event,
              partner: {
                ...(event.partner || {}),
                [key]: value,
              },
            };
          }
          return event;
        })
      );
    }
  },
  [currentFormDef]
);

  // --- Navigation Handlers ---

  const handleStepOneSubmit = async () => {
    if (selectedEvents.length === 0) {
      toast.error("Please select at least one event.");
      return;
    }
    console.log("");
    
    const payload = {
      events: selectedEvents,
    };

    console.log("EVENTS PAYLOAD GENERATED:", payload);
    try {
      setLoading(true);
      const result = await dispatch(addToEvents(payload)).unwrap();
      console.log("AddToEvents Res : ",result);
      
      toast.success(result.msg || "Events added successfully!");
      setStep(2);
      setStep2Index(0);
    } catch (err) {
      toast.error(err || "Failed to add events");
    } finally {
      setLoading(false);
    }
  };

  const goNextStep2Form = async () => {
    // Note: Validation is inside PlayerForm component, this runs on successful form submit
    console.log("STEP 2 PAYLOAD GENERATED:", playersData.player);
    // reStructure player data
    const { fullName, tnbaId, dob, academyName, place, district } =
      playersData.player;

    const playerPayload = {
      name: fullName,
      TnBaId: tnbaId,
      dob,
      academyName,
      place,
      district,
    };
    // condition based CurrentFromDef==="player"
    if (currentFormDef.type === "player") {
      console.log("Player Payload : ",playerPayload);
      
      try {
        setLoading(true);
        const resultAction = await dispatch(updatePlayerForm(playerPayload));

        if (updatePlayerForm.fulfilled.match(resultAction)) {
          const updatedUser = resultAction.payload.data.user;

          // ✅ Update localStorage
          const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
          const newUserData = {
            ...storedUser,
            name: updatedUser.name,
            dob: updatedUser.dob,
            TNBAID: updatedUser.TnBaId,
            academyName: updatedUser.academyName,
            place: updatedUser.place,
            district: updatedUser.district,
          };

          localStorage.setItem("user", JSON.stringify(newUserData));

          toast.success("Your player details were saved successfully!");
          console.log("✅ Player updated:", updatedUser);
        } else {
          throw new Error(resultAction.payload || "Player update failed");
        }
      } catch (error) {
        console.error("❌ Player update error:", error);
        toast.error(error.message || "Failed to update player details");
      } finally {
        setLoading(false);
      }
    } else if (currentFormDef.type === "partner") {
       const partnerKey = currentFormDef.key;
      const partnerData = playersData.partners[partnerKey];

      const { category, eventType } = currentFormDef;

      const payload = {
        category,
        type: eventType,
        partner: {
          fullname: partnerData.fullName,
          TnBaId: partnerData.tnbaId,
          dob: partnerData.dob,
          academyName: partnerData.academyName,
          place: partnerData.place,
          district: partnerData.district,
        },
      };
      console.log("Payload Partner : ",payload);
      
      try {
        setLoading(true);
        const res = await dispatch(addPartnerToEvent(payload)).unwrap();
        console.log("res add partner : ",res);
        
        toast.success(res.msg || `${category} ${eventType} partner added!`);
      } catch (error) {
        toast.error(error || "Failed to add partner");
      } finally {
        setLoading(false);
      }
    }

    // use the diapatch updatePlayerForm
    console.log("FORMATTED PLAYER PAYLOAD:", playerPayload);

    if (step2Index === step2Forms.length - 1) {
      console.log("FINAL PAYLOAD GENERATED:", {
        player: playersData.player,
        partners: playersData.partners, // Contains separate partner data
        events: selectedEvents,
      });
      setStep(3);
    } else {
      setStep2Index(step2Index + 1);
    }
  };

  const goBackStep2Form = () => {
    if (step2Index > 0) {
      setStep2Index(step2Index - 1);
    } else {
      setStep(1); // Back to Step 1
    }
  };

  const handlePaymentBack = () => {
    setStep(2);
    setStep2Index(step2Forms.length - 1); // Go back to the last partner form
  };

  const handleEntrySubmit = () => {
    setLoading(true);
    // Mock Final Submission
    setTimeout(() => {
      setLoading(false);
      console.log("Submit PAYLOAD GENERATED:", {
        player: playersData.player,
        partners: playersData.partners, // Contains separate partner data
        events: selectedEvents,
      });
      toast.success("Entry successfully submitted!");
      navigate("/dashboard");
      // Reset state or navigate away in a real app
      // setStep(1);
      // setSelectedEvents([]);
    }, 1500);
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#0a192f] to-[#0f223f] text-white flex flex-col items-center py-8 px-4 sm:px-6 md:px-10 font-[Inter] transition-all duration-300">
      {/* Header (Mock navigation back to dashboard) */}
      <div className="w-full max-w-6xl bg-[#192339]/80 border border-cyan-400/10 rounded-2xl shadow-xl p-6 sm:p-8 backdrop-blur-md mb-10 flex flex-col sm:flex-row items-center justify-start gap-4">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* Mocked navigation back button */}
          <button
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-2 px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition-all text-sm sm:text-base"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="font-medium">Back</span>
          </button>
          <h2 className="text-xl md:text-3xl font-bold text-cyan-300 tracking-wide">
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

      {/* Step Content Card */}
      <div className="w-full max-w-4xl bg-[#192339]/80 border border-cyan-400/10 rounded-2xl shadow-xl p-6 sm:p-8 backdrop-blur-md min-h-[500px]">
        {/* Step 1: Event Selection */}
        {step === 1 && (
          <StepOneEventSelection
            categories={tournamentData.categories}
            selectedEvents={selectedEvents}
            setSelectedEvents={setSelectedEvents}
            entryFees={tournamentData.entryFees}
            onNext={handleStepOneSubmit}
            loading={loading}
          />
        )}

        {/* Step 2: Player/Partner Details */}
        {step === 2 && currentFormDef && (
          <PlayerForm
            currentForm={currentFormDef}
            form={currentFormData}
            onFormChange={onFormChange}
            onNext={goNextStep2Form}
            onBack={goBackStep2Form}
          />
        )}

        {/* Step 3: Summary & Payment */}
        {step === 3 && (
          <PaymentStep
            
            selectedEvents={selectedEvents}
            player={playersData.player}
            partners={playersData.partners}
            upi={tournamentData.upi}
            upiQrUrl={tournamentData.upiQrUrl}
            onBack={handlePaymentBack}
            onSubmit={handleEntrySubmit}
          />
        )}
      </div>

      {/* Mock Toast/Message Area
      {loading && (
        <div className="fixed bottom-4 right-4 bg-cyan-600 text-white p-3 rounded-lg shadow-2xl font-semibold">
          {step === 1 ? "Processing events..." : "Submitting Entry..."}
        </div>
      )} */}
    </div>
  );
};

export default EntryPage;
