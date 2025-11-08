// ✅ PaymentStep.jsx
import { useEffect, useMemo, useState } from "react";
import { tournamentData } from "../../constants";
import UploadScreenShot from "./UploadScreenShot";
import { useDispatch } from "react-redux";
import { getPlayerEntries } from "../../redux/Slices/EntriesSlice";

const PaymentStep = ({
  setPlayersData,
  setSelectedEvents,
  selectedEvents,
  player,
  upi,
  upiQrUrl,
  onBack,
  eventsAnalysis = {} // Add default value to prevent destructuring errors
}) => {

  const dispatch = useDispatch();
  const [fetchSelectedEvents, setFetchSelectedEvents] = useState([]);

  // Destructure with safe defaults
  const {
    unpaidSelectedEvents = [],
    unpaidTotalFee = 0,
    unpaidEventsCount = 0,
    paidEventsCount = 0
  } = eventsAnalysis || {};

  // Debug logs
  console.log('PaymentStep received events analysis:', eventsAnalysis);
  console.log('Unpaid events:', unpaidSelectedEvents);
  console.log('Unpaid total fee:', unpaidTotalFee);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await dispatch(getPlayerEntries()).unwrap();
        const events = res?.data?.events || res?.events || [];
        console.log("Fetched events:", events);
        
        setFetchSelectedEvents(events); // Set the fetched events
        setSelectedEvents(events); // Update parent state

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
  }, [dispatch, setSelectedEvents, setPlayersData]);

  // ✅ Calculate total fee for ALL selected events
  const totalFee = useMemo(() => {
    return selectedEvents.reduce((acc, event) => {
      const feeKey = event.type === "singles" ? "singles" : "doubles";
      return acc + tournamentData.entryFees[feeKey];
    }, 0);
  }, [selectedEvents]);

  // ✅ Calculate total fee for fetched events (for comparison)
  const fetchSelectedEventsTotalAmount = useMemo(() => {
    return fetchSelectedEvents.reduce((acc, event) => {
      const feeKey = event.type === "singles" ? "singles" : "doubles";
      return acc + tournamentData.entryFees[feeKey];
    }, 0);
  }, [fetchSelectedEvents]);

  console.log("Selected Events:", selectedEvents);
  console.log("Fetch Amount:", fetchSelectedEventsTotalAmount, "Total Fee:", totalFee);

  // Determine which amount to use for payment
  const paymentAmount = unpaidTotalFee > 0 ? unpaidTotalFee : totalFee;

  return (
    <div className="space-y-8">
      {/* 🧾 Summary Section */}
      <div className="bg-[#0d162a] p-6 rounded-xl border border-cyan-400/20 shadow-md">
        <h3 className="text-xl font-bold text-cyan-300 mb-6 text-center">
          Summary & Payment
        </h3>

        {/* Registration Summary */}
        <div className="mb-8 border border-gray-700 p-4 rounded-lg bg-[#192339] shadow-inner">
          <p className="text-lg font-semibold text-gray-200 border-b border-gray-700 pb-2 mb-3">
            Registration Summary
          </p>
          <ul className="list-disc ml-5 text-gray-300 space-y-2 text-sm">
            {selectedEvents.map((event, index) => {
              const isDoubles =
                event.type.toLowerCase().includes("doubles") ||
                event.type.toLowerCase().includes("mixed");
              const isPaid = event.payment?.status === "Paid";

              return (
                <li 
                  key={index} 
                  className={`${isPaid ? 'text-green-400' : 'text-yellow-300'}`}
                >
                  {event.category} {event.type}
                  {isPaid && <span className="ml-2 text-xs bg-green-600 px-1 rounded">Paid ✓</span>}
                  {isDoubles && (
                    <span className="ml-2 text-gray-400">
                      (Partner:{" "}
                      <span className="text-cyan-300 font-medium">
                        {event.partner?.fullname || "N/A"}
                      </span>
                      )
                    </span>
                  )}
                </li>
              );
            })}
          </ul>

          <p className="mt-4 pt-3 border-t border-gray-700 text-xl font-bold text-yellow-300 flex justify-between">
            <span>Total Entry Fee:</span> <span>₹{totalFee}</span>
          </p>
          <p className="text-sm text-gray-400 mt-2">
            Player: {player.fullName || "N/A"}
          </p>
        </div>

        {/* Payment Status Summary */}
        {unpaidEventsCount > 0 && (
          <div className="mb-4 p-4 bg-blue-900/30 rounded-lg">
            <h3 className="text-lg font-semibold mb-2 text-cyan-300">Payment Summary</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-gray-400">Unpaid Events:</span>
                <span className="ml-2 text-yellow-300 font-semibold">{unpaidEventsCount}</span>
              </div>
              <div>
                <span className="text-gray-400">Paid Events:</span>
                <span className="ml-2 text-green-400 font-semibold">{paidEventsCount}</span>
              </div>
            </div>
            <p className="text-xl font-bold text-yellow-300 mt-3 pt-2 border-t border-gray-600">
              Amount Due: ₹{unpaidTotalFee}
            </p>
          </div>
        )}

        {/* Payment Info */}
        <div className="border border-gray-700 p-4 rounded-lg bg-[#192339] text-center">
          <p className="text-lg font-semibold text-gray-200 border-b border-gray-700 pb-2 mb-3">
            Payment Details
          </p>
          <div className="flex flex-col items-center">
            <p className="text-sm text-gray-400">UPI ID</p>
            <p className="text-lg font-mono text-green-400 mb-4">{upi}</p>
            <img
              src={upiQrUrl}
              alt="UPI QR Code"
              className="w-32 h-32 rounded-lg shadow-lg border border-cyan-400/20"
            />
            
            {/* Dynamic Payment Button */}
            <a
              href={`upi://pay?pa=${upi}&pn=Tournament%20Fees&am=${paymentAmount}&cu=INR`}
              className="mt-4 px-6 py-2 bg-gradient-to-r from-cyan-500 to-cyan-400 hover:scale-105 text-white font-semibold rounded-lg transition-all duration-200 shadow-md"
            >
              {unpaidTotalFee > 0 ? `Pay ₹${unpaidTotalFee} for Unpaid Events` : `Pay ₹${totalFee}`}
            </a>
            
            {unpaidTotalFee > 0 && unpaidTotalFee !== totalFee && (
              <p className="text-xs text-gray-400 mt-2">
                Paying only for {unpaidEventsCount} unpaid event{unpaidEventsCount !== 1 ? 's' : ''}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* ✅ Upload Screenshot Section */}
      <UploadScreenShot
        expectedAmount={paymentAmount} // Pass the dynamic payment amount
        expectedUPI={upi}
        onBack={onBack}
        selectedEvents={selectedEvents}
        unpaidEventsCount={unpaidEventsCount} // Pass additional context
      />
    </div>
  );
};

export default PaymentStep;