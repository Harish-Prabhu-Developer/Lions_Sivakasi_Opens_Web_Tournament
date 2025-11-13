// components/Academy/PlayerFormModal.jsx
import React from "react";
import { User, Award, CalendarDays, MapPin } from "lucide-react";

const PlayerFormModal = ({ editingPlayer, playerForm, onInputChange, onSubmit, onClose }) => {
  const iconMap = {
    "Full Name": <User className="w-4 h-4 text-cyan-400" />,
    "TNBA ID": <Award className="w-4 h-4 text-cyan-400" />,
    "Date of Birth": <CalendarDays className="w-4 h-4 text-cyan-400" />,
    "Academy": <Award className="w-4 h-4 text-cyan-400" />,
    "Place": <MapPin className="w-4 h-4 text-cyan-400" />,
    "District": <MapPin className="w-4 h-4 text-teal-300" />,
  };

  const formFields = [
    { label: "Full Name", key: "fullName", type: "text", required: true },
    { label: "TNBA ID", key: "tnbaId", type: "text", required: false },
    { label: "Date of Birth", key: "dob", type: "date", required: true },
    { label: "Academy", key: "academy", type: "text", required: true },
    { label: "Place", key: "place", type: "text", required: true },
    { label: "District", key: "district", type: "text", required: true },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-linear-to-br from-[#1e293b] to-[#0f172a] border border-cyan-400/20 rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <h3 className="text-xl font-semibold text-cyan-300 mb-6 flex items-center gap-2">
          <User className="w-5 h-5" />
          {editingPlayer ? 'Edit Player' : 'Add New Player'}
        </h3>

        <form onSubmit={onSubmit} className="space-y-4">
          {formFields.map(({ label, key, type, required }) => (
            <div key={key} className="flex flex-col">
              <label className="text-sm text-cyan-300 font-semibold flex items-center gap-2 pb-2">
                {iconMap[label]} <span>{label}{required && ' *'}</span>
              </label>
              <input
                type={type}
                value={playerForm[key]}
                onChange={(e) => onInputChange(key, e.target.value)}
                className="px-3 py-2 rounded-lg bg-[#141C2F] border border-cyan-800 text-gray-200 font-medium focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-all"
                placeholder={`Enter ${label}`}
                required={required}
              />
            </div>
          ))}

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-linear-to-r from-cyan-500 to-cyan-400 hover:from-cyan-400 hover:to-cyan-300 text-white font-semibold rounded-lg transition-all"
            >
              {editingPlayer ? 'Update Player' : 'Add Player'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PlayerFormModal;