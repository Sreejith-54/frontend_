import React, { useState, useEffect } from "react";
import './SubjectWiseReport.css';

function SubjectWiseReport() {
  // --- STATE MANAGEMENT ---
  const [depts, setDepts] = useState([]);
  const [batches, setBatches] = useState([]);
  const [sections, setSections] = useState([]);
  const [courses, setCourses] = useState([]);

  const [selectedDept, setSelectedDept] = useState("");
  const [selectedBatch, setSelectedBatch] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSemester, setSelectedSemester] = useState("1"); // Default to 1
  const [selectedSubject, setSelectedSubject] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [loading, setLoading] = useState(false);
  const [uniqueSubjects, setUniqueSubjects] = useState([]);
  const [pivotedData, setPivotedData] = useState([]);

  // --- INITIAL LOAD ---
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
    });
  }, []);

  // --- FETCH & PROCESS DATA ---
  useEffect(() => {
    if (selectedClass && selectedSemester) {
      setLoading(true);
      const token = localStorage.getItem("token");
      
      const params = new URLSearchParams({
        section_id: selectedClass,
        semester: selectedSemester,
        course_code: selectedSubject, 
        ...(startDate && { start_date: startDate }),
        ...(endDate && { end_date: endDate })
      });

      fetch(`${import.meta.env.VITE_API_URL}/api/admin/attendance-report?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            processReportData(data);
          } else {
            setPivotedData([]);
            setUniqueSubjects([]);
          }
          setLoading(false);
        })
        .catch(err => {
          console.error("Error:", err);
          setLoading(false);
        });
    } else {
      setPivotedData([]);
      setUniqueSubjects([]);
    }
  }, [selectedClass, selectedSubject, selectedSemester, startDate, endDate]);

  const processReportData = (data) => {
    const subjectsSet = new Set();
    const studentMap = {};

    data.forEach(record => {
        subjectsSet.add(record.subject);
        if (!studentMap[record.roll_number]) {
            studentMap[record.roll_number] = {
                roll_number: record.roll_number,
                full_name: record.full_name,
                attendance: {}
            };
        }
        studentMap[record.roll_number].attendance[record.subject] = {
            attended: record.attended,
            total: record.total,
            percentage: parseFloat(record.percentage)
        };
    });

    const sortedSubjects = Array.from(subjectsSet).sort();
    const sortedStudents = Object.values(studentMap).sort((a, b) => 
        a.roll_number.localeCompare(b.roll_number)
    );

    setUniqueSubjects(sortedSubjects);
    setPivotedData(sortedStudents);
  };

  // --- CSV DOWNLOAD ---
  const downloadCSV = () => {
    if (pivotedData.length === 0) return;
    const headers = ['Roll No', 'Name', ...uniqueSubjects];
    const rows = pivotedData.map(student => {
        const rowData = [student.roll_number, student.full_name];
        uniqueSubjects.forEach(subject => {
            const record = student.attendance[subject];
            rowData.push(record ? `${record.percentage}% (${record.attended}/${record.total})` : '-');
        });
        return rowData.join(',');
    });
    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', `Attendance_Report_Sem${selectedSemester}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // --- RENDER ---
  return (
    <div>
      {/* FILTER BAR - Matching AttendanceOverview style */}
      <div style={filterContainer}>
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
          {depts.map((d) => <option value={d.id} key={d.id}>{d.dept_code}</option>)}
        </select>
        
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
          {batches.filter(b => b.dept_id === parseInt(selectedDept)).map((b) => (
            <option value={b.id} key={b.id}>{b.batch_name}</option>
          ))}
        </select>

        <select 
          style={selectStyle} 
          value={selectedClass} 
          disabled={!selectedBatch} 
          onChange={(e) => setSelectedClass(e.target.value)}
        >
          <option value="">Select Section</option>
          {sections.filter(s => s.batch_id === parseInt(selectedBatch)).map((sec) => (
            <option value={sec.id} key={sec.id}>{sec.section_name}</option>
          ))}
        </select>

        <select 
          style={selectStyle} 
          value={selectedSemester} 
          onChange={(e) => setSelectedSemester(e.target.value)}
        >
          <option value="">Select Sem</option>
          {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>Sem {s}</option>)}
        </select>

        <select 
          style={selectStyle} 
          value={selectedSubject} 
          onChange={(e) => setSelectedSubject(e.target.value)}
        >
          <option value="">All Subjects</option>
          {courses.map((course) => (
            <option value={course.course_code} key={course.course_code}>{course.course_name}</option>
          ))}
        </select>

        <div style={{display:'flex', alignItems:'center', gap:'5px', background:'white', padding:'0 5px', borderRadius:'4px', border:'1px solid #ccc'}}>
          <label style={{fontSize:'12px', fontWeight:'bold', color:'#555', paddingLeft:'5px'}}>From:</label>
          <input 
            type="date" 
            style={{...selectStyle, border:'none', minWidth:'120px'}} 
            value={startDate} 
            onChange={(e) => setStartDate(e.target.value)} 
          />
        </div>

        <div style={{display:'flex', alignItems:'center', gap:'5px', background:'white', padding:'0 5px', borderRadius:'4px', border:'1px solid #ccc'}}>
          <label style={{fontSize:'12px', fontWeight:'bold', color:'#555', paddingLeft:'5px'}}>To:</label>
          <input 
            type="date" 
            style={{...selectStyle, border:'none', minWidth:'120px'}} 
            value={endDate} 
            onChange={(e) => setEndDate(e.target.value)} 
          />
        </div>

        <button 
          onClick={downloadCSV} 
          disabled={pivotedData.length === 0}
          style={{
            ...btnStyle,
            backgroundColor: pivotedData.length > 0 ? '#AD3A3C' : '#ccc',
            cursor: pivotedData.length > 0 ? 'pointer' : 'not-allowed',
            opacity: pivotedData.length > 0 ? 1 : 0.6
          }}
        >
          Download CSV
        </button>
      </div>

      {/* REPORT TABLE */}
      {loading ? (
        <p style={{textAlign: 'center', marginTop: '30px'}}>Loading...</p>
      ) : (
        <div style={{overflowX: 'auto', maxHeight: '75vh'}}>
          <table style={tableStyle}>
            <thead>
              <tr>
                {/* Sticky Columns */}
                <th style={{...thStyle, position: 'sticky', left: 0, top: 0, zIndex: 20, background: '#eee'}}>Roll No</th>
                <th style={{...thStyle, position: 'sticky', left: '120px', top: 0, zIndex: 20, background: '#eee', borderRight: '2px solid #ddd'}}>Name</th>
                {/* Subject Columns */}
                {uniqueSubjects.map(sub => (
                  <th key={sub} style={thStyle}>{sub}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pivotedData.length > 0 ? pivotedData.map((student) => (
                <tr key={student.roll_number}>
                  <td style={{...tdStyle, position: 'sticky', left: 0, background: 'white', fontWeight: '500', zIndex: 10}}>
                    {student.roll_number}
                  </td>
                  <td style={{...tdStyle, position: 'sticky', left: '120px', background: 'white', fontWeight: '500', zIndex: 10, textAlign:'left', borderRight: '2px solid #eee'}}>
                    {student.full_name}
                  </td>
                  
                  {uniqueSubjects.map(subject => {
                    const data = student.attendance[subject];
                    if (!data) return <td key={subject} style={{...tdStyle, textAlign:'center'}}>-</td>;

                    const bgColor = data.percentage < 75 ? '#ffcccc' : data.percentage < 80 ? '#fff3cd' : '#d4edda';
                    const textColor = data.percentage < 75 ? '#a00' : data.percentage < 80 ? '#856404' : '#155724';

                    return (
                      <td key={subject} style={{...tdStyle, backgroundColor: bgColor, color: textColor, textAlign:'center'}}>
                        <div style={{fontWeight:'bold'}}>{data.percentage}%</div>
                        <div style={{fontSize:'11px', color: textColor, opacity: 0.8}}>({data.attended}/{data.total})</div>
                      </td>
                    );
                  })}
                </tr>
              )) : (
                <tr>
                  <td colSpan={uniqueSubjects.length + 2} style={{textAlign: 'center', padding: '30px', color: '#999'}}>
                    {!selectedClass ? "Please select a Section and Semester" : "No records found"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* ================= STYLES (Matching AttendanceOverview) ================= */

const filterContainer = {
  display: "flex", 
  gap: "10px", 
  background: "#f5f5f5", 
  marginTop: "20px",
  padding: "15px", 
  borderRadius: "8px", 
  alignItems: "center", 
  marginBottom: "20px", 
  flexWrap: 'wrap', 
  border: "1px solid #ddd"
};

const selectStyle = {
  padding: "8px", 
  borderRadius: "4px", 
  border: "1px solid #ccc", 
  minWidth: "100px", 
  fontSize: '13px'
};

const btnStyle = {
  padding: "8px 20px", 
  background: "#AD3A3C", 
  color: "white", 
  border: "none", 
  borderRadius: "4px", 
  cursor: "pointer", 
  fontWeight: "bold", 
  marginLeft: "auto"
};

const tableStyle = {
  width: "100%",
  borderCollapse: "collapse",
  backgroundColor: "white",
  boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
};

const thStyle = {
  position:"sticky",
  background: "#eee",
  top: "0", 
  color: "#333", 
  padding: "12px", 
  borderBottom: "2px solid #ddd", 
  textAlign: "left", 
  fontSize: '13px',
  whiteSpace: 'nowrap',
  zIndex: '10'
};

const tdStyle = {
  padding: "12px",
  borderBottom: "1px solid #eee",
  color: "#555",
  fontSize: "13px"
};

export default SubjectWiseReport;