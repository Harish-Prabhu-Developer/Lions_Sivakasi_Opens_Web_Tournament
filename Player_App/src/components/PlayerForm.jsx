import React from "react";
import { User, Hash, Calendar, School, MapPin, LocateIcon } from "lucide-react";
import CustomInput from "./CustomInput";
// Icons mapping per label
const iconMap = {
  "Full Name": <User className="w-5 h-5 text-cyan-300" />,
  "TNBA ID": <Hash className="w-5 h-5 text-cyan-300" />,
  "Date of Birth": <Calendar className="w-5 h-5 text-cyan-300" />,
  "Academy Name": <School className="w-5 h-5 text-cyan-300" />,
  "Place": <MapPin className="w-5 h-5 text-cyan-300" />,
  "District": <LocateIcon className="w-5 h-5 text-cyan-300" />,
};

// Original JSON fields
const fieldsObject = {
  "Full Name": " ",
  "TNBA ID": "",
  "Date of Birth": "10-09-2006",
  "Academy Name": "",
  "Place": "",
  "District": "",
};

// Convert JSON to Array (each field as individual object)
const fieldsArray = Object.keys(fieldsObject).map((key) => ({
  [key]: fieldsObject[key],
}));

const PlayerForm = ({ label, form = {}, setForm }) => {
  const handleChange = (field) => (e) => {
    const value = e.target.value;
    setForm(field, value);
  };

  return (
    <div className="w-full my-2 px-2 bg-gradient-to-br from-[#202a43]/80 via-[#1d2842]/80 to-[#141d2f]/90 border border-cyan-400/20 rounded-2xl p-1 space-y-3 shadow-xl">
      <h3 className="text-cyan-200 bg-cyan-800/20 rounded-xl font-bold text-lg px-3 py-2 mb-2 tracking-wide shadow text-center">
        {label}
      </h3>

{fieldsArray.map((obj) => {
  const fieldKey = Object.keys(obj)[0];
  const fieldLabel = obj[fieldKey];
  return (
    <div className="relative mt-6" key={fieldKey}>
  <input
    type={fieldKey === "Date of Birth" ? "date" : "text"}
    id={fieldKey}
    value={form[fieldKey] || ""}
    onChange={handleChange(fieldKey)}
    placeholder=" "
    className={`
      ${fieldKey === "Date of Birth" ? "appearance-none focus:appearance-none" : ""}
      peer w-full rounded-xl
      px-4 py-4
      text-cyan-100
      bg-[#101e33]/80
      border-2 border-cyan-900/60
      focus:border-cyan-400
      outline-none transition
      shadow-lg
      focus:bg-[#13223b]/90
      disabled:opacity-60
      text-base
      
    autoComplete="off"`}
  />
  <label
    htmlFor={fieldKey}
    className="
      absolute left-4 -top-2 text-cyan-400 bg-[#101e33]
      rounded-md px-2 py-0
      transition-all duration-200
      origin-top-left pointer-events-none
      flex items-center gap-2
      text-sm
      peer-placeholder-shown:top-4 peer-placeholder-shown:text-cyan-300 peer-placeholder-shown:bg-transparent
      peer-placeholder-shown:text-base
      peer-focus:scale-90 peer-focus:-translate-y-1 peer-focus:text-cyan-200 peer-focus:bg-[#101e33]
      "
  >
    {iconMap[fieldKey]}
    {fieldKey}
  </label>
</div>

  );
})}

    </div>
  );
};

export default PlayerForm;
