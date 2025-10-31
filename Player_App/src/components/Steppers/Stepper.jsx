import { Check } from "lucide-react";
import React from "react";

const Stepper = ({ currentStep, steps }) => (
  <div className="flex justify-between items-center w-full relative">
    {steps.map((label, index) => {
      const stepNumber = index + 1;
      const isCompleted = stepNumber < currentStep;
      const isActive = stepNumber === currentStep;

      return (
        <React.Fragment key={label}>
          {index > 0 && (
            <div className={`flex h-1 absolute top-2  -mr-3 transition-all duration-500 ${isCompleted ? 'bg-cyan-400' : 'bg-gray-700'} ${index === 0 ? 'left-0' : 'left-0'} ${index === steps.length - 1 ? 'right-0' : ''}`} style={{ left: `calc(${100 / (steps.length - 1) * index}% - 60px)`, right: `calc(${100 / (steps.length - 1) * (steps.length - 1 - index)}% - 60px)` }}></div>
          )}
          <div className="flex flex-col items-center z-10 w-1/3">
            <div
              className={`w-10 h-10 flex items-center justify-center rounded-full font-bold transition-all duration-300 border-2 ${
                isCompleted
                  ? 'bg-cyan-400 border-cyan-400 text-[#0a192f]'
                  : isActive
                  ? 'bg-transparent border-cyan-400 text-cyan-400'
                  : 'bg-gray-700 border-gray-700 text-gray-400'
              }`}
            >
              {isCompleted ? <Check className="w-5 h-5" /> : stepNumber}
            </div>
            <span className={`text-xs mt-2 text-center transition-colors duration-300 ${isActive ? 'text-cyan-300' : 'text-gray-400'}`}>
              {label}
            </span>
          </div>
        </React.Fragment>
      );
    })}
  </div>
);

export default Stepper;