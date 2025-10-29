import React from "react";
import { IndianRupee, QrCode } from "lucide-react";

import EXQR from "../../assets/ExQr.png";
import UploadScreenShot from "./UploadScreenShot";
import toast from "react-hot-toast";
import SelectedEventCard from "./SelectedEventCard";
import { tournamentData } from "../../pages/EntryPage";

const PaymentStep = ({ selectedEvents, player, partner, setStep }) => {
  // Calculate total entry fees
  const totalFee = selectedEvents.reduce(
    (sum, e) => sum + (["singles"].includes(e.type.toLowerCase()) ? 800 : 1400),
    0
  );

  // Show all partners
  const partnerList = partner
    ? Object.entries(partner)
        .filter(([_, p]) => p["Full Name"])
        .map(([k, p]) => (
          <div key={k} className="flex items-start gap-2">
            <span className="font-semibold text-cyan-300 min-w-fit">
              Partner:
            </span>
            <span className="text-cyan-50">
              {p["Full Name"]}{" "}
              <span className="text-xs text-cyan-400">
                ({k.replace("Boys & Girls", "").trim()})
              </span>
            </span>
          </div>
        ))
    : null;

  return (
    <div className="text-white space-y-6 max-w-2xl mx-auto px-2 w-full">
      <h3 className="text-2xl sm:text-3xl text-cyan-300 font-bold text-center mb-4">
        Summary & Payment
      </h3>

      {/* Summary Card */}
      <div className="bg-gradient-to-br from-[#121a2f]/95 via-[#0f1729]/90 to-[#0a1220]/95 border border-cyan-500/30 rounded-2xl p-4 md:p-6 text-sm md:text-base space-y-3 shadow-xl">
        <h4 className="text-lg font-semibold text-cyan-300 mb-3 flex items-center gap-2">
          <IndianRupee className="w-5 h-5" />
          Registration Summary
        </h4>

        <div className="space-y-2">
          <div className="flex flex-col gap-1">
            <span className="font-semibold text-cyan-300">
              Events Selected:
            </span>
            <SelectedEventCard selectedEvents={selectedEvents} />
          </div>

          <div className="flex items-start gap-2">
            <span className="font-semibold text-cyan-300 min-w-fit">
              Player:
            </span>
            <span className="text-cyan-50">
              {player?.["Full Name"] || "N/A"}
            </span>
          </div>

          {partnerList && partnerList.length > 0 && (
            <div className="space-y-1">{partnerList}</div>
          )}
        </div>

        <div className="pt-3 mt-3 border-t border-cyan-700/30">
          <div className="flex justify-between items-center">
            <span className="font-bold text-lg text-cyan-300">
              Total Entry Fee:
            </span>
            <span className="font-bold text-2xl text-cyan-100">
              ₹{totalFee}
            </span>
          </div>
        </div>
      </div>

      {/* Payment Section */}
      <div className="bg-gradient-to-br from-[#132044]/90 via-[#0e1a35]/85 to-[#091226]/90 border border-cyan-700/40 p-5 md:p-6 rounded-2xl text-center text-cyan-200 space-y-4 shadow-xl">
        <div className="flex items-center justify-center gap-2 mb-2">
          <QrCode className="w-6 h-6 text-cyan-300" />
          <h4 className="text-xl sm:text-2xl font-semibold text-cyan-300">
            Payment Details
          </h4>
        </div>

        <div className="bg-cyan-950/30 border border-cyan-700/30 rounded-lg p-3 text-center">
          <p className="text-sm text-cyan-400 mb-1">UPI ID</p>
          <p className="text-base md:text-lg font-mono text-cyan-50 break-all">
            {tournamentData.upi}
          </p>
        </div>

        <div className="flex justify-center mt-4">
          <div className="bg-white/95 p-3 rounded-xl border-2 border-cyan-400/40 shadow-lg">
            <img src={EXQR} alt="QR Payment" className="w-40 h-40 rounded-lg" />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center w-full pt-2">
          <a
            href={`upi://pay?pa=${tournamentData.upi}&pn=LionsSivakasiOpen&am=${totalFee}.00&cu=INR`}
            className="w-full sm:w-auto min-w-[160px] bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-500 px-6 py-3 rounded-xl  hover:scale-105 hover:shadow-xl hover:shadow-cyan-500/30 transition-all shadow-lg"
          >
            <span className=" text-white font-bold text-center">Pay via UPI</span>
          </a>
        </div>
      </div>

      {/* Upload Screenshot */}
      <UploadScreenShot expectedAmount={totalFee} setStep={setStep} />
    </div>
  );
};

export default PaymentStep;
