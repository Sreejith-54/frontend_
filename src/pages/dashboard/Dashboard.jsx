import React, { useState, useEffect } from "react";
import api from "../utils/api"; 
import "./Dashboard.css";

export default function MonthlyAttendanceDashboard() {
  // ... (All existing state definitions remain the same) ...
  const [depts, setDepts] = useState([]);
  const [batches, setBatches] = useState([]);
  const [sections, setSections] = useState([]);
  const [courses, setCourses] = useState([]);

  const [deptId, setDeptId] = useState("");
  const [batchId, setBatchId] = useState("");
  const [sectionId, setSectionId] = useState("");
  const [semester, setSemester] = useState("");
  const [courseCode, setCourseCode] = useState("");
  
  const today = new Date();
  const defaultMonth = today.getFullYear() + '-' + String(today.getMonth() + 1).padStart(2, '0');
  const [month, setMonth] = useState(defaultMonth);

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  // ... (All useEffects remain the same) ...
  useEffect(() => { api.get("/admin/depts").then(res => setDepts(res.data)).catch(console.error); }, []);
  useEffect(() => { if (!deptId) { setBatches([]); return; } api.get("/admin/batches").then(res => setBatches(res.data.filter(b => b.dept_id === +deptId))).catch(console.error); }, [deptId]);
  useEffect(() => { if (!batchId) { setSections([]); return; } api.get("/admin/sections").then(res => setSections(res.data.filter(s => s.batch_id === +batchId))).catch(console.error); }, [batchId]);
  useEffect(() => { 
    if (!sectionId || !semester) { setCourses([]); return; }
    api.get("/common/timetable", { params: { section_id: sectionId, semester } }).then(res => {
      const unique = []; const seen = new Set();
      res.data.forEach(slot => { if (!seen.has(slot.course_code)) { seen.add(slot.course_code); unique.push({ course_code: slot.course_code, course_name: slot.course_name }); } });
      setCourses(unique);
    });
  }, [sectionId, semester]);

  const fetchAttendance = async () => {
    if (!sectionId || !semester || !courseCode || !month) { alert("Please select all filters."); return; }
    setLoading(true); setData([]);
    try {
      const res = await api.get("/attendance/periodic", {
        params: { sectionId: Number(sectionId), semester: Number(semester), courseCode, month }
      });
      setData(res.data);
    } catch (err) {
      console.error(err); alert(err.response?.data?.error || "Failed to load attendance");
    } finally {
      setLoading(false);
    }
  };

  const getColor = (pct) => {
    if (pct < 75) return '#f8d7da'; 
    if (pct < 85) return '#fff3cd'; 
    return '#d4edda'; 
  };

  // --- NEW: CSV DOWNLOAD FUNCTION ---
  const downloadCSV = () => {
    if (data.length === 0) return;

    // 1. Create Headers
    // Static Headers
    const headers = ['Student Name'];
    
    // Dynamic Date Headers from the first record
    data[0].records.forEach(rec => {
      headers.push(`${rec.date} (Slot ${rec.slot})`);
    });

    // Summary Headers
    headers.push('Monthly Attended', 'Monthly Total', 'Monthly %', 'Overall Attended', 'Overall Total', 'Overall %');

    // 2. Create Rows
    const rows = data.map(student => {
      // Escape name in quotes to handle commas
      const rowData = [`"${student.studentName}"`];

      // Add status for each date
      student.records.forEach(rec => {
        rowData.push(rec.status); // present, absent, unmarked
      });

      // Add Monthly Stats
      rowData.push(student.monthlySummary.attended);
      rowData.push(student.monthlySummary.total);
      rowData.push(`${student.monthlySummary.percentage}%`);

      // Add Overall Stats
      rowData.push(student.totalAttended);
      rowData.push(student.totalClasses);
      rowData.push(`${student.overallPercentage}%`);

      return rowData.join(',');
    });

    // 3. Combine and Download
    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Attendance_${courseCode}_${month}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  // ------------------------------------

  const headerRecords = data.length > 0 ? data[0].records : [];

  return (
    <div className="monthly-attendance">

      {/* --- FILTERS BAR --- */}
      <div className="filters">
        <select onChange={e => setDeptId(e.target.value)} value={deptId}>
          <option value="">Select Dept</option>
          {depts.map(d => <option key={d.id} value={d.id}>{d.dept_code}</option>)}
        </select>
        <select onChange={e => setBatchId(e.target.value)} value={batchId} disabled={!deptId}>
          <option value="">Select Batch</option>
          {batches.map(b => <option key={b.id} value={b.id}>{b.batch_name}</option>)}
        </select>
        <select onChange={e => setSectionId(e.target.value)} value={sectionId} disabled={!batchId}>
          <option value="">Select Section</option>
          {sections.map(s => <option key={s.id} value={s.id}>{s.section_name}</option>)}
        </select>
        <select onChange={e => setSemester(e.target.value)} value={semester}>
          <option value="">Select Sem</option>
          {[1,2,3,4,5,6,7,8].map(n => <option key={n} value={n}>Sem {n}</option>)}
        </select>
        <select onChange={e => setCourseCode(e.target.value)} value={courseCode} disabled={!semester}>
          <option value="">Select Course</option>
          {courses.map(c => <option key={c.course_code} value={c.course_code}>{c.course_name}</option>)}
        </select>
        <input type="month" value={month} onChange={e => setMonth(e.target.value)} max={defaultMonth} />
        
        {/* Buttons Group */}
        <div style={{marginLeft: 'auto', display: 'flex', gap: '10px'}}>
            <button className="fetch-btn" onClick={downloadCSV} disabled={data.length === 0}>
                Export CSV
            </button>
            <button className="fetch-btn" onClick={fetchAttendance}>
                {loading ? 'Fetching...' : 'Get Report'}
            </button>
        </div>
      </div>

      {loading && <div style={{textAlign:'center', padding:'20px'}}>Loading Attendance Data...</div>}

      {/* ... (Rest of Legend, Header, and Table Rows remain exactly the same as previous code) ... */}
      
      {/* LEGEND */}
      {!loading && data.length > 0 && (
        <div className="legend-container top-legend">
          <div className="legend-group">
            <span className="legend-title">Status Key:</span>
            <div className="legend-item"><span className="day-box present"></span> Present</div>
            <div className="legend-item"><span className="day-box absent"></span> Absent</div>
            <div className="legend-item"><span className="day-box late"></span> Late</div>
            <div className="legend-item"><span className="day-box unmarked"></span> Unmarked</div>
          </div>
          <div className="legend-divider"></div>
          <div className="legend-group">
            <span className="legend-title">Performance:</span>
            <div className="legend-item"><span className="pct-box danger"></span> &lt; 75%</div>
            <div className="legend-item"><span className="pct-box warning"></span> 75-85%</div>
            <div className="legend-item"><span className="pct-box success"></span> &gt; 85%</div>
          </div>
        </div>
      )}

      {/* HEADER */}
      {!loading && data.length > 0 && (
        <div className="attendance-row header">
          <div className="student-name">Student Name</div>
          <div className="attendance-days header-scroll">
            {headerRecords.map((rec, idx) => {
              const dateObj = new Date(rec.date);
              return (
                <div key={idx} className="date-header-cell">
                  <span className="date-num">{dateObj.getDate()}</span>
                </div>
              );
            })}
          </div>
          <div className="attendance-summary">Month %</div>
          <div className="attendance-summary total-col">Total</div>
          <div className="attendance-summary total-col">Overall %</div>
        </div>
      )}

      {/* ROWS */}
      {!loading && data.map((student, i) => (
        <div className="attendance-row" key={i}>
          <div className="student-name" title={student.studentName}>
            {student.studentName}
          </div>
          <div className="attendance-days">
            {student.records.map((record, idx) => (
              <div key={idx} className="box-wrapper">
                <span className={`day-box ${record.status}`} title={`${record.date}: ${record.status}`} />
              </div>
            ))}
          </div>
          <div className="attendance-summary">
             {student.monthlySummary.attended}/{student.monthlySummary.total}
             <br/><small>{student.monthlySummary.percentage}%</small>
          </div>
          <div className="attendance-summary total-col">
             {student.totalAttended}/{student.totalClasses}
          </div>
          <div className="attendance-summary total-col" style={{ backgroundColor: getColor(student.overallPercentage), fontWeight: 'bold' }}>
             {student.overallPercentage}%
          </div>
        </div>
      ))}
      
      {!loading && data.length === 0 && (
        <div style={{ textAlign: 'center', padding: '40px', color: '#666', background: 'white', borderRadius: '8px' }}>
          No data available. Please select filters and click "Get Report".
        </div>
      )}

    </div>
  );
}