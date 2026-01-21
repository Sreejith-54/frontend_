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
  const [selectedSemester, setSelectedSemester] = useState("1");
  
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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

  // 2. Fetch courses from timetable and their attendance data
  useEffect(() => {
    if (selectedClass && selectedSemester) {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };
      const currentMonth = new Date().toISOString().slice(0, 7);

      // First, get timetable to find courses for this section
      fetch(
        `${import.meta.env.VITE_API_URL}/api/common/timetable?section_id=${selectedClass}&semester=${selectedSemester}`,
        { headers }
      )
        .then(res => res.json())
        .then(timetableData => {
          // Get unique courses from timetable
          const uniqueCourses = {};
          timetableData.forEach(slot => {
            if (!uniqueCourses[slot.course_code]) {
              uniqueCourses[slot.course_code] = {
                courseCode: slot.course_code,
                courseName: slot.course_name
              };
            }
          });

          const courseList = Object.values(uniqueCourses);

          // Fetch attendance data for each course
          const attendancePromises = courseList.map(course => 
            fetch(
              `${import.meta.env.VITE_API_URL}/api/attendance/periodic?sectionId=${selectedClass}&semester=${selectedSemester}&courseCode=${course.courseCode}&month=${currentMonth}`,
              { headers }
            )
              .then(res => res.ok ? res.json() : [])
              .then(data => {
                if (data.length === 0) {
                  return {
                    courseCode: course.courseCode,
                    courseName: course.courseName,
                    totalClasses: 0,
                    avgAttendance: 0,
                    totalStudents: 0
                  };
                }

                // Calculate statistics
                const totalClasses = data[0]?.totalClasses || 0;
                const totalStudents = data.length;
                const totalPercentage = data.reduce((sum, student) => sum + student.overallPercentage, 0);
                const avgAttendance = totalStudents > 0 ? (totalPercentage / totalStudents).toFixed(2) : 0;

                return {
                  courseCode: course.courseCode,
                  courseName: course.courseName,
                  totalClasses,
                  avgAttendance: parseFloat(avgAttendance),
                  totalStudents
                };
              })
              .catch(err => {
                console.error(`Error fetching ${course.courseCode}:`, err);
                return {
                  courseCode: course.courseCode,
                  courseName: course.courseName,
                  totalClasses: 0,
                  avgAttendance: 0,
                  totalStudents: 0
                };
              })
          );

          return Promise.all(attendancePromises);
        })
        .then(courseStats => {
          setReportData(courseStats);
          setLoading(false);
        })
        .catch(err => {
          console.error("Error loading report:", err);
          setError(err.message);
          setReportData([]);
          setLoading(false);
        });
    } else {
      setReportData([]);
    }
  }, [selectedClass, selectedSemester]);

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

        {/* Semester Selection */}
        <div className='selection-box'>
          <label style={labelStyle}>Semester: </label>
          <select 
            style={selectStyle} 
            value={selectedSemester} 
            onChange={(e) => setSelectedSemester(e.target.value)}
          >
            <option value="1">Semester 1</option>
            <option value="2">Semester 2</option>
            <option value="3">Semester 3</option>
            <option value="4">Semester 4</option>
            <option value="5">Semester 5</option>
            <option value="6">Semester 6</option>
            <option value="7">Semester 7</option>
            <option value="8">Semester 8</option>
          </select>
        </div>
      </div>

      <div className='main'>
        <div className='report'>
          {loading ? (
            <p style={{textAlign: 'center'}}>Loading Report...</p>
          ) : error ? (
            <p style={{textAlign: 'center', color: 'red'}}>Error: {error}</p>
          ) : (
            <table className="report-table">
              <thead>
                <tr>
                  <th>Course ID</th>
                  <th>Subject</th>
                  <th>Total Classes</th>
                  <th>Avg Attendance %</th>
                </tr>
              </thead>
              <tbody>
                {reportData.length > 0 ? reportData.map((course) => {
                  const perc = parseFloat(course.avgAttendance);
                  const bgColor = perc < 75 ? '#ff8164' : perc < 80 ? '#fdb469' : 'white';

                  return (
                    <tr key={course.courseCode} style={{ backgroundColor: bgColor }}>
                      <td style={{ borderTopLeftRadius: '18px', borderBottomLeftRadius: '18px' }}>
                        {course.courseCode}
                      </td>
                      <td>{course.courseName}</td>
                      <td>{course.totalClasses}</td>
                      <td>{course.avgAttendance}%</td>
                    </tr>
                  );
                }) : (
                  <tr>
                    <td colSpan="4" style={{textAlign: 'center', padding: '20px', color: '#666'}}>
                      {selectedClass && selectedSemester 
                        ? "No courses found" 
                        : "Please select class and semester to view report"}
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

// Style constants
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