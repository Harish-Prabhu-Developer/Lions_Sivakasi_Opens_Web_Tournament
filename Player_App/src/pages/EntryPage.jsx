import React, { useState } from "react";
import { Trophy, ArrowRight, ArrowLeft, Upload, Info } from "lucide-react";

// Responsive Stepper with adaptive lines
const Stepper = ({ currentStep, steps }) => (
  <div className="w-full max-w-xl mx-auto mb-8 px-2 relative flex flex-col items-center">
    {/* Desktop: Circles + line */}
    <div className="hidden md:flex w-full items-center justify-between relative">
     
      {steps.map((step, idx) => (
        <>
         {/* Horizontal line behind all steps */}
      {idx < steps.length - 1 && idx < currentStep - 1 && (
        <div className="absolute top-6 left-0 w-full h-1 bg-red-600 z-0 rounded-full" style={{ transform: 'translateY(-50%)' }}></div>
      )}
        <div key={step} className="flex flex-col py-2 items-center flex-1 z-10">
          <span
            className={`flex items-center justify-center w-9 h-9 rounded-full font-bold text-lg transition-all duration-300
              ${idx + 1 <= currentStep
                ? "bg-gradient-to-r from-cyan-400 to-cyan-500 shadow-cyan-400/40 shadow text-white"
                : "bg-[#182a3a] text-gray-400"
              }`}
          >
            {idx + 1}
          </span>
          <span className="text-sm font-semibold mt-2 text-cyan-200 drop-shadow-sm tracking-wide text-center">
            {step}
          </span>
        </div>
        </>
      ))}
    </div>
    {/* Mobile: Circles and label in a row, connector dots below */}
    <div className="flex md:hidden justify-between w-full relative">
      {steps.map((step, idx) => (
        <div key={step} className="flex flex-col items-center flex-1">
          <span
            className={`flex items-center justify-center w-8 h-8 rounded-full font-bold text-base transition-all duration-300
              ${idx + 1 <= currentStep
                ? "bg-gradient-to-r from-cyan-400 to-cyan-500 shadow-cyan-400/40 shadow text-white"
                : "bg-[#182a3a] text-gray-400"
              }`}
          >
            {idx + 1}
          </span>
          <span className="text-xs font-medium mt-1 text-cyan-200 text-center">{step}</span>
        </div>
      ))}
    </div>
    {/* Mobile connector dots */}
    <div className="flex md:hidden w-full justify-center items-center mt-3">
      {steps.map((_, idx) =>
        idx !== steps.length - 1 ? (
          <div key={idx} className="w-7 h-1 bg-red-600 mx-1 rounded-full" />
        ) : null
      )}
    </div>
  </div>
);



