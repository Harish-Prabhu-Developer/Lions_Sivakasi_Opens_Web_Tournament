// components/Auth/RegisterForm.jsx
import CustomInput from "../CustomInput";
import { IsValidEmail, IsValidPhone } from "../../utils/Validation";
import { Calendar } from "lucide-react";
import { useRef } from "react";

const RegisterForm = ({ form, setForm, onSubmit, setActiveTab ,loading}) => {
  const inputRef = useRef(null);
  const handleChange = (field) => (e) =>
    setForm({ ...form, [field]: e.target.value });
 // Function to trigger native date picker
  const openDatePicker = () => {
    if (inputRef.current) {
      if (inputRef.current.showPicker) {
        inputRef.current.showPicker(); // Chrome/Edge/Safari
      } else {
        inputRef.current.focus(); // fallback
      }
    }
  };

  return (
    <form
      className="w-full flex flex-col gap-6 animate-fadeIn"
      onSubmit={onSubmit}
      autoComplete="on"
    >
      {/* Full Name */}
      <CustomInput
        label="Full Name"
        type="text"
        name="fullName"
        placeholder="Enter player full name"
        autoComplete="name"
        value={form.fullName}
        onChange={handleChange("fullName")}
        error={
          form.fullName && form.fullName.length < 3
            ? "Full name should be at least 3 characters long."
            : ""
        }
      />

      {/* Gender */}
      <div className="flex flex-col gap-2">
        <label className="text-cyan-100 font-medium tracking-wide">
          Gender
        </label>
        <div className="flex items-center gap-3">
          {["male", "female", "other"].map((option) => (
            <label
              key={option}
              className={`px-4 py-2 rounded-xl cursor-pointer transition-all border-2 ${
                form.gender === option
                  ? "bg-cyan-500/90 text-white border-cyan-400"
                  : "bg-white/10 border-white/20 text-gray-300 hover:bg-white/20"
              }`}
            >
              <input
                type="radio"
                name="gender"
                value={option}
                className="hidden"
                onChange={handleChange("gender")}
              />
              {option}
            </label>
          ))}
        </div>
        
      </div>

      {/* Modern Date of Birth Selector */}
      <div className="flex flex-col gap-2 relative">
        <label className="text-cyan-100 font-medium tracking-wide">
          Date of Birth
        </label>

        <div className="relative group">
          <input
            ref={inputRef}
            type="date"
            name="dob"
            value={form.dob || ""}
            onChange={handleChange("dob")}
            className="w-full appearance-none  bg-[#13192c] text-cyan-100 px-3 py-3 rounded-xl border border-white/20 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/40 transition-all caret-cyan-300 outline-none"
          />
          <Calendar
            size={18}
            className="absolute text-cyan-300/70 right-4 top-1/2 transform -translate-y-1/2 cursor-pointer transition-all group-hover:text-cyan-200"
            onClick={openDatePicker}
          />
        </div>

        {form.dob && new Date(form.dob) > new Date("2022-01-01") && (
          <p className="text-red-400 text-sm mt-1">
            Date of birth should be in the past.
          </p>
        )}
      </div>
      {/* Mobile Number */}
      <CustomInput
        label="Mobile Number"
        type="phone"
        name="mobile"
        placeholder="Enter your mobile number"
        autoComplete="mobile"
        value={form.mobile}
        onChange={handleChange("mobile")}
        error={
          form.mobile && !IsValidPhone(form.mobile)
            ? "Please enter a valid phone number."
            : ""
        }
      />

      {/* Email */}
      <CustomInput
        label="Email Address"
        type="email"
        name="email"
        placeholder="Enter your email"
        autoComplete="username"
        value={form.email}
        onChange={handleChange("email")}
        error={
          form.email && !IsValidEmail(form.email)
            ? "Please enter a valid email."
            : ""
        }
      />

      {/* Password */}
      <CustomInput
        label="Password"
        type="password"
        name="password"
        placeholder="Enter your password"
        autoComplete="new-password"
        value={form.password}
        onChange={handleChange("password")}
        error={
          form.password && form.password.length < 8
            ? "Password should be at least 8 characters long."
            : ""
        }
      />

    <button
      type="submit"
      disabled={loading}
      className={`
        w-full mt-2 py-3 rounded-xl font-bold text-lg text-white shadow-xl ring-1 ring-cyan-400/30 transition-all
        bg-gradient-to-r from-cyan-500 to-cyan-400
        hover:from-cyan-600 hover:to-cyan-500 active:scale-95
        ${loading ? "opacity-70 cursor-not-allowed filter grayscale" : ""}
      `}
    >
      {loading ? "Creating Account..." : "Create Account"}
    </button>


      <div className="text-center text-sm mt-3 text-gray-400">
        Already have an account?{" "}
        <span
          className="text-cyan-300 font-semibold cursor-pointer hover:underline"
          onClick={() => setActiveTab("login")}
        >
          Login here
        </span>
      </div>
      <style>
        {`/* For most browsers */
input[type="date"]::-webkit-calendar-picker-indicator {
  display: none;
}

/* For Firefox */
input[type="date"]::-moz-calendar-picker-indicator {
  display: none;
}

/* For Edge */
input[type="date"]::-ms-clear {
  display: none;
  width: 0;
  height: 0;
}

/* Optional: hack for IE */
input[type="date"] {
  -ms-clear: none;
}
`}
      </style>
    </form>
  );
};

export default RegisterForm;
