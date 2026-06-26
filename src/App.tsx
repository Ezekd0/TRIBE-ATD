import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import AuthLayout from './layouts/AuthLayout';
import DashboardLayout from './layouts/DashboardLayout';

// Public Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';

// Member Pages
import MemberDashboard from './pages/MemberDashboard';
import Profile from './pages/Profile';
import DigitalID from './pages/DigitalID';
import AttendanceHistory from './pages/AttendanceHistory';

// Admin Pages
import AdminDashboard from './pages/AdminDashboard';
import Scanner from './pages/Scanner';
import Members from './pages/Members';
import AttendanceRecords from './pages/AttendanceRecords';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Landing />} />
        
        {/* Auth Routes */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/admin-login" element={<Login isAdminLogin={true} />} />
          <Route path="/register" element={<Register />} />
        </Route>

        {/* Member Routes */}
        <Route path="/member" element={<DashboardLayout requiredRole="member" />}>
          <Route index element={<MemberDashboard />} />
          <Route path="profile" element={<Profile />} />
          <Route path="id" element={<DigitalID />} />
          <Route path="history" element={<AttendanceHistory />} />
        </Route>

        {/* Admin Routes */}
        <Route path="/admin" element={<DashboardLayout requiredRole="admin" />}>
          <Route index element={<AdminDashboard />} />
          <Route path="scan" element={<Scanner />} />
          <Route path="members" element={<Members />} />
          <Route path="records" element={<AttendanceRecords />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
