import React from "react";

const PlayerForm = ({ label, form, setForm }) => {
  const fields = [
    "Full Name",
    "TNBA ID",
    "Date of Birth",
    "Academy Name",
    "Place",
    "District",
  ];
  return (
    <div className="w-full bg-[#141c2f]/90 border border-cyan-400/20 rounded-xl p-4 space-y-2 text-left">
      <h3 className="text-cyan-300 font-semibold text-lg mb-2">{label}</h3>
      {fields.map((f) => (
        <input
          key={f}
          placeholder={f}
          type={f === "Date of Birth" ? "date" : "text"}
          value={form[f] || ""}
          onChange={(e) =>
            setForm((prev) => ({ ...prev, [f]: e.target.value }))
          }
          className="w-full bg-cyan-950/20 text-white text-sm border border-cyan-400/30 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-400"
        />
      ))}
    </div>
  );
};

export default PlayerForm;
