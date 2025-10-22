import React, { useState } from "react";
import CustomInput from "../CustomInput";
import { Mail, Phone, Eye, EyeOff } from "lucide-react";
import { IsValidEmail, IsValidPhone } from "../../utils/Validation.js";

const LoginForm = ({ form, setForm, remember, setRemember, onSubmit }) => {
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (field) => (e) => setForm({ ...form, [field]: e.target.value });
  const toggleShowPassword = () => setShowPassword((prev) => !prev);

  return (
    <form className="w-full flex flex-col gap-6 animate-fadeIn" onSubmit={onSubmit} autoComplete="on">
      <CustomInput
        label="Email or Phone"
        icon={form.loginId && IsValidPhone(form.loginId) ? Phone : Mail}
        type={form.loginId && IsValidPhone(form.loginId) ? "phone" : "email"}
        name="loginId"
        placeholder="Enter your email or phone"
        autoComplete="username"
        value={form.loginId}
        onChange={handleChange("loginId")}
        error={
          form.loginId &&
          !(IsValidPhone(form.loginId) || IsValidEmail(form.loginId))
            ? "Please enter a valid email or phone number."
            : ""
        }
      />
      <div className="relative">
        <CustomInput
          label="Password"
          type={showPassword ? "text" : "password"}
          name="loginPassword"
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
        <span
          className="cursor-pointer absolute right-4 top-10 text-gray-400 hover:text-cyan-400 transition"
          onClick={toggleShowPassword}
        >
          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
        </span>
      </div>
      <div className="flex items-center text-xs text-cyan-200 w-full mt-[-12px] mb-[8px]">
        <label className="flex items-center cursor-pointer select-none">
          <span className="mr-2 transition-all duration-200">
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
              className="accent-cyan-400 scale-125 rounded border-cyan-400 mr-1"
            />
          </span>
          <span>Remember me</span>
        </label>
        <span className="ml-auto text-gray-400 hover:text-cyan-300 transition underline cursor-pointer">
          Forgot Password?
        </span>
      </div>
      <button
        type="submit"
        className="w-full mt-2 py-3 rounded-xl font-bold bg-gradient-to-r from-cyan-500 to-cyan-400 shadow-xl hover:from-cyan-600 hover:to-cyan-500 active:scale-95 transition-all text-lg text-white ring-1 ring-cyan-400/30"
      >
        Login
      </button>
    </form>
  );
};

export default LoginForm;
