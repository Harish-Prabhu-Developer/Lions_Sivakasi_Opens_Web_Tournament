// PaymentStep.jsx
import { useMemo, useState } from "react";
import { tournamentData } from "../../constants";
import UploadScreenShot from "./UploadScreenShot"; // ✅ using the detailed one
import toast from "react-hot-toast";

const PaymentStep = ({
  selectedEvents,
  player,
  partners,
  upi,
  upiQrUrl,
  onBack,
  onSubmit,
}) => {

  // ✅ Calculate total fee dynamically
  const totalFee = useMemo(() => {
    return selectedEvents.reduce((acc, event) => {
      const feeKey = event.type === "Singles" ? "singles" : "doubles";
      return acc + tournamentData.entryFees[feeKey];
    }, 0);
  }, [selectedEvents]);


  return (
    <div className="space-y-8">
      {/* 🧾 Summary Section */}
      <div className="bg-[#0d162a] p-6 rounded-xl border border-cyan-400/20">
        <h3 className="text-xl font-bold text-cyan-300 mb-6 text-center">
          Summary & Payment
        </h3>

        {/* Registration Summary */}
        <div className="mb-8 border border-gray-700 p-4 rounded-lg bg-[#192339]">
          <p className="text-lg font-semibold text-gray-200 border-b border-gray-700 pb-2 mb-3">
            ₹ Registration Summary
          </p>
          <ul className="list-disc ml-5 text-gray-300 space-y-1 text-sm">
            {selectedEvents.map((event, index) => {
              const partnerKey = `${event.category}|${event.type}`;
              const partnerData = partners[partnerKey];
              const isDoubles = event.type.includes("Doubles");

              return (
                <li key={index} className="text-yellow-300">
                  {event.category.replace("Boys & Girls", "").trim()}{" "}
                  {event.type.toLowerCase()}
                  {isDoubles && partnerData && (
                    <span className="ml-2 text-gray-400">
                      (Partner: {partnerData.fullName || "Data Missing"})
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
              className="w-32 h-32 rounded-lg shadow-lg"
            />
            <a
              href={`upi://pay?pa=${upi}&pn=Tournament%20Fees&am=${totalFee}&cu=INR`}
              className="mt-4 px-6 py-2 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg transition-all"
            >
              Pay via UPI
            </a>
          </div>
        </div>
      </div>

      {/* ✅ Replace mock upload with full OCR-based verification */}
      <UploadScreenShot
        expectedAmount={totalFee}
        expectedUPI={upi}
        onBack={onBack}
        selectedEvents={selectedEvents}
      />


      {/* Navigation Buttons
      <div className="flex flex-col sm:flex-row justify-between mt-8 gap-4">
        <button
          onClick={onBack}
          className="px-6 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg font-medium transition-all duration-200 w-full sm:w-auto"
        >
          ← Back
        </button>

        <button
          onClick={onSubmit}
          disabled={verificationStatus !== "verified"}
          className={`px-8 py-2 font-semibold rounded-lg transition-all duration-200 w-full sm:w-auto ${
            verificationStatus === "verified"
              ? "bg-gradient-to-r from-green-500 to-green-400 hover:scale-105"
              : "bg-gray-600 cursor-not-allowed opacity-70"
          }`}
        >
          Submit Entry
        </button>
      </div> */}
    </div>
  );
};

export default PaymentStep;
