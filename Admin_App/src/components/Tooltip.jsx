// src/components/Tooltip.jsx
import React, { useState } from "react";

const Tooltip = ({ content, children, showCondition = true }) => {
  const [visible, setVisible] = useState(false);
  const [coords, setCoords] = useState({ x: 0, y: 0 });

  const tooltipContent = content.split("\n");

  const handleEnter = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    //ge mouse position
    const mouseX = e.clientX;
    setCoords({
      x: showCondition ? rect.left + rect.width / 3.5 : mouseX,
      y: rect.top + rect.height / 2,
    });
    setVisible(true);
  };

  const handleLeave = () => setVisible(false);

  if (!showCondition) return children;

  return (
    <>
      <div
        className="relative flex items-center"
        onMouseEnter={handleEnter}
        onMouseLeave={handleLeave}
      >
        {children}
      </div>

      {visible && (
        <div
          style={{
            position: "fixed",
            left: coords.x,
            top: coords.y,
            transform: "translateY(-50%)",
            zIndex: 9999,
          }}
          className="bg-gray-900 text-white px-3 py-2 rounded-lg shadow-2xl 
                     whitespace-nowrap animate-fade-in transition-all"
        >
          {tooltipContent.map((line, i) => (
            <p
              key={i}
              className={`${
                i > 0
                  ? "text-xs text-gray-400 italic"
                  : "text-sm font-medium"
              } leading-tight`}
            >
              {line}
            </p>
          ))}
          <div className="absolute -left-1.5 top-1/2 -translate-y-1/2 w-0 h-0 
                          border-y-[6px] border-y-transparent border-r-[6px] border-r-gray-900" />
        </div>
      )}
    </>
  );
};

export default Tooltip;
