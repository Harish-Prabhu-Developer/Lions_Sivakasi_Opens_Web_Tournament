import React from 'react';
import { tournamentData } from '../Dialog/EntryDialog';
import EXQR from "../../assets/ExQr.png"
const PaymentStep = ({ selectedEvents, player, partner }) => {
  // Sum total entry fees based on event type
  const totalFee = selectedEvents.reduce(
    (sum, e) => sum + (["singles"].includes(e.type.toLowerCase()) ? 800 : 1400),
    0
  );

  // Show all partners, handling multiple doubles/mixed
  const partnerList = partner
    ? Object.entries(partner)
        .filter(([_, p]) => p["Full Name"])
        .map(([k, p]) => (
          <p key={k}>
            <span className="font-semibold text-cyan-300">Partner ({k}):</span> {p["Full Name"]}
          </p>
        ))
    : null;

  return (
    <div className="text-white space-y-6 max-w-xl mx-auto px-2 w-full">
      <h3 className="text-xl sm:text-2xl text-cyan-300 font-bold text-center mb-3">Summary & Payment</h3>
      {/* Summary Card */}
      <div className="bg-[#121a2f]/90 border border-cyan-500/20 rounded-xl p-4 text-sm md:text-base space-y-2 shadow flex flex-col">
        <p>
          <span className="font-semibold text-cyan-300">Events Selected:</span>{" "}
          {selectedEvents.map(e => `${e.category} (${e.type})`).join(", ")}
        </p>
        <p>
          <span className="font-semibold text-cyan-300">Player:</span>{" "}
          {player?.["Full Name"] || "N/A"}
        </p>
        {partnerList && partnerList.length > 0 && partnerList}
        <p className="font-semibold">
          Total Entry Fees: <span className="text-cyan-300">₹{totalFee}</span>
        </p>
      </div>

      {/* Payment Section */}
      <div className="bg-[#132044]/80 border border-cyan-700/30 p-4 rounded-xl text-center text-cyan-200 space-y-3 shadow flex flex-col items-center">
        <h4 className="text-lg sm:text-xl font-semibold text-cyan-300">Payment Details</h4>
        <div className="mb-1">UPI ID: 
          <span className="ml-1 text-cyan-50 break-all">{tournamentData.upi}</span>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center w-full">
          <a
            href={`intent://pay?pa=${tournamentData.upi}&am=${totalFee}.00#Intent;scheme=upi;package=com.google.android.apps.nbu.paisa.user;end`}
            className="flex-1 min-w-[140px] bg-gradient-to-r from-cyan-500 to-sky-400 my-2 text-white px-4 py-2 rounded-lg font-bold hover:scale-105 transition text-center"
          >
            <span className='text-white'>Pay via UPI</span>
          </a>
        </div>
        <div className="flex justify-center mt-3">
          <img
            src={EXQR}
            alt="QR Payment"
            className="w-32 h-32 border border-cyan-400/30 rounded-lg p-1 shadow-md"
          />
        </div>
      </div>
    </div>
  );
};

export default PaymentStep;
