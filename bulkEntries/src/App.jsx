//App.jsx
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from "react-router-dom";
import AuthPage from "./pages/AuthPage";
import DashboardPage from "./pages/DashboardPage";
import Layout from "./pages/Layout";
import PlayerDetailsPage from "./components/Academy/Player/PlayerDetailsPage";
import EntryPage from "./pages/EntryPage";



function ProtectedRoute() {
  const isLoggedIn = !!localStorage.getItem("bulkapp_token");
  return isLoggedIn ? <Outlet /> : <Navigate to="/academy/auth?activeTab=login" replace />;
}

function PublicRoute() {
  const isLoggedIn = !!localStorage.getItem("bulkapp_token");
  return !isLoggedIn ? <Outlet /> : <Navigate to="/" replace />;
}

function App() {
  return (
<Router basename="/academy">
      <Routes>
        {/* Public routes */}
        <Route element={<PublicRoute />}>
          <Route path="/auth" element={<AuthPage />} />
        </Route>

        {/* Protected Layout */}
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<Layout />}>
            <Route index element={<DashboardPage />} />
            {/* Add more nested pages here */}
          </Route>

          {/* Player Details as standalone page */}
          <Route path="/player/:id" element={<PlayerDetailsPage />} />
          
          {/* Entry page with player ID */}
          <Route path="/entry/:id" element={<EntryPage />} />
        </Route>

        {/* Catch-all redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>

  );
}

export default App;