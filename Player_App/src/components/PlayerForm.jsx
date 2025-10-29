// PlayerForm.jsx
import React, { useContext, useEffect, useState } from "react";
import { User, Hash, Calendar, School, MapPin, LocateIcon } from "lucide-react";
import AuthContext from "./Auth/AuthContext";
import { formatDate } from "../utils/dateUtils";


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
  "Full Name": "",
  "TNBA ID": "",
  "Date of Birth": "",
  "Academy Name": "",
  "Place": "",
  "District": "",
};

// Convert JSON to Array (each field as individual object)
const fieldsArray = Object.keys(fieldsObject).map((key) => ({
  [key]: fieldsObject[key],
}));

const PlayerForm = ({ currentForm, form = {}, setForm }) => {
  const { user } = useContext(AuthContext); // ✅ Get user from context
  const [initialized, setInitialized] = useState(false);

  // ✅ Auto-fill player details from logged-in user (only first time)
useEffect(() => {
  if (user && !initialized) {
    let defaultValues = {};

    // 🧠 Only fill defaultValues for player form
    if (currentForm.type === "player") {
      defaultValues = {
        "Full Name": user.name || "",
        "TNBA ID": user.TNBAID || "",
        "Date of Birth": formatDate(user.dob) || "",
        "Academy Name": user.academy || "",
        "Place": user.place || "",
        "District": user.district || "",
      };
    }

    // 🧩 Populate form fields
    Object.keys(defaultValues).forEach((key) => {
      if (defaultValues[key]) setForm(key, defaultValues[key]);
    });

    setInitialized(true);
  }
}, [user, initialized, setForm, currentForm.type]);


const handleChange = (field) => (e) => {
  let value = e.target.value;
  if (field === "Date of Birth") {
    value = formatDate(value); // ✅ store back as "DD-MM-YYYY"
  }
  setForm(field, value);
};

  return (
    <div className="w-full my-2 px-2 bg-gradient-to-br from-[#202a43]/80 via-[#1d2842]/80 to-[#141d2f]/90 border border-cyan-400/20 rounded-2xl p-1 space-y-3 shadow-xl">
      <h3 className="text-cyan-200 bg-cyan-800/20 rounded-xl font-bold text-lg px-3 py-2 mb-2 tracking-wide shadow text-center">
        {currentForm.label}
      </h3>

      {fieldsArray.map((obj) => {
        const fieldKey = Object.keys(obj)[0];
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
              `}
              autoComplete="off"
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
