import React, { useState, useEffect, useRef } from "react";
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
  const [deptSearch, setDeptSearch] = useState("");
  const [deptOpen, setDeptOpen] = useState(false);
  const deptRef = useRef(null);

  const [batchSearch, setBatchSearch] = useState("");
  const [batchOpen, setBatchOpen] = useState(false);
  const batchRef = useRef(null);

  const [sectionSearch, setSectionSearch] = useState("");
  const [sectionOpen, setSectionOpen] = useState(false);
  const sectionRef = useRef(null);

  const [semesterSearch, setSemesterSearch] = useState("");
  const [semesterOpen, setSemesterOpen] = useState(false);
  const semesterRef = useRef(null);

  const [courseSearch, setCourseSearch] = useState("");
  const [courseOpen, setCourseOpen] = useState(false);
  const courseRef = useRef(null);

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

  useEffect(() => {
    const close = (e) => {
      if (deptRef.current && !deptRef.current.contains(e.target)) setDeptOpen(false);
      if (batchRef.current && !batchRef.current.contains(e.target)) setBatchOpen(false);
      if (sectionRef.current && !sectionRef.current.contains(e.target)) setSectionOpen(false);
      if (semesterRef.current && !semesterRef.current.contains(e.target)) setSemesterOpen(false);
      if (courseRef.current && !courseRef.current.contains(e.target)) setCourseOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

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

      <div className="filters">

        {/* Dept */}
        <div style={{ position: "relative" }} ref={deptRef}>
          <input
            type="text"
            value={deptSearch}
            onChange={(e) => { setDeptSearch(e.target.value); setDeptOpen(true); }}
            onFocus={() => setDeptOpen(true)}
            placeholder={depts.find(d => d.id == deptId)?.dept_code || "Select Dept"}
            style={selectStyle}
          />
          {deptOpen && (
            <ul style={dropdownListStyle}>
              {depts.filter(d => d.dept_code.toLowerCase().includes(deptSearch.toLowerCase())).map(d => (
                <li key={d.id} style={dropdownItemStyle} onClick={() => { setDeptId(d.id); setDeptSearch(""); setDeptOpen(false); setBatchId(""); setSectionId(""); }}>
                  {d.dept_code}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Batch */}
        <div style={{ position: "relative" }} ref={batchRef}>
          <input
            type="text"
            value={batchSearch}
            onChange={(e) => { setBatchSearch(e.target.value); setBatchOpen(true); }}
            onFocus={() => setBatchOpen(true)}
            placeholder={batches.find(b => b.id == batchId)?.batch_name || "Select Batch"}
            disabled={!deptId}
            style={{ ...selectStyle, background: !deptId ? "#eee" : "white", cursor: !deptId ? "not-allowed" : "text" }}
          />
          {batchOpen && deptId && (
            <ul style={dropdownListStyle}>
              {batches.filter(b => b.batch_name.toLowerCase().includes(batchSearch.toLowerCase())).map(b => (
                <li key={b.id} style={dropdownItemStyle} onClick={() => { setBatchId(b.id); setBatchSearch(""); setBatchOpen(false); setSectionId(""); }}>
                  {b.batch_name}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Section */}
        <div style={{ position: "relative" }} ref={sectionRef}>
          <input
            type="text"
            value={sectionSearch}
            onChange={(e) => { setSectionSearch(e.target.value); setSectionOpen(true); }}
            onFocus={() => setSectionOpen(true)}
            placeholder={sections.find(s => s.id == sectionId)?.section_name || "Select Section"}
            disabled={!batchId}
            style={{ ...selectStyle, background: !batchId ? "#eee" : "white", cursor: !batchId ? "not-allowed" : "text" }}
          />
          {sectionOpen && batchId && (
            <ul style={dropdownListStyle}>
              {sections.filter(s => s.section_name.toLowerCase().includes(sectionSearch.toLowerCase())).map(s => (
                <li key={s.id} style={dropdownItemStyle} onClick={() => { setSectionId(s.id); setSectionSearch(""); setSectionOpen(false); }}>
                  {s.section_name}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Semester */}
        <div style={{ position: "relative" }} ref={semesterRef}>
          <input
            type="text"
            value={semesterSearch}
            onChange={(e) => { setSemesterSearch(e.target.value); setSemesterOpen(true); }}
            onFocus={() => setSemesterOpen(true)}
            placeholder={semester ? `Sem ${semester}` : "Select Sem"}
            style={selectStyle}
          />
          {semesterOpen && (
            <ul style={dropdownListStyle}>
              {[1, 2, 3, 4, 5, 6, 7, 8].filter(n => `Sem ${n}`.toLowerCase().includes(semesterSearch.toLowerCase())).map(n => (
                <li key={n} style={dropdownItemStyle} onClick={() => { setSemester(n); setSemesterSearch(""); setSemesterOpen(false); }}>
                  Sem {n}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Course */}
        <div style={{ position: "relative" }} ref={courseRef}>
          <input
            type="text"
            value={courseSearch}
            onChange={(e) => { setCourseSearch(e.target.value); setCourseOpen(true); }}
            onFocus={() => setCourseOpen(true)}
            placeholder={courses.find(c => c.course_code == courseCode)?.course_name || "Select Course"}
            disabled={!semester}
            style={{ ...selectStyle, background: !semester ? "#eee" : "white", cursor: !semester ? "not-allowed" : "text" }}
          />
          {courseOpen && semester && (
            <ul style={dropdownListStyle}>
              {courses.filter(c => c.course_name.toLowerCase().includes(courseSearch.toLowerCase())).map(c => (
                <li key={c.course_code} style={dropdownItemStyle} onClick={() => { setCourseCode(c.course_code); setCourseSearch(""); setCourseOpen(false); }}>
                  {c.course_name}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Month left as it is */}
        <input type="month" value={month} onChange={e => setMonth(e.target.value)} max={defaultMonth} />

        {/* Buttons Group */}
        <div style={{ marginLeft: 'auto', display: 'flex', gap: '10px' }}>
          <button className="fetch-btn" onClick={downloadCSV} disabled={data.length === 0}>
            Export CSV
          </button>
          <button className="fetch-btn" onClick={fetchAttendance}>
            {loading ? 'Fetching...' : 'Get Report'}
          </button>
        </div>
      </div>

      {loading && <div style={{ textAlign: 'center', padding: '20px' }}>Loading Attendance Data...</div>}

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
            <br /><small>{student.monthlySummary.percentage}%</small>
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

const dropdownListStyle = { position: "absolute", width: "100%", background: "white", border: "1px solid #ccc", maxHeight: "200px", overflowY: "auto", zIndex: 100, listStyle: "none", padding: 0, margin: "4px 0 0", borderRadius: "4px" };
const dropdownItemStyle = { padding: "8px 12px", cursor: "pointer" };
const selectStyle = { padding: "8px", borderRadius: "4px", border: "1px solid #ccc", minWidth: "100px", fontSize: '13px' };
