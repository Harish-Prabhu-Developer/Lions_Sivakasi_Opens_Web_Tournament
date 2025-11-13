// components/Academy/FloatingActionButton.jsx
import React from "react";
import { Plus } from "lucide-react";

const FloatingActionButton = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="
        fixed bottom-6 right-6 sm:bottom-8 sm:right-8 
        w-14 h-14 sm:w-16 sm:h-16 
        rounded-full bg-cyan-500 text-white 
        shadow-lg hover:bg-cyan-400 
        flex items-center justify-center
        transition-all duration-300 hover:scale-110
        ring-2 ring-cyan-300/30 hover:ring-cyan-200/50
        z-40
      "
      aria-label="Add New Player"
    >
      <Plus className="w-6 h-6 sm:w-7 sm:h-7" />
    </button>
  );
};

export default FloatingActionButton;