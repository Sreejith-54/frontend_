import { Outlet } from "react-router-dom";
import Navbar from '../components/Navbar.jsx';
import { useAuth } from "../pages/Login/AuthContext.jsx"; // Import the hook

export default function MainLayout() {
  const { user, isCR, isFaculty, isAdmin } = useAuth();

  // Define Navbar links based on roles
  let navLinks = [];

  if (isFaculty) {
    navLinks = [
      { name: 'Dashboard', link: '/Faculty' },
      { name: 'Attendance List', link: '/Faculty/attendance' },
    ];
  } else if (isAdmin) {
    navLinks = [
      { name: 'Admin Dashboard', link: '/admin' },
      { name: 'Student Reports', link: '/admin/student-report' },
      { name: 'Subject Reports', link: '/admin/subject-report' },
    ];
  }
  // For CR, we can leave it empty or add specific CR links
  else if (isCR) {
    navLinks = [
      { name: 'Mark Attendance', link: '/cr' }
    ];
  }

  return (
    <div className="app-container">
      <main className="content" style={{ minWidth: '100vw' }}>
        {/* Pass the dynamic links to the Navbar */}
        <Navbar links={navLinks} />
        
        {/* This renders the child routes (Cr, AdminDashboard, etc.) */}
        <Outlet />
        <div style={{ backgroundColor: '#AD3A3C' , color: 'white' , display: 'flex',justifyContent: 'center', alignItems: 'center', height: '8vh'}}>
          <p>© 2026 ACM Amritapuri All Rights Reserved.</p>
        </div>
      </main>
    </div>
  );
}