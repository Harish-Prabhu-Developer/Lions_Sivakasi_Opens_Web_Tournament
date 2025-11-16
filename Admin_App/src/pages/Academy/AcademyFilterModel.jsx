import { useState } from "react";

const AcademyFilterModel = ({ filters, setFilters, availableFilters, onClose }) => {
  const [tempFilters, setTempFilters] = useState(filters);

  const handleToggle = (key, value) => {
    setTempFilters((prev) => ({
      ...prev,
      [key]: prev[key].includes(value)
        ? prev[key].filter((v) => v !== value)
        : [...prev[key], value],
    }));
  };

  const applyFilters = () => {
    setFilters(tempFilters);
    onClose();
  };

  const clearAllFilters = () => {
    setTempFilters({
      categoryFilter: [],
      typeFilter: [],
      statusFilter: [],
      academyFilter: [],
      partnerFilter: [],
      playerFilter: []
    });
  };

  // Filter out empty filter sections
  const nonEmptyFilterSections = Object.entries(availableFilters).filter(
    ([, options]) => options && options.length > 0
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm transition-all">
      {/* Card */}
      <div className="bg-white w-80 sm:w-96 rounded-xl shadow-2xl border border-gray-200 p-5 relative animate-fadeIn scale-100">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition"
          aria-label="Close"
        >
          ✕
        </button>

        <h3 className="font-bold text-lg mb-4 text-indigo-700 text-center">
          Filter Academy Entries
        </h3>

        {/* Filter Sections */}
        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
          {nonEmptyFilterSections.length > 0 ? (
            nonEmptyFilterSections.map(([key, options]) => (
              <div
                key={key}
                className="border-b border-gray-100 pb-3 last:border-b-0"
              >
                <p className="font-medium text-sm mb-2 capitalize text-gray-700">
                  {key.replace("Filter", "").replace(/([A-Z])/g, ' $1').trim()}
                </p>
                <div className="grid grid-cols-1 gap-2 max-h-32 overflow-y-auto">
                  {options.map((option) => (
                    <label
                      key={option}
                      className="flex items-center text-sm text-gray-600 cursor-pointer hover:bg-gray-50 px-2 py-1 rounded"
                    >
                      <input
                        type="checkbox"
                        checked={tempFilters[key].includes(option)}
                        onChange={() => handleToggle(key, option)}
                        className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 transition duration-150"
                      />
                      <span className="ml-2 truncate">{option}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center text-gray-500 py-4">
              No filter options available
            </div>
          )}
        </div>

        {/* Buttons */}
        <div className="mt-5 flex justify-between gap-2">
          <button
            onClick={clearAllFilters}
            className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition"
          >
            Clear All
          </button>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition"
            >
              Cancel
            </button>
            <button
              onClick={applyFilters}
              className="px-3 py-1.5 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
            >
              Apply
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AcademyFilterModel;