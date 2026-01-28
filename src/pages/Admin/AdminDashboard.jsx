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
  const [showAuthKey, setShowAuthKey] = useState(false);
  const [authKey, setAuthKey] = useState("");
  const [editAuthKey, setEditAuthKey] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  
  const role = localStorage.getItem("role");

  const handleFacultyCode = async () => {
    if (showAuthKey) {
      // Cancel - hide the panel
      setShowAuthKey(false);
      setIsEditing(false);
      setMessage("");
      return;
    }

    // Show the panel and fetch the key
    setShowAuthKey(true);
    setLoading(true);
    setMessage("");
    
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:3000/api/faculty/auth-key", {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (!response.ok) throw new Error("Failed to fetch authorization key");
      
      const data = await response.json();
      setAuthKey(data.authorization_key);
      setEditAuthKey(data.authorization_key);
    } catch (err) {
      setMessage("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAuthKey = async () => {
    setLoading(true);
    setMessage("");
    
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:3000/api/faculty/auth-key", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ authorization_key: editAuthKey })
      });
      
      if (!response.ok) throw new Error("Failed to update authorization key");
      
      const data = await response.json();
      setAuthKey(data.authorization_key);
      setIsEditing(false);
      setMessage("Authorization key updated successfully");
      
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      setMessage("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

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
          <>
            <button 
              style={showAuthKey ? cancelBtn : primaryBtn} 
              onClick={handleFacultyCode}
            >
              {showAuthKey ? "Cancel" : "Get Faculty code"}
            </button>

            {/* Auth Key Display Panel */}
            {showAuthKey && (
              <div style={authPanel}>
                <h4 style={{ margin: "0 0 15px 0", fontSize: "14px", color: "#AD3A3C" }}>
                  {!isEditing ? "Authorization Key" : "Enter New Authorization Key"}
                </h4>
                
                {loading ? (
                  <p style={{ fontSize: "13px", color: "#666" }}>Loading...</p>
                ) : (
                  <>
                    {!isEditing ? (
                      <div>
                        <div style={codeDisplay}>{authKey}</div>
                        <button 
                          style={editBtn} 
                          onClick={() => setIsEditing(true)}
                        >
                          Edit Key
                        </button>
                      </div>
                    ) : (
                      <div>
                        <input
                          type="text"
                          value={editAuthKey}
                          onChange={(e) => setEditAuthKey(e.target.value)}
                          style={inputStyle}
                        />
                        <div style={{ display: "flex", gap: "8px", marginTop: "10px" }}>
                          <button 
                            style={saveBtn} 
                            onClick={handleSaveAuthKey}
                            disabled={loading}
                          >
                            Save
                          </button>
                          <button 
                            style={cancelSmallBtn} 
                            onClick={() => {
                              setIsEditing(false);
                              setEditAuthKey(authKey);
                              setMessage("");
                            }}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                    
                    {message && (
                      <p style={{ 
                        fontSize: "12px", 
                        marginTop: "10px", 
                        color: message.includes("Error") ? "#d32f2f" : "#2e7d32" 
                      }}>
                        {message}
                      </p>
                    )}
                  </>
                )}
              </div>
            )}
          </>
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

const cancelBtn = {
  marginTop: "12px",
  padding: "8px 0px",
  backgroundColor: "transparent",
  color: "white",
  border: "1px solid white",
  borderRadius: "4px",
  cursor: "pointer",
};

const authPanel = {
  marginTop: "15px",
  padding: "15px",
  backgroundColor: "white",
  border: "2px solid #AD3A3C",
  borderRadius: "6px",
  color: "#333"
};

const codeDisplay = {
  fontSize: "24px",
  fontWeight: "bold",
  padding: "12px",
  color: "#AD3A3C",
  backgroundColor: "#f5f5f5",
  borderColor: "#AD3A3C",
  borderWidth: "2px",
  borderStyle: "solid",
  borderRadius: "4px",
  textAlign: "center",
  marginBottom: "12px",
};

const inputStyle = {
  color: "#AD3A3C",
  width: "100%",
  padding: "10px",
  fontSize: "18px",
  fontWeight: "bold",
  textAlign: "center",
  backgroundColor: "#f5f5f5",
  border: "2px solid #AD3A3C",
  borderRadius: "4px",
};

const editBtn = {
  width: "100%",
  padding: "8px",
  backgroundColor: "#AD3A3C",
  color: "white",
  border: "none",
  borderRadius: "4px",
  cursor: "pointer",
  fontSize: "13px",
  fontWeight: "500"
};

const saveBtn = {
  flex: 1,
  padding: "8px",
  backgroundColor: "#AD3A3C",
  color: "white",
  border: "none",
  borderRadius: "4px",
  cursor: "pointer",
  fontSize: "13px",
  fontWeight: "500"
};

const cancelSmallBtn = {
  flex: 1,
  padding: "8px",
  backgroundColor: "#757575",
  color: "white",
  border: "none",
  borderRadius: "4px",
  cursor: "pointer",
  fontSize: "13px",
  fontWeight: "500"
};

export default AdminDashboard;