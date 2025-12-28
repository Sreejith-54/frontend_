import React, { useState } from 'react';
import './Attendance.css';

export default function Attendance() {
  const [klass, setKlass] = useState('Class 1');
  const [students, setStudents] = useState([
    { id: 1, roll: '01', name: 'Student name', present: true },
    { id: 2, roll: '02', name: 'Student Name', present: false },
    { id: 3, roll: '03', name: 'Student name', present: true },
  ]);
  const [newName, setNewName] = useState('');

  function toggleAttendance(id) {
    setStudents((s) => s.map((st) => (st.id === id ? { ...st, present: !st.present } : st)));
  }

  function addStudent(e) {
    e.preventDefault();
    if (!newName.trim()) return;
    setStudents((s) => [
      ...s,
      { id: Date.now(), roll: String(s.length + 1).padStart(2, '0'), name: newName.trim(), present: false },
    ]);
    setNewName('');
  }

  const absentees = students.filter((s) => !s.present);

  return (
    <div className="attendance-page">
      <div className="topbar">Logbook</div>

      <div className="attendance-wrapper">
        <div className="left-panel">
          <div className="title">Time Table</div>

          <div className="table-wrapper">
            <table className="stu-table">
              <thead>
                <tr>
                  <th>Roll</th>
                  <th>Student Name</th>
                  <th>Attendance</th>
                </tr>
              </thead>
              <tbody>
                {students.map((st) => (
                  <tr
                    key={st.id}
                    className={st.present ? 'row present' : 'row absent'}
                    onClick={() => toggleAttendance(st.id)}
                    title="Click to toggle"
                  >
                    <td>{st.roll}</td>
                    <td>{st.name}</td>
                    <td>{st.present ? 'Present' : 'Absent'}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            
          </div>
        </div>

        <div className="right-panel">
          <label>
        
            <select value={klass} onChange={(e) => setKlass(e.target.value)}>
              <option>Select Class</option>
             
            </select>
          </label>
           <label>
        
            <select value={klass} onChange={(e) => setKlass(e.target.value)}>
              <option>Class Status</option>
            
            </select>
          </label>

          <div className="absentees">
            <h4>Absentees</h4>
           
          </div>

          <button className="submit-btn">Submit</button>
        </div>
      </div>
    </div>
  );
}
