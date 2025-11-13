import toast from "react-hot-toast";
import { playerFields } from "../../../constants";

const PlayerForm = ({ currentForm, form, onFormChange, onNext, onBack }) => {
  const isPlayer = currentForm.type === 'player';

  // Use the specific label for the title
  const title = currentForm.label;

  const handleSubmit = (e) => {
    e.preventDefault();
    // Basic validation check (e.g., if all fields are non-empty)
     // Allow tnbaId to be empty, but all other fields must be filled
  const isValid = playerFields.every(field => {
    if (field.key === "tnbaId") return true; // skip validation for tnbaId
    return form[field.key] && form[field.key].trim() !== "";
  });
    console.log("Field: ",playerFields);
    console.log("isValid : ",isValid);
      
    if (!isValid) {
      toast.error(`Please fill in all details for ${title}.`);
      return;
    }

    onNext();
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="bg-[#0d162a] p-6 rounded-xl border border-cyan-400/20 mb-8">
        <h3 className="text-xl font-bold text-cyan-300 mb-6 text-center">{title}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {playerFields.map((field) => (
            <div key={field.key} className="flex flex-col">
              <label htmlFor={field.key} className="text-sm font-medium text-gray-300 mb-1 flex items-center gap-2">
                {field.label}
              </label>
              <input
                id={field.key}
                type={field.type === 'date' ? 'date' : 'text'}
                placeholder={field.type === 'date' ? 'mm/dd/yyyy' : field.label}
                value={form[field.key] || ''}
                onChange={(e) => onFormChange(field.key, e.target.value)}
                disabled={isPlayer&&field.key==="dob"?true:false} //The player dob field is not editable
                required={field.key==="tnbaId"?false:true} //The tnbaId field is not required 
                className={`w-full px-4 py-2 border rounded-lg text-white focus:ring-cyan-500 focus:border-cyan-500 transition-colors duration-200 ${
                  isPlayer && field.key === "dob" 
                    ? "bg-[#1a253f] border-gray-600 text-gray-400 bg-opacity-50 cursor-not-allowed" 
                    : "bg-[#192339] border-cyan-700 focus:ring-cyan-500 focus:border-cyan-500"
                }`}
              />
            </div>
          ))}
        </div>
      </div>
      
      <div className="flex flex-col sm:flex-row justify-between mt-8 gap-4">
        <button
          type="button"
          onClick={onBack}
          className="px-6 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg font-medium transition-all duration-200 w-full sm:w-auto"
        >
          ← Back
        </button>
        <button
          type="submit"
          className="px-8 py-2 bg-linear-to-r from-cyan-500 to-cyan-400 hover:scale-105 text-white font-semibold rounded-lg transition-all duration-200 w-full sm:w-auto"
        >
          {currentForm.isLast
            ? "Next (Review & Payment) →"
            : "Next Player →"}
        </button>
      </div>
    </form>
  );
};

export default PlayerForm;