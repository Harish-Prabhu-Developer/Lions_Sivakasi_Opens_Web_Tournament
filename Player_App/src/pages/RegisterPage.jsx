// RegisterPage.jsx
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import LoginForm from "../components/Auth/LoginForm";
import RegisterForm from "../components/Auth/RegisterForm";
import AuthTabs from "../components/Auth/AuthTabs";

const RegisterPage = ({ active = "login" }) => {
  const [activeTab, setActiveTab] = useState(active);
  const [form, setForm] = useState({
    fullName: "",
    mobile: "",
    email: "",
    password: "",
    loginId: "",
    loginPassword: "",
  });
  const [remember, setRemember] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // fetch & set remember data if any
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    // your login code here (including storing remember data)
        // Simulate login
    await localStorage.setItem("IsLoggedIn", JSON.stringify(true));
    await localStorage.setItem("token", "ejfhkjhdsjdhfkj");
    toast.success("Login Successfully");
    navigate("/dashboard");

  };

  const handleRegister = async (e) => {
    e.preventDefault();
    // your register code here
    await localStorage.setItem("IsLoggedIn", JSON.stringify(true));
    await localStorage.setItem("token", "ejfhkjhdsjdhfkj");

    toast.success("Account Created Successfully");
    setActiveTab("login");
  };

  return (
    <div className="min-h-screen flex flex-col items-center pt-20 justify-center bg-gradient-to-br from-[#20273e] to-[#101522] px-2">
      <div className="text-md text-cyan-100 mb-8 opacity-80">Player Registration Portal</div>
      <div className="w-full max-w-sm rounded-2xl bg-white/10 shadow-2xl ring-1 ring-white/10 px-8 py-10 mx-auto flex flex-col items-center backdrop-blur-md border-t border-cyan-400/10 relative overflow-hidden">
        <AuthTabs activeTab={activeTab} setActiveTab={setActiveTab} />
        {activeTab === "login" ? (
          <LoginForm form={form} setForm={setForm} remember={remember} setRemember={setRemember} onSubmit={handleLogin} />
        ) : (
          <RegisterForm form={form} setForm={setForm} onSubmit={handleRegister} setActiveTab={setActiveTab} />
        )}
      </div>
      <div className="mt-5 mb-4">
        <Link to="/">
          <span className="text-cyan-300 hover:underline">&larr; Back to Home</span>
        </Link>
      </div>
      <style>{`
        .animate-fadeIn {
          animation: fadeInUp 0.55s cubic-bezier(.55,1.2,.4,1) both;
        }
        @keyframes fadeInUp {
          0% { opacity: 0; transform: translateY(22px);}
          100% { opacity: 1; transform: translateY(0);}
        }
      `}</style>
    </div>
  );
};

export default RegisterPage;
