// Stepper.jsx
import { Check } from 'lucide-react'
import React from 'react'

const Stepper = ({ currentStep, steps }) => {
  return (
    <div className="w-full flex flex-col items-center mb-3">
    <div className="flex w-full justify-between items-center">
      {steps.map((step, i) => (
        <React.Fragment key={step}>
          {i > 0 && (
            <div
              className={`flex-1 h-1 w-full rounded-full ${
                i < currentStep ? "bg-cyan-400" : "bg-gray-600/30"
              }`}
            />
          )}
          <div className="flex flex-col items-center">
            <div
              className={`flex items-center justify-center w-6 h-6 text-center text-xs sm:text-sm sm:w-11 sm:h-11 rounded-full font-bold border-2 transition-all duration-300 ${
                i + 1 < currentStep
                  ? "bg-cyan-500 border-cyan-400 text-white shadow-md"
                  : i + 1 === currentStep
                  ? "bg-white/20 border-cyan-400 text-cyan-200 scale-110 shadow-lg"
                  : "bg-white/15 border-gray-400 text-gray-400"
              }`}
            >
              <span>{i + 1 < currentStep ? <Check className="w-3 h-3 sm:w-5 sm:h-5" /> : i + 1}</span>
            </div>
            <span
              className={`mt-2 text-xs sm:text-sm font-medium ${
                i + 1 === currentStep
                  ? "text-cyan-400"
                  : i + 1 < currentStep
                  ? "text-cyan-300"
                  : "text-gray-500"
              }`}
            >
              {step.split(" ").join("\n")}
            </span>
          </div>
        </React.Fragment>
      ))}
    </div>
  </div>
  )
}

export default Stepper