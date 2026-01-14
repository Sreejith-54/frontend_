import { useState } from "react";

const SubjectManagement = () => {
  const [selectedClass, setSelectedClass] = useState(1);

  const classes = [
    { id: 1, name: "CSE-A" },
    { id: 2, name: "CSE-B" },
  ];

  const subjects = [
    {
      id: 1,
      classId: 1,
      courseCode: "CSE101",
      courseName: "Data Structures",
      faculty: "Dr. Anirudh",
      active: true,
    },
    {
      id: 2,
      classId: 1,
      courseCode: "CSE102",
      courseName: "Algorithms",
      faculty: "Ms. Jaydeep",
      active: true,
    },
    {
      id: 3,
      classId: 2,
      courseCode: "CSE201",
      courseName: "Operating Systems",
      faculty: "Dr. Anirudh",
      active: false,
    },
  ];

  return (
    <div>
      {/* CLASS SELECT */}
      <div style={{ marginBottom: "25px" }}>
        <label style={{ fontWeight: "bold" }}>Select Class: </label>
        <select
          value={selectedClass}
          onChange={(e) => setSelectedClass(Number(e.target.value))}
          style={{ padding: "6px 12px", marginLeft: "10px" }}
        >
          {classes.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>

        <button style={primaryBtn}>+ Add Subject</button>
      </div>

      {/* SUBJECT TABLE */}
      <table style={tableStyle}>
        <thead>
          <tr>
            <th>Course Code</th>
            <th>Subject Name</th>
            <th>Faculty</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {subjects
            .filter((s) => s.classId === selectedClass)
            .map((sub) => (
              <tr key={sub.id}>
                <td>{sub.courseCode}</td>
                <td>{sub.courseName}</td>
                <td>{sub.faculty}</td>
                <td>{sub.active ? "Active" : "Inactive"}</td>
                <td>
                  <button style={actionBtn}>
                    {sub.active ? "Deactivate" : "Activate"}
                  </button>
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
};

/* ================= STYLES ================= */

const primaryBtn = {
  marginLeft: "20px",
  padding: "8px 16px",
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

export default SubjectManagement;
