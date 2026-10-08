import { Routes, Route } from 'react-router-dom';

import Landing from './pages/Landing';
import TrackBus from './pages/TrackBus';
import StudentLogin from './pages/StudentLogin';
import StudentSignup from './pages/StudentSignup';
import AdminLogin from './pages/AdminLogin';
import NotFound from './pages/NotFound';

import StudentLayout from './layouts/StudentLayout';
import StudentDashboard from './pages/StudentDashboard';
import StudentTrack from './pages/StudentTrack';

import AdminLayout from './layouts/AdminLayout';
import AdminDashboard from './pages/AdminDashboard';
import AdminBuses from './pages/AdminBuses';
import AdminRoutes from './pages/AdminRoutes';
import AdminStops from './pages/AdminStops';
import AdminStudents from './pages/AdminStudents';
import AdminTracking from './pages/AdminTracking';

import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<Landing />} />
      <Route path="/track" element={<TrackBus />} />
      <Route path="/student/login" element={<StudentLogin />} />
      <Route path="/student/signup" element={<StudentSignup />} />
      <Route path="/admin/login" element={<AdminLogin />} />

      {/* Student (protected) */}
      <Route
        path="/student"
        element={
          <ProtectedRoute requiredRole="student">
            <StudentLayout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<StudentDashboard />} />
        <Route path="track" element={<StudentTrack />} />
      </Route>

      {/* Admin (protected) */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute requiredRole="admin">
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="buses" element={<AdminBuses />} />
        <Route path="routes" element={<AdminRoutes />} />
        <Route path="stops" element={<AdminStops />} />
        <Route path="students" element={<AdminStudents />} />
        <Route path="tracking" element={<AdminTracking />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
