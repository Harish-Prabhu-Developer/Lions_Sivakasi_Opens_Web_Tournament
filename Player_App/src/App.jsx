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

// Simulated auth check function
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

const PublicRoute = () => {
  const [loggedIn, setLoggedIn] = useState(IsLoggedIn());
  useEffect(() => {
    const checkLogin = () => {
      const token = localStorage.getItem("token");
      setLoggedIn(!!token);
    };
    checkLogin();
  }, []);
  return loggedIn ? <Navigate to="/register" replace /> : <Outlet />;
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
    const checkLogin = () => {
      const token = localStorage.getItem("token");
      setLoggedIn(!!token);
    };
    checkLogin();
  }, []);

  return (
    <Router>
      <Layout loggedIn={loggedIn} />
    </Router>
  );
};

export default App;
