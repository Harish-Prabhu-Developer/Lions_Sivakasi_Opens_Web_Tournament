import { Eye, EyeOff, LogIn, Mail, Lock } from "lucide-react";
import React, { useState, useCallback, useEffect } from "react";
import toast from "react-hot-toast";
import { decryptData, encryptData } from "../utils/cryptoUtils";
import { useNavigate } from "react-router-dom";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  // On mount, check if saved login data exists and pre-fill
  useEffect(() => {
    const savedEncrypted = localStorage.getItem("rememberedLogin");
    if (savedEncrypted) {
      try {
        const savedData = decryptData(savedEncrypted);
        if (savedData && savedData.email && savedData.password) {
          setEmail(savedData.email);
          setPassword(savedData.password);
          setRememberMe(true);
        }
      } catch (err) {
        console.error("Decryption failed:", err);
        localStorage.removeItem("rememberedLogin");
      }
    }
  }, []);

  // Placeholder for the actual Firebase/Auth admin login logic
  const handleLogin = useCallback(
    async (e) => {
      e.preventDefault();
      setError("");
      setLoading(true);

      // Simulated API call delay
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Simulated Admin Authentication Logic
      const mockEmail = "admin@admin.com";
      const mockPassword = "admin123";

      if (email === mockEmail && password === mockPassword) {
        toast.success("Login successful!");
        navigate("/");
        // Remember Me logic
        if (rememberMe) {
          localStorage.setItem(
            "rememberedLogin",
            encryptData({ email, password })
          );
        } else {
          localStorage.removeItem("rememberedLogin");
        }
      } else {
        setError("Invalid email or password");
        toast.error("Invalid email or password");
      }

      setLoading(false);
    },
    [email, password, rememberMe]
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 font-sans p-4">
      <div className="w-full max-w-md">
        <div className="bg-white p-8 sm:p-10 rounded-2xl shadow-2xl border border-gray-200 transition duration-500 hover:shadow-xl hover:shadow-indigo-400/30">
          <div className="flex flex-col items-center">
            <LogIn className="w-12 h-12 text-indigo-700 mb-4 p-2 bg-indigo-100 rounded-xl" />
            <h2 className="text-3xl font-extrabold text-gray-900 mb-2">
              Admin Portal Login
            </h2>
            <p className="text-sm text-gray-500">
              Access the administrative control panel
            </p>
          </div>

          <form className="mt-8 space-y-6" onSubmit={handleLogin}>
            {/* Email Input */}
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-indigo-700" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-700 transition duration-200 ease-in-out disabled:bg-gray-50 disabled:cursor-not-allowed text-base"
                  placeholder="admin@example.com"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-indigo-700" />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-700 transition duration-200 ease-in-out disabled:bg-gray-50 disabled:cursor-not-allowed text-base"
                  placeholder="Enter your secret password"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  disabled={loading}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 transition disabled:opacity-50"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <Eye className="w-5 h-5" />
                  ) : (
                    <EyeOff className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Remember Me + Forgot Password */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="accent-indigo-500 w-3 h-3 scale-125 rounded border-gray-300 checked:bg-indigo-500"
                />
                <label className="ml-2 block text-sm text-indigo-700 font-medium select-none">
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <a
                  href="#"
                  className="font-medium text-indigo-600 hover:text-indigo-700 transition"
                >
                  Forgot Password?
                </a>
              </div>
            </div>

            {/* Login Button */}
            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-lg text-base font-semibold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 disabled:bg-indigo-400 disabled:cursor-wait"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                    Authenticating...
                  </>
                ) : (
                  "Sign In to Admin"
                )}
              </button>
            </div>

            {/* Error Message */}
            {error && (
              <p className="text-red-500 text-center font-medium">{error}</p>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
