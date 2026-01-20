import { useState } from "react";
import UserManagement from "./UserManagement";
import DepartmentManagement from "./DepartmentManagement";
import BatchManagement from "./BatchManagement";
import SectionManagement from "./SectionManagement";
import StudentManagement from "./StudentManagement";
import SubjectManagement from "./SubjectManagement";
import ViewTimeTable from "./ViewTimeTable";
import FacultyTimetableViewer from "./FacultyTimetableViewer"; // <--- 1. NEW IMPORT
import TimetableConfig from "./TimetableConfig";
import AttendanceOverview from "./AttendanceOverview";
import AttendanceShortage from "./AttendanceShortage";
import Dashboard from "../dashboard/Dashboard";
import Reports from "./Reports";

const AdminDashboard = () => {
  const [activeSection, setActiveSection] = useState("dashboard");
  const role = localStorage.getItem("role");

  return (
    <div style={{ display: "flex", height: "100%", minHeight: "100vh" }}>
      
      {/* SIDEBAR */}
      <aside style={{ width: "260px", backgroundColor: "#AD3A3C", color: "white", padding: "20px", display: "flex", flexDirection: "column" }}>
        <h2 style={{ fontSize: "1.3rem", marginBottom: "30px", borderBottom: "1px solid rgba(255,255,255,0.3)", paddingBottom: "15px" }}>
          {role} Portal
        </h2>

        <nav style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <button style={navBtn(activeSection === "dashboard")} onClick={() => setActiveSection("dashboard")}>Dashboard</button>
          <small style={{ color: "#ffcccb", fontWeight: "bold", marginTop: "10px" }}>TIMETABLE</small>
          <button style={navBtn(activeSection === "view_timetable")} onClick={() => setActiveSection("view_timetable")}>Class Timetable</button>
          {/* 2. NEW BUTTON HERE */}
          <button style={navBtn(activeSection === "faculty_timetable")} onClick={() => setActiveSection("faculty_timetable")}>Faculty Schedule</button>
          
          {role === 'admin' && (
          <>
          <button style={navBtn(activeSection === "config_timetable")} onClick={() => setActiveSection("config_timetable")}>Configure Slots</button>

          <small style={{ color: "#ffcccb", fontWeight: "bold", marginTop: "10px" }}>ACADEMICS</small>
          <button style={navBtn(activeSection === "departments")} onClick={() => setActiveSection("departments")}>Departments</button>
          <button style={navBtn(activeSection === "batches")} onClick={() => setActiveSection("batches")}>Batches</button>
          <button style={navBtn(activeSection === "sections")} onClick={() => setActiveSection("sections")}>Sections</button>
          <button style={navBtn(activeSection === "subjects")} onClick={() => setActiveSection("subjects")}>Subjects / Courses</button>
          </>
          )}
          <small style={{ color: "#ffcccb", fontWeight: "bold", marginTop: "10px" }}>PEOPLE & DATA</small>
          {role === 'admin' && (
          <>
          <button style={navBtn(activeSection === "students")} onClick={() => setActiveSection("students")}>Student Management</button>
          <button style={navBtn(activeSection === "users")} onClick={() => setActiveSection("users")}>User & Role Mgmt</button>
          </>
          )}
          <button style={navBtn(activeSection === "attendance")} onClick={() => setActiveSection("attendance")}>Attendance Overview</button>
          <button style={navBtn(activeSection === "shortage")} onClick={() => setActiveSection("shortage")}>Shortage List</button>
          <button style={navBtn(activeSection === "reports")} onClick={() => setActiveSection("reports")}>Reports</button>
        </nav>
        {role === 'faculty' && (
          <button style={primaryBtn} onClick={()=>{handleFacultyCode}}>Get Faculty code </button>
        )}
      </aside>

      {/* MAIN CONTENT */}
      <main style={{ flex: 1, backgroundColor: "#f5f5f5", padding: "30px", overflowY: "auto" }}>
        <h2 style={{ marginBottom: "20px", color: "#333", borderLeft: "5px solid #AD3A3C", paddingLeft: "15px" }}>
          {getSectionTitle(activeSection)}
        </h2>

        <div style={{ backgroundColor: "white", borderRadius: "8px", padding: "25px", minHeight: "85%", boxShadow: "0 4px 15px rgba(0,0,0,0.05)" }}>
          {renderSection(activeSection)}
        </div>
      </main>
    </div>
  );
};

/* HELPERS */
const navBtn = (active) => ({
  background: active ? "rgba(255,255,255,0.15)" : "transparent",
  color: active ? "white" : "rgba(255,255,255,0.8)",
  borderLeft: active ? "4px solid white" : "4px solid transparent",
  borderTop: "none", borderRight: "none", borderBottom: "none",
  padding: "10px 15px", textAlign: "left", fontSize: "14px", cursor: "pointer", transition: "all 0.2s"
});

const getSectionTitle = (key) => {
  switch (key) {
    case "dashboard": return "Dashboard";
    case "view_timetable": return "Class Timetable Viewer";
    case "faculty_timetable": return "Faculty Schedule Viewer"; // <--- 3. ADD TITLE
    case "config_timetable": return "Configure Timetable Slots";
    case "students": return "Student Directory";
    case "users": return "User & Role Management";
    case "departments": return "Department Configuration";
    case "batches": return "Batch Configuration";
    case "sections": return "Section Configuration";
    case "subjects": return "Subject & Course Configuration";
    case "attendance": return "Attendance Overview";
    case "reports": return "Reports";
    case "shortage": return "Attendance Shortage (<75%)";
    default: return "";
  }
};

const renderSection = (key) => {
  switch (key) {
    case "dashboard": return <Dashboard />;
    case "view_timetable": return <ViewTimeTable />;
    case "faculty_timetable": return <FacultyTimetableViewer />; // <--- 4. RENDER COMPONENT
    case "config_timetable": return <TimetableConfig />;
    case "students": return <StudentManagement />;
    case "users": return <UserManagement />;
    case "departments": return <DepartmentManagement />;
    case "batches": return <BatchManagement />;
    case "sections": return <SectionManagement />;
    case "subjects": return <SubjectManagement />;
    case "attendance": return <AttendanceOverview />;
    case "reports": return <Reports />;
    case "shortage": return <AttendanceShortage />;
    default: return null;
  }
};

const primaryBtn = {
  marginTop: "12px",
  padding: "8px 0px",
  backgroundColor: "white",
  color: "#AD3A3C",
  border: "none",
  borderRadius: "4px",
  cursor: "pointer",
};

export default AdminDashboard;