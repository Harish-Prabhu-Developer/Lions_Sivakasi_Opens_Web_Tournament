import Layout from './pages/Layout';
import DashboardPage from './pages/DashboardPage';
import LoginPage from './pages/LoginPage';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
function App() {
  return (
    <Router>
      <Routes>
        {/* Auth Routes */}
        <Route path="/login" element={<LoginPage />} />

        {/* Protected Layout */}
        <Route path="/" element={<Layout />}>
          <Route index element={<DashboardPage />} />
          {/* Add more nested pages below */}
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
