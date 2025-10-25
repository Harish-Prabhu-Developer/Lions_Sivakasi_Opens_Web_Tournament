import "./App.css";
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from "react-router-dom";
import HomePage from "./pages/HomePage";
import Navbar from "./components/Navbar";
import DashboardPage from "./pages/DashboardPage";
import RegisterPage from "./pages/RegisterPage";
import { useEffect, useState } from "react";
// Simulated auth check function: replace with your real authentication logic
const IsLoggedIn = () => {
  const token = localStorage.getItem("token");
  return !!token;
};

const ProtectRoute = () => {
  const [loggedIn, setLoggedIn] = useState(IsLoggedIn());
  useEffect(() => {
    const checkLogin = () => {
      const token = localStorage.getItem("token");
      setLoggedIn(!!token);
    };
    checkLogin();
  }, []);
  return loggedIn ? <Outlet /> : <Navigate to="/register" replace />;
};

const App = () => {
    const [loggedIn, setLoggedIn] = useState(IsLoggedIn());
  useEffect(() => {
    const checkLogin = () => {
      const token = localStorage.getItem("token");
      setLoggedIn(!!token);
    };
    checkLogin();
  }, []);
  return (
    <Router>
      <div className="flex flex-col h-screen w-screen bg-gradient-to-b from-[#0a192f] to-[#0f223f] text-gray-100">
        <Navbar loggedIn={loggedIn} />
        <main className="flex-1 w-full">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route element={<ProtectRoute />}>
              <Route path="/dashboard" element={<DashboardPage />} />


            </Route>
            <Route path="/register" element={<RegisterPage />} />
            {/* Optional catch-all route: redirect unknown paths */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

export default App;
