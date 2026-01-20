import './App.css';
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from './pages/Login/AuthContext.jsx'; // Ensure this path is correct

import AdminDashboard from "./pages/Admin/AdminDashboard.jsx";
import StudentReport from "./pages/StudentReportPage/StudentReportPage.jsx";
import FacultyDashboard from './pages/Faculty/FacultyDashboard.jsx';
import SubjectWiseReport from './pages/SubjectWiseReport/SubjectWiseReport.jsx';
import Cr from './components/Attendance.jsx';
import AttendanceReport from './pages/Faculty/AttendanceReport.jsx';
import MainLayout from './components/MainLayout.jsx';
import Login from './pages/Login/Login.jsx';

// --- ROLE-BASED PROTECTOR COMPONENT ---
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    // Not logged in? Send to login page
    return <Navigate to="/" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Logged in but wrong role? Send back to login (or an unauthorized page)
    return <Navigate to="/" replace />;
  }

  return children;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="App">
          <Routes>
            {/* PUBLIC ROUTE */}
            <Route path="/" element={<Login />} />
            

            {/* CR ROUTES */}
            <Route 
              path="/cr" 
              element={
                <ProtectedRoute allowedRoles={['cr']}>
                  <MainLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Cr />} />
            </Route>

            {/* FACULTY ROUTES */}
            <Route 
              path="/Faculty" 
              element={
                <ProtectedRoute allowedRoles={['faculty']}>
                  <MainLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<AdminDashboard />} />
              <Route path="attendance" element={<AttendanceReport />} />
            </Route>

            {/* ADMIN ROUTES */}
            <Route 
              path="/admin" 
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <MainLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<AdminDashboard />} />
              
              {/* 
                Note: 'candid' needs to be defined in your component 
                or passed via state for these to work 
              */}
              <Route
                path="student-report"
                element={<StudentReport />}
              />
              <Route
                path="subject-report"
                element={<SubjectWiseReport />}
              />
            </Route>

            {/* CATCH ALL - Redirect unknown routes to login */}
            <Route path="*" element={<Navigate to="/" replace />} />
            
          </Routes>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;