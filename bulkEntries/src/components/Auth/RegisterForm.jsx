// components/Auth/RegisterForm.jsx
import React, { useState } from "react";
import { IsValidEmail, IsValidPhone } from "../../utils/Validation";
import { Lock, GraduationCap, Mail, MapPin, Phone, Loader, Eye, EyeOff } from "lucide-react";
import { CustomInput } from "../CustomInput";
import { handlePhoneChange, handlePhoneValue } from "../../utils/phoneFormat";

const RegisterForm = ({ form, setForm, onSubmit, setActiveTab, loading }) => {
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

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
        placeholder="Enter your full name"
        autoComplete="name"
        value={form.fullName}
        onChange={handleChange("fullName")}
        error={
          form.fullName && form.fullName.length < 3
            ? "Full name should be at least 3 characters long."
            : ""
        }
      />

      {/* Mobile */}
      <CustomInput
        label="Mobile Number"
        type="tel"
        name="mobile"
        IconType={Phone}
        placeholder='Enter your mobile number'
        autoComplete="tel"
        value={handlePhoneValue(form.mobile)}
        onChange={(e) => {
            const formattedValue = handlePhoneChange(e); // 👈 handles formatting logic
            setForm((prev) => ({ ...prev, mobile: formattedValue.replace('+91 ', '').replace(/\s/g, '') }));
            // 👆 stores only digits in state (without +91 / spaces)
          }}
        error={
          form.mobile && !IsValidPhone(form.mobile)
            ? "Please enter a valid 10-digit phone number."
            : ""
        }
      />

      {/* Email */}
      <CustomInput
        label="Email Address"
        type="email"
        name="email"
        IconType={Mail}
        placeholder="Enter your email"
        autoComplete="email"
        value={form.email}
        onChange={handleChange("email")}
        error={
          form.email && !IsValidEmail(form.email)
            ? "Please enter a valid email."
            : ""
        }
      />

      {/* Academy Name */}
      <CustomInput
        label="Academy Name"
        type="text"
        name="academyName"
        IconType={GraduationCap}
        placeholder="Enter your Academy Name"
        autoComplete="organization"
        value={form.academyName}
        onChange={handleChange("academyName")}
        error={
          form.academyName && form.academyName.length < 3
            ? "Academy Name should be at least 3 characters long."
            : ""
        }
      />

      {/* Place */}
      <CustomInput
        label="Place"
        type="text"
        name="place"
        IconType={MapPin}
        placeholder="Enter your city, e.g., Sivakasi"
        autoComplete="address-level2"
        value={form.place}
        onChange={handleChange("place")}
        error={
          form.place && form.place.length < 3
            ? "Place should be at least 3 characters long."
            : ""
        }
      />

      {/* Password */}
      <div className="relative">
        <CustomInput
          label="Password"
          type={showPassword ? "text" : "password"}
          name="password"
          IconType={Lock}
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
          type="button"
          className="absolute right-3 top-12 text-cyan-400 hover:text-cyan-300 transition-colors"
          onClick={() => setShowPassword(!showPassword)}
        >
          {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
        </button>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={loading}
        className={`w-full mt-2 py-3 rounded-xl font-bold flex justify-center items-center text-lg text-white shadow-xl ring-1 ring-cyan-400/30 transition-all
          ${
            loading
              ? "cursor-not-allowed bg-gray-500"
              : "bg-linear-to-r from-cyan-500 to-cyan-400 hover:from-cyan-600 hover:to-cyan-500 active:scale-95 cursor-pointer"
          }`}
      >
        {loading ? <Loader className="animate-spin h-6 w-6" /> : "Create Account"}
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
    </form>
  );
};

export default RegisterForm;