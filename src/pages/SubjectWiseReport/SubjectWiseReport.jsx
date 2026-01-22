
import React, { useState, useEffect } from "react";
import './subjectwisereport_style.css';

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
    <div className='container'>
      
      {/* 1. Header with Symmetric Grid Layout */}
      <div className='operator' style={headerContainerStyle}>
        <div style={gridStyle}>
            {/* Row 1 */}
            <div className='selection-box' style={boxStyle}>
                <label style={labelStyle}>Dept</label>
                <select style={selectStyle} value={selectedDept} onChange={(e) => {
                    setSelectedDept(e.target.value); setSelectedBatch(""); setSelectedClass("");
                }}>
                    <option value="">Select Dept</option>
                    {depts.map((d) => <option value={d.id} key={d.id}>{d.dept_code}</option>)}
                </select>
            </div>
            
            <div className='selection-box' style={boxStyle}>
                <label style={labelStyle}>Batch</label>
                <select style={selectStyle} value={selectedBatch} disabled={!selectedDept} onChange={(e) => {
                    setSelectedBatch(e.target.value); setSelectedClass("");
                }}>
                    <option value="">Select Batch</option>
                    {batches.filter(b => b.dept_id === parseInt(selectedDept)).map((b) => (
                        <option value={b.id} key={b.id}>{b.batch_name}</option>
                    ))}
                </select>
            </div>

            <div className='selection-box' style={boxStyle}>
                <label style={labelStyle}>Class</label>
                <select style={selectStyle} value={selectedClass} disabled={!selectedBatch} onChange={(e) => setSelectedClass(e.target.value)}>
                    <option value="">Select Class</option>
                    {sections.filter(s => s.batch_id === parseInt(selectedBatch)).map((sec) => (
                        <option value={sec.id} key={sec.id}>{sec.section_name}</option>
                    ))}
                </select>
            </div>

            <div className='selection-box' style={boxStyle}>
                <label style={labelStyle}>Semester (Req)</label>
                <select style={selectStyle} value={selectedSemester} onChange={(e) => setSelectedSemester(e.target.value)}>
                    <option value="">Select</option>
                    {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>{s}</option>)}
                </select>
            </div>

            {/* Row 2 */}
            <div className='selection-box' style={boxStyle}>
                <label style={labelStyle}>Subject (Opt)</label>
                <select style={selectStyle} value={selectedSubject} onChange={(e) => setSelectedSubject(e.target.value)}>
                    <option value="">All Subjects</option>
                    {courses.map((course) => (
                    <option value={course.course_code} key={course.course_code}>{course.course_name}</option>
                    ))}
                </select>
            </div>

            <div className='selection-box' style={boxStyle}>
                <label style={labelStyle}>From Date</label>
                <input type="date" style={selectStyle} value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </div>

            <div className='selection-box' style={boxStyle}>
                <label style={labelStyle}>To Date</label>
                <input type="date" style={selectStyle} value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </div>

            <div className='selection-box' style={{...boxStyle, justifyContent: 'flex-end'}}>
                <button 
                    onClick={downloadCSV} 
                    disabled={pivotedData.length === 0}
                    style={{
                        ...selectStyle,
                        backgroundColor: pivotedData.length > 0 ? '#4CAF50' : '#e0e0e0',
                        color: pivotedData.length > 0 ? 'white' : '#888',
                        cursor: pivotedData.length > 0 ? 'pointer' : 'not-allowed',
                        fontWeight: 'bold',
                        border: 'none',
                        height: '38px' // Match height of inputs
                    }}
                >
                    Download CSV
                </button>
            </div>
        </div>
      </div>

      {/* 2. Main Report Area */}
      <div className='main'>
        <div className='report' style={{overflowX: 'auto', maxHeight: '75vh'}}>
          {loading ? <p style={{textAlign: 'center', marginTop: '20px'}}>Loading Report...</p> : (
            <table className="report-table" style={{borderCollapse: 'separate', borderSpacing: 0}}>
              <thead style={{position: 'sticky', top: 0, zIndex: 10}}>
                <tr>
                  {/* Sticky Columns (Neutral Gray Background) */}
                  <th style={{...stickyHeaderStyle, left: 0, zIndex: 20}}>Roll No</th>
                  <th style={{...stickyHeaderStyle, left: '120px', zIndex: 20}}>Name</th>
                  {/* Subject Columns */}
                  {uniqueSubjects.map(sub => (
                    <th key={sub} style={headerCellStyle}>{sub}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pivotedData.length > 0 ? pivotedData.map((student) => (
                    <tr key={student.roll_number} style={{backgroundColor: 'white', borderBottom: '1px solid #ddd'}}>
                        <td style={{...stickyCellStyle, left: 0}}>{student.roll_number}</td>
                        <td style={{...stickyCellStyle, left: '120px', textAlign:'left'}}>{student.full_name}</td>
                        
                        {uniqueSubjects.map(subject => {
                            const data = student.attendance[subject];
                            if (!data) return <td key={subject} style={cellStyle}>-</td>;

                            const bgColor = data.percentage < 75 ? '#ffcccc' : data.percentage < 80 ? '#fff3cd' : '#d4edda';
                            const textColor = data.percentage < 75 ? '#a00' : data.percentage < 80 ? '#856404' : '#155724';

                            return (
                                <td key={subject} style={{...cellStyle, backgroundColor: bgColor, color: textColor}}>
                                    <div style={{fontWeight:'bold'}}>{data.percentage}%</div>
                                    <div style={{fontSize:'0.75em'}}>({data.attended}/{data.total})</div>
                                </td>
                            );
                        })}
                    </tr>
                )) : (
                    <tr>
                        <td colSpan={uniqueSubjects.length + 2} style={{textAlign: 'center', padding: '30px', color: '#666'}}>
                            {!selectedClass ? "Please select a Class and Semester" : "No records found"}
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

// --- STYLES ---

const headerContainerStyle = { 
    backgroundColor: '#f8f9fa', 
    margin: '20px', 
    padding: '25px', 
    borderRadius: '12px',
    boxShadow: '0 2px 5px rgba(0,0,0,0.05)'
};

const gridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)', // 4 Equal Columns
    gap: '20px',
    alignItems: 'end'
};

const boxStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '5px'
};

const labelStyle = { 
    fontSize: '0.85rem', 
    fontWeight: '600', 
    color: '#444', 
    marginLeft: '2px'
};

const selectStyle = { 
    padding: '8px 12px', 
    borderRadius: '6px', 
    border: '1px solid #ccc',
    fontSize: '0.9rem',
    width: '100%',
    boxSizing: 'border-box'
};

// Table Styles
const headerCellStyle = {
    backgroundColor: '#e9ecef', // Neutral Gray
    color: '#495057',
    padding: '12px 15px',
    fontWeight: 'bold',
    borderBottom: '2px solid #dee2e6',
    whiteSpace: 'nowrap'
};

const stickyHeaderStyle = {
    ...headerCellStyle,
    position: 'sticky',
    top: 0,
    backgroundColor: '#e9ecef', // Match header color (opaque)
    borderRight: '1px solid #dee2e6'
};

const cellStyle = {
    padding: '10px',
    borderBottom: '1px solid #eee',
    textAlign: 'center',
    verticalAlign: 'middle'
};

const stickyCellStyle = {
    ...cellStyle,
    position: 'sticky',
    backgroundColor: '#f8f9fa', // Slightly different gray for sticky columns
    borderRight: '1px solid #dee2e6',
    fontWeight: '500',
    zIndex: 5
};

export default SubjectWiseReport;