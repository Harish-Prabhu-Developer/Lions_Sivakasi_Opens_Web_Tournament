import Layout from './pages/Layout';
import DashboardPage from './pages/DashboardPage';
import LoginPage from './pages/LoginPage';
import { BrowserRouter as Router, Routes, Route,Navigate,Outlet } from 'react-router-dom';
import EntriesPage from './pages/EntriesPage';
import UsersPage from './pages/UsersPage';
import ReportPage from './pages/ReportPage';
import PartnerChangeRequestPage from './pages/PartnerChangeRequestPage';
import EntriesDetailPage from './pages/EntriesDetailPage';
import AcademyEntriesPage from './pages/Academy/AcademyEntriesPage';
import AcademyEntryDetail from './pages/Academy/AcademyEntryDetail';
import AcademyReportPage from './pages/Academy/AcademyReportPage';
function ProtectedRoute() {
  const isLoggedIn = localStorage.getItem('token');
  return isLoggedIn ? <Outlet /> : <Navigate to="/login" replace />;
}

function PublicRoute() {
  const isLoggedIn = localStorage.getItem('token');
  return isLoggedIn ? <Navigate to="/" replace /> : <Outlet />;
}

function App() {
  return (
    <Router basename='/admin'>
      <Routes>
        {/* Public route for login, redirects if logged in */}
        <Route element={<PublicRoute />}>
          <Route path="/login" element={<LoginPage />} />
        </Route>

        {/* Protected Layout wrapped with ProtectedRoute */}
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<Layout />}>
            <Route index element={<DashboardPage />} />
            <Route path='/entries' element={<EntriesPage/>}/>
            <Route path="/entryDetail/:id" element={<EntriesDetailPage />} />
            <Route path="/academyEntryDetail/:id" element={<AcademyEntryDetail />} />
            <Route path='/users' element={<UsersPage/>}/>
            <Route path='/academyEntries' element={<AcademyEntriesPage/>}/>
            <Route path='/reports'element={<ReportPage/>}/>
            <Route path='/academyReports'element={<AcademyReportPage/>}/>
            <Route path='/partners'element={<PartnerChangeRequestPage/>}/>
            {/* Add more nested pages below */}
          </Route>
        </Route>

        {/* Catch-all route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;