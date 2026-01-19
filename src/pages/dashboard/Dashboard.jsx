import React, { useEffect, useState } from "react";
import './/dashboard1.css';

const dummyData = [
  {
    studentName: "AM.SC.U4CSE24208",
    attendance: [
      "present", "present", "absent", "late", "present", "present",
      "present", "absent", "present", "late", "present", "present",
      "present", "absent", "present", "late", "present", "present"
    ],
    attended: 33,
    total: 48
  },
  {
    studentName: "AM.SC.U4CSE24209",
    attendance: [
      "present", "present", "present", "present", "late", "present",
      "absent", "present", "present", "present", "late", "present"
    ],
    attended: 36,
    total: 48
  }
];

export default function Dashboard() {
  const [batch, setBatch] = useState("");
  const [semester, setSemester] = useState("");
  const [course, setCourse] = useState("");
  const [data, setData] = useState([]);

  useEffect(() => {
    // Later replace this with API call
    setData(dummyData);
  }, []);

  return (
    <div className="monthly-attendance">

      {/* Filters */}
      <div className="filters">
        <select value={batch} onChange={(e) => setBatch(e.target.value)}>
          <option value="">Select Batch</option>
          <option value="2022">CSE 2022–26</option>
          <option value="2023">CSE 2023–27</option>
        </select>

        <select value={semester} onChange={(e) => setSemester(e.target.value)}>
          <option value="">Select Semester</option>
          <option value="5">Semester 5</option>
          <option value="6">Semester 6</option>
        </select>

        <select value={course} onChange={(e) => setCourse(e.target.value)}>
          <option value="">Select Course</option>
          <option value="DS">Data Structures</option>
          <option value="ALGO">Algorithms</option>
        </select>
      </div>

      {/* Table Header */}
      <div className="attendance-row header">
        <div className="student-name">Student</div>
        <div className="attendance-days">Attendance</div>
        <div className="attendance-summary">Total</div>
      </div>

      {/* Data Rows */}
      {data.map((student, index) => (
        <div className="attendance-row" key={index}>
          <div className="student-name">{student.studentName}</div>

          <div className="attendance-days">
            {student.attendance.map((status, i) => (
              <span key={i} className={`day-box ${status}`} />
            ))}
          </div>

          <div className="attendance-summary">
            {student.attended}/{student.total}
          </div>
        </div>
      ))}
    </div>
  );
}
