import React, { useState } from "react";
import CustomInput from "../CustomInput";
import toast from "react-hot-toast";
import axios from "axios";
import { API_URL } from "../../constants";
import { IsValidEmail } from "../../utils/Validation";

const ForgotPasswordForm = ({ setActiveTab }) => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  // --- Handle Forgot Password ---
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !IsValidEmail(email)) {
      toast.error("Please enter a valid email address.");
      return;
    }

    try {
      setLoading(true);

      const res = await axios.post(`${API_URL}/api/v1/auth/forgot-password`, {
        email,
      });

      if (res.data.success) {
        toast.success(res.data.msg || "OTP sent successfully!");
        // Optionally redirect to OTP verification screen
        // navigate("/verify-otp", { state: { email } });
      } else {
        toast.error(res.data.msg || "Failed to send OTP.");
      }
    } catch (error) {
      console.error("Forgot Password Error:", error);
      const msg =
        error.response?.data?.msg ||
        (error.response?.status === 500
          ? "Server error. Please try again later."
          : "Network error. Check your connection.");
      toast.error(msg);
    } finally {
      setLoading(false);
    }
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

      {/* Email Input */}
      <CustomInput
        label="Email Address"
        type="email"
        name="email"
        placeholder="Enter your registered email"
        autoComplete="username"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        error={
          email && !IsValidEmail(email) ? "Please enter a valid email." : ""
        }
      />

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading}
        className={`
                w-full mt-2 py-3 rounded-xl font-bold shadow-xl text-lg text-white ring-1 ring-cyan-400/30 transition-all
                ${
                loading
                    ? "bg-cyan-400/60 cursor-not-allowed filter grayscale opacity-70"
                    : "bg-gradient-to-r from-cyan-500 to-cyan-400 hover:from-cyan-600 hover:to-cyan-500 active:scale-95"
                }
            `}
      >
        {loading ? "Sending New Password..." : "Send New Password"}
      </button>

      {/* Back to Login */}
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
