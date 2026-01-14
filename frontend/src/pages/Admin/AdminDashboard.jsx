import { useState } from "react";
import UserManagement from "./UserManagement";
import ClassManagement from "./ClassManagement";
import SubjectManagement from "./SubjectManagement";
import AttendanceOverview from "./AttendanceOverview";
import AttendanceShortage from "./AttendanceShortage";
import Reports from "./Reports";
import TimeTableManagement from "./TimeTableManagement";


const AdminDashboard = () => {
  const [activeSection, setActiveSection] = useState("users");

  return (
    <div style={{ display: "flex", height: "100%", minHeight: "100vh" }}>
      
      {/* SIDEBAR */}
      <aside
        style={{
          width: "260px",
          backgroundColor: "#AD3A3C",
          color: "white",
          padding: "20px",
        }}
      >

        <nav style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
            
          <button style={navBtn(activeSection === "users")} onClick={() => setActiveSection("users")}>
            User Management
          </button>
          <button style={navBtn(activeSection === "classes")} onClick={() => setActiveSection("classes")}>
            Class Management
          </button>
          <button style={navBtn(activeSection === "subjects")} onClick={() => setActiveSection("subjects")}>
            Subject Management
          </button>
          <button style={navBtn(activeSection === "timetable")} onClick={() => setActiveSection("timetable")}>
            Time Table Management
          </button>
          <button style={navBtn(activeSection === "attendance")} onClick={() => setActiveSection("attendance")}>
            Attendance Overview
          </button>
          <button style={navBtn(activeSection === "reports")} onClick={() => setActiveSection("reports")}>
            Reports
          </button>
          <button style={navBtn(activeSection === "shortage")} onClick={() => setActiveSection("shortage")}>
            Attendance Shortage
          </button>
        </nav>
      </aside>

      {/* MAIN CONTENT */}
      <main style={{ flex: 1, backgroundColor: "#f5f5f5", padding: "30px" }}>
        <h2 style={{ marginBottom: "20px" }}>
          {getSectionTitle(activeSection)}
        </h2>

        <div
          style={{
            backgroundColor: "white",
            borderRadius: "8px",
            padding: "30px",
            minHeight: "80%",
          }}
        >
          {renderSection(activeSection)}
        </div>
      </main>
    </div>
  );
};

/* ---------- HELPERS ---------- */

const navBtn = (active) => ({
  background: active ? "white" : "transparent",
  color: active ? "#AD3A3C" : "white",
  border: "none",
  padding: "12px",
  textAlign: "left",
  borderRadius: "5px",
  fontSize: "15px",
  cursor: "pointer",
});

const getSectionTitle = (key) => {
  switch (key) {
    case "users": return "User & Role Management";
    case "classes": return "Class & Section Management";
    case "subjects": return "Subject & Course Configuration";
    case "timetable" : return "Time Table Management";
    case "attendance": return "Attendance Overview";
    case "reports": return "Reports";
    case "shortage": return "Attendance Shortage (<75%)";
    default: return "";
  }
};

const renderSection = (key) => {
  switch (key) {
    case "users":
      return <UserManagement />;
    case "classes":
      return <ClassManagement />;
    case "subjects":
      return <SubjectManagement />;
    case "timetable":
      return <TimeTableManagement/>;
    case "attendance":
      return <AttendanceOverview />;
    case "reports":
      return <Reports />;
    case "shortage":
      return <AttendanceShortage />;
    default:
      return null;
  }
};

export default AdminDashboard;
