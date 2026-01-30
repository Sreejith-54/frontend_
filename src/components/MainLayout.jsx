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
  <div className="app-container" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
    <Navbar links={navLinks} />
    
    <main className="content" style={{ flex: 1 }}>
      <Outlet />
    </main>

    <footer style={{ backgroundColor: '#AD3A3C', color: 'white', height: '50px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
       <p>© 2026 ACM Student Chapter, Amritapuri All Rights Reserved.</p>
    </footer>
  </div>
);
}