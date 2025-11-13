// components/Auth/LoginForm.jsx
import React, { useState } from "react";
import { Loader, Lock, Mail, Phone, Eye, EyeOff } from "lucide-react";
import { IsValidEmail, IsValidPhone } from "../../utils/Validation.js";
import { CustomInput } from "../CustomInput.jsx";

const LoginForm = ({
  form,
  setForm,
  remember,
  setRemember,
  onSubmit,
  loading,
  setActiveTab,

}) => {
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  return (
    <form
      className="w-full flex flex-col gap-6 animate-fadeIn"
      onSubmit={onSubmit}
      autoComplete="on"
    >

{/* Email or Phone */}
<CustomInput
  label="Email or Phone"
  type={IsValidPhone(form.loginId) ? "tel" : "email"}
  IconType={IsValidPhone(form.loginId) ? Phone : Mail}
  name="loginId"
  placeholder="Enter your email or phone"
  autoComplete="username"
  value={form.loginId}
  onChange={(e) => {
    let value = e.target.value;

    // 🧩 Optional: Auto-detect numeric input and restrict to 10 digits
    if (/^\d+$/.test(value)) {
      value = value.replace(/\D/g, '').slice(0, 10);
    }

    // ✅ Update form state
    setForm((prev) => ({ ...prev, loginId: value }));
  }}
  error={
    form.loginId &&
    !(IsValidPhone(form.loginId) || IsValidEmail(form.loginId))
      ? "Please enter a valid email or phone number."
      : ""
  }
/>


      {/* Password */}
      <div className="relative">
        <CustomInput
          label="Password"
          type={showPassword ? "text" : "password"}
          name="loginPassword"
          IconType={Lock}
          placeholder="Enter your password"
          autoComplete="current-password"
          value={form.loginPassword}
          onChange={handleChange("loginPassword")}
          error={
            form.loginPassword && form.loginPassword.length < 8
              ? "Password should be at least 8 characters long."
              : ""
          }
        />
        <button
          type="button"
          className="absolute right-3 top-14 transform -translate-y-1/2 text-cyan-400 hover:text-cyan-300 transition-colors"
          onClick={() => setShowPassword(!showPassword)}
        >
          {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
        </button>
      </div>

      {/* Remember Me / Forgot Password */}
      <div className="flex items-center text-xs text-cyan-200 w-full -mt-2 mb-2">
        <label className="flex items-center cursor-pointer select-none">
          <input
            type="checkbox"
            checked={remember}
            onChange={(e) => setRemember(e.target.checked)}
            className="accent-cyan-400 w-3 h-3 mr-2 scale-125 rounded border-cyan-400"
          />
          Remember me
        </label>
        <span
          className="ml-auto text-gray-400 hover:text-cyan-300 transition underline cursor-pointer"
          onClick={() => setActiveTab("forget")}
        >
          Forgot Password?
        </span>
      </div>

      <button
        type="submit"
        disabled={loading}
        className={`w-full mt-2 py-3 rounded-xl font-bold text-lg text-white shadow-xl ring-1 ring-cyan-400/30 transition-all
          flex justify-center items-center
          ${
            loading
              ? "cursor-not-allowed bg-gray-500"
              : "bg-linear-to-r from-cyan-500 to-cyan-400 hover:from-cyan-600 hover:to-cyan-500 active:scale-95 cursor-pointer"
          }`}
      >
        {loading ? <Loader className="animate-spin h-6 w-6" /> : "Login"}
      </button>
    </form>
  );
};

export default LoginForm;