import React, { useState, useEffect } from "react";
import './subjectwisereport_style.css';

function SubjectWiseReport() {
  const [depts, setDepts] = useState([]);
  const [batches, setBatches] = useState([]);
  const [sections, setSections] = useState([]);
  const [courses, setCourses] = useState([]);

  const [selectedDept, setSelectedDept] = useState("");
  const [selectedBatch, setSelectedBatch] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(false);

  // 1. Initial Load: Fetch All Dropdown Data
  useEffect(() => {
    const token = localStorage.getItem("token");
    const headers = { Authorization: `Bearer ${token}` };

    Promise.all([
      fetch(`${import.meta.env.VITE_API_URL}/api/admin/depts`, { headers }).then(res => res.json()),
      fetch(`${import.meta.env.VITE_API_URL}/api/admin/batches`, { headers }).then(res => res.json()),
      fetch(`${import.meta.env.VITE_API_URL}/api/admin/sections`, { headers }).then(res => res.json()),
      fetch(`${import.meta.env.VITE_API_URL}/api/admin/courses`, { headers }).then(res => res.json())
    ]).then(([deptsData, batchesData, sectionsData, coursesData]) => {
      setDepts(deptsData);
      setBatches(batchesData);
      setSections(sectionsData);
      setCourses(coursesData);
    }).catch(err => console.error("Error loading filters:", err));
  }, []);

  // 2. Fetch Report Data when Section and Subject are selected
  useEffect(() => {
    if (selectedClass && selectedSubject) {
      setLoading(true);
      const token = localStorage.getItem("token");
      
      fetch(`${import.meta.env.VITE_API_URL}/api/admin/attendance-report?section_id=${selectedClass}&course_code=${selectedSubject}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => {
          setReportData(data);
          setLoading(false);
        })
        .catch(err => {
          console.error("Error loading report:", err);
          setLoading(false);
        });
    } else {
      setReportData([]);
    }
  }, [selectedClass, selectedSubject]);

  return (
    <div className='container'>
      <div className='operator' style={headerStyle}>
        
        {/* Department Selection */}
        <div className='selection-box'>
          <label style={labelStyle}>Dept: </label>
          <select 
            style={selectStyle} 
            value={selectedDept} 
            onChange={(e) => {
              setSelectedDept(e.target.value);
              setSelectedBatch("");
              setSelectedClass("");
            }}
          >
            <option value="">Select Dept</option>
            {depts.map((d) => (
              <option value={d.id} key={d.id}>{d.dept_code}</option>
            ))}
          </select>
        </div>

        {/* Batch Selection */}
        <div className='selection-box'>
          <label style={labelStyle}>Batch: </label>
          <select 
            style={selectStyle} 
            value={selectedBatch} 
            disabled={!selectedDept}
            onChange={(e) => {
              setSelectedBatch(e.target.value);
              setSelectedClass("");
            }}
          >
            <option value="">Select Batch</option>
            {batches
              .filter(b => b.dept_id === parseInt(selectedDept))
              .map((b) => (
                <option value={b.id} key={b.id}>{b.batch_name}</option>
              ))
            }
          </select>
        </div>

        {/* Class/Section Selection */}
        <div className='selection-box'>
          <label style={labelStyle}>Class: </label>
          <select 
            style={selectStyle} 
            value={selectedClass} 
            disabled={!selectedBatch}
            onChange={(e) => setSelectedClass(e.target.value)}
          >
            <option value="">Select Class</option>
            {sections
              .filter(s => s.batch_id === parseInt(selectedBatch))
              .map((sec) => (
                <option value={sec.id} key={sec.id}>{sec.section_name}</option>
              ))
            }
          </select>
        </div>

        {/* Subject Selection */}
        <div className='selection-box'>
          <label style={labelStyle}>Subject: </label>
          <select 
            style={selectStyle} 
            value={selectedSubject} 
            onChange={(e) => setSelectedSubject(e.target.value)}
          >
            <option value="">Select Subject</option>
            {courses.map((course) => (
              <option value={course.course_code} key={course.course_code}>{course.course_name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className='main'>
        <div className='report'>
          {loading ? <p style={{textAlign: 'center'}}>Loading Report...</p> : (
            <table className="report-table">
              <thead>
                <tr>
                  <th>Roll No</th>
                  <th>Student Name</th>
                  <th>Attendance %</th>
                </tr>
              </thead>
              <tbody>
                {reportData.length > 0 ? reportData.map((student) => {
                  const perc = parseFloat(student.percentage);
                  const bgColor = perc < 75 ? '#ff8164' : perc < 80 ? '#fdb469' : 'white';

                  return (
                    <tr key={student.roll_number} style={{ backgroundColor: bgColor }}>
                      <td style={{ borderTopLeftRadius: '18px', borderBottomLeftRadius: '18px' }}>{student.roll_number}</td>
                      <td>{student.full_name}</td>
                      <td>{student.percentage}% ({student.attended}/{student.total})</td>
                    </tr>
                  );
                }) : (
                    <tr>
                        <td colSpan="3" style={{textAlign: 'center', padding: '20px', color: '#666'}}>
                            {selectedClass && selectedSubject ? "No records found" : "Please select all filters to view report"}
                        </td>
                    </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

// Maintaining your original style constants
const headerStyle = { 
    display: 'flex', 
    justifyContent: 'space-around', 
    backgroundColor: '#f0f0f0', 
    margin: '30px 20px', 
    padding: '40px 10px', 
    borderRadius: '8px',
    flexWrap: 'wrap',
    gap: '10px'
};
const labelStyle = { fontSize: '1.8vh', fontWeight: '600', marginRight: '5px' };
const selectStyle = { fontSize: '1.5vh', padding: '8px 1vw', borderRadius: '4px', border: '1px solid #ccc' };

export default SubjectWiseReport;
