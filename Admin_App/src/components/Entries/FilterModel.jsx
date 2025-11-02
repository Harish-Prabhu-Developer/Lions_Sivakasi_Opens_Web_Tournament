import { useState } from "react";

const FilterModel = ({ filters, setFilters, availableFilters, onClose }) => {
  const [tempFilters, setTempFilters] = useState(filters);

  const handleToggle = (key, value) => {
    setTempFilters(prev => ({
      ...prev,
      [key]: prev[key].includes(value)
        ? prev[key].filter(v => v !== value)
        : [...prev[key], value]
    }));
  };

  const applyFilters = () => {
    setFilters(tempFilters);
    onClose();
  };

  return (
    <div className="absolute right-0 mt-2 w-72 origin-top-right bg-white rounded-xl shadow-2xl p-4 z-50 border border-gray-200">
      <h3 className="font-bold text-lg mb-3 text-indigo-700">Filter Entries</h3>
      <div className="space-y-4">
        {Object.entries(availableFilters).map(([key, options]) => (
          <div key={key} className="border-b border-gray-100 pb-3 last:border-b-0">
            <p className="font-medium text-sm mb-2 capitalize text-gray-700">{key.replace('Filter', ' ')}</p>
            <div className="grid grid-cols-2 gap-2">
              {options.map(option => (
                <label key={option} className="flex items-center text-sm text-gray-600 cursor-pointer">
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
      <div className="mt-4 flex justify-end gap-2">
        <button
          onClick={() => { setFilters({}); onClose(); }}
          className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded-lg"
        >
          Clear
        </button>
        <button
          onClick={applyFilters}
          className="px-3 py-1 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
        >
          Apply
        </button>
      </div>
    </div>
  );
};

export default FilterModel;