function StepEventSelection({ stepProps }) {
  const { entry, setEntry, goNext } = stepProps;
  const eventTypes = ["Singles", "Doubles", "Mixed Doubles"];
  const ageCategories = ["U11", "U13", "U15", "U17", "U19"];
  return (
    <div className="rounded-2xl glass-card px-4 py-6 md:p-10 shadow-2xl max-w-2xl w-full mx-auto">
      <h2 className="font-extrabold text-2xl md:text-3xl mb-6 md:mb-7 text-cyan-300 tracking-tight">
        Step 1: Event Selection
      </h2>
      <div className="mb-6">
        <span className="block font-semibold mb-3 text-gray-400">Select Event Type</span>
        <div className="flex flex-wrap gap-3">
          {eventTypes.map((type) => (
            <button
              key={type}
              className={`min-w-[96px] px-8 py-3 rounded-xl font-semibold text-base shadow transition-colors duration-200 ${
                entry.eventType === type
                  ? "bg-gradient-to-r from-cyan-400 to-cyan-500 text-white shadow-lg scale-[1.04]"
                  : "bg-white/10 text-gray-200 hover:bg-cyan-400/20"
              }`}
              onClick={() => setEntry((e) => ({ ...e, eventType: type }))}
            >
              {type}
            </button>
          ))}
        </div>
      </div>
      <div>
        <span className="block font-semibold mb-3 text-gray-400">Select Age Category</span>
        <div className="flex flex-wrap gap-2 mb-7">
          {ageCategories.map((age) => (
            <button
              key={age}
              className={`min-w-[72px] px-6 py-2 rounded-xl font-semibold text-base shadow transition-colors duration-200 ${
                entry.ageCategory === age
                  ? "bg-gradient-to-r from-cyan-400 to-cyan-500 text-white shadow-lg scale-[1.04]"
                  : "bg-white/10 text-gray-200 hover:bg-cyan-400/20"
              }`}
              onClick={() => setEntry((e) => ({ ...e, ageCategory: age }))}
            >
              {age}
            </button>
          ))}
        </div>
      </div>
      <div className="mt-2 mb-8 font-bold text-xl text-cyan-400 flex items-center gap-3 justify-center md:justify-start">
        Entry Fee <span className="bg-[#14213C] px-5 py-2 rounded-xl text-white text-lg shadow-md ml-2">₹700</span>
      </div>
      <div className="flex justify-end pt-2">
        <button
          onClick={goNext}
          className="flex items-center gap-2 px-10 py-3 bg-gradient-to-r from-cyan-500 to-cyan-400 rounded-full font-bold text-white shadow-md hover:scale-105 active:scale-90 transition"
        >
          Next <ArrowRight className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
}

function StepPlayerDetails({ stepProps }) {
  const { entry, setEntry, goNext, goBack } = stepProps;
  return (
    <div className="rounded-2xl glass-card px-4 py-6 md:p-10 shadow-2xl max-w-2xl w-full mx-auto">
      <h2 className="font-extrabold text-2xl md:text-3xl mb-7 text-cyan-300">Step 2: Player Details</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-7 mb-8">
        <input
          className="glass-input"
          placeholder="Full Name"
          value={entry.fullName}
          onChange={(e) => setEntry((ent) => ({ ...ent, fullName: e.target.value }))}
        />
        <input
          className="glass-input"
          placeholder="Date of Birth"
          type="date"
          value={entry.dob}
          onChange={(e) => setEntry((ent) => ({ ...ent, dob: e.target.value }))}
        />
        <input
          className="glass-input"
          placeholder="TNBA ID"
          value={entry.tnbaId}
          onChange={(e) => setEntry((ent) => ({ ...ent, tnbaId: e.target.value }))}
        />
        <input
          className="glass-input"
          placeholder="Academy Name"
          value={entry.academy}
          onChange={(e) => setEntry((ent) => ({ ...ent, academy: e.target.value }))}
        />
        <input
          className="glass-input"
          placeholder="District"
          value={entry.district}
          onChange={(e) => setEntry((ent) => ({ ...ent, district: e.target.value }))}
        />
      </div>
      <div className="flex justify-between pt-2">
        <button
          onClick={goBack}
          className="flex items-center gap-2 px-8 py-2 bg-[#222B37]/80 text-gray-200 rounded-xl font-semibold shadow hover:bg-cyan-400/10 transition"
        >
          <ArrowLeft className="w-4 h-4" /> Previous
        </button>
        <button
          onClick={goNext}
          className="flex items-center gap-2 px-8 py-2 bg-gradient-to-r from-cyan-500 to-cyan-400 text-white rounded-xl font-bold shadow-md hover:scale-105 transition"
        >
          Next <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

function StepDocumentsPayment({ stepProps }) {
  const { entry, setEntry, goBack, submitEntry } = stepProps;
  return (
    <div className="rounded-2xl glass-card px-4 py-6 md:p-10 shadow-2xl max-w-2xl w-full mx-auto">
      <h2 className="font-extrabold text-2xl md:text-3xl mb-7 text-cyan-300">Step 3: Documents & Payment</h2>
      <div className="mb-6 md:mb-8">
        <label className="block text-gray-400 font-semibold mb-2">
          Age Proof (Birth Certificate/School ID)
        </label>
        <div className="flex items-center gap-3">
          <input
            type="file"
            className="glass-input file:py-2 file:px-4 file:bg-cyan-400 file:text-white file:rounded-lg"
            onChange={(e) =>
              setEntry((ent) => ({ ...ent, ageProof: e.target.files[0] }))
            }
          />
          <Upload className="w-5 h-5 text-cyan-400" />
        </div>
      </div>
      <div className="mb-6 md:mb-8">
        <label className="block text-gray-400 font-semibold mb-2">
          Address Proof (Optional)
        </label>
        <div className="flex items-center gap-3">
          <input
            type="file"
            className="glass-input file:py-2 file:px-4 file:bg-cyan-400 file:text-white file:rounded-lg"
            onChange={(e) =>
              setEntry((ent) => ({ ...ent, addrProof: e.target.files[0] }))
            }
          />
          <Upload className="w-5 h-5 text-cyan-400" />
        </div>
      </div>
      <div className="bg-[#181F2F]/90 rounded-xl border border-cyan-400/20 p-5 mb-7 text-base shadow glass-card">
        <span className="flex gap-2 items-center text-lg font-bold text-cyan-400 mb-2">
          <Trophy className="w-6 h-6" /> Payment Details
        </span>
        <div className="text-gray-100 mb-2">
          <b>Bank:</b> TMBL (Tamilnad Mercantile Bank Ltd)
        </div>
        <div className="text-gray-100 mb-1">
          <b>Account Name:</b> Lions Club Sivakasi Central
        </div>
        <div className="text-gray-100 mb-1">
          <b>Account Number:</b> 1234567890
        </div>
        <div className="text-gray-100 mb-1">
          <b>IFSC Code:</b> TMBL0000123
        </div>
        <div className="mt-2 font-bold text-cyan-400 text-xl">
          Amount: ₹700
        </div>
      </div>
      <div className="mb-4">
        <label className="block text-gray-400 font-semibold mb-2">
          Payment Proof (Screenshot / Receipt)
        </label>
        <div className="flex items-center gap-3">
          <input
            type="file"
            className="glass-input file:py-2 file:px-4 file:bg-cyan-400 file:text-white file:rounded-lg"
            onChange={(e) =>
              setEntry((ent) => ({ ...ent, paymentProof: e.target.files[0] }))
            }
          />
          <Upload className="w-5 h-5 text-cyan-400" />
        </div>
      </div>
      <div className="flex items-center gap-2 mb-6 bg-yellow-400/10 border border-yellow-500/20 px-5 py-3 rounded-xl">
        <Info className="w-5 h-5 text-yellow-400" />
        <span className="text-yellow-200 text-sm">
          Your entry will be reviewed by admins once you submit. Make sure all details are correct.
        </span>
      </div>
      <div className="flex justify-between pt-3">
        <button
          onClick={goBack}
          className="flex items-center gap-2 px-8 py-2 bg-[#222B37]/80 text-gray-200 rounded-xl font-semibold shadow hover:bg-cyan-400/10 transition"
        >
          <ArrowLeft className="w-4 h-4" /> Previous
        </button>
        <button
          onClick={submitEntry}
          className="flex items-center gap-2 px-8 py-2 bg-gradient-to-r from-green-500 to-green-400 text-white rounded-xl font-bold shadow-md hover:scale-105 transition"
        >
          Submit Entry <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

const EntryPage = () => {
  const [step, setStep] = useState(1);
  const steps = ["Event", "Details", "Documents"];
  const [entry, setEntry] = useState({
    eventType: "",
    ageCategory: "",
    fullName: "",
    dob: "",
    tnbaId: "",
    academy: "",
    district: "",
    ageProof: null,
    addrProof: null,
    paymentProof: null,
  });

  const goNext = () => setStep((s) => Math.min(s + 1, steps.length));
  const goBack = () => setStep((s) => Math.max(s - 1, 1));
  const submitEntry = () => alert("Entry submitted!");

  return (
    <div className="min-h-screen mt-20 pb-10 bg-gradient-to-br from-[#141C2F] to-[#16213C] text-white px-2">
      <div className="max-w-2xl w-full mx-auto mb-8">
        <div className="flex flex-col items-center mb-4">
          <Trophy className="w-11 h-11 text-cyan-400 mb-2 mt-2 drop-shadow-lg" />
          <h1 className="text-2xl md:text-3xl font-extrabold mb-1 bg-gradient-to-r from-cyan-300 to-cyan-400 text-transparent bg-clip-text">
            Tournament Entry
          </h1>
          <p className="text-base text-gray-400">
            Fill in your details to register for the tournament
          </p>
        </div>
        <Stepper currentStep={step} steps={steps} />
      </div>
      {step === 1 && <StepEventSelection stepProps={{ entry, setEntry, goNext }} />}
      {step === 2 && <StepPlayerDetails stepProps={{ entry, setEntry, goNext, goBack }} />}
      {step === 3 && <StepDocumentsPayment stepProps={{ entry, setEntry, goBack, submitEntry }} />}
      <style>{`
      .glass-card {
        background: rgba(25, 35, 57, 0.97);
        backdrop-filter: blur(10px);
        box-shadow: 0 16px 44px -12px rgba(38, 220, 254, 0.15);
      }
      .glass-input {
        width: 100%;
        padding: 0.95rem 1.2rem;
        border-radius: 1rem;
        background: rgba(24, 31, 47, 0.98);
        border: 2px solid #18b4dd22;
        color: #e4eaf4;
        font-size: 1rem;
        outline: none;
        box-shadow: 0 2px 24px -1px rgba(38,240,254,0.07);
        transition: border-color 0.2s, box-shadow 0.2s;
      }
      .glass-input:focus {
        border-color: #06d4fa;
        box-shadow: 0 4px 24px -2px rgba(38,208,254,0.16);
        background: rgba(24,31,47,0.98);
        color: #fff;
      }
      `}
      </style>
    </div>
  );
};

export default EntryPage;
