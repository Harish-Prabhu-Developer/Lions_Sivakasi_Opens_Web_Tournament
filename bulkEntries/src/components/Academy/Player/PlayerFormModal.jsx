import React, { useState, useEffect, useRef } from "react";
import { User, Award, CalendarDays, MapPin, Loader2, Users, Venus, Mars } from "lucide-react";

const PlayerFormModal = ({ editingPlayer, playerForm, onInputChange, onSubmit, onClose, loading }) => {
  const [dropdownOpen, setDropdownOpen] = useState({
    gender: false
  });
  
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen({ gender: false });
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const iconMap = {
    "Full Name": <User className="w-4 h-4 text-cyan-400" />,
    "TNBA ID": <Award className="w-4 h-4 text-cyan-400" />,
    "Date of Birth": <CalendarDays className="w-4 h-4 text-cyan-400" />,
    "Gender": <Users className="w-4 h-4 text-cyan-400" />,
    "Academy": <Award className="w-4 h-4 text-cyan-400" />,
    "Place": <MapPin className="w-4 h-4 text-cyan-400" />,
    "District": <MapPin className="w-4 h-4 text-teal-300" />,
  };

  // Gender options with display labels and backend values
  const genderOptions = [
    { label: "Boys", value: "male" },
    { label: "Girls", value: "female" }
  ];

  const formFields = [
    { label: "Full Name", key: "fullName", type: "text", required: true },
    { label: "TNBA ID", key: "tnbaId", type: "text", required: false },
    { label: "Date of Birth", key: "dob", type: "date", required: true },
    { 
      label: "Gender", 
      key: "gender", 
      type: "select", 
      required: true, 
      options: genderOptions 
    },
    { label: "Academy", key: "academy", type: "text", required: true },
    { label: "Place", key: "place", type: "text", required: true },
    { label: "District", key: "district", type: "text", required: true },
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(e);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-linear-to-br from-[#1e293b] to-[#0f172a] border border-cyan-400/20 rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <h3 className="text-xl font-semibold text-cyan-300 mb-6 flex items-center gap-2">
          <User className="w-5 h-5" />
          {editingPlayer ? 'Edit Player' : 'Add New Player'}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          {formFields.map(({ label, key, type, required, options }) => (
            <div key={key} className="flex flex-col">
              <label className="text-sm text-cyan-300 font-semibold flex items-center gap-2 pb-2">
                {iconMap[label]} <span>{label}{required && ' *'}</span>
              </label>
              
              {type === "select" ? (
                <div className="relative" ref={dropdownRef}>
                  <button
                    type="button"
                    onClick={() => setDropdownOpen(prev => ({ ...prev, [key]: !prev[key] }))}
                    className="w-full px-3 py-2 rounded-lg bg-[#141C2F] border border-cyan-800 text-gray-200 font-medium focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-all text-left flex items-center justify-between"
                    disabled={loading}
                  >
                    <div className="flex items-center gap-2">
                      {playerForm[key] ? (
                        <>
                          {playerForm[key] === 'female' ? (
                            <Venus className="w-4 h-4 text-pink-400" />
                          ) : (
                            <Mars className="w-4 h-4 text-blue-400" />
                          )}
                          <span>{playerForm[key] === 'female' ? 'Girls' : 'Boys'}</span>
                        </>
                      ) : (
                        <span>Select Category</span>
                      )}
                    </div>
                    <svg className={`w-4 h-4 text-cyan-400 transition-transform ${dropdownOpen[key] ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  
                  {dropdownOpen[key] && (
                    <div className="absolute z-10 w-full mt-1 bg-[#1e293b] border border-cyan-800 rounded-lg shadow-lg">
                      {options?.map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => {
                            onInputChange(key, option.value);
                            setDropdownOpen(prev => ({ ...prev, [key]: false }));
                          }}
                          className="w-full px-3 py-2 text-left hover:bg-cyan-900/30 transition-colors flex items-center gap-2"
                        >
                          {option.label === "Girls" ? (
                            <Venus className="w-4 h-4 text-pink-400" />
                          ) : (
                            <Mars className="w-4 h-4 text-blue-400" />
                          )}
                          <span className="text-gray-200">{option.label}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <input
                  type={type}
                  value={playerForm[key]}
                  onChange={(e) => onInputChange(key, e.target.value)}
                  className="px-3 py-2 rounded-lg bg-[#141C2F] border border-cyan-800 text-gray-200 font-medium focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-all"
                  placeholder={`Enter ${label}`}
                  required={required}
                  disabled={loading}
                />
              )}
            </div>
          ))}

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-linear-to-r from-cyan-500 to-cyan-400 hover:from-cyan-400 hover:to-cyan-300 text-white font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {editingPlayer ? 'Updating...' : 'Adding...'}
                </>
              ) : (
                editingPlayer ? 'Update Player' : 'Add Player'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PlayerFormModal;