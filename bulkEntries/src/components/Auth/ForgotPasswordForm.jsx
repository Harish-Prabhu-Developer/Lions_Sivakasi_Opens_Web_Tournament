// components/Auth/ForgotPasswordForm.jsx
import React, { useState } from "react";
import { IsValidEmail } from "../../utils/Validation";
import { Loader, Mail } from "lucide-react";
import { CustomInput } from "../CustomInput";

const ForgotPasswordForm = ({ setActiveTab, onSubmit, loading}) => {
  const [email, setEmail] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(email);
  };

  return (
    <form
      className="w-full flex flex-col gap-6 animate-fadeIn"
      onSubmit={handleSubmit}
      autoComplete="on"
    >
      <h2 className="text-cyan-100 text-center font-semibold text-lg mb-2">
        Forgot Password
      </h2>

      <CustomInput
        label="Email Address"
        type="email"
        name="email"
        IconType={Mail}
        placeholder="Enter your registered email"
        autoComplete="username"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        error={
          email && !IsValidEmail(email) ? "Please enter a valid email." : ""
        }
      />

      <button
        type="submit"
        disabled={loading}
        className={`w-full flex items-center justify-center mt-2 py-3 rounded-xl font-bold shadow-xl text-lg text-white ring-1 ring-cyan-400/30 transition-all
          ${
            loading
              ? "cursor-not-allowed bg-gray-500"
              : "bg-linear-to-r from-cyan-500 to-cyan-400 hover:from-cyan-600 hover:to-cyan-500 active:scale-95"
          }`}
      >
        {loading ? <Loader className="animate-spin h-6 w-6" /> : "Send New Password"}
      </button>

      <div className="text-center text-sm mt-4 text-gray-400">
        Remember your password?{" "}
        <span
          className="text-cyan-300 font-semibold cursor-pointer hover:underline"
          onClick={() => setActiveTab("login")}
        >
          Back to Login
        </span>
      </div>
    </form>
  );
};

export default ForgotPasswordForm;