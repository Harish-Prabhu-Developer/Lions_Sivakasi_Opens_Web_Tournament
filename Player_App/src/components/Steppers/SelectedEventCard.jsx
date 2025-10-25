import React from "react";

const SelectedEventCard = ({ selectedEvents }) => {
  return (
            <span className="text-cyan-50 pl-4">
              {selectedEvents.map((e, idx) => (
                
                  <li key={idx}>
                    {e.category.replace("Boys & Girls", "").trim()}
                    <span className="text-cyan-400 text-xs ml-1">
                      ({e.type})
                    </span>
                    {idx < selectedEvents.length - 1 && <br />}
                  </li>
                
              ))}
            </span>
  );
};

export default SelectedEventCard;
