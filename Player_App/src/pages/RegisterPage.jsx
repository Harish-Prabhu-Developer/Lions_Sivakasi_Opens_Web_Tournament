// RegisterPage.jsx
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import LoginForm from "../components/Auth/LoginForm";
import RegisterForm from "../components/Auth/RegisterForm";
import AuthTabs from "../components/Auth/AuthTabs";
import axios from "axios";
import { useContext } from "react";
import AuthContext from "../components/Auth/AuthContext";
import { decryptData, encryptData } from "../utils/cryptoUtils";
import { API_URL } from "../constants";
import ForgotPasswordForm from "../components/Auth/ForgotPasswordForm";
const RegisterPage = ({ active = "login" }) => {
  const [activeTab, setActiveTab] = useState(active);
  const [form, setForm] = useState({
    fullName: "",
    gender: "",
    dob: "",
    mobile: "",
    email: "",
    password: "",
    loginId: "",
    loginPassword: "",
  });
  const [loading, setLoading] = useState({
    login: false,
    register: false,
  });
  const [remember, setRemember] = useState(false);
  const navigate = useNavigate();
  const { setUser, setIsLoggedIn } = useContext(AuthContext);
  // On mount, check if saved login data exists and pre-fill
  useEffect(() => {
    const savedEncrypted = localStorage.getItem("rememberedLogin");
    if (savedEncrypted) {
      const savedData = decryptData(savedEncrypted);
      if (savedData) {
        setForm({
          ...form,
          loginId: savedData.loginId,
          loginPassword: savedData.loginPassword,
        });
        setRemember(true);
      }
    }
  }, []);

  // ======== LOGIN HANDLER =========
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      setLoading({ ...loading, login: true });
      const res = await axios.post(`${API_URL}/api/v1/auth/login`, {
        identifier: form.loginId,
        password: form.loginPassword,
      });

      if (res.data.success) {
        const { user, token } = res.data.data;
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user)); // ✅ store user too
        setUser(user);
        setIsLoggedIn(true); // ✅ optional, ensures immediate UI sync

        if (remember) {
          localStorage.setItem(
            "rememberedLogin",
            encryptData({
              loginId: form.loginId,
              loginPassword: form.loginPassword,
            })
          );
        } else {
          localStorage.removeItem("rememberedLogin");
        }

        toast.success(res.data.msg || "Login successful!");
        navigate("/dashboard");
      } else {
        toast.error(res.data.msg || "Login failed. Please try again.");
      }
    } catch (error) {
      console.error("Login Error:", error);
      const serverMsg =
        error.response?.data?.msg ||
        (error.response?.status === 500
          ? "Server error. Please try again later."
          : "Network error. Check your connection.");
      toast.error(serverMsg);
    } finally {
      setLoading({ ...loading, login: false });
    }
  };

  // ======== REGISTER HANDLER =========
  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      setLoading({ ...loading, register: true });
      const registerData = {
        name: form.fullName,
        email: form.email,
        password: form.password,
        phone: form.mobile,
        dob: form.dob,
        gender: form.gender,
      };

      const res = await axios.post(
        `${API_URL}/api/v1/auth/register`,
        registerData
      );

      if (res.data.success) {
        toast.success(res.data.msg || "Registration successful!");
        setForm({
          fullName: "",
          gender: "",
          dob: "",
          mobile: "",
          email: "",
          password: "",
        });
        setActiveTab("login");
      } else {
        toast.error(res.data.msg || "Registration failed.");
      }
    } catch (error) {
      console.error("Register Error:", error);
      const serverMsg =
        error.response?.data?.msg ||
        (error.response?.status === 500
          ? "Server error. Please try again later."
          : "Network error. Check your connection.");
      toast.error(serverMsg);
    } finally {
      setLoading({ ...loading, register: false });
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center pt-20 justify-center bg-gradient-to-br from-[#20273e] to-[#101522] px-2">
      <div className="text-md text-cyan-100 mb-8 opacity-80">
        Player Registration Portal
      </div>
      <div className="w-full max-w-sm rounded-2xl bg-white/10 shadow-2xl ring-1 ring-white/10 px-8 py-10 mx-auto flex flex-col items-center backdrop-blur-md border-t border-cyan-400/10 relative overflow-hidden">
        {(activeTab === "login" || activeTab === "register") && (
          <AuthTabs activeTab={activeTab} setActiveTab={setActiveTab} />
        )}

        {activeTab === "login" ? (
          <LoginForm
            form={form}
            setForm={setForm}
            remember={remember}
            setRemember={setRemember}
            setActiveTab={setActiveTab}
            onSubmit={handleLogin}
            loading={loading.login}
          />
        ) : activeTab === "register" ? (
          <RegisterForm
            form={form}
            setForm={setForm}
            onSubmit={handleRegister}
            setActiveTab={setActiveTab}
            loading={loading.register}
          />
        ) : (
          <ForgotPasswordForm setActiveTab={setActiveTab} />
        )}
      </div>
      <div className="mt-5 mb-4">
        <Link to="/">
          <span className="text-cyan-300 hover:underline">
            &larr; Back to Home
          </span>
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
