// RegisterPage.jsx
import React, { useState } from 'react';
import { Mail, Lock, User, Phone } from 'lucide-react';

const RegisterPage = () => {
  const [activeTab, setActiveTab] = useState("login");

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#20273e] to-[#101522] px-2">

      <span className="text-md text-cyan-100 mb-8 opacity-80">Player Registration Portal</span>

      {/* Card */}
      <div className="w-full max-w-sm rounded-2xl bg-[#181f33]/90 border border-cyan-400/10 shadow-xl px-8 py-10 mx-auto flex flex-col items-center">
        {/* Tabs */}
        <div className="flex w-full mb-8 bg-[#142039]/80 rounded-xl overflow-hidden">
          <button
            className={`flex-1 py-3 font-semibold text-base transition-all ${activeTab==="login"
              ? "text-white bg-gradient-to-r from-cyan-500 to-cyan-400 shadow-md"
              : "text-gray-300"
            }`}
            onClick={() => setActiveTab("login")}
          >
            Login
          </button>
          <button
            className={`flex-1 py-3 font-semibold text-base transition-all ${activeTab==="register"
              ? "text-white bg-gradient-to-r from-cyan-500 to-cyan-400 shadow-md"
              : "text-gray-300"
            }`}
            onClick={() => setActiveTab("register")}
          >
            Register
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === "login" ? (
          <form className="w-full flex flex-col gap-6 animate-fadeIn">
            <div>
              <label className="text-gray-300 text-sm font-medium mb-1 block">Email Address</label>
              <div className="relative">
                <Mail className="absolute top-3 left-3 w-5 h-5 text-cyan-400" />
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="w-full py-3 pl-11 pr-4 rounded-lg bg-[#13192c] text-white border border-cyan-500/10 focus:border-cyan-500 outline-none"
                  autoComplete="username"
                />
              </div>
            </div>
            <div>
              <label className="text-gray-300 text-sm font-medium mb-1 block">Password</label>
              <div className="relative">
                <Lock className="absolute top-3 left-3 w-5 h-5 text-cyan-400" />
                <input
                  type="password"
                  placeholder="Enter your password"
                  className="w-full py-3 pl-11 pr-4 rounded-lg bg-[#13192c] text-white border border-cyan-500/10 focus:border-cyan-500 outline-none"
                  autoComplete="current-password"
                />
              </div>
            </div>
            <button
              type="submit"
              className="w-full mt-2 py-3 rounded-lg font-semibold bg-gradient-to-r from-cyan-500 to-cyan-400 shadow-md hover:from-cyan-600 hover:to-cyan-500 active:scale-95 transition-all text-lg text-white"
            >
              Login
            </button>
            <div className="text-center text-sm mt-3 text-gray-400">
              Don't have an account?{" "}
              <span
                className="text-cyan-300 font-semibold cursor-pointer hover:underline"
                onClick={() => setActiveTab("register")}
              >
                Register here
              </span>
            </div>
          </form>
        ) : (
          <form className="w-full flex flex-col gap-6 animate-fadeIn">
            <div>
              <label className="text-gray-300 text-sm font-medium mb-1 block">Full Name</label>
              <div className="relative">
                <User className="absolute top-3 left-3 w-5 h-5 text-cyan-400" />
                <input
                  type="text"
                  placeholder="Enter your full name"
                  className="w-full py-3 pl-11 pr-4 rounded-lg bg-[#13192c] text-white border border-cyan-500/10 focus:border-cyan-500 outline-none"
                  autoComplete="name"
                />
              </div>
            </div>
            <div>
              <label className="text-gray-300 text-sm font-medium mb-1 block">Mobile Number</label>
              <div className="relative">
                <Phone className="absolute top-3 left-3 w-5 h-5 text-cyan-400" />
                <input
                  type="tel"
                  placeholder="Enter your mobile number"
                  className="w-full py-3 pl-11 pr-4 rounded-lg bg-[#13192c] text-white border border-cyan-500/10 focus:border-cyan-500 outline-none"
                  autoComplete="tel"
                />
              </div>
            </div>
            <div>
              <label className="text-gray-300 text-sm font-medium mb-1 block">Email Address</label>
              <div className="relative">
                <Mail className="absolute top-3 left-3 w-5 h-5 text-cyan-400" />
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="w-full py-3 pl-11 pr-4 rounded-lg bg-[#13192c] text-white border border-cyan-500/10 focus:border-cyan-500 outline-none"
                  autoComplete="username"
                />
              </div>
            </div>
            <div>
              <label className="text-gray-300 text-sm font-medium mb-1 block">Password</label>
              <div className="relative">
                <Lock className="absolute top-3 left-3 w-5 h-5 text-cyan-400" />
                <input
                  type="password"
                  placeholder="Enter your password"
                  className="w-full py-3 pl-11 pr-4 rounded-lg bg-[#13192c] text-white border border-cyan-500/10 focus:border-cyan-500 outline-none"
                  autoComplete="new-password"
                />
              </div>
            </div>
            <button
              type="submit"
              className="w-full mt-2 py-3 rounded-lg font-semibold bg-gradient-to-r from-cyan-500 to-cyan-400 shadow-md hover:from-cyan-600 hover:to-cyan-500 active:scale-95 transition-all text-lg text-white"
            >
              Create Account
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
        )}
      </div>
      <div className="mt-5 mb-4">
        <a href="/" className="text-cyan-300 hover:underline">&larr; Back to Home</a>
      </div>
      <style>{`
        .animate-fadeIn {
          animation: fadeInUp 0.5s;
        }
        @keyframes fadeInUp {
          0% { opacity: 0; transform: translateY(15px);}
          100% { opacity: 1; transform: translateY(0);}
        }
      `}</style>
    </div>
  );
};

export default RegisterPage;
