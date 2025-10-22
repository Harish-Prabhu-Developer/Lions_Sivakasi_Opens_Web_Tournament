import React from "react";
import CustomInput from "../CustomInput";
import { IsValidEmail, IsValidPhone } from "../../utils/Validation";

const RegisterForm = ({ form, setForm, onSubmit, setActiveTab }) => {
  const handleChange = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  return (
    <form className="w-full flex flex-col gap-6 animate-fadeIn" onSubmit={onSubmit} autoComplete="on">
      <CustomInput
        label="Full Name"
        type="text"
        name="fullName"
        placeholder="Enter your full name"
        autoComplete="name"
        value={form.fullName}
        onChange={handleChange("fullName")}
        error={form.fullName && form.fullName.length < 3 ? "Full name should be at least 3 characters long." : ""}
      />
      <CustomInput
        label="Mobile Number"
        type="phone"
        name="mobile"
        placeholder="Enter your mobile number"
        autoComplete="mobile"
        value={form.mobile}
        onChange={handleChange("mobile")}
        error={form.mobile && !IsValidPhone(form.mobile) ? "Please enter a valid phone number." : ""}
      />
      <CustomInput
        label="Email Address"
        type="email"
        name="email"
        placeholder="Enter your email"
        autoComplete="username"
        value={form.email}
        onChange={handleChange("email")}
        error={form.email && !IsValidEmail(form.email) ? "Please enter a valid email." : ""}
      />
      <CustomInput
        label="Password"
        type="password"
        name="password"
        placeholder="Enter your password"
        autoComplete="new-password"
        value={form.password}
        onChange={handleChange("password")}
        error={form.password && form.password.length < 8 ? "Password should be at least 8 characters long." : ""}
      />
      <button
        type="submit"
        className="w-full mt-2 py-3 rounded-xl font-bold bg-gradient-to-r from-cyan-500 to-cyan-400 shadow-xl hover:from-cyan-600 hover:to-cyan-500 active:scale-95 transition-all text-lg text-white ring-1 ring-cyan-400/30"
      >
        Create Account
      </button>
      <div className="text-center text-sm mt-3 text-gray-400">
        Already have an account?{" "}
        <span className="text-cyan-300 font-semibold cursor-pointer hover:underline" onClick={() => setActiveTab("login")}>
          Login here
        </span>
      </div>
    </form>
  );
};

export default RegisterForm;
