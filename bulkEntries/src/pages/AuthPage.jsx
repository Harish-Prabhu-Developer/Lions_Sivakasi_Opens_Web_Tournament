import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-hot-toast";
import AuthTabs from "../components/Auth/AuthTabs";
import LoginForm from "../components/Auth/LoginForm";
import RegisterForm from "../components/Auth/RegisterForm";
import ForgotPasswordForm from "../components/Auth/ForgotPasswordForm";
import { API_URL } from "../constants";
import { decryptData, encryptData } from "../utils/cryptoUtils";
const AuthPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // ✅ Read from URL or fallback
  const tabFromURL = searchParams.get("activeTab") || "login";
  const [activeTab, setActiveTab] = useState(tabFromURL);

  // ✅ Sync tab to URL only when tab changes
  useEffect(() => {
    if (tabFromURL !== activeTab) {
      setSearchParams({ activeTab });
    }
  }, [activeTab, tabFromURL, setSearchParams]);

  // ✅ Shared form state
  const [form, setForm] = useState({
    loginId: "",
    loginPassword: "",
    fullName: "",
    mobile: "",
    email: "",
    academyName: "",
    place: "",
    password: "",
  });

  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");


  // On mount, check if saved login data exists and pre-fill
useEffect(() => {
  const savedEncrypted = localStorage.getItem("rememberedBulkApp");
  if (savedEncrypted) {
    const savedData = decryptData(savedEncrypted);
    if (savedData) {
      setForm(prev => ({
        ...prev,
        loginId: savedData.loginId,
        loginPassword: savedData.loginPassword,
      }));
      setRemember(true);
    }
  }
}, []);


  // ✅ Show error message and clear after timeout
  const showError = (text, duration = 5000) => {
    setErrorMessage(text);
    setTimeout(() => setErrorMessage(""), duration);
  };

  // ✅ Clear error when switching tabs
  useEffect(() => {
    setErrorMessage("");
  }, [activeTab]);

  // ✅ Handle Register
  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");

    try {
      // Validate required fields
      if (!form.fullName || !form.email || !form.mobile || !form.password) {
        showError("Please fill all required fields");
        setLoading(false);
        return;
      }

      // Validate mobile number
      if (!/^[0-9]{10}$/.test(form.mobile)) {
        showError("Please enter a valid 10-digit mobile number");
        setLoading(false);
        return;
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(form.email)) {
        showError("Please enter a valid email address");
        setLoading(false);
        return;
      }

      const response = await axios.post(
        `${API_URL}/api/v2/academy/auth/register`,
        {
          name: form.fullName,
          email: form.email,
          password: form.password,
          phone: form.mobile,
          academyName: form.academyName,
          place: form.place,
        }
      );

      if (response.data.success) {
        toast.success(response.data.msg || "Registration successful!");
               setTimeout(() => setActiveTab("login"), 1500); // smooth UX
      }
    } catch (error) {
      console.error("Registration Error:", error);
      
      if (error.response?.data) {
        showError(error.response.data.msg || "Registration failed");
        toast.error(error.response.data.msg || "Registration failed")
      } else if (error.request) {
        toast.error(error.request.statusText);
        showError("Network error. Please check your connection.");
      } else {
        showError("An unexpected error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  // ✅ Handle Login
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");

    try {
      // Validate required fields
      if (!form.loginId || !form.loginPassword) {
        showError("Please enter both identifier and password");
        setLoading(false);
        return;
      }

      const response = await axios.post(
        `${API_URL}/api/v2/academy/auth/login`,
        {
          identifier: form.loginId,
          password: form.loginPassword,
        }
      );

      if (response.data.success) {
        toast.success(response.data.msg || "Login successful!");
        
        // Store token and user data
        localStorage.setItem("bulkapp_token", response.data.data.token);
        localStorage.setItem("user_bulkapp_Data", JSON.stringify(response.data.data.user));
        
        if (remember) {
          localStorage.setItem(
            "rememberedBulkApp",
            encryptData({
              loginId: form.loginId,
              loginPassword: form.loginPassword,
            })
          );
        } else {
          localStorage.removeItem("rememberedBulkApp");
        }

          navigate("/dashboard");

      }
    } catch (error) {
      console.error("Login Error:", error);

      if (error.response?.data) {
        showError(error.response.data.msg || "Login failed");
        toast.error(error.response.data.msg || "Login failed")
      } else if (error.request) {
        showError("Network error. Please check your connection.");
        toast.error(error.request.statusText);
      } else {
        showError("An unexpected error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  // ✅ Handle Forgot Password
  const handleForgotPassword = async (email) => {
    setLoading(true);
    setErrorMessage("");

    try {
      if (!email) {
        showError("Please enter your email address");
        setLoading(false);
        return;
      }

      const response = await axios.post(
        `${API_URL}/api/v2/academy/auth/forgot-password`,
        { email }
      );

      if (response.data.success) {
        toast.success(response.data.msg || "New password sent to your email!");
        

          setTimeout(() => setActiveTab("login"), 1500); // smooth UX
      }
    } catch (error) {
      console.error("Forgot Password Error:", error);
      
      if (error.response?.data) {
        showError(error.response.data.msg || "Password reset failed");
        toast.error(error.response.data.msg || "Password reset failed")
      } else if (error.request) {
        showError("Network error. Please check your connection.");
        toast.error(error.request.statusText);
      } else {
        showError("An unexpected error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  // ✅ Map tab → form
  const renderForm = () => {
    switch (activeTab) {
      case "login":
        return (
          <LoginForm
            form={form}
            setForm={setForm}
            remember={remember}
            setRemember={setRemember}
            onSubmit={handleLogin}
            loading={loading}
            setActiveTab={setActiveTab}
          />
        );
      case "register":
        return (
          <RegisterForm
            form={form}
            setForm={setForm}
            onSubmit={handleRegister}
            setActiveTab={setActiveTab}
            loading={loading}
          />
        );
      case "forget":
        return (
          <ForgotPasswordForm 
            setActiveTab={setActiveTab} 
            onSubmit={handleForgotPassword}
            loading={loading}
          />
        );
      default:
        navigate("/auth?activeTab=login", { replace: true });
        return null;
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-[#0a0f1f] px-4">
      {/* Title */}
      <h1 className="text-3xl sm:text-4xl font-bold text-cyan-400 mb-8 tracking-wide text-center animate-fadeIn">
        Academy Entries Platform
      </h1>

      {/* Auth Container */}
      <div className="bg-[#111b2e]/80 backdrop-blur-md border border-cyan-400/30 rounded-2xl p-8 w-full max-w-md shadow-2xl animate-fadeIn">
        {/* Show Tabs only for Login/Register */}
        {activeTab !== "forget" && (
          <AuthTabs
            tabs={["Login", "Register"]}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
          />
        )}

        {renderForm()}
        
        {/* Error Message Display */}
        {errorMessage && (
          <div className="mt-4 p-3 bg-red-500/20 border border-red-500 rounded-md text-red-300 text-center animate-fadeIn">
            {errorMessage}
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthPage;