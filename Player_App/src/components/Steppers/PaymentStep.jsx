import React from 'react'
import { tournamentData } from '../Dialog/EntryDialog';

const PaymentStep = ({ selectedEvents, player, partner }) => {
    return (
          <div className="text-white space-y-3">
    <h3 className="text-xl text-cyan-300 font-bold text-center mb-3">Summary & Payment</h3>

    <div className="bg-[#121a2f]/90 border border-cyan-500/20 rounded-xl p-4 text-sm space-y-2">
      <p>
        <span className="font-semibold text-cyan-300">Events Selected:</span>{" "}
        {selectedEvents.map(e => `${e.category} (${e.type})`).join(", ")}
      </p>
      <p>
        <span className="font-semibold text-cyan-300">Player:</span> {player["Full Name"] || "N/A"}
      </p>
      {partner["Full Name"] && (
        <p>
          <span className="font-semibold text-cyan-300">Partner:</span> {partner["Full Name"]}
        </p>
      )}
      <p className="font-semibold">
        Total Entry Fees: ₹
        {selectedEvents.reduce(
          (sum, e) => sum + (["singles"].includes(e.type) ? 800 : 1400),
          0
        )}
      </p>
    </div>

    <div className="bg-[#132044]/80 border border-cyan-700/30 p-4 rounded-xl text-center text-cyan-200 space-y-2">
      <h4 className="text-lg font-semibold text-cyan-300">Payment Details</h4>
      <p>UPI ID: {tournamentData.upi}</p>
      <a
        href={`upi://pay?pa=${tournamentData.upi}&pn=LionsSivakasi`}
        className="inline-block mt-2 bg-gradient-to-r from-cyan-500 to-sky-400 text-white px-6 py-2 rounded-lg font-bold hover:scale-105 transition"
      >
        Pay via UPI App
      </a>
      <div className="flex justify-center mt-3">
        <img
          src="/qrcode.png"
          alt="QR Payment"
          className="w-32 h-32 border border-cyan-400/30 rounded-lg p-1 shadow-md"
        />
      </div>
    </div>
  </div>

    )
};


export default PaymentStep