import React, { useState, useRef } from "react";

const Tooltip = ({ content, children, showCondition = true }) => {
  const [visible, setVisible] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const triggerRef = useRef(null);

  const tooltipContent = Array.isArray(content) ? content : content.split("\n");

  const handleMouseEnter = (e) => {
    if (!showCondition) return;

    const rect = e.currentTarget.getBoundingClientRect();
    
    // Calculate position to the right of the element with some offset
    setPosition({
      top: rect.top + window.scrollY + rect.height / 2,
      left: rect.right + window.scrollX + 8 // 8px offset from the element
    });
    
    setVisible(true);
  };

  const handleMouseLeave = () => {
    setVisible(false);
  };

  if (!showCondition) {
    return children;
  }

  return (
    <>
      <div
        ref={triggerRef}
        className="relative inline-flex w-full"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {children}
      </div>

      {visible && (
        <div
          style={{
            position: 'absolute',
            top: `${position.top}px`,
            left: `${position.left}px`,
            transform: 'translateY(-50%)',
            zIndex: 9999,
          }}
          className="animate-fade-in"
        >
          <div className="bg-gray-900 text-white px-3 py-2 rounded-lg shadow-lg max-w-xs">
            {tooltipContent.map((line, index) => (
              <div
                key={index}
                className={`
                  ${index > 0 ? 'text-xs text-gray-300 mt-1' : 'text-sm font-medium'}
                  leading-tight whitespace-nowrap
                `}
              >
                {line}
              </div>
            ))}
            {/* Tooltip arrow */}
            <div 
              className="absolute top-1/2 -left-1 transform -translate-y-1/2 w-0 h-0 
                         border-y-[6px] border-y-transparent border-r-[6px] border-r-gray-900"
            />
          </div>
        </div>
      )}
    </>
  );
};

export default Tooltip;