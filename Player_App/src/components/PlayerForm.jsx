import React from "react";
import { User, Hash, Calendar, School, MapPin, LocateIcon } from "lucide-react";

const iconMap = {
  "Full Name": <User className="w-5 h-5 text-cyan-300" />,
  "TNBA ID": <Hash className="w-5 h-5 text-cyan-300" />,
  "Date of Birth": <Calendar className="w-5 h-5 text-cyan-300" />,
  "Academy Name": <School className="w-5 h-5 text-cyan-300" />,
  "Place": <MapPin className="w-5 h-5 text-cyan-300" />,
  "District": <LocateIcon className="w-5 h-5 text-cyan-300" />,
};

const fields = [
  "Full Name",
  "TNBA ID",
  "Date of Birth",
  "Academy Name",
  "Place",
  "District",
];

const PlayerForm = ({ label, form = {}, setForm }) => {
  const handleChange = (field) => (e) => {
    const updated = { ...form, [field]: e.target.value };
    setForm(updated);
    console.log(`[${label}]`, updated);
  };

  return (
    <div className="w-full bg-gradient-to-br from-[#202a43]/80 via-[#1d2842]/80 to-[#141d2f]/90 border border-cyan-400/20 rounded-2xl p-5 space-y-3 shadow-xl">
      <h3 className="text-cyan-200 bg-cyan-800/20 rounded-xl font-bold text-lg px-3 py-2 mb-2 tracking-wide shadow text-center">
        {label}
      </h3>
      {fields.map((f) => (
        <label
          key={f}
          className="flex items-center gap-2 bg-[#102032]/70 border-2 border-cyan-800/20 rounded-lg px-3 py-2 focus-within:border-cyan-400 transition-all shadow-inner"
        >
          <span>{iconMap[f]}</span>
          <input
            className="w-full bg-transparent outline-none border-none text-white text-base placeholder:text-cyan-300/60 py-2 px-1"
            placeholder={f}
            type={f === "Date of Birth" ? "date" : "text"}
            value={form[f] || ""}
            onChange={handleChange(f)}
            autoComplete="off"
          />
        </label>
      ))}
    </div>
  );
};

export default PlayerForm;
