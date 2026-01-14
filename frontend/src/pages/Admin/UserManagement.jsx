import { useState } from "react";

const UserManagement = () => {
  const [activeTab, setActiveTab] = useState("faculty");

  return (
    <div>
      {/* TAB SWITCH */}
      <div style={{ display: "flex", gap: "15px", marginBottom: "25px" }}>
        <button style={tabBtn(activeTab === "faculty")} onClick={() => setActiveTab("faculty")}>
          Faculty
        </button>
        <button style={tabBtn(activeTab === "cr")} onClick={() => setActiveTab("cr")}>
          Class Representatives
        </button>
      </div>

      {/* CONTENT */}
      {activeTab === "faculty" && <FacultySection />}
      {activeTab === "cr" && <CRSection />}
    </div>
  );
};

/* ================= FACULTY ================= */

const FacultySection = () => {
  const facultyList = [
    { id: "FAC101", name: "Dr. Anirudh", department: "CSE", active: true },
    { id: "FAC102", name: "Ms. Jaydeep", department: "AI", active: false },
  ];

  return (
    <>
      <h3>Faculty Management</h3>

      <button style={primaryBtn}>+ Add Faculty</button>

      <table style={tableStyle}>
        <thead>
          <tr>
            <th>Faculty ID</th>
            <th>Name</th>
            <th>Department</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {facultyList.map((f) => (
            <tr key={f.id}>
              <td>{f.id}</td>
              <td>{f.name}</td>
              <td>{f.department}</td>
              <td>{f.active ? "Active" : "Inactive"}</td>
              <td>
                <button style={actionBtn}>
                  {f.active ? "Deactivate" : "Activate"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
};

/* ================= CR ================= */

const CRSection = () => {
  const crList = [
    { roll: "AM.SC.U5CSE24654", name: "John Doe", class: "CSE-A", active: true },
    { roll: "AM.SC.U5CSE24660", name: "Alice", class: "CSE-B", active: true },
  ];

  return (
    <>
      <h3>Class Representative Management</h3>

      <button style={primaryBtn}>+ Assign CR</button>

      <table style={tableStyle}>
        <thead>
          <tr>
            <th>Roll No</th>
            <th>Name</th>
            <th>Class</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {crList.map((cr, index) => (
            <tr key={index}>
              <td>{cr.roll}</td>
              <td>{cr.name}</td>
              <td>{cr.class}</td>
              <td>{cr.active ? "Active" : "Inactive"}</td>
              <td>
                <button style={actionBtn}>
                  {cr.active ? "Deactivate" : "Activate"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
};

/* ================= STYLES ================= */

const tabBtn = (active) => ({
  padding: "10px 16px",
  border: "none",
  borderBottom: active ? "3px solid #AD3A3C" : "3px solid transparent",
  background: "none",
  cursor: "pointer",
  fontWeight: active ? "bold" : "normal",
});

const primaryBtn = {
  margin: "15px 0",
  padding: "10px 18px",
  backgroundColor: "#AD3A3C",
  color: "white",
  border: "none",
  borderRadius: "4px",
  cursor: "pointer",
};

const actionBtn = {
  padding: "6px 12px",
  border: "none",
  borderRadius: "4px",
  backgroundColor: "#ddd",
  cursor: "pointer",
};

const tableStyle = {
  width: "100%",
  borderCollapse: "collapse",
};

export default UserManagement;
