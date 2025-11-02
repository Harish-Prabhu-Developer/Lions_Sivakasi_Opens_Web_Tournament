import { Check } from "lucide-react";
import React from "react";

const Stepper = ({ currentStep, steps }) => {
  return (
    <div className="relative flex justify-between items-center w-full max-w-3xl mx-auto">
      {/* Background Connector Line */}
      <div className="absolute top-6 left-[5%] right-[5%] h-[2px] bg-gray-700 -translate-y-1/2 z-0"></div>

      {/* Active Connector Line */}
      <div
        className="absolute top-6 left-[7%] h-[2px] bg-cyan-400 transition-all duration-700 ease-in-out -translate-y-1/2 z-0"
        style={{
          width: `${((currentStep - 1) / (steps.length - 1)) * 90}%`,
        }}
      ></div>

      {/* Steps */}
      {steps.map((label, index) => {
        const stepNumber = index + 1;
        const isCompleted = stepNumber < currentStep;
        const isActive = stepNumber === currentStep;

        return (
          <div
            key={label}
            className="relative flex flex-col items-center z-10 text-center w-fit"
          >
            <div
              className={`w-10 h-10 flex items-center justify-center rounded-full font-bold transition-all duration-300 border-2 shadow-md ${
                isCompleted
                  ? "bg-cyan-400 border-cyan-400 text-[#0a192f] shadow-cyan-500/40"
                  : isActive
                  ? "bg-[#0f172a] border-cyan-400 text-cyan-400 shadow-cyan-400/20"
                  : "bg-gray-700 border-gray-700 text-gray-400"
              }`}
            >
              {isCompleted ? <Check className="w-5 h-5" /> : stepNumber}
            </div>
            <span
              className={`text-xs mt-2 text-center transition-colors duration-300 ${
                isActive
                  ? "text-cyan-300 font-semibold"
                  : "text-gray-400 font-medium"
              }`}
            >
              {label}
            </span>
          </div>
        );
      })}
    </div>
  );
};

export default Stepper;
