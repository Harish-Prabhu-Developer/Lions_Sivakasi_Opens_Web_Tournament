// EntryPage.jsx
import { ArrowLeft } from "lucide-react";
import { useEffect, useState, useCallback } from "react";
import { toast } from "react-hot-toast";
import { Loader2 } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import PlayerForm from "../components/Academy/Player/PlayerForm";
import PaymentStep from "../components/Academy/Player/PaymentStep";

const EntryPage = () => {
  const navigate = useNavigate();
  const { id: playerId } = useParams();
  const [loading, setLoading] = useState(false);
  const [currentPlayer, setCurrentPlayer] = useState(null);
  const [step, setStep] = useState(1); // Step 1: Event Selection, Step 2: Partner Forms, Step 3: Payment
  const [currentPartnerFormIndex, setCurrentPartnerFormIndex] = useState(0);

  // Tournament configuration
  const tournamentData = {
    entryFees: { singles: 900, doubles: 1300 },
    categories: [
      { name: "Under 09", afterBorn: 2017, events: ["singles"] },
      { name: "Under 11", afterBorn: 2015, events: ["singles"] },
      { name: "Under 13", afterBorn: 2013, events: ["singles", "doubles"] },
      {
        name: "Under 15",
        afterBorn: 2011,
        events: ["singles", "doubles", "mixed doubles"],
      },
      { name: "Under 17", afterBorn: 2009, events: ["singles", "doubles"] },
      {
        name: "Under 19",
        afterBorn: 2007,
        events: ["singles", "doubles", "mixed doubles"],
      },
    ],
    upi: "9360933755@iob",
    upiName: "TNBA Tournament",
    upiQrUrl: "https://via.placeholder.com/150?text=UPI+QR" // Replace with actual QR URL
  };

  // Event limits
  const SINGLES_DOUBLES_LIMIT = 3;
  const MIXED_DOUBLES_LIMIT = 1;
  const TOTAL_EVENTS_LIMIT = 4;

  // State variables to store data for future use
  const [selectedEvents, setSelectedEvents] = useState([]);
  const [partnerForms, setPartnerForms] = useState({});
  const [currentFormData, setCurrentFormData] = useState({});
  const [playersData, setPlayersData] = useState({
    player: null,
    partners: {}
  });

  // Load player data from localStorage based on playerId
  useEffect(() => {
    if (playerId) {
      const savedPlayers = localStorage.getItem('academyPlayers');
      if (savedPlayers) {
        const playersData = JSON.parse(savedPlayers);
        const player = playersData.find(p => p.id === playerId);
        if (player) {
          setCurrentPlayer(player);
          setPlayersData(prev => ({ ...prev, player }));
        } else {
          toast.error("Player not found");
          navigate("/dashboard");
        }
      } else {
        toast.error("No players data found");
        navigate("/dashboard");
      }
    }
  }, [playerId, navigate]);

  // Get doubles events that require partner details
  const getDoublesEvents = useCallback(() => {
    return selectedEvents.filter(
      (ev) => ev.type === "doubles" || ev.type === "mixed doubles"
    );
  }, [selectedEvents]);

  // Generate partner forms configuration
  const partnerFormsConfig = getDoublesEvents().map((ev, index) => {
    const categoryLabel = ev.category.replace("Boys & Girls", "").trim();
    // Find the category to get afterBorn requirement
    const category = tournamentData.categories.find(cat => cat.name === ev.category);
    return {
      key: `${ev.category}|${ev.type}|${index}`,
      label: `${categoryLabel} Partner Details (${ev.type})`,
      type: "partner",
      category: ev.category,
      eventType: ev.type,
      afterBorn: category?.afterBorn || 0,
      isLast: index === getDoublesEvents().length - 1
    };
  });

  // FIXED: Update current form data when partner form index changes
  useEffect(() => {
    if (step === 2 && partnerFormsConfig.length > 0) {
      const currentForm = partnerFormsConfig[currentPartnerFormIndex];
      const currentPartnerData = partnerForms[currentForm.key] || {};
      
      // Only update if the data has actually changed
      if (JSON.stringify(currentFormData) !== JSON.stringify(currentPartnerData)) {
        setCurrentFormData(currentPartnerData);
      }
    }
  }, [currentPartnerFormIndex, step, partnerFormsConfig]); // Removed partnerForms from dependencies

  // Filter categories based on player's DOB
  const getFilteredCategories = () => {
    if (!currentPlayer || !currentPlayer.dob) return tournamentData.categories;

    const userDob = new Date(currentPlayer.dob);
    const userBirthYear = userDob.getFullYear();

    return tournamentData.categories.filter((category) => {
      return userBirthYear >= category.afterBorn;
    });
  };

  const filteredCategories = getFilteredCategories();

  // Validate partner DOB based on event category (SAME RULES AS PLAYER)
  const validatePartnerDOB = (partnerDOB, eventCategory) => {
    if (!partnerDOB) return { isValid: false, message: "Partner DOB is required" };

    const partnerBirthYear = new Date(partnerDOB).getFullYear();
    const category = tournamentData.categories.find(cat => cat.name === eventCategory);
    
    if (!category) {
      return { isValid: false, message: "Invalid event category" };
    }

    // PARTNER MUST MEET THE SAME ELIGIBILITY AS PLAYER
    // Partner birth year must be >= category.afterBorn (same rule as player)
    const isEligible = partnerBirthYear >= category.afterBorn;
    
    if (!isEligible) {
      const maxAge = new Date().getFullYear() - category.afterBorn;
      return { 
        isValid: false, 
        message: `Partner must be born in ${category.afterBorn} or later (under ${maxAge} years old)` 
      };
    }

    return { 
      isValid: true, 
      message: `Partner is eligible for ${eventCategory.replace("Boys & Girls", "").trim()} category` 
    };
  };

  // Get current partner form configuration
  const getCurrentPartnerFormConfig = () => {
    if (step === 2 && partnerFormsConfig.length > 0) {
      return partnerFormsConfig[currentPartnerFormIndex];
    }
    return null;
  };

  // Calculate player's age for a specific category
  const getPlayerAgeForCategory = (category) => {
    if (!currentPlayer || !currentPlayer.dob) return 0;
    const userBirthYear = new Date(currentPlayer.dob).getFullYear();
    return category.afterBorn - userBirthYear;
  };

  // Calculate partner's age for a specific category
  const getPartnerAgeForCategory = (partnerDOB, category) => {
    if (!partnerDOB) return 0;
    const partnerBirthYear = new Date(partnerDOB).getFullYear();
    return category.afterBorn - partnerBirthYear;
  };

  // Event counts
  const singlesDoublesCount = selectedEvents.filter(
    (e) => e.type !== "mixed doubles"
  ).length;
  const mixedDoublesCount = selectedEvents.filter(
    (e) => e.type === "mixed doubles"
  ).length;
  const totalCount = selectedEvents.length;

  // Calculate total fee
  const calculateTotalFee = () => {
    return selectedEvents.reduce((acc, event) => {
      const feeKey = event.type === "singles" ? "singles" : "doubles";
      return acc + tournamentData.entryFees[feeKey];
    }, 0);
  };

  const totalFee = calculateTotalFee();

  const isEventSelected = (categoryName, type) =>
    selectedEvents.some((e) => e.category === categoryName && e.type === type);

  const canSelectEvent = (type) => {
    if (totalCount >= TOTAL_EVENTS_LIMIT) return false;

    if (type === "mixed doubles") {
      return mixedDoublesCount < MIXED_DOUBLES_LIMIT;
    } else {
      return singlesDoublesCount < SINGLES_DOUBLES_LIMIT;
    }
  };

  const handleToggleEvent = (categoryName, type) => {
    const newEvent = { category: categoryName, type: type };
    const isCurrentlySelected = isEventSelected(categoryName, type);

    if (isCurrentlySelected) {
      setSelectedEvents((prev) =>
        prev.filter((e) => !(e.category === categoryName && e.type === type))
      );
    } else {
      if (canSelectEvent(type)) {
        setSelectedEvents((prev) => [...prev, newEvent]);
      } else {
        let message = `Cannot select more than ${TOTAL_EVENTS_LIMIT} total events.`;
        if (
          type === "mixed doubles" &&
          mixedDoublesCount >= MIXED_DOUBLES_LIMIT
        ) {
          message = `Maximum ${MIXED_DOUBLES_LIMIT} Mixed Doubles event allowed.`;
        } else if (singlesDoublesCount >= SINGLES_DOUBLES_LIMIT) {
          message = `Maximum ${SINGLES_DOUBLES_LIMIT} Singles/Doubles events allowed.`;
        }
        toast.error(message);
      }
    }
  };

  const handleNext = () => {
    if (selectedEvents.length === 0) {
      toast.error("Please select at least one event.");
      return;
    }

    // If there are doubles events, move to partner forms
    const doublesEvents = getDoublesEvents();
    if (doublesEvents.length > 0) {
      setStep(2);
    } else {
      // No doubles events, proceed to payment
      setStep(3);
    }
  };

  const handlePartnerFormChange = (key, value) => {
    const currentForm = partnerFormsConfig[currentPartnerFormIndex];
    
    // If DOB is being updated, validate it
    if (key === "dob" && value) {
      const validation = validatePartnerDOB(value, currentForm.category);
      if (!validation.isValid) {
        // toast.error(validation.message);
      }
    }

    // Update partner forms and current form data simultaneously
    const updatedPartnerForms = {
      ...partnerForms,
      [currentForm.key]: {
        ...partnerForms[currentForm.key],
        [key]: value
      }
    };

    setPartnerForms(updatedPartnerForms);
    setCurrentFormData(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handlePartnerFormNext = () => {
    const currentForm = partnerFormsConfig[currentPartnerFormIndex];
    const currentPartnerData = partnerForms[currentForm.key] || {};
    
    // Validate all required fields
    const requiredFields = ['fullName', 'dob', 'academy', 'place', 'district'];
    const hasAllFields = requiredFields.every(field => 
      currentPartnerData[field]?.trim() !== ""
    );

    if (!hasAllFields) {
      toast.error(`Please fill in all required details for ${currentForm.label}`);
      return;
    }

    // Validate partner DOB specifically
    const dobValidation = validatePartnerDOB(currentPartnerData.dob, currentForm.category);
    if (!dobValidation.isValid) {
      toast.error(dobValidation.message);
      return;
    }

    if (currentPartnerFormIndex < partnerFormsConfig.length - 1) {
      // Move to next partner form
      setCurrentPartnerFormIndex(prev => prev + 1);
    } else {
      // All partner forms completed, proceed to payment
      setStep(3);
    }
  };

  const handlePartnerFormBack = () => {
    if (currentPartnerFormIndex > 0) {
      setCurrentPartnerFormIndex(prev => prev - 1);
    } else {
      // Back to event selection
      setStep(1);
    }
  };

  // Handle payment step back navigation
  const handlePaymentBack = () => {
    const doublesEvents = getDoublesEvents();
    if (doublesEvents.length > 0) {
      setStep(2);
      setCurrentPartnerFormIndex(doublesEvents.length - 1);
    } else {
      setStep(1);
    }
  };

  // Handle final submission after payment
  const handleFinalSubmit = async (paymentData) => {
    try {
      setLoading(true);
      
      // Prepare final data
      const finalEntryData = {
        playerId,
        player: currentPlayer,
        selectedEvents,
        partners: partnerForms,
        totalFee,
        paymentScreenshot: paymentData?.paymentProof,
        upiId: tournamentData.upi,
        submittedAt: new Date().toISOString(),
        paymentVerified: false,
        status: 'pending',
        extractedData: paymentData?.extractedData
      };

      // Store the entry data in localStorage
      const existingEntries = JSON.parse(localStorage.getItem('tournamentEntries') || '[]');
      const newEntry = {
        ...finalEntryData,
        entryId: `entry_${Date.now()}`,
      };
      
      existingEntries.push(newEntry);
      localStorage.setItem('tournamentEntries', JSON.stringify(existingEntries));

      // Also update player's entries
      const savedPlayers = JSON.parse(localStorage.getItem('academyPlayers') || '[]');
      const updatedPlayers = savedPlayers.map(player => {
        if (player.id === playerId) {
          const playerEntries = player.entries || [];
          return {
            ...player,
            entries: [...playerEntries, {
              entryId: newEntry.entryId,
              events: selectedEvents,
              partners: partnerForms,
              totalFee,
              submittedAt: newEntry.submittedAt,
              status: 'pending',
              paymentScreenshot: paymentData?.paymentProof
            }]
          };
        }
        return player;
      });
      
      localStorage.setItem('academyPlayers', JSON.stringify(updatedPlayers));

      console.log("Final Entry Data stored:", finalEntryData);
      
      toast.success("Tournament entry submitted successfully! Awaiting verification.");
      
      // Navigate back to player details after delay
      setTimeout(() => {
        navigate(`/player/${playerId}`);
      }, 3000);
      
    } catch (err) {
      console.error("Submission error:", err);
      toast.error("Failed to submit entry");
    } finally {
      setLoading(false);
    }
  };

  const RuleTag = ({ label, count, limit }) => (
    <div
      className={`px-3 py-1 text-sm rounded-full font-medium ${
        count > limit ? "bg-red-600 text-white" : "bg-cyan-600 text-white"
      }`}
    >
      {label}: {count}/{limit}
    </div>
  );

  // SelectedEventCard component
  const SelectedEventCard = () => {
    if (selectedEvents.length === 0) {
      return (
        <div className="text-center py-4 text-gray-400">
          No events selected yet
        </div>
      );
    }

    return (
      <div className="bg-[#0d162a] p-4 rounded-xl border border-cyan-400/20 mb-6">
        <h3 className="text-cyan-300 font-semibold mb-3">Selected Events:</h3>
        <div className="space-y-2">
          {selectedEvents.map((e, idx) => {
            const category = tournamentData.categories.find(cat => cat.name === e.category);
            return (
              <div key={idx} className="flex items-center justify-between bg-[#0f1d38] p-3 rounded-lg">
                <div>
                  <span className="text-cyan-50">
                    {e.category.replace("Boys & Girls", "").trim()}
                  </span>
                  <span className="text-cyan-400 text-xs ml-2">
                    ({e.type})
                  </span>
                  <div className="text-xs text-gray-400 mt-1">
                    Born after: {category?.afterBorn}
                  </div>
                </div>
                <span className="text-yellow-300 text-sm font-semibold">
                  ₹{e.type === "singles" ? tournamentData.entryFees.singles : tournamentData.entryFees.doubles}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // PartnerDetailsCard component to show stored partner details
  const PartnerDetailsCard = () => {
    const doublesEvents = getDoublesEvents();
    
    if (doublesEvents.length === 0 || Object.keys(partnerForms).length === 0) {
      return null;
    }

    return (
      <div className="bg-[#0d162a] p-4 rounded-xl border border-green-400/20 mb-6">
        <h3 className="text-green-300 font-semibold mb-3">Partner Details:</h3>
        <div className="space-y-3">
          {Object.entries(partnerForms).map(([key, partnerData], index) => {
            const [category, eventType] = key.split('|');
            const categoryData = tournamentData.categories.find(cat => cat.name === category);
            const validation = validatePartnerDOB(partnerData.dob, category);
            const partnerAge = getPartnerAgeForCategory(partnerData.dob, categoryData);
            
            return (
              <div key={key} className="bg-[#0f1d38] p-3 rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <span className="text-green-50 font-semibold">
                      {category.replace("Boys & Girls", "").trim()} - {eventType}
                    </span>
                    <div className="text-xs text-gray-400 mt-1">
                      Must be born after: {categoryData?.afterBorn}
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded ${
                    validation.isValid 
                      ? "bg-green-800/30 text-green-400" 
                      : "bg-red-800/30 text-red-400"
                  }`}>
                    {validation.isValid ? "Eligible ✓" : "Not Eligible ✗"}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-gray-400">Name:</span>
                    <span className="text-white ml-2">{partnerData.fullName || "Not provided"}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">DOB:</span>
                    <span className="text-white ml-2">{partnerData.dob || "Not provided"}</span>
                    {partnerData.dob && (
                      <div className={`text-xs mt-1 ${
                        validation.isValid ? "text-green-400" : "text-red-400"
                      }`}>
                        {validation.isValid 
                          ? `Age: ${partnerAge} years (Eligible)` 
                          : validation.message
                        }
                      </div>
                    )}
                  </div>
                  <div>
                    <span className="text-gray-400">Academy:</span>
                    <span className="text-white ml-2">{partnerData.academy || "Not provided"}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Place:</span>
                    <span className="text-white ml-2">{partnerData.place || "Not provided"}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Show message if no categories are available
  if (filteredCategories.length === 0 && currentPlayer && step === 1) {
    return (
      <div className="min-h-screen w-full bg-linear-to-br from-[#0a192f] to-[#0f223f] text-white flex flex-col items-center py-8 px-4">
        <div className="w-full max-w-4xl">
          <div className="flex items-center gap-3 mb-8">
            <button
              onClick={() => navigate(`/player/${playerId}`)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
            <h2 className="text-2xl font-bold text-cyan-300">
              Tournament Entry - {currentPlayer.fullName}
            </h2>
          </div>

          <div className="text-center py-8 bg-[#192339]/80 rounded-2xl p-8">
            <div className="text-red-400 text-lg font-semibold mb-4">
              No eligible categories found for your age
            </div>
            <div className="text-gray-400">
              <p>Player date of birth: {currentPlayer.dob}</p>
              <p className="mt-2">Please contact tournament organizers for eligibility information.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!currentPlayer) {
    return (
      <div className="min-h-screen w-full bg-linear-to-br from-[#0a192f] to-[#0f223f] text-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-cyan-400 animate-spin mx-auto mb-4" />
          <p className="text-cyan-200">Loading player data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-linear-to-br from-[#0a192f] to-[#0f223f] text-white flex flex-col items-center py-8 px-4 sm:px-6 md:px-10">
      {/* Header */}
      <div className="w-full max-w-6xl mb-10">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(`/player/${playerId}`)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Player</span>
          </button>
          <h2 className="text-2xl md:text-3xl font-bold text-cyan-300">
            Tournament Entry - {currentPlayer.fullName}
          </h2>
        </div>
      </div>

      {/* Main Content */}
      <div className="w-full max-w-4xl">
        {/* Player Info Banner */}
        <div className="mb-6 p-4 bg-blue-900/30 border border-blue-500/30 rounded-lg">
          <div className="text-sm text-blue-300">
            <span className="font-semibold">Player:</span> {currentPlayer.fullName} |
            <span className="font-semibold"> DOB:</span> {currentPlayer.dob} |
            <span className="font-semibold"> Academy:</span> {currentPlayer.academy}
          </div>
        </div>

        {/* Step 1: Event Selection */}
        {step === 1 && (
          <>
            {/* Selected Events Card */}
            <SelectedEventCard />

            {/* Event Limits & Pricing */}
            <div className="flex flex-wrap justify-between items-center mb-8 gap-4 p-4 bg-[#0d162a] rounded-xl border border-cyan-400/20">
              <RuleTag
                label="Total Events"
                count={totalCount}
                limit={TOTAL_EVENTS_LIMIT}
              />
              <RuleTag
                label="Singles/Doubles"
                count={singlesDoublesCount}
                limit={SINGLES_DOUBLES_LIMIT}
              />
              <RuleTag
                label="Mixed Doubles"
                count={mixedDoublesCount}
                limit={MIXED_DOUBLES_LIMIT}
              />
              <div className="text-lg font-bold text-yellow-300">
                Total Price: ₹{totalFee}
              </div>
            </div>

            {/* Event Selection Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {filteredCategories.map((category) => {
                const userAge = getPlayerAgeForCategory(category);

                return (
                  <div
                    key={category.name}
                    className="bg-[#0f1d38] p-5 rounded-xl border border-gray-700 shadow-lg hover:shadow-cyan-500/30 transition-shadow duration-300"
                  >
                    <h3 className="text-lg font-bold text-cyan-300 mb-1">
                      {category.name.replace("Boys & Girls", "").trim()}
                    </h3>
                    <p className="text-sm text-gray-400 mb-1">
                      Born after: {category.afterBorn}
                    </p>
                    <p className="text-xs text-green-400 mb-3">
                      Player age: {userAge} years (Eligible ✓)
                    </p>
                    <p className="text-xs text-yellow-400 mb-3">
                      Partner must be born in {category.afterBorn} or later
                    </p>

                    <div className="flex flex-col gap-2">
                      {category.events.map((type) => {
                        const isSelected = isEventSelected(category.name, type);
                        const canBeSelected = canSelectEvent(type) || isSelected;

                        return (
                          <button
                            key={type}
                            onClick={() => handleToggleEvent(category.name, type)}
                            disabled={!canBeSelected && !isSelected}
                            className={`
                              w-full capitalize py-2 rounded-lg font-semibold transition-all duration-200
                              ${
                                isSelected
                                  ? "bg-cyan-500 hover:bg-cyan-600 text-white shadow-lg shadow-cyan-500/50 transform scale-[1.02]"
                                  : canBeSelected
                                  ? "bg-gray-700 hover:bg-gray-600 text-gray-200"
                                  : "bg-gray-800 text-gray-500 cursor-not-allowed opacity-60"
                              }
                            `}
                          >
                            {type}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Next Button */}
            <div className="flex justify-end">
              <button
                disabled={selectedEvents.length === 0 || loading}
                onClick={handleNext}
                className={`px-8 py-3 font-semibold rounded-lg transition-all duration-200 shadow-md flex items-center justify-center gap-2 ${
                  selectedEvents.length === 0 || loading
                    ? "bg-gray-600 cursor-not-allowed"
                    : "bg-linear-to-r from-cyan-500 to-cyan-400 hover:scale-105"
                }`}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Next →"
                )}
              </button>
            </div>
          </>
        )}

        {/* Step 2: Partner Forms */}
        {step === 2 && partnerFormsConfig.length > 0 && (
          <>
            {/* Show eligibility information for current partner form */}
            <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4 mb-6">
              <div className="text-yellow-300 text-sm">
                <strong>Eligibility Requirement:</strong> Partner must be born in{" "}
                <strong>{getCurrentPartnerFormConfig()?.afterBorn} or later</strong> to be eligible for{" "}
                <strong>{getCurrentPartnerFormConfig()?.category.replace("Boys & Girls", "").trim()}</strong> category
                <br />
                <span className="text-yellow-200">
                  <strong>Same rule as player:</strong> Born after {getCurrentPartnerFormConfig()?.afterBorn}
                </span>
              </div>
            </div>

            {/* Show stored selected events and partner details */}
            <SelectedEventCard />
            <PartnerDetailsCard />
            
            {/* Current Partner Form */}
            <PlayerForm
              currentForm={partnerFormsConfig[currentPartnerFormIndex]}
              form={currentFormData}
              onFormChange={handlePartnerFormChange}
              onNext={handlePartnerFormNext}
              onBack={handlePartnerFormBack}
            />
          </>
        )}

        {/* Step 3: Payment */}
        {step === 3 && (
          <PaymentStep
            setPlayersData={setPlayersData}
            setSelectedEvents={setSelectedEvents}
            selectedEvents={selectedEvents}
            player={currentPlayer}
            upi={tournamentData.upi}
            upiQrUrl={tournamentData.upiQrUrl}
            onBack={handlePaymentBack}
            onSubmitSuccess={handleFinalSubmit}
            eventsAnalysis={{
              unpaidSelectedEvents: selectedEvents, // All events are unpaid initially
              unpaidTotalFee: totalFee,
              unpaidEventsCount: selectedEvents.length,
              paidEventsCount: 0
            }}
          />
        )}
      </div>
    </div>
  );
};

export default EntryPage;