import { useState } from "react";

const AttendanceOverview = () => {
  const [selectedClass, setSelectedClass] = useState(1);
  const [selectedDate, setSelectedDate] = useState("2026-01-10");

  const classes = [
    { id: 1, name: "CSE-A" },
    { id: 2, name: "CSE-B" },
  ];

  const sessions = [
    {
      id: 1,
      classId: 1,
      date: "2026-01-10",
      status: "class",
      subject: "CSE101",
      markedBy: "CR",
      verified: true,
      locked: true,
      present: 42,
      absent: 3,
    },
    {
      id: 2,
      classId: 1,
      date: "2026-01-09",
      status: "substitution",
      subject: "CSE102",
      markedBy: "Faculty",
      verified: false,
      locked: false,
      present: 40,
      absent: 5,
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
          <label style={{ fontWeight: "bold" }}>Date: </label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            style={selectStyle}
          />
        </div>
      </div>

      {/* SESSION TABLE */}
      <table style={tableStyle}>
        <thead>
          <tr>
            <th>Date</th>
            <th>Subject</th>
            <th>Class Status</th>
            <th>Marked By</th>
            <th>Present</th>
            <th>Absent</th>
            <th>Verified</th>
            <th>Locked</th>
          </tr>
        </thead>

        <tbody>
          {sessions
            .filter(
              (s) =>
                s.classId === selectedClass &&
                s.date === selectedDate
            )
            .map((s) => (
              <tr key={s.id}>
                <td>{s.date}</td>
                <td>{s.subject}</td>
                <td>{s.status}</td>
                <td>{s.markedBy}</td>
                <td>{s.present}</td>
                <td>{s.absent}</td>
                <td>{s.verified ? "Yes" : "No"}</td>
                <td>{s.locked ? "Yes" : "No"}</td>
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

export default AttendanceOverview;
