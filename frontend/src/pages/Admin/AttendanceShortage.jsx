import { useState } from "react";

const AttendanceShortage = () => {
  const [selectedClass, setSelectedClass] = useState(1);
  const [selectedSubject, setSelectedSubject] = useState("ALL");

  const classes = [
    { id: 1, name: "CSE-A" },
    { id: 2, name: "CSE-B" },
  ];

  const subjects = [
    { code: "ALL", name: "All Subjects" },
    { code: "CSE101", name: "Data Structures" },
    { code: "CSE102", name: "Algorithms" },
    { code: "CSE201", name: "Operating Systems" },
  ];

  const shortageList = [
    {
      rollNo: "AM.SC.U5CSE24654",
      name: "John Doe",
      classId: 1,
      subject: "CSE101",
      attendance: 68,
    },
    {
      rollNo: "AM.SC.U5CSE24660",
      name: "Alice",
      classId: 1,
      subject: "CSE102",
      attendance: 72,
    },
    {
      rollNo: "AM.SC.U5CSE24675",
      name: "Bob",
      classId: 2,
      subject: "CSE201",
      attendance: 60,
    },
  ];

  return (
    <div>
      {/* FILTERS */}
      <div style={{ display: "flex", gap: "20px", marginBottom: "25px" }}>
        <div>
          <label style={{ fontWeight: "bold" }}>Class: </label>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(Number(e.target.value))}
            style={selectStyle}
          >
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label style={{ fontWeight: "bold" }}>Subject: </label>
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            style={selectStyle}
          >
            {subjects.map((s) => (
              <option key={s.code} value={s.code}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* SHORTAGE TABLE */}
      <table style={tableStyle}>
        <thead>
          <tr>
            <th>Roll No</th>
            <th>Student Name</th>
            <th>Subject</th>
            <th>Attendance %</th>
            <th>Status</th>
          </tr>
        </thead>

        <tbody>
          {shortageList
            .filter(
              (s) =>
                s.classId === selectedClass &&
                (selectedSubject === "ALL" ||
                  s.subject === selectedSubject)
            )
            .map((s, index) => (
              <tr key={index}>
                <td>{s.rollNo}</td>
                <td>{s.name}</td>
                <td>{s.subject}</td>
                <td>{s.attendance}%</td>
                <td style={{ color: "red", fontWeight: "bold" }}>
                  Shortage
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
};

/* ================= STYLES ================= */

const selectStyle = {
  padding: "6px 12px",
  marginLeft: "8px",
};

const tableStyle = {
  width: "100%",
  borderCollapse: "collapse",
};

export default AttendanceShortage;
