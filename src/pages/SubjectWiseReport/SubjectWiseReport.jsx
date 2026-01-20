import React, { useState, useEffect } from "react";
import './subjectwisereport_style.css';

function SubjectWiseReport() {
  const [sections, setSections] = useState([]);
  const [courses, setCourses] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(false);

  // 1. Load Initial Dropdown Data (Sections and Courses)
  useEffect(() => {
    const token = localStorage.getItem("token");
    const headers = { Authorization: `Bearer ${token}` };

    Promise.all([
      fetch(`${import.meta.env.VITE_API_URL}/api/admin/sections`, { headers }).then(res => res.json()),
      fetch(`${import.meta.env.VITE_API_URL}/api/admin/courses`, { headers }).then(res => res.json())
    ]).then(([sectionsData, coursesData]) => {
      setSections(sectionsData);
      setCourses(coursesData);
    }).catch(err => console.error("Error loading filters:", err));
  }, []);

  // 2. Fetch Report Data when filters change
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
    }
  }, [selectedClass, selectedSubject]);

  return (
    <div className='container'>
      <div className='operator' style={headerStyle}>
        {/* Class Selection */}
        <div className='class-selection'>
          <label style={labelStyle}>Select Class: </label>
          <select 
            style={selectStyle} 
            value={selectedClass} 
            onChange={(e) => setSelectedClass(e.target.value)}
          >
            <option value="">Select Class</option>
            {sections.map((sec) => (
              <option value={sec.id} key={sec.id}>{sec.batch_name} - {sec.section_name}</option>
            ))}
          </select>
        </div>

        {/* Subject Selection */}
        <div>
          <label style={labelStyle}>Select Subject: </label>
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
          {loading ? <p>Loading Report...</p> : (
            <table className="report-table">
              <thead>
                <tr>
                  <th>Roll No</th>
                  <th>Student Name</th>
                  <th>Attendance %</th>
                </tr>
              </thead>
              <tbody>
                {reportData.map((student) => {
                  const perc = parseFloat(student.percentage);
                  const bgColor = perc < 75 ? '#ff8164' : perc < 80 ? '#fdb469' : 'white';

                  return (
                    <tr key={student.roll_number} style={{ backgroundColor: bgColor }}>
                      <td style={{ borderTopLeftRadius: '18px', borderBottomLeftRadius: '18px' }}>{student.roll_number}</td>
                      <td>{student.full_name}</td>
                      <td>{student.percentage}% ({student.attended}/{student.total})</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

const headerStyle = { display: 'flex', justifyContent: 'space-around', backgroundColor: '#f0f0f0', margin: '30px 20px', padding: '40px 20px', borderRadius: '8px' };
const labelStyle = { fontSize: '2vh', fontWeight: '600', marginRight: '10px' };
const selectStyle = { fontSize: '1.5vh', padding: '10px 2vw' };

export default SubjectWiseReport;