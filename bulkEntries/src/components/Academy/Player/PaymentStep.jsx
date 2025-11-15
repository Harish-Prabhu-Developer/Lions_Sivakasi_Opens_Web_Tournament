// ✅ PaymentStep.jsx
import { useEffect, useMemo, useState } from "react";
import { tournamentData } from "../../../constants";
import UploadScreenShot from "./UploadScreenShot";
import { useDispatch } from "react-redux";
import { getAcademyPlayerEntries } from "../../../redux/Slices/EntriesSlice";
import { CheckCircle2 } from "lucide-react";

const PaymentStep = ({
  setPlayersData,
  setSelectedEvents,
  selectedEvents,
  player,
  upi,
  upiQrUrl,
  onBack,
  onSubmitSuccess,
  eventsAnalysis = {}
}) => {
  const [EntryIds, setEntryIds] = useState('');
  const [allEntries, setAllEntries] = useState([]);
  const dispatch = useDispatch();
  
  useEffect(() => {
    const fetchingPlayer = async () => {
      console.log("Player : ", player);
      const response = await dispatch(getAcademyPlayerEntries(player.id));
      console.log("Res : ", response);
      
      if (response.payload.success) {
        console.log("Entries data:", response.payload.data);
        
        // Set entry ID
        setEntryIds(response.payload.data.entries[0]?._id || "");
        
        // Set all entries for payment analysis
        setAllEntries(response.payload.data.entries || []);
        
        // Set selected events
        const eventsFromAPI = response.payload.data.events || [];
        setSelectedEvents(eventsFromAPI);
        
        console.log("All entries:", response.payload.data.entries);
        console.log("Events from API:", eventsFromAPI);
      }
    };
    fetchingPlayer();
  }, [dispatch, player.id, setSelectedEvents]);

  // ✅ Calculate payment status from events (not from entries)
const paymentAnalysis = useMemo(() => {
  if (!selectedEvents || selectedEvents.length === 0) {
    return {
      paidEvents: [],
      unpaidEvents: [],
      paidEventsCount: 0,
      unpaidEventsCount: 0,
      paidAmount: 0,
      unpaidAmount: 0,
      totalFee: 0,
      amountDue: 0,
      // ✅ NEW: Group events by payment status
      eventsByPayment: {}
    };
  }

  const paidEvents = selectedEvents.filter(event => 
    event.payment && (event.payment.status === "Paid" || event.payment.status === "verified")
  );
  
  const unpaidEvents = selectedEvents.filter(event => 
    !event.payment || (event.payment.status !== "Paid" && event.payment.status !== "verified")
  );

  // Calculate amounts
  const paidAmount = paidEvents.reduce((acc, event) => {
    const feeKey = event.type === "singles" ? "singles" : "doubles";
    return acc + tournamentData.entryFees[feeKey];
  }, 0);

  const unpaidAmount = unpaidEvents.reduce((acc, event) => {
    const feeKey = event.type === "singles" ? "singles" : "doubles";
    return acc + tournamentData.entryFees[feeKey];
  }, 0);

  const totalFee = paidAmount + unpaidAmount;
  const amountDue = unpaidAmount;

  // ✅ NEW: Group events by their payment (to show payment batches)
  const eventsByPayment = {};
  selectedEvents.forEach(event => {
    if (event.payment) {
      if (!eventsByPayment[event.payment]) {
        eventsByPayment[event.payment] = [];
      }
      eventsByPayment[event.payment].push(event);
    }
  });

  return {
    paidEvents,
    unpaidEvents,
    paidEventsCount: paidEvents.length,
    unpaidEventsCount: unpaidEvents.length,
    paidAmount,
    unpaidAmount,
    totalFee,
    amountDue,
    eventsByPayment
  };
}, [selectedEvents]);
  // Show payment status
  const showPaymentStatus = paymentAnalysis.paidEventsCount > 0;

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
          
          {/* All Events with Payment Status */}
          <div className="mb-4">
            <p className="text-cyan-400 font-semibold mb-2">All Registered Events:</p>
            <ul className="space-y-2 text-sm">
              {selectedEvents.map((event, index) => {
                const isDoubles = event.type.toLowerCase().includes("doubles") || event.type.toLowerCase().includes("mixed");
                const isPaid = event.payment && (event.payment.status === "Paid" || event.payment.status === "verified");
                const eventFee = event.type === "singles" ? tournamentData.entryFees.singles : tournamentData.entryFees.doubles;
                
                return (
                  <li 
                    key={`event-${index}`} 
                    className={`p-3 rounded-lg ${
                      isPaid 
                        ? "bg-green-900/20 border border-green-500/30" 
                        : "bg-yellow-900/20 border border-yellow-500/30"
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-cyan-300 font-medium">
                            {event.category} {event.type}
                          </span>
                          <span className={`text-xs px-2 py-1 rounded ${
                            isPaid ? "bg-green-600 text-white" : "bg-yellow-600 text-white"
                          }`}>
                            {isPaid ? "Paid ✓" : "Unpaid"}
                          </span>
                        </div>
                        {isDoubles && event.partner && (
                          <div className="text-xs text-gray-400">
                            Partner: {event.partner.fullName || "N/A"}
                          </div>
                        )}
                      </div>
                      <span className={`font-semibold ${
                        isPaid ? "text-green-300" : "text-yellow-300"
                      }`}>
                        ₹{eventFee}
                      </span>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Payment Summary */}
          <div className="bg-[#0d162a] p-4 rounded-lg border border-gray-600">
            <h4 className="text-cyan-300 font-semibold mb-3 text-center">Payment Summary</h4>
            
            {/* Events Count */}
            <div className="grid grid-cols-2 gap-4 mb-3">
              <div className="text-center p-2 bg-green-900/20 rounded border border-green-500/30">
                <div className="text-green-400 text-lg font-bold">
                  {paymentAnalysis.paidEventsCount}
                </div>
                <div className="text-green-300 text-xs">Paid Events</div>
              </div>
              <div className="text-center p-2 bg-yellow-900/20 rounded border border-yellow-500/30">
                <div className="text-yellow-400 text-lg font-bold">
                  {paymentAnalysis.unpaidEventsCount}
                </div>
                <div className="text-yellow-300 text-xs">Unpaid Events</div>
              </div>
            </div>

            {/* Amount Breakdown */}
            <div className="space-y-2 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Total Entry Fee:</span>
                <span className="text-cyan-300 font-semibold">₹{paymentAnalysis.totalFee}</span>
              </div>
              
              {paymentAnalysis.paidEventsCount > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-green-400">Already Paid:</span>
                  <span className="text-green-400 font-semibold">₹{paymentAnalysis.paidAmount}</span>
                </div>
              )}
              
              <div className="flex justify-between items-center pt-2 border-t border-gray-600">
                <span className="text-yellow-400 font-bold">Amount Due:</span>
                <span className="text-yellow-400 text-lg font-bold">₹{paymentAnalysis.amountDue}</span>
              </div>
            </div>
          </div>
          
          <p className="text-sm text-gray-400 mt-3 text-center">
            Player: <span className="text-cyan-300">{player.fullName || "N/A"}</span>
          </p>
        </div>

        {/* Payment Info */}
        {paymentAnalysis.amountDue > 0 && (
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
                href={`upi://pay?pa=${upi}&pn=Tournament%20Fees&am=${paymentAnalysis.amountDue}&cu=INR`}
                className="mt-4 px-6 py-3 bg-linear-to-r from-cyan-500 to-cyan-400 hover:scale-105 text-white font-semibold rounded-lg transition-all duration-200 shadow-md"
              >
                {paymentAnalysis.paidAmount > 0 ? (
                  `Pay ₹${paymentAnalysis.amountDue} Remaining`
                ) : (
                  `Pay ₹${paymentAnalysis.amountDue}`
                )}
              </a>
              
              {paymentAnalysis.paidAmount > 0 && (
                <p className="text-xs text-gray-400 mt-2">
                  Already paid: ₹{paymentAnalysis.paidAmount} | Remaining: ₹{paymentAnalysis.amountDue}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Payment History */}
        {paymentAnalysis.paidEventsCount > 0 && (
          <div className="mt-6 border border-purple-500/30 p-4 rounded-lg bg-purple-900/20">
            <h3 className="text-lg font-semibold mb-3 text-purple-300">Payment History</h3>
            <div className="space-y-2">
              {paymentAnalysis.paidEvents.map((event, index) => {
                const eventFee = event.type === "singles" ? tournamentData.entryFees.singles : tournamentData.entryFees.doubles;
                return (
                  <div key={`paid-event-${index}`} className="flex justify-between items-center p-2 bg-purple-800/20 rounded">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-400" />
                      <span className="text-purple-300 text-sm">
                        {event.category} {event.type}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-green-400 text-sm">₹{eventFee}</span>
                      <span className="bg-green-600 text-white text-xs px-2 py-1 rounded">
                        Paid
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* ✅ Upload Screenshot Section - Only show if there are unpaid events */}
      {paymentAnalysis.unpaidEventsCount > 0 && (
        <UploadScreenShot
          expectedAmount={paymentAnalysis.amountDue}
          expectedUPI={upi}
          onBack={onBack}
          playerId={player.id}
          EntryId={EntryIds}
          selectedEvents={paymentAnalysis.unpaidEvents} // Pass only unpaid events
          unpaidEventsCount={paymentAnalysis.unpaidEventsCount}
          paidEventsCount={paymentAnalysis.paidEventsCount}
          totalEventsCount={selectedEvents.length}
          onSubmitSuccess={onSubmitSuccess}
        />
      )}

      {/* Show message if all events are paid */}
      {paymentAnalysis.unpaidEventsCount === 0 && (
        <div className="text-center py-8 bg-green-900/20 border border-green-500/30 rounded-xl">
          <CheckCircle2 className="w-16 h-16 text-green-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-green-300 mb-2">All Events Paid!</h3>
          <p className="text-green-200">Your registration is complete and all events have been paid for.</p>
          <button
            onClick={onBack}
            className="mt-4 px-6 py-2 bg-gray-600 hover:bg-gray-500 text-white font-semibold rounded-lg transition-all"
          >
            Back to Events
          </button>
        </div>
      )}
    </div>
  );
};

export default PaymentStep;