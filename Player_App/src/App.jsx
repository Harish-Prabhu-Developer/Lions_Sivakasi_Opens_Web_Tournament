import "./App.css";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Outlet,
  useLocation,
} from "react-router-dom";
import { useEffect, useState } from "react";

import HomePage from "./pages/HomePage";
import Navbar from "./components/Navbar";
import DashboardPage from "./pages/DashboardPage";
import RegisterPage from "./pages/RegisterPage";
import EntryDetailsPage from "./pages/EntryDetailsPage";
import EntryPage from "./pages/EntryPage";
import { IsLoggedIn } from "./utils/authHelpers";


const ProtectRoute = () => {
  const token = localStorage.getItem("token");
  const user = localStorage.getItem("user");

  if (!token || !user) {
    // 🔸 No valid session, redirect to register/login
    return <Navigate to="/register" replace />;
  }

  // ✅ Authenticated user proceeds to protected route
  return <Outlet />;
};




const PublicRoute = () => {
  const token = localStorage.getItem("token");
  const user = localStorage.getItem("user");

  if (token && user) {
    // 🔸 If already logged in, redirect to dashboard
    return <Navigate to="/dashboard" replace />;
  }

  // ✅ Not logged in → allow public route
  return <Outlet />;
};
// ✅ Wrapper to handle Navbar visibility
const Layout = ({ loggedIn }) => {
  const location = useLocation();

  // Hide Navbar on EntryDetails page
  const hideNavbar =
    location.pathname.startsWith("/entrydetails/") ||
    location.pathname === "/entry";

  return (
    <div className="flex flex-col h-screen w-screen bg-gradient-to-b from-[#0a192f] to-[#0f223f] text-gray-100">
      {!hideNavbar && <Navbar loggedIn={loggedIn} />}
      <main className="flex-1 w-full overflow-y-auto">
        <Routes>
          {/* No auth routes and public routes */}
          <Route path="/" element={<HomePage />} />
          {/* Public routes */}
          <Route element={<PublicRoute />}>
            <Route path="/register" element={<RegisterPage />} />
          </Route>
          {/* Protected routes and public routes */}
          <Route element={<ProtectRoute />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/entry" element={<EntryPage />} />
            <Route path="/entrydetails/:id" element={<EntryDetailsPage />} />
          </Route>

          {/* Catch-all route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
};

const App = () => {
 const [loggedIn, setLoggedIn] = useState(IsLoggedIn());

  useEffect(() => {
    const handleStorageChange = () => setLoggedIn(IsLoggedIn());
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  return (
    <Router>
      <Layout loggedIn={loggedIn} />
    </Router>
  );
};

export default App;
