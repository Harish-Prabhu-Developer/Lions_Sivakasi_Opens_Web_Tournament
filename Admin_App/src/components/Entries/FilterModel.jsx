import { useState } from "react";

const FilterModel = ({ filters, setFilters, availableFilters, onClose }) => {
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
          Filter Entries
        </h3>

        {/* Filter Sections */}
        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
          {Object.entries(availableFilters).map(([key, options]) => (
            <div
              key={key}
              className="border-b border-gray-100 pb-3 last:border-b-0"
            >
              <p className="font-medium text-sm mb-2 capitalize text-gray-700">
                {key.replace("Filter", "")}
              </p>
              <div className="grid grid-cols-2 gap-2">
                {options.map((option) => (
                  <label
                    key={option}
                    className="flex items-center text-sm text-gray-600 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={tempFilters[key].includes(option)}
                      onChange={() => handleToggle(key, option)}
                      className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 transition duration-150"
                    />
                    <span className="ml-2 capitalize truncate">{option}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Buttons */}
        <div className="mt-5 flex justify-end gap-2">
          <button
            onClick={() => {
              setFilters({ categoryFilter: [], statusFilter: [] });
              onClose();
            }}
            className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition"
          >
            Clear
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
  );
};

export default FilterModel;